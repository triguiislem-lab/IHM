import { database } from '../../firebaseConfig';
import { ref, get, set, update } from 'firebase/database';
import { getAuth } from 'firebase/auth';
import { fetchCompleteUserInfo } from './fetchCompleteUserInfo';
import { getCachedData, setCachedData } from './cacheUtils';

// Récupérer un formateur par ID
export const fetchInstructorById = async (instructorId) => {
	try {
		

		// Vérifier si l'ID est valide
		if (!instructorId) {
			
			return null;
		}

		// Utiliser le nouveau chemin standardisé
		const instructorRef = ref(database, `elearning/users/${instructorId}`);
		const snapshot = await get(instructorRef);

		if (snapshot.exists()) {
			const instructorData = snapshot.val();
			

			// Créer un objet formateur avec les informations nécessaires
			return {
				id: instructorId,
				name: `${instructorData.firstName || ''} ${instructorData.lastName || ''}`.trim() || 'Formateur',
				bio: instructorData.bio || instructorData.description || 'Informations du formateur non disponibles',
				expertise: instructorData.expertise || '',
				avatar: instructorData.avatar || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
			};
		}

		
		return null;
	} catch (error) {
		
		return null;
	}
};

// Fonction générique pour récupérer des données de Firebase
const fetchDataFromPath = async (path) => {
	try {
		
		const dataRef = ref(database, path);
		const snapshot = await get(dataRef);

		if (snapshot.exists()) {
			const data = snapshot.val();
			
			// Convert object to array if necessary, preserving IDs
			let result;
			if (Array.isArray(data)) {
				result = data;
			} else {
				// Convert object to array with IDs
				result = Object.entries(data).map(([id, value]) => ({
					id,
					...value
				}));
			}
			

			// Ensure all items have required properties (image and instructor for courses)
			result = await Promise.all(result.map(async (item) => {
				let updatedItem = { ...item };

				// Add default image if missing
				if (!updatedItem.image) {
					
					updatedItem.image = "https://images.unsplash.com/photo-1498050108023-c5249f4df085?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80";
				}

				// If this is a course, ensure it has instructor information
				if (path.includes('courses') && (!updatedItem.instructor || Object.keys(updatedItem.instructor || {}).length === 0)) {
					

					// Check if there's an instructorId but no instructor object
					if (updatedItem.instructorId) {
						// Try to fetch instructor data
						
						const instructorData = await fetchInstructorById(updatedItem.instructorId);

						if (instructorData) {
							
							updatedItem.instructor = instructorData;
						} else {
							
							updatedItem.instructor = {
								id: updatedItem.instructorId,
								name: "Formateur",
								bio: "Informations du formateur non disponibles",
								avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
							};
						}
					} else {
						// No instructorId, add default instructor
						
						updatedItem.instructor = {
							name: "Formateur",
							bio: "Informations du formateur non disponibles",
							avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
						};
					}
				}

				return updatedItem;
			}));

			return result;
		}
		
		return [];
	} catch (error) {
		
		throw error;
	}
};

// Récupérer les utilisateurs
export const fetchUsersFromDatabase = async () => {
	return fetchDataFromPath('elearning/users');
};

// Récupérer les administrateurs
export const fetchAdminsFromDatabase = async () => {
	// Note: Dans la nouvelle structure, les administrateurs sont dans users avec role=admin
	const users = await fetchDataFromPath('elearning/users');
	return users.filter(user => user.role === 'admin');
};

// Récupérer les apprenants
export const fetchApprenantsFromDatabase = async () => {
	// Note: Dans la nouvelle structure, les apprenants sont dans users avec role=student
	const users = await fetchDataFromPath('elearning/users');
	return users.filter(user => user.role === 'student');
};

// Récupérer les formateurs
export const fetchFormateursFromDatabase = async () => {
	// Note: Dans la nouvelle structure, les formateurs sont dans users avec role=instructor
	const users = await fetchDataFromPath('elearning/users');
	return users.filter(user => user.role === 'instructor');
};

// Fonction pour tester les chemins disponibles dans Firebase
export const testFirebasePaths = async () => {
	try {
		

		// Tester le chemin racine
		const rootRef = ref(database, '/');
		const rootSnapshot = await get(rootRef);
		if (rootSnapshot.exists()) {
			const rootData = rootSnapshot.val();
			
		}

		// Tester le chemin elearning
		const elearningRef = ref(database, '/elearning');
		const elearningSnapshot = await get(elearningRef);
		if (elearningSnapshot.exists()) {
			const elearningData = elearningSnapshot.val();
			
		} else {
			
		}

		// Examiner en détail la structure des cours
		const coursRef = ref(database, '/elearning/courses');
		const coursSnapshot = await get(coursRef);
		if (coursSnapshot.exists()) {
			const coursData = coursSnapshot.val();
			

			// Examiner le premier cours pour comprendre la structure
			const firstCourseId = Object.keys(coursData)[0];
			if (firstCourseId) {
				

				// Vérifier si le cours a des modules
				if (coursData[firstCourseId].modules) {
					

					// Examiner le premier module
					const firstModuleId = Object.keys(coursData[firstCourseId].modules)[0];
					if (firstModuleId) {
						
					}
				} else {
					
				}
			}
		} else {
			
		}

		// Examiner les formations
		const formationsRef = ref(database, '/elearning/specialites');
		const formationsSnapshot = await get(formationsRef);
		if (formationsSnapshot.exists()) {
			const formationsData = formationsSnapshot.val();
			

			// Examiner la première formation
			const firstFormationId = Object.keys(formationsData)[0];
			if (firstFormationId) {
				
			}
		} else {
			
		}

		// Examiner les inscriptions
		const inscriptionsRef = ref(database, '/elearning/enrollments');
		const inscriptionsSnapshot = await get(inscriptionsRef);
		if (inscriptionsSnapshot.exists()) {
			const inscriptionsData = inscriptionsSnapshot.val();
			

			// Examiner la première inscription
			const firstInscriptionId = Object.keys(inscriptionsData)[0];
			if (firstInscriptionId) {
				
			}
		} else {
			
		}

		// Examiner les évaluations
		const evaluationsRef = ref(database, '/elearning/evaluations');
		const evaluationsSnapshot = await get(evaluationsRef);
		if (evaluationsSnapshot.exists()) {
			const evaluationsData = evaluationsSnapshot.val();
			

			// Examiner la première évaluation
			const firstEvaluationId = Object.keys(evaluationsData)[0];
			if (firstEvaluationId) {
				
			}
		} else {
			
		}

		// Tester d'autres chemins possibles
		const paths = [
			'/elearning/courses',
			'/elearning/modules',
			'/elearning/evaluations',
			'/elearning/enrollments',
			'/elearning/users',
			'/elearning/feedback',
			'/elearning/specialites',
			'/elearning/disciplines',
			'/elearning/progress',
			'/elearning/settings'
		];

		for (const path of paths) {
			const testRef = ref(database, path);
			const testSnapshot = await get(testRef);
			
			if (testSnapshot.exists()) {
				const testData = testSnapshot.val();
				if (typeof testData === 'object') {
					
				} else {
					
				}
			}
		}

		return "Test completed";
	} catch (error) {
		
		throw error;
	}
};

// Récupérer les formations (spécialités dans la nouvelle structure)
export const fetchFormationsFromDatabase = async () => {
	try {
		// Utiliser le nouveau chemin standardisé
		let result = await fetchDataFromPath('elearning/specialites');

		// Si aucun résultat, essayer le chemin des courses comme fallback
		if (!result || result.length === 0) {
			
			result = await fetchDataFromPath('elearning/courses');
		}

		// Si toujours aucun résultat, utiliser des données de test
		if (!result || result.length === 0) {
			
			result = [
				{
					id: "f1",
					titre: "Développement Web Full Stack",
					description: "Formation complète sur le développement web",
					duree: "350",
					dateDebut: "2025-05-01",
					dateFin: "2025-11-01",
					image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?ixlib=rb-1.2.1&auto=format&fit=crop&w=700&q=80",
					formateur: "u2",
					category: "Web Development",
					level: "Intermédiaire",
					color: "#0063ff",
					icon: "FaComputer",
					cours: ["c1", "c2"]
				},
				{
					id: "f2",
					titre: "Data Science et Intelligence Artificielle",
					description: "Maîtrisez les bases de la data science et du machine learning",
					duree: "300",
					dateDebut: "2025-06-15",
					dateFin: "2025-12-15",
					image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?ixlib=rb-1.2.1&auto=format&fit=crop&w=700&q=80",
					formateur: "u5",
					category: "Programming",
					level: "Avancé",
					color: "#922aee",
					icon: "FaComputer",
					cours: ["c3", "c4"]
				},
				{
					id: "f3",
					titre: "Anglais Professionnel",
					description: "Perfectionnez votre anglais pour le monde professionnel",
					duree: "200",
					dateDebut: "2025-07-01",
					dateFin: "2025-10-01",
					image: "https://images.unsplash.com/photo-1536240478700-b869070f9279?ixlib=rb-1.2.1&auto=format&fit=crop&w=700&q=80",
					formateur: "u2",
					category: "Languages",
					level: "Débutant",
					color: "#00c986",
					icon: "FaBook",
					cours: ["c5"]
				}
			];
		}

		return result;
	} catch (error) {
		
		// En cas d'erreur, retourner des données de test
		return [
			{
				id: "f1",
				titre: "Développement Web Full Stack",
				description: "Formation complète sur le développement web",
				duree: "350",
				dateDebut: "2025-05-01",
				dateFin: "2025-11-01",
				image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?ixlib=rb-1.2.1&auto=format&fit=crop&w=700&q=80",
				formateur: "u2",
				category: "Web Development",
				level: "Intermédiaire",
				color: "#0063ff",
				icon: "FaComputer",
				cours: ["c1", "c2"]
			}
		];
	}
};

// Récupérer les cours avec mise en cache
export const fetchCoursesFromDatabase = async () => {
	try {
		// Vérifier si les données sont en cache
		const cacheKey = 'all_courses';
		const cachedData = getCachedData(cacheKey);

		if (cachedData) {
			
			return cachedData;
		}

		// Utiliser le nouveau chemin standardisé
		let result = await fetchDataFromPath('elearning/courses');

		// Si aucun résultat, utiliser des données de test
		if (!result || result.length === 0) {
			
		}

		// Si toujours aucun résultat, utiliser des données de test
		if (!result || result.length === 0) {
			
			result = [
				{
					id: "c1",
					title: "HTML/CSS Fondamentaux",
					description: "Apprenez les bases du développement web",
					contenu: "Structure HTML, sélecteurs CSS, mise en page responsive...",
					duration: "40 heures",
					formation: "f1",
					image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80",
					lessons: 8,
					level: "Débutant",
					price: 29,
					rating: 4.8,
					students: 24,
					topics: [
						"HTML5",
						"CSS3",
						"Responsive Design",
						"Flexbox",
						"CSS Grid"
					],
					totalRatings: 12,
					category: "Web Development",
					instructor: {
						name: "John Doe",
						bio: "Expert en développement web avec 10 ans d'expérience",
						avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
					},
					updatedAt: "2023-09-15T10:30:00Z"
				},
				{
					id: "c2",
					title: "JavaScript Avancé",
					description: "Maîtriser JavaScript et les frameworks modernes",
					contenu: "ES6+, promises, async/await, React basics",
					duration: "60 heures",
					formation: "f1",
					image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?ixlib=rb-1.2.1&auto=format&fit=crop&w=700&q=80",
					lessons: 15,
					level: "Avancé",
					price: 49,
					rating: 4.7,
					students: 18,
					topics: [
						"JavaScript ES6+",
						"Promises",
						"Async/Await",
						"React",
						"State Management"
					],
					totalRatings: 9,
					category: "Programming",
					instructor: {
						name: "Jane Smith",
						bio: "Développeuse JavaScript senior et formatrice",
						avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
					},
					updatedAt: "2023-10-05T14:20:00Z"
				}
			];
		}

	// Mettre en cache les résultats
	if (result && result.length > 0) {
		setCachedData(cacheKey, result);
	}

	return result;
	} catch (error) {
		
		// En cas d'erreur, retourner des données de test
		return [
			{
				id: "c1",
				title: "HTML/CSS Fondamentaux",
				description: "Apprenez les bases du développement web",
				contenu: "Structure HTML, sélecteurs CSS, mise en page responsive...",
				duration: "40 heures",
				formation: "f1",
				image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?ixlib=rb-1.2.1&auto=format&fit=crop&w=700&q=80",
				lessons: 8,
				level: "Débutant",
				price: 29,
				rating: 4.8,
				students: 24,
				topics: [
					"HTML5",
					"CSS3",
					"Responsive Design",
					"Flexbox",
					"CSS Grid"
				],
				totalRatings: 12,
				category: "Web Development",
				instructor: {
					name: "John Doe",
					bio: "Expert en développement web avec 10 ans d'expérience",
					avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
				},
				updatedAt: "2023-09-15T10:30:00Z"
			}
		];
	}
};

// Récupérer les modules
export const fetchModulesFromDatabase = async () => {
	return fetchDataFromPath('elearning/modules');
};

// Récupérer les spécialités
export const fetchSpecialitesFromDatabase = async () => {
	try {
		

		// Utiliser le nouveau chemin standardisé
		const specialitesRef = ref(database, 'elearning/specialites');
		const snapshot = await get(specialitesRef);

		if (snapshot.exists()) {
			const specialitesData = snapshot.val();
			

			// Convertir l'objet en tableau avec les IDs
			const specialitesArray = Object.entries(specialitesData).map(([id, data]) => ({
				id,
				...data
			}));

			return specialitesArray;
		}

		// Si aucune spécialité n'est trouvée, vérifier l'ancien chemin
		const oldPathRef = ref(database, 'Elearning/Specialites');
		const oldPathSnapshot = await get(oldPathRef);

		if (oldPathSnapshot.exists()) {
			const oldSpecialitesData = oldPathSnapshot.val();
			

			// Convertir l'objet en tableau avec les IDs
			const specialitesArray = Object.entries(oldSpecialitesData).map(([id, data]) => ({
				id,
				...data
			}));

			// Migrer les données vers le nouveau chemin
			try {
				const newSpecialitesRef = ref(database, 'elearning/specialites');
				await set(newSpecialitesRef, oldSpecialitesData);
				
			} catch (migrationError) {
				
			}

			return specialitesArray;
		}

		
		return [];
	} catch (error) {
		
		return [];
	}
};

// Récupérer les disciplines
export const fetchDisciplinesFromDatabase = async () => {
	try {
		

		// Utiliser le nouveau chemin standardisé
		const disciplinesRef = ref(database, 'elearning/disciplines');
		const snapshot = await get(disciplinesRef);

		if (snapshot.exists()) {
			const disciplinesData = snapshot.val();
			

			// Convertir l'objet en tableau avec les IDs
			const disciplinesArray = Object.entries(disciplinesData).map(([id, data]) => ({
				id,
				...data
			}));

			return disciplinesArray;
		}

		// Si aucune discipline n'est trouvée, vérifier l'ancien chemin
		const oldPathRef = ref(database, 'Elearning/Disciplines');
		const oldPathSnapshot = await get(oldPathRef);

		if (oldPathSnapshot.exists()) {
			const oldDisciplinesData = oldPathSnapshot.val();
			

			// Convertir l'objet en tableau avec les IDs
			const disciplinesArray = Object.entries(oldDisciplinesData).map(([id, data]) => ({
				id,
				...data
			}));

			// Migrer les données vers le nouveau chemin
			try {
				const newDisciplinesRef = ref(database, 'elearning/disciplines');
				await set(newDisciplinesRef, oldDisciplinesData);
				
			} catch (migrationError) {
				
			}

			return disciplinesArray;
		}

		
		return [];
	} catch (error) {
		
		return [];
	}
};

// Récupérer les inscriptions
export const fetchInscriptionsFromDatabase = async () => {
	return fetchDataFromPath('elearning/enrollments');
};

// Récupérer les enrollments (inscriptions aux cours)
export const fetchEnrollmentsFromDatabase = async () => {
	return fetchDataFromPath('elearning/enrollments');
};

// Récupérer les enrollments d'un utilisateur spécifique
export const fetchEnrollmentsByUser = async (userId) => {
	try {
		

		// Utiliser le chemin standardisé
		const enrollmentsRef = ref(database, `elearning/enrollments/${userId}`);
		const snapshot = await get(enrollmentsRef);
		let enrollments = [];

		if (snapshot.exists()) {
			const enrollmentsData = snapshot.val();
			

			// Convertir les données en tableau d'inscriptions
			enrollments = Object.entries(enrollmentsData).map(([courseId, data]) => ({
				courseId,
				userId,
				enrolledAt: data.enrolledAt || new Date().toISOString(),
				...data
			}));

			
		} else {
			

			// Essayer d'autres chemins possibles comme fallback
			const fallbackPaths = [
				'elearning/enrollments/byUser',
				'elearning/enrollments/byCourse'
			];

			let fallbackEnrollments = [];

			for (const path of fallbackPaths) {
				try {
					const legacyRef = ref(database, path);
					const legacySnapshot = await get(legacyRef);

					if (legacySnapshot.exists()) {
						const legacyData = legacySnapshot.val();
						const userEnrollments = Object.values(legacyData).filter(
							(enrollment) => enrollment.userId === userId
						);

						if (userEnrollments.length > 0) {
							
							fallbackEnrollments = [...fallbackEnrollments, ...userEnrollments];

							// Migrer les données vers le nouveau format
							for (const enrollment of userEnrollments) {
								const courseId = enrollment.courseId || enrollment.course?.id || enrollment.course;
								if (courseId) {
									try {
										// Enregistrer dans le nouveau format
										const newEnrollmentRef = ref(database, `elearning/enrollments/${courseId}/${userId}`);
										await set(newEnrollmentRef, {
											userId,
											courseId,
											enrolledAt: enrollment.enrolledAt || enrollment.date || new Date().toISOString(),
											enrollmentId: Date.now().toString()
										});

										// Ajouter également une référence dans byUser
										const userEnrollmentRef = ref(database, `elearning/enrollments/byUser/${userId}/${courseId}`);
										await set(userEnrollmentRef, {
											courseId,
											enrolledAt: enrollment.enrolledAt || enrollment.date || new Date().toISOString()
										});
										
									} catch (migrationError) {
										
									}
								}
							}
						}
					}
				} catch (error) {
					
				}
			}

			// Éliminer les doublons des inscriptions de fallback
			if (fallbackEnrollments.length > 0) {
				const uniqueEnrollments = [];
				const courseIds = new Set();

				fallbackEnrollments.forEach(enrollment => {
					const courseId = enrollment.courseId || enrollment.course?.id || enrollment.course;
					if (courseId && !courseIds.has(courseId)) {
						courseIds.add(courseId);
						// Normaliser l'objet d'inscription
						uniqueEnrollments.push({
							...enrollment,
							courseId,
							userId,
							enrolledAt: enrollment.enrolledAt || enrollment.date || new Date().toISOString()
						});
					}
				});

				
				enrollments = uniqueEnrollments;
			}
		}

		return enrollments;
	} catch (error) {
		
		// En cas d'erreur, retourner des données de test
		return [
			{
				courseId: "c1",
				courseName: "HTML/CSS Fondamentaux",
				enrolledAt: "2025-03-11T11:36:03.168Z",
				userEmail: "jean.dupont@email.com",
				userId: userId,
				userName: "Jean Dupont"
			},
			{
				courseId: "c2",
				courseName: "JavaScript Avancé",
				enrolledAt: "2025-03-15T12:06:54.744Z",
				userEmail: "jean.dupont@email.com",
				userId: userId,
				userName: "Jean Dupont"
			}
		];
	}
};

// Récupérer les évaluations
export const fetchEvaluationsFromDatabase = async () => {
	return fetchDataFromPath('elearning/evaluations');
};

// Récupérer les feedbacks
export const fetchFeedbacksFromDatabase = async () => {
	return fetchDataFromPath('elearning/feedback');
};

// Récupérer les paramètres
export const fetchSettingsFromDatabase = async () => {
	return fetchDataFromPath('elearning/settings');
};

// Récupérer un utilisateur spécifique par ID
export const fetchUserById = async (userId) => {
	try {
		const userRef = ref(database, `elearning/users/${userId}`);
		const snapshot = await get(userRef);

		if (snapshot.exists()) {
			return snapshot.val();
		}
		return null;
	} catch (error) {
		
		// En cas d'erreur, retourner des données de test
		return {
			id: userId,
			nom: "Dupont",
			prenom: "Jean",
			email: "jean.dupont@email.com",
			createdAt: "2025-03-01T10:30:52.592Z",
			userType: "apprenant"
		};
	}
};

// Récupérer les informations complètes d'un utilisateur (y compris son rôle spécifique)
// Cette fonction a été déplacée dans un fichier séparé pour plus de clarté
export { fetchCompleteUserInfo };

// Note: L'ancienne version de fetchCourseById a été supprimée car elle est remplacée par une version plus complète

// Récupérer une formation spécifique par ID
export const fetchFormationById = async (formationId) => {
	try {
		const formationRef = ref(database, `elearning/specialites/${formationId}`);
		const snapshot = await get(formationRef);

		if (snapshot.exists()) {
			return snapshot.val();
		}
		return null;
	} catch (error) {
		
		throw error;
	}
};

// Récupérer les inscriptions d'un apprenant
export const fetchInscriptionsByApprenant = async (apprenantId) => {
	try {
		// Utiliser le nouveau chemin standardisé
		const inscriptionsRef = ref(database, `elearning/enrollments/byUser/${apprenantId}`);
		const snapshot = await get(inscriptionsRef);

		if (snapshot.exists()) {
			const inscriptions = snapshot.val();
			// Convertir en tableau avec format standardisé
			const apprenantInscriptions = Object.entries(inscriptions).map(([courseId, data]) => ({
				id: `${apprenantId}_${courseId}`,
				apprenant: apprenantId,
				formation: courseId,
				dateInscription: data.enrolledAt,
				statut: data.status || 'active'
			}));
			return apprenantInscriptions;
		}
		return [];
	} catch (error) {
		
		// En cas d'erreur, retourner des données de test
		return [
			{
				id: "i1",
				apprenant: apprenantId,
				formation: "f1",
				dateInscription: "2025-04-15T11:36:03.168Z",
				statut: "confirmé"
			},
			{
				id: "i3",
				apprenant: apprenantId,
				formation: "f3",
				dateInscription: "2025-08-10T11:45:48.293Z",
				statut: "en attente"
			}
		];
	}
};

// Récupérer les inscriptions pour un cours spécifique
export const fetchCourseEnrollments = async (courseId) => {
	try {
		

		// Vérifier d'abord dans le nouveau chemin standardisé
		const enrollmentsRef = ref(database, `elearning/enrollments/byCourse/${courseId}`);
		const snapshot = await get(enrollmentsRef);

		if (snapshot.exists()) {
			const enrollmentsData = snapshot.val();
			

			// Convertir l'objet en tableau avec les IDs
			const enrollmentsArray = Object.entries(enrollmentsData).map(([userId, data]) => ({
				userId,
				courseId,
				...data
			}));

			return enrollmentsArray;
		}

		// Vérifier dans l'ancien chemin
		const oldPathRef = ref(database, `Elearning/Cours/${courseId}/enrollments`);
		const oldPathSnapshot = await get(oldPathRef);

		if (oldPathSnapshot.exists()) {
			const oldEnrollmentsData = oldPathSnapshot.val();
			

			// Convertir l'objet en tableau avec les IDs
			const enrollmentsArray = Object.entries(oldEnrollmentsData).map(([userId, data]) => ({
				userId,
				courseId,
				...data
			}));

			// Migrer les données vers le nouveau chemin
			try {
				for (const enrollment of enrollmentsArray) {
					const newEnrollmentRef = ref(database, `elearning/enrollments/byCourse/${courseId}/${enrollment.userId}`);
					await set(newEnrollmentRef, {
						userId: enrollment.userId,
						courseId,
						enrolledAt: enrollment.enrolledAt || new Date().toISOString(),
						status: 'active'
					});

					// Ajouter également une référence dans byUser
					const userEnrollmentRef = ref(database, `elearning/enrollments/byUser/${enrollment.userId}/${courseId}`);
					await set(userEnrollmentRef, {
						courseId,
						enrolledAt: enrollment.enrolledAt || new Date().toISOString(),
						status: 'active'
					});
				}
				
			} catch (migrationError) {
				
			}

			return enrollmentsArray;
		}

		// Vérifier dans le chemin des progressions
		const progressionsRef = ref(database, `elearning/progress`);
		const progressionsSnapshot = await get(progressionsRef);

		if (progressionsSnapshot.exists()) {
			const progressionsData = progressionsSnapshot.val();
			const enrollmentsArray = [];

			// Parcourir les utilisateurs et leurs progressions
			Object.entries(progressionsData).forEach(([userId, userProgressions]) => {
				if (userProgressions && userProgressions[courseId]) {
					enrollmentsArray.push({
						userId,
						courseId,
						enrolledAt: userProgressions[courseId].startDate || new Date().toISOString(),
						progress: userProgressions[courseId].progress || 0
					});
				}
			});

			if (enrollmentsArray.length > 0) {
				
				return enrollmentsArray;
			}
		}

		// Aucune inscription trouvée
		
		return [];
	} catch (error) {
		
		return [];
	}
};

// Récupérer les formations d'un formateur
export const fetchFormationsByFormateur = async (formateurId) => {
	try {
		// Utiliser le nouveau chemin standardisé
		const formationsRef = ref(database, 'elearning/courses');
		const snapshot = await get(formationsRef);

		if (snapshot.exists()) {
			const formations = snapshot.val();
			const formateurFormations = Object.values(formations).filter(
				(formation) => formation.instructorId === formateurId
			);
			return formateurFormations;
		}
		return [];
	} catch (error) {
		
		throw error;
	}
};

// Récupérer un cours spécifique par ID
export const fetchCourseById = async (courseId) => {
	try {
		

		// Utiliser le nouveau chemin standardisé
		const directCourseRef = ref(database, `elearning/courses/${courseId}`);
		const directCourseSnapshot = await get(directCourseRef);

		if (directCourseSnapshot.exists()) {
			
			const courseData = directCourseSnapshot.val();

			// Ajouter l'ID au cours
			const course = {
				id: courseId,
				...courseData
			};

			// Récupérer les modules du cours
			const modulesData = await fetchModulesByCourse(courseId);

			// Récupérer les informations du formateur si un instructorId est présent
			let instructorData = null;
			if (course.instructorId) {
				
				instructorData = await fetchInstructorById(course.instructorId);
			}

			// Créer l'objet cours complet
			const courseWithModules = {
				...course,
				modules: modulesData,
				// Ajouter les informations du formateur
				instructor: instructorData || course.instructor || {
					name: "Formateur",
					bio: "Informations du formateur non disponibles",
					avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
				}
			};
			
			return courseWithModules;
		}

		// Si non trouvé, essayer dans la collection complète
		const coursRef = ref(database, 'elearning/courses');
		const coursSnapshot = await get(coursRef);

		if (coursSnapshot.exists()) {
			const coursData = coursSnapshot.val();
			const courses = Object.entries(coursData).map(([id, data]) => ({
				id,
				...data
			}));
			

			const course = courses.find(c => c.id === courseId);
			

			if (course) {
				// Récupérer les modules du cours
				const modulesData = await fetchModulesByCourse(courseId);

				// Récupérer les informations du formateur si un instructorId est présent
				let instructorData = null;
				if (course.instructorId) {
					
					instructorData = await fetchInstructorById(course.instructorId);
				}

				// Créer l'objet cours complet
				const courseWithModules = {
					...course,
					modules: modulesData,
					// Ajouter les informations du formateur
					instructor: instructorData || course.instructor || {
						name: "Formateur",
						bio: "Informations du formateur non disponibles",
						avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
					}
				};
				
				return courseWithModules;
			}
		}

		// Si toujours pas trouvé, essayer dans l'ancien chemin comme fallback
		const altCoursesRef = ref(database, 'elearning/courses');
		const altCoursesSnapshot = await get(altCoursesRef);

		if (altCoursesSnapshot.exists()) {
			const altCoursesData = altCoursesSnapshot.val();
			const altCourses = Array.isArray(altCoursesData) ? altCoursesData : Object.values(altCoursesData);

			const altCourse = altCourses.find(c => c.id === courseId);
			if (altCourse) {
				return altCourse;
			}
		}

		// Si toujours pas trouvé, créer un cours factice basé sur l'ID
		
		return {
			id: courseId,
			title: `Cours ${courseId}`,
			description: "Description non disponible",
			// Utiliser une image par défaut de haute qualité
			image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80",
			modules: [],
			// Ajouter des informations sur le formateur
			instructor: {
				name: "Formateur",
				bio: "Informations du formateur non disponibles",
				avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
			},
			// Ajouter d'autres informations utiles
			duration: "Non spécifié",
			lessons: 0,
			students: 0,
			topics: ["Contenu non disponible"],
			category: "Non classé",
			level: "Non spécifié"
		};
	} catch (error) {
		
		throw error;
	}
};

// Récupérer les modules d'un cours spécifique
export const fetchModulesByCourse = async (courseId) => {
	try {
		
		let modulesFound = false;
		let modulesArray = [];

		// Chemins possibles pour les modules
		const modulePaths = [
			`elearning/courses/${courseId}/modules`,
			`elearning/modules/byCourse/${courseId}`,
			`Elearning/Cours/${courseId}/modules`,
			`Elearning/Modules/byCourse/${courseId}`
		];

		// Vérifier chaque chemin possible
		for (const path of modulePaths) {
			try {
				
				const moduleRef = ref(database, path);
				const moduleSnapshot = await get(moduleRef);

				if (moduleSnapshot.exists()) {
					const moduleData = moduleSnapshot.val();
					

					// Convertir les modules en tableau avec leurs IDs
					modulesArray = Object.entries(moduleData).map(([moduleId, moduleData]) => ({
						id: moduleId,
						...moduleData,
						courseId: courseId
					}));

					modulesFound = true;
					break;
				}
			} catch (pathError) {
				
			}
		}

		// Vérifier si les modules sont directement dans le cours
		if (!modulesFound) {
			const courseRef = ref(database, `elearning/courses/${courseId}`);
			const courseSnapshot = await get(courseRef);

			if (courseSnapshot.exists()) {
				const courseData = courseSnapshot.val();

				if (courseData.modules) {
					

					// Convertir les modules en tableau avec leurs IDs
					modulesArray = Object.entries(courseData.modules).map(([moduleId, moduleData]) => ({
						id: moduleId,
						...moduleData,
						courseId: courseId
					}));

					modulesFound = true;
				}
			}
		}

		// Si les modules ne sont pas directement dans le cours, essayer dans elearning/modules
		if (!modulesFound) {
			const modulesRef = ref(database, 'elearning/modules');
			const modulesSnapshot = await get(modulesRef);

			if (modulesSnapshot.exists()) {
				const modulesData = modulesSnapshot.val();
				const allModules = Object.entries(modulesData).map(([id, data]) => ({
					id,
					...data
				}));

				// Filtrer les modules qui appartiennent au cours spécifié
				modulesArray = allModules.filter(module => module.courseId === courseId);
				

				if (modulesArray.length > 0) {
					modulesFound = true;
				}
			}
		}

		// Si aucun module n'est trouvé, créer des modules par défaut
		if (!modulesFound || modulesArray.length === 0) {
			

			// Récupérer les informations du cours pour le titre
			let courseTitle = "Cours";
			try {
				const courseRef = ref(database, `elearning/courses/${courseId}`);
				const courseSnapshot = await get(courseRef);
				if (courseSnapshot.exists()) {
					const courseData = courseSnapshot.val();
					courseTitle = courseData.title || "Cours";
				}
			} catch (error) {
				
			}

			// Créer des modules par défaut
			modulesArray = [
				{
					id: `module1_${courseId}`,
					title: `Introduction à ${courseTitle}`,
					description: "Module d'introduction au cours",
					courseId: courseId,
					order: 1,
					status: "in-progress",
					score: 0,
					resources: [
						{
							id: `resource1_${courseId}`,
							title: "Introduction vidéo",
							type: "video",
							url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
							description: "Vidéo d'introduction au cours"
						},
						{
							id: `resource2_${courseId}`,
							title: "Support de cours",
							type: "pdf",
							url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
							description: "Support de cours au format PDF"
						}
					]
				},
				{
					id: `module2_${courseId}`,
					title: `Concepts fondamentaux`,
					description: "Concepts fondamentaux du cours",
					courseId: courseId,
					order: 2,
					status: "locked",
					score: 0,
					resources: [
						{
							id: `resource3_${courseId}`,
							title: "Présentation des concepts",
							type: "video",
							url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
							description: "Vidéo présentant les concepts fondamentaux"
						}
					]
				},
				{
					id: `module3_${courseId}`,
					title: `Applications pratiques`,
					description: "Applications pratiques des concepts",
					courseId: courseId,
					order: 3,
					status: "locked",
					score: 0,
					resources: [
						{
							id: `resource4_${courseId}`,
							title: "Exercices pratiques",
							type: "pdf",
							url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
							description: "Exercices pratiques au format PDF"
						}
					]
				}
			];
		}

		// Récupérer les évaluations pour chaque module
		for (const module of modulesArray) {
			module.evaluations = await fetchEvaluationsByModule(module.id);
			module.score = calculateModuleScore(module.evaluations);
			module.status = module.score >= 70 ? "completed" : "in-progress";
		}

		return modulesArray;
	} catch (error) {
		
		return [];
	}
};

// Récupérer les évaluations d'un module spécifique
export const fetchEvaluationsByModule = async (moduleId) => {
	try {
		
		let evaluationsFound = false;
		let evaluationsArray = [];

		// Chemins possibles pour les évaluations
		const evaluationPaths = [
			`elearning/evaluations/${moduleId}`,
			`elearning/evaluations/byModule/${moduleId}`,
			`elearning/modules/${moduleId}/evaluations`,
			`Elearning/Evaluations/${moduleId}`,
			`Elearning/Evaluations/byModule/${moduleId}`,
			`Elearning/Modules/${moduleId}/evaluations`
		];

		// Vérifier chaque chemin possible
		for (const path of evaluationPaths) {
			try {
				
				const evalRef = ref(database, path);
				const evalSnapshot = await get(evalRef);

				if (evalSnapshot.exists()) {
					const evalData = evalSnapshot.val();
					

					// Convertir les évaluations en tableau avec leurs IDs
					evaluationsArray = Object.entries(evalData).map(([evalId, evalData]) => ({
						id: evalId,
						...evalData,
						moduleId: moduleId
					}));

					evaluationsFound = true;
					break;
				}
			} catch (pathError) {
				
			}
		}

		// Vérifier d'abord si les évaluations sont directement dans le module
		if (!evaluationsFound) {
			const moduleRef = ref(database, `elearning/modules/${moduleId}`);
			const moduleSnapshot = await get(moduleRef);

			if (moduleSnapshot.exists()) {
				const moduleData = moduleSnapshot.val();

				if (moduleData.evaluations) {
					

					// Convertir les évaluations en tableau avec leurs IDs
					evaluationsArray = Object.entries(moduleData.evaluations).map(([evalId, evalData]) => ({
						id: evalId,
						...evalData,
						moduleId: moduleId
					}));

					evaluationsFound = true;
				}
			}
		}

		// Si les évaluations ne sont pas directement dans le module, essayer dans elearning/evaluations
		if (!evaluationsFound) {
			const evaluationsRef = ref(database, 'elearning/evaluations');
			const evaluationsSnapshot = await get(evaluationsRef);

			if (evaluationsSnapshot.exists()) {
				const evaluationsData = evaluationsSnapshot.val();
				const allEvaluations = Object.entries(evaluationsData).map(([id, data]) => ({
					id,
					...data
				}));

				// Filtrer les évaluations qui appartiennent au module spécifié
				evaluationsArray = allEvaluations.filter(evaluation => evaluation.moduleId === moduleId);
				

				if (evaluationsArray.length > 0) {
					evaluationsFound = true;
				}
			}
		}

		// Si aucune évaluation n'est trouvée, créer des évaluations par défaut
		if (!evaluationsFound || evaluationsArray.length === 0) {
			

			// Récupérer les informations du module pour le titre
			let moduleTitle = "Module";
			try {
				const moduleRef = ref(database, `elearning/modules/${moduleId}`);
				const moduleSnapshot = await get(moduleRef);
				if (moduleSnapshot.exists()) {
					const moduleData = moduleSnapshot.val();
					moduleTitle = moduleData.title || "Module";
				}
			} catch (error) {
				
			}

			// Créer des évaluations par défaut
			evaluationsArray = [
				{
					id: `quiz1_${moduleId}`,
					title: `Quiz: ${moduleTitle}`,
					type: "quiz",
					description: "Quiz d'évaluation des connaissances",
					moduleId: moduleId,
					score: 0,
					date: new Date().toISOString(),
					questions: [
						{
							id: `q1_${moduleId}`,
							text: "Question 1: Quelle est la réponse correcte ?",
							options: [
								"Réponse A",
								"Réponse B",
								"Réponse C",
								"Réponse D"
							],
							correctAnswer: 0
						},
						{
							id: `q2_${moduleId}`,
							text: "Question 2: Choisissez la bonne option.",
							options: [
								"Option 1",
								"Option 2",
								"Option 3",
								"Option 4"
							],
							correctAnswer: 1
						},
						{
							id: `q3_${moduleId}`,
							text: "Question 3: Quelle affirmation est vraie ?",
							options: [
								"Affirmation A",
								"Affirmation B",
								"Affirmation C",
								"Affirmation D"
							],
							correctAnswer: 2
						}
					]
				}
			];
		}

		return evaluationsArray;
	} catch (error) {
		
		return [];
	}
};

// Calculer le score d'un module basé sur ses évaluations
export const calculateModuleScore = (evaluations) => {
	if (!evaluations || evaluations.length === 0) {
		return 0;
	}

	// Calculer la somme des scores
	const totalScore = evaluations.reduce((sum, evaluation) => sum + (evaluation.score || 0), 0);

	// Calculer la moyenne
	const averageScore = totalScore / evaluations.length;

	// Arrondir à l'entier le plus proche
	return Math.round(averageScore);
};

// Calculer le score total d'un cours basé sur ses modules
export const calculateCourseScore = (modules) => {
	if (!modules || modules.length === 0) {
		return 0;
	}

	// Calculer la somme des scores des modules
	const totalScore = modules.reduce((sum, module) => sum + (module.score || 0), 0);

	// Calculer la moyenne
	const averageScore = totalScore / modules.length;

	// Arrondir à l'entier le plus proche
	return Math.round(averageScore);
};

// Déterminer si un cours est complété
export const isCourseCompleted = (modules) => {
	if (!modules || modules.length === 0) {
		return false;
	}

	// Un cours est complété si tous ses modules sont complétés
	return modules.every(module => module.status === "completed");
};

// Calculer le taux de progression d'un cours
export const calculateCourseProgress = (modules) => {
	if (!modules || modules.length === 0) {
		return 0;
	}

	// Compter le nombre de modules complétés
	const completedModules = modules.filter(module => module.status === "completed").length;

	// Calculer le pourcentage
	const progressPercentage = (completedModules / modules.length) * 100;

	// Arrondir à l'entier le plus proche
	return Math.round(progressPercentage);
};

// Créer des modules et des évaluations de test pour un cours
export const createTestModulesForCourse = async (courseId) => {
	try {
		

		// Vérifier si le cours existe
		const courseRef = ref(database, `elearning/courses/${courseId}`);
		const courseSnapshot = await get(courseRef);

		if (!courseSnapshot.exists()) {
			
			return false;
		}

		// Créer un objet pour stocker les modules
		const modulesData = {};

		// Créer 4 modules de test
		for (let i = 1; i <= 4; i++) {
			const moduleId = `m${i}_${courseId}`;
			const moduleData = {
				title: `Module ${i}: ${i === 1 ? 'Introduction' : i === 2 ? 'Concepts de base' : i === 3 ? 'Concepts avancés' : 'Projet final'}`,
				description: `Description du module ${i}. Ce module couvre les concepts ${i === 1 ? 'fondamentaux' : i === 2 ? 'intermédiaires' : i === 3 ? 'avancés' : 'pratiques'} du cours.`,
				order: i,
				courseId: courseId,
				evaluations: {}
			};

			// Créer 2 évaluations pour chaque module
			for (let j = 1; j <= 2; j++) {
				const evalId = `e${j}_${moduleId}`;
				const evalData = {
					title: `${j === 1 ? 'Quiz' : 'Devoir'} du module ${i}`,
					type: j === 1 ? 'quiz' : 'assignment',
					description: `${j === 1 ? 'Quiz' : 'Devoir'} pour évaluer les connaissances du module ${i}.`,
					moduleId: moduleId,
					maxScore: 100,
					score: Math.floor(Math.random() * 31) + 70, // Score entre 70 et 100
					date: new Date().toISOString()
				};

				moduleData.evaluations[evalId] = evalData;
			}

			modulesData[moduleId] = moduleData;
		}

		// Mettre à jour le cours avec les modules
		await update(courseRef, { modules: modulesData });

		
		return true;
	} catch (error) {
		
		return false;
	}
};

// Ajouter un module à un cours
export const addModuleToCourse = async (courseId, moduleData) => {
	try {
		

		// Vérifier si le cours existe
		const courseRef = ref(database, `elearning/courses/${courseId}`);
		const courseSnapshot = await get(courseRef);

		if (!courseSnapshot.exists()) {
			
			return false;
		}

		// Générer un ID unique pour le module
		const moduleId = `m${Date.now()}_${courseId}`;

		// Préparer les données du module
		const newModuleData = {
			...moduleData,
			courseId: courseId,
			evaluations: {}
		};

		// Mettre à jour le cours avec le nouveau module
		const modulesRef = ref(database, `elearning/courses/${courseId}/modules/${moduleId}`);
		await set(modulesRef, newModuleData);

		
		return moduleId;
	} catch (error) {
		
		return false;
	}
};

// Ajouter une évaluation à un module
export const addEvaluationToModule = async (courseId, moduleId, evaluationData) => {
	try {
		

		// Vérifier si le module existe
		const moduleRef = ref(database, `elearning/courses/${courseId}/modules/${moduleId}`);
		const moduleSnapshot = await get(moduleRef);

		if (!moduleSnapshot.exists()) {
			
			return false;
		}

		// Générer un ID unique pour l'évaluation
		const evalId = `e${Date.now()}_${moduleId}`;

		// Préparer les données de l'évaluation
		const newEvaluationData = {
			...evaluationData,
			moduleId: moduleId,
			date: new Date().toISOString()
		};

		// Mettre à jour le module avec la nouvelle évaluation
		const evalRef = ref(database, `elearning/courses/${courseId}/modules/${moduleId}/evaluations/${evalId}`);
		await set(evalRef, newEvaluationData);

		
		return evalId;
	} catch (error) {
		
		return false;
	}
};

// Récupérer les cours d'une formation
export const fetchCoursesByFormation = async (formationId) => {
	try {
		const formation = await fetchFormationById(formationId);
		if (formation && formation.cours && formation.cours.length > 0) {
			const coursPromises = formation.cours.map(courseId => fetchCourseById(courseId));
			return Promise.all(coursPromises);
		}
		return [];
	} catch (error) {
		
		throw error;
	}
};
