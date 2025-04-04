import { database } from '../../firebaseConfig';
import { ref, get, set, update, push } from 'firebase/database';

// Utility function for consistent price formatting across the app
export const formatPrice = (price) => {
	return new Intl.NumberFormat('en-US', {
		style: 'currency',
		currency: 'USD',
	}).format(price);
};

export const fetchCoursesFromDatabase = async () => {
	try {
		const coursesRef = ref(database, '/Elearning/Cours');
		const snapshot = await get(coursesRef);

		if (snapshot.exists()) {
			const coursesData = snapshot.val();
			// Convert object to array with ID included in each course
			const courses = Object.entries(coursesData).map(([id, course]) => ({
				...course,
				id: id,
			}));

			// Fetch formations to get additional data
			const formationsRef = ref(database, '/Elearning/Formations');
			const formationsSnapshot = await get(formationsRef);

			if (formationsSnapshot.exists()) {
				const formationsData = formationsSnapshot.val();

				// Enhance courses with formation data
				return courses.map((course) => {
					const formation = formationsData[course.formation] || {};
					return {
						...course,
						formationTitle: formation.titre || '',
						formationCategory: formation.category || '',
						formationLevel: formation.level || course.level || '',
						formationImage: formation.image || course.image,
					};
				});
			}

			return courses;
		}
		return [];
	} catch (error) {
		console.error('Error fetching courses:', error);
		throw error;
	}
};

export const fetchStudentCourses = async (userId) => {
	try {
		if (!userId) throw new Error('User ID is required');

		// First get student data to find inscriptions
		const studentRef = ref(database, `Elearning/Apprenants/${userId}`);
		const studentSnapshot = await get(studentRef);

		if (!studentSnapshot.exists()) {
			return [];
		}

		const studentData = studentSnapshot.val();
		const inscriptionIds = studentData.inscriptions || [];

		if (inscriptionIds.length === 0) {
			return [];
		}

		// Get inscriptions data
		const inscriptionsPromises = inscriptionIds.map((inscriptionId) =>
			get(ref(database, `Elearning/Inscriptions/${inscriptionId}`)),
		);

		const inscriptionsSnapshots = await Promise.all(inscriptionsPromises);
		const inscriptions = inscriptionsSnapshots
			.filter((snapshot) => snapshot.exists())
			.map((snapshot) => snapshot.val());

		// Get formation IDs from inscriptions
		const formationIds = inscriptions
			.filter((inscription) => inscription.statut === 'confirmé')
			.map((inscription) => inscription.formation);

		if (formationIds.length === 0) {
			return [];
		}

		// Fetch formations
		const formationsPromises = formationIds.map((formationId) =>
			get(ref(database, `Elearning/Formations/${formationId}`)),
		);

		const formationsSnapshots = await Promise.all(formationsPromises);
		const formations = formationsSnapshots
			.filter((snapshot) => snapshot.exists())
			.map((snapshot) => {
				const formationData = snapshot.val();
				return {
					...formationData,
					id: formationData.id || snapshot.key,
				};
			});

		// Now fetch all courses from formations
		const allCourses = await fetchCoursesFromDatabase();

		// Filter courses to only those from the formations the student is enrolled in
		const enrolledCourses = allCourses.filter((course) =>
			formationIds.includes(course.formation),
		);

		// Add progress data
		return enrolledCourses.map((course) => ({
			...course,
			progress: studentData.progression || 0,
			enrollmentStatus:
				inscriptions.find((i) => i.formation === course.formation)?.statut ||
				'unknown',
			enrolledDate:
				inscriptions.find((i) => i.formation === course.formation)
					?.dateInscription || new Date().toISOString(),
		}));
	} catch (error) {
		console.error('Error fetching student courses:', error);
		throw error;
	}
};

export const fetchInstructorCourses = async (instructorId) => {
	try {
		// Get instructor data
		const instructorRef = ref(database, `Elearning/Formateurs/${instructorId}`);
		const instructorSnapshot = await get(instructorRef);

		if (!instructorSnapshot.exists()) {
			return [];
		}

		const instructorData = instructorSnapshot.val();
		const formationIds = instructorData.formations || [];

		if (formationIds.length === 0) {
			return [];
		}

		// Fetch all courses
		const coursesRef = ref(database, 'Elearning/Cours');
		const coursesSnapshot = await get(coursesRef);

		if (!coursesSnapshot.exists()) {
			return [];
		}

		const coursesData = coursesSnapshot.val();

		// Convert to array and filter courses belonging to instructor's formations
		const instructorCourses = Object.entries(coursesData)
			.map(([id, course]) => ({
				...course,
				id: id,
			}))
			.filter((course) => formationIds.includes(course.formation));

		// Fetch formations data to enhance course information
		const formationsRef = ref(database, 'Elearning/Formations');
		const formationsSnapshot = await get(formationsRef);

		if (formationsSnapshot.exists()) {
			const formationsData = formationsSnapshot.val();

			// Add formation details to each course
			return instructorCourses.map((course) => {
				const formation = formationsData[course.formation] || {};
				return {
					...course,
					formationTitle: formation.titre || '',
					formationCategory: formation.category || '',
				};
			});
		}

		return instructorCourses;
	} catch (error) {
		console.error('Error fetching instructor courses:', error);
		throw error;
	}
};

// Enroll a student in a course
export const enrollStudentInCourse = async (
	userId,
	courseId,
	isPaid = false,
) => {
	try {
		if (!userId || !courseId)
			throw new Error('User ID and Course ID are required');

		// Get course details to verify it exists
		const courseRef = ref(database, `Elearning/Cours/${courseId}`);
		const courseSnapshot = await get(courseRef);

		if (!courseSnapshot.exists()) {
			throw new Error('Course does not exist');
		}

		const course = courseSnapshot.val();

		// Create new enrollment record in Inscriptions
		const inscriptionsRef = ref(database, 'Elearning/Inscriptions');
		const newInscriptionRef = push(inscriptionsRef);
		const inscriptionId = newInscriptionRef.key;

		const inscriptionData = {
			id: inscriptionId,
			apprenant: userId,
			formation: course.formation,
			dateInscription: new Date().toISOString(),
			statut: isPaid ? 'confirmé' : 'en attente',
		};

		// Save inscription
		await set(newInscriptionRef, inscriptionData);

		// Update student's inscriptions array
		const studentRef = ref(database, `Elearning/Apprenants/${userId}`);
		const studentSnapshot = await get(studentRef);

		if (studentSnapshot.exists()) {
			const studentData = studentSnapshot.val();
			const inscriptions = studentData.inscriptions || [];

			if (!inscriptions.includes(inscriptionId)) {
				inscriptions.push(inscriptionId);
				await update(studentRef, { inscriptions });
			}
		} else {
			// Create student record if doesn't exist
			const newStudentData = {
				id: userId,
				utilisateurId: userId,
				inscriptions: [inscriptionId],
				progression: 0,
			};
			await set(studentRef, newStudentData);
		}

		// Get user data for the enrollment record
		const userRef = ref(database, `Elearning/Utilisateurs/${userId}`);
		const userSnapshot = await get(userRef);
		let userName = 'User';
		let userEmail = 'user@email.com';

		if (userSnapshot.exists()) {
			const userData = userSnapshot.val();
			userName = `${userData.prenom} ${userData.nom}`;
			userEmail = userData.email;
		}

		// Create enrollment in Enrollments
		const enrollmentsRef = ref(database, `Elearning/Enrollments`);
		const newEnrollmentRef = push(enrollmentsRef);

		const enrollmentData = {
			courseId,
			courseName: course.titre,
			enrolledAt: new Date().toISOString(),
			userId,
			userName,
			userEmail,
		};

		await set(newEnrollmentRef, enrollmentData);

		return { success: true, enrollment: inscriptionData };
	} catch (error) {
		console.error('Error enrolling student in course:', error);
		throw error;
	}
};

// Update course progress for a student
export const updateCourseProgress = async (
	userId,
	courseId,
	progress,
	completedChapterId = null,
) => {
	try {
		if (!userId || !courseId)
			throw new Error('User ID and Course ID are required');

		// Update student progression
		const studentRef = ref(database, `Elearning/Apprenants/${userId}`);

		// Get current student data
		const studentSnapshot = await get(studentRef);
		if (!studentSnapshot.exists()) {
			throw new Error('Student does not exist');
		}

		// Update progression
		await update(studentRef, {
			progression: progress,
		});

		// If a chapter was completed, we might want to record it in an evaluations entry
		if (completedChapterId) {
			// This would be implemented based on your specific requirements
			// for tracking completed chapters
		}

		return { success: true };
	} catch (error) {
		console.error('Error updating course progress:', error);
		throw error;
	}
};

// Fetch site statistics for the NumberCounter component
export const fetchSiteStatistics = async () => {
	try {
		// Get instructors count (formateurs)
		const formateursRef = ref(database, 'Elearning/Formateurs');
		const formateursSnapshot = await get(formateursRef);
		const formateursCount = formateursSnapshot.exists()
			? Object.keys(formateursSnapshot.val()).length
			: 0;

		// Get courses count
		const coursesRef = ref(database, 'Elearning/Cours');
		const coursesSnapshot = await get(coursesRef);
		const coursesCount = coursesSnapshot.exists()
			? Object.keys(coursesSnapshot.val()).length
			: 0;

		// Get total course hours
		let totalHours = 0;
		if (coursesSnapshot.exists()) {
			const courses = coursesSnapshot.val();
			totalHours = Object.values(courses).reduce(
				(sum, course) => sum + (parseInt(course.duree) || 0),
				0,
			);
		}

		// Get students count (apprenants)
		const apprenantsRef = ref(database, 'Elearning/Apprenants');
		const apprenantsSnapshot = await get(apprenantsRef);
		const apprenantsCount = apprenantsSnapshot.exists()
			? Object.keys(apprenantsSnapshot.val()).length
			: 0;

		return {
			instructorCount: formateursCount,
			courseCount: coursesCount,
			contentHours: totalHours,
			studentCount: apprenantsCount,
		};
	} catch (error) {
		console.error('Error fetching site statistics:', error);
		return {
			instructorCount: 0,
			courseCount: 0,
			contentHours: 0,
			studentCount: 0,
		};
	}
};

// Fetch distinct formation categories for the SubjectCard component
export const fetchFormationCategories = async () => {
	try {
		// Get all formations
		const formationsRef = ref(database, 'Elearning/Formations');
		const formationsSnapshot = await get(formationsRef);

		if (!formationsSnapshot.exists()) {
			return [];
		}

		const formations = formationsSnapshot.val();

		// Extract unique categories with their data
		const categoriesMap = {};

		Object.values(formations).forEach((formation) => {
			if (formation.category && !categoriesMap[formation.category]) {
				categoriesMap[formation.category] = {
					name: formation.category,
					color: formation.color || '#0063ff',
					icon: formation.icon || 'FaBook',
				};
			}
		});

		// Convert to array with required structure
		return Object.entries(categoriesMap).map(([category, data], index) => ({
			id: index + 1,
			name: data.name,
			color: data.color,
			icon: data.icon,
			delay: 0.2 + index * 0.1,
		}));
	} catch (error) {
		console.error('Error fetching formation categories:', error);
		return [];
	}
};

// Fetch testimonials for the Testimonial component
export const fetchTestimonials = async () => {
	try {
		// Get feedback entries
		const feedbackRef = ref(database, 'Elearning/Feedback');
		const feedbackSnapshot = await get(feedbackRef);

		if (!feedbackSnapshot.exists()) {
			return [];
		}

		const feedback = feedbackSnapshot.val();

		// Map through feedback objects and get additional user data for each
		const testimonialPromises = Object.entries(feedback).map(
			async ([id, feedbackItem]) => {
				// Get user data for the feedback
				const apprenantRef = ref(
					database,
					`Elearning/Apprenants/${feedbackItem.apprenant}`,
				);
				const apprenantSnapshot = await get(apprenantRef);

				// Get user details
				const userRef = ref(
					database,
					`Elearning/Utilisateurs/${feedbackItem.apprenant}`,
				);
				const userSnapshot = await get(userRef);

				let avatar = '';
				let fullName = 'Anonymous Student';

				if (apprenantSnapshot.exists()) {
					avatar = apprenantSnapshot.val().avatar || '';
				}

				if (userSnapshot.exists()) {
					const userData = userSnapshot.val();
					fullName = `${userData.prenom} ${userData.nom}`;
				}

				// Get formation name
				let formationName = '';
				if (feedbackItem.formation) {
					const formationRef = ref(
						database,
						`Elearning/Formations/${feedbackItem.formation}`,
					);
					const formationSnapshot = await get(formationRef);

					if (formationSnapshot.exists()) {
						formationName = formationSnapshot.val().titre || '';
					}
				}

				return {
					id,
					name: fullName,
					text: feedbackItem.commentaire || '',
					img: avatar,
					rating: feedbackItem.note || 5,
					date: feedbackItem.date || '',
					course: formationName,
					delay: 0.2 + parseInt(id.replace(/\D/g, '') || 0) * 0.1,
				};
			},
		);

		return await Promise.all(testimonialPromises);
	} catch (error) {
		console.error('Error fetching testimonials:', error);
		return [];
	}
};

// Fetch banner content from Firebase settings
export const fetchBannerContent = async () => {
	try {
		// Get settings data which might contain banner info
		const settingsRef = ref(database, 'Elearning/settings');
		const settingsSnapshot = await get(settingsRef);

		// Default banner content in case Firebase data is missing
		const defaultBanners = [
			{
				id: 'banner1',
				tag: 'CUSTOMIZE WITH YOUR SCHEDULE',
				title: 'Personalized Professional Online Tutor on Your Schedule',
				subtitle:
					'Our scheduling system allows you to select based on your free time. Keep track of your classes and never miss lectures.',
				link: '#',
			},
			{
				id: 'banner2',
				tag: 'QUALIFIED INSTRUCTORS',
				title: 'Talented and Qualified Tutors to Serve You',
				subtitle:
					'Learn from industry experts who are passionate about teaching and helping you achieve your goals.',
				link: '#',
				reverse: true,
			},
		];

		if (settingsSnapshot.exists()) {
			const settings = settingsSnapshot.val();

			// If banners exist in settings, use them
			if (settings.banners) {
				return settings.banners;
			}
		}

		// Return default banners if no data in Firebase
		return defaultBanners;
	} catch (error) {
		console.error('Error fetching banner content:', error);
		return [];
	}
};

// Fetch "Why Choose Us" features from Firebase
export const fetchWhyChooseUsContent = async () => {
	try {
		// Default features in case Firebase data is missing
		const defaultFeatures = [
			{
				id: 1,
				title: 'One-on-one Teaching',
				desc: 'All of our special education experts have a degree in special education.',
				icon: 'GrYoga',
				bgColor: '#0063ff',
				delay: 0.3,
			},
			{
				id: 2,
				title: '24/7 Tutor Availability',
				desc: 'Our tutors are always available to respond as quick as possible for you',
				icon: 'FaDumbbell',
				bgColor: '#73bc00',
				delay: 0.6,
			},
			{
				id: 3,
				title: 'Interactive Whiteboard',
				desc: 'Our digital whiteboard equipped with audio and video chat features.',
				icon: 'GiGymBag',
				bgColor: '#fa6400',
				delay: 0.9,
			},
			{
				id: 4,
				title: 'Affordable Prices',
				desc: 'Choose an expert tutor based on your budget and per hour.',
				icon: 'GiGymBag',
				bgColor: '#fe6baa',
				delay: 1.2,
			},
		];

		// Get settings data which contains Why Choose Us content
		const settingsRef = ref(database, 'Elearning/settings/features');
		const featuresSnapshot = await get(settingsRef);

		if (featuresSnapshot.exists()) {
			const features = featuresSnapshot.val();

			// If it's an array, return it directly
			if (Array.isArray(features)) {
				return features;
			}

			// If it's an object, convert to array
			if (typeof features === 'object') {
				return Object.entries(features).map(([id, feature], index) => ({
					id: id,
					...feature,
					delay: 0.3 + index * 0.3,
				}));
			}
		}

		// Return default features if no data in Firebase
		return defaultFeatures;
	} catch (error) {
		console.error('Error fetching Why Choose Us content:', error);
		return defaultFeatures;
	}
};

// Fetch Hero content from Firebase
export const fetchHeroContent = async () => {
	try {
		// Get hero content from settings
		const heroRef = ref(database, 'Elearning/settings/hero');
		const heroSnapshot = await get(heroRef);

		// Default hero content in case Firebase data is missing
		const defaultHero = {
			title: "Find Your Perfect <span class='text-primary'>Tutor</span>",
			subtitle:
				'We help you find perfect tutor for 1-on-1 lessons. It is completely free and private',
			tagline: '100% Satisfaction Guarantee',
			primaryButton: 'Get Started',
			secondaryButton: 'See how it works',
			primaryButtonLink: '/courses',
			secondaryButtonLink: '#how-it-works',
			imageUrl: '', // Will use the local image if empty
		};

		if (heroSnapshot.exists()) {
			const heroData = heroSnapshot.val();
			return {
				...defaultHero, // Fallback values for missing properties
				...heroData,
			};
		}

		return defaultHero;
	} catch (error) {
		console.error('Error fetching hero content:', error);
		return null;
	}
};
