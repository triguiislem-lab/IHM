import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getAuth } from 'firebase/auth';
import { ArrowLeft, BookOpen, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { fetchCoursesFromDatabase, updateCourseProgress } from '../utils/firebaseUtils';
import { ref, get } from 'firebase/database';
import { database } from '../../firebaseConfig';

const CoursePage = () => {
	const { courseId, chapterId } = useParams();
	const navigate = useNavigate();
	const [course, setCourse] = useState(null);
	const [loading, setLoading] = useState(true);
	const [enrollment, setEnrollment] = useState(null);
	const [activeModule, setActiveModule] = useState(null);
	const [user, setUser] = useState(null);
	const [completedModules, setCompletedModules] = useState([]);

	useEffect(() => {
		const auth = getAuth();
		const currentUser = auth.currentUser;

		if (!currentUser) {
			navigate('/login');
			return;
		}

		setUser(currentUser);

		const loadCourseData = async () => {
			try {
				setLoading(true);

				// Check if student is enrolled in any course
				const studentRef = ref(
					database,
					`Elearning/Apprenants/${currentUser.uid}`,
				);
				const studentSnapshot = await get(studentRef);

				if (!studentSnapshot.exists()) {
					navigate('/courses');
					return;
				}

				const studentData = studentSnapshot.val();
				const inscriptionIds = studentData.inscriptions || [];

				if (inscriptionIds.length === 0) {
					navigate('/courses');
					return;
				}

				// Get inscriptions
				const inscriptionsPromises = inscriptionIds.map((inscriptionId) =>
					get(ref(database, `Elearning/Inscriptions/${inscriptionId}`)),
				);

				const inscriptionsSnapshots = await Promise.all(inscriptionsPromises);
				const inscriptions = inscriptionsSnapshots
					.filter((snapshot) => snapshot.exists())
					.map((snapshot) => snapshot.val());

				// Load course details
				const courses = await fetchCoursesFromDatabase();
				const foundCourse = courses.find((c) => c.id === courseId);

				if (!foundCourse) {
					navigate('/courses');
					return;
				}

				// Check if user is enrolled in this course's formation
				const isEnrolled = inscriptions.some(
					(inscription) =>
						inscription.formation === foundCourse.formation &&
						inscription.statut === 'confirmé',
				);

				if (!isEnrolled) {
					// Not enrolled, redirect to course details
					navigate(`/course/${courseId}`);
					return;
				}

				setCourse(foundCourse);

				// Load modules for this course
				const modulesRef = ref(database, `Elearning/Modules`);
				const modulesSnapshot = await get(modulesRef);

				if (modulesSnapshot.exists()) {
					const modulesData = modulesSnapshot.val();
					const courseModules = Object.values(modulesData)
						.filter((module) => module.cours === courseId)
						.map((module) => ({
							...module,
							completed: false, // We'll set this based on evaluations if available
						}));

					// Attach modules to course
					foundCourse.modules = courseModules;

					// Set active module if provided in URL, otherwise use first module
					if (chapterId && courseModules.length > 0) {
						const module = courseModules.find((m) => m.id === chapterId);
						setActiveModule(module || courseModules[0]);
					} else if (courseModules.length > 0) {
						setActiveModule(courseModules[0]);
					}

					// Check for completed evaluations
					const evaluationsRef = ref(database, `Elearning/Evaluations`);
					const evaluationsSnapshot = await get(evaluationsRef);

					if (evaluationsSnapshot.exists()) {
						const evaluationsData = evaluationsSnapshot.val();
						const userEvaluations = Object.values(evaluationsData).filter(
							(evaluation) => evaluation.apprenant === currentUser.uid,
						);

						// Extract completed module IDs
						const completedModuleIds = userEvaluations.map(
							(evaluation) => evaluation.module,
						);
						setCompletedModules(completedModuleIds);

						// Update course modules with completion status
						foundCourse.modules = foundCourse.modules.map((module) => ({
							...module,
							completed: completedModuleIds.includes(module.id),
						}));
					}
				}

				// Set enrollment data
				setEnrollment({
					progress: studentData.progression || 0,
					// Add any other enrollment data you need
				});
			} catch (error) {
				console.error('Error loading course data:', error);
			} finally {
				setLoading(false);
			}
		};

		loadCourseData();
	}, [courseId, chapterId, navigate]);

	const markModuleComplete = async () => {
		if (!user || !course || !activeModule) return;

		try {
			const updatedCompleted = [...completedModules];

			// Add module ID if not already completed
			if (!updatedCompleted.includes(activeModule.id)) {
				updatedCompleted.push(activeModule.id);
			}

			// Calculate progress percentage
			const progressPercentage = Math.round(
				(updatedCompleted.length / course.modules.length) * 100,
			);

			// Update in Firebase
			await updateCourseProgress(
				user.uid,
				courseId,
				progressPercentage,
				activeModule.id,
			);

			// Update local state
			setCompletedModules(updatedCompleted);
			setEnrollment({ ...enrollment, progress: progressPercentage });

			// Mark the active module as completed
			if (course.modules) {
				course.modules = course.modules.map((module) =>
					module.id === activeModule.id
						? { ...module, completed: true }
						: module,
				);
			}
		} catch (error) {
			console.error('Error marking module complete:', error);
		}
	};

	if (loading) {
		return (
			<div className='min-h-screen flex items-center justify-center'>
				<div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500'></div>
			</div>
		);
	}

	return (
		<div className='min-h-screen bg-gray-50'>
			{/* Course Header */}
			<div className='bg-white shadow-sm border-b'>
				<div className='container py-4 flex items-center justify-between'>
					<Link
						to='/courses'
						className='flex items-center text-sm font-medium text-gray-600 hover:text-blue-600'>
						<ArrowLeft className='h-4 w-4 mr-1' />
						Back to Courses
					</Link>

					<div className='flex items-center'>
						<div className='text-sm font-medium text-gray-600 mr-4'>
							Progress: {enrollment?.progress || 0}%
						</div>
						<div className='w-32 bg-gray-200 rounded-full h-2'>
							<div
								className='bg-blue-600 h-2 rounded-full'
								style={{ width: `${enrollment?.progress || 0}%` }}
							/>
						</div>
					</div>
				</div>
			</div>

			<div className='container py-8 grid grid-cols-1 lg:grid-cols-3 gap-8'>
				{/* Sidebar */}
				<div className='col-span-1 order-2 lg:order-1'>
					<div className='bg-white p-6 rounded-xl shadow-sm border'>
						<h3 className='text-lg font-semibold mb-4'>Course Content</h3>

						<div className='space-y-2'>
							{course?.modules?.map((module, index) => (
								<button
									key={module.id}
									onClick={() => setActiveModule(module)}
									className={`w-full text-left p-3 rounded-lg flex items-center justify-between ${
										activeModule?.id === module.id
											? 'bg-blue-50 text-blue-700'
											: 'hover:bg-gray-50'
									}`}>
									<div className='flex items-center'>
										<span className='flex-shrink-0 w-6 h-6 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-xs font-medium'>
											{index + 1}
										</span>
										<span className='ml-3 text-sm font-medium truncate max-w-[180px]'>
											{module.titre}
										</span>
									</div>
									{module.completed ? (
										<CheckCircle className='h-4 w-4 text-green-500' />
									) : (
										<BookOpen className='h-4 w-4 text-gray-400' />
									)}
								</button>
							))}
						</div>
					</div>
				</div>

				{/* Content */}
				<div className='col-span-1 lg:col-span-2 order-1 lg:order-2'>
					{activeModule ? (
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							className='bg-white p-6 md:p-8 rounded-xl shadow-sm border'>
							<h2 className='text-2xl font-bold mb-6'>{activeModule.titre}</h2>

							{/* Module content would go here, for now showing a placeholder */}
							<div className='prose max-w-none'>
								<p className='mb-4'>{activeModule.contenu}</p>
							</div>

							<div className='mt-12 flex justify-between items-center pt-6 border-t'>
								<button
									onClick={() => {
										const currentIndex = course.modules.findIndex(
											(m) => m.id === activeModule.id,
										);

										// Check if there's a previous module
										if (currentIndex > 0) {
											setActiveModule(course.modules[currentIndex - 1]);
										}
									}}
									className={`text-sm font-medium px-4 py-2 rounded-lg ${
										course.modules.indexOf(activeModule) === 0
											? 'text-gray-400 cursor-not-allowed'
											: 'text-blue-600 hover:bg-blue-50'
									}`}
									disabled={course.modules.indexOf(activeModule) === 0}>
									Previous Module
								</button>

								{activeModule.completed ? (
									<button
										onClick={() => {
											const currentIndex = course.modules.findIndex(
												(m) => m.id === activeModule.id,
											);

											// Check if there's a next module
											if (currentIndex < course.modules.length - 1) {
												setActiveModule(course.modules[currentIndex + 1]);
											}
										}}
										className={`text-sm font-medium bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 ${
											course.modules.indexOf(activeModule) ===
											course.modules.length - 1
												? 'opacity-50 cursor-not-allowed'
												: ''
										}`}
										disabled={
											course.modules.indexOf(activeModule) ===
											course.modules.length - 1
										}>
										Next Module
									</button>
								) : (
									<button
										onClick={markModuleComplete}
										className='text-sm font-medium bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center'>
										<CheckCircle className='h-4 w-4 mr-2' />
										Mark as Complete
									</button>
								)}
							</div>
						</motion.div>
					) : (
						<div className='bg-white p-8 rounded-xl shadow-sm border text-center'>
							<h2 className='text-2xl font-bold mb-4'>No Modules Available</h2>
							<p className='text-gray-500'>
								This course doesn't have any modules yet.
							</p>
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default CoursePage;
