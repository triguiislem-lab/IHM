import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, Star, Library, Users, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';
import {
	fetchCoursesFromDatabase,
	formatPrice,
} from '../../utils/firebaseUtils';
import CourseEnrollButton from './CourseEnrollButton';
import { getDatabase, ref, get } from 'firebase/database';

const CourseDetails = () => {
	const { id } = useParams();
	const navigate = useNavigate();
	const [course, setCourse] = useState(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const loadCourse = async () => {
			try {
				const coursesData = await fetchCoursesFromDatabase();
				const foundCourse = coursesData.find((c) => c.id === id);

				if (!foundCourse) {
					console.log(`Course with id ${id} not found`);
					setLoading(false);
					return;
				}

				// We already have formation data in the course from fetchCoursesFromDatabase
				// but if you need additional formation details, here's the correct way:
				const database = getDatabase();
				const formationRef = ref(
					database,
					`Elearning/Formations/${foundCourse.formation}`,
				);
				const formationSnapshot = await get(formationRef);

				let formationData = null;
				if (formationSnapshot.exists()) {
					formationData = formationSnapshot.val();
				}

				setCourse({
					...foundCourse,
					formationData: formationData || {
						titre: foundCourse.formationTitle || 'Unknown Formation',
					},
				});
			} catch (error) {
				console.error('Error loading course:', error);
			} finally {
				setLoading(false);
			}
		};

		loadCourse();
	}, [id, navigate]);

	if (loading) {
		return (
			<div className='min-h-screen flex items-center justify-center'>
				<div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500'></div>
			</div>
		);
	}

	if (!course) {
		return (
			<div className='min-h-screen flex items-center justify-center'>
				<div className='text-center'>
					<h2 className='text-2xl font-bold mb-2'>Course Not Found</h2>
					<p className='text-gray-600 mb-6'>
						The course you're looking for doesn't exist or has been removed.
					</p>
					<button
						onClick={() => navigate('/courses')}
						className='bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700'>
						Browse Courses
					</button>
				</div>
			</div>
		);
	}

	return (
		<div className='min-h-screen bg-gray-50 pt-16 pb-20'>
			<div className='container'>
				<button
					onClick={() => navigate('/courses')}
					className='flex items-center text-sm font-medium text-gray-600 hover:text-blue-600 mb-6'>
					<ArrowLeft className='h-4 w-4 mr-1' />
					Back to Courses
				</button>

				<div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
					{/* Course Image */}
					<div className='lg:col-span-2'>
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.5 }}>
							<img
								src={course.image}
								alt={course.titre}
								className='w-full h-80 object-cover rounded-xl shadow-sm'
							/>

							<div className='bg-white p-6 md:p-8 rounded-xl shadow-sm mt-6 border'>
								<h1 className='text-3xl font-bold mb-4'>{course.titre}</h1>

								<div className='flex flex-wrap gap-2 mb-6'>
									<span className='px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium'>
										{course.level}
									</span>
									<span className='px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-sm font-medium'>
										Formation:{' '}
										{course.formationTitle ||
											course.formationData?.titre ||
											'Unknown'}
									</span>
								</div>

								<div className='prose max-w-none mb-6'>
									<p>{course.description}</p>
								</div>

								<div className='border-t pt-6'>
									<h3 className='text-xl font-semibold mb-4'>
										What You'll Learn
									</h3>

									<ul className='grid grid-cols-1 md:grid-cols-2 gap-3'>
										{course.topics &&
											course.topics.map((topic, index) => (
												<li
													key={index}
													className='flex items-start text-gray-700'>
													<span className='mr-2 text-green-500'>✓</span>
													{topic}
												</li>
											))}
									</ul>
								</div>
							</div>
						</motion.div>
					</div>

					{/* Course Info & Enrollment */}
					<div>
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.5, delay: 0.2 }}
							className='bg-white p-6 rounded-xl shadow-sm border sticky top-20'>
							<div className='flex items-baseline justify-between mb-4'>
								<h3 className='text-2xl font-bold'>
									{course.price === 0 ? 'Free' : formatPrice(course.price)}
								</h3>
							</div>

							<CourseEnrollButton course={course} />

							<div className='mt-6 space-y-4'>
								<div className='flex justify-between p-4 bg-gray-50 rounded-lg'>
									<div className='flex items-center'>
										<Clock className='h-5 w-5 text-gray-500 mr-3' />
										<span className='text-sm font-medium'>Duration</span>
									</div>
									<span className='text-sm font-semibold'>
										{course.duree} hours
									</span>
								</div>

								<div className='flex justify-between p-4 bg-gray-50 rounded-lg'>
									<div className='flex items-center'>
										<Star className='h-5 w-5 text-gray-500 mr-3' />
										<span className='text-sm font-medium'>Rating</span>
									</div>
									<div className='flex items-center'>
										<span className='text-sm font-semibold mr-1'>
											{course.rating}
										</span>
										<div className='flex'>
											{[...Array(5)].map((_, i) => (
												<Star
													key={i}
													className={`h-3 w-3 ${
														i < Math.floor(course.rating)
															? 'text-yellow-400'
															: 'text-gray-300'
													}`}
													fill={
														i < Math.floor(course.rating)
															? 'currentColor'
															: 'none'
													}
												/>
											))}
										</div>
										<span className='text-xs text-gray-500 ml-1'>
											({course.totalRatings})
										</span>
									</div>
								</div>

								<div className='flex justify-between p-4 bg-gray-50 rounded-lg'>
									<div className='flex items-center'>
										<Library className='h-5 w-5 text-gray-500 mr-3' />
										<span className='text-sm font-medium'>Lessons</span>
									</div>
									<span className='text-sm font-semibold'>
										{course.lessons} lessons
									</span>
								</div>

								<div className='flex justify-between p-4 bg-gray-50 rounded-lg'>
									<div className='flex items-center'>
										<Users className='h-5 w-5 text-gray-500 mr-3' />
										<span className='text-sm font-medium'>Students</span>
									</div>
									<span className='text-sm font-semibold'>
										{course.students} enrolled
									</span>
								</div>

								<div className='flex justify-between p-4 bg-gray-50 rounded-lg'>
									<div className='flex items-center'>
										<Calendar className='h-5 w-5 text-gray-500 mr-3' />
										<span className='text-sm font-medium'>Level</span>
									</div>
									<span className='text-sm font-semibold'>{course.level}</span>
								</div>
							</div>
						</motion.div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default CourseDetails;
