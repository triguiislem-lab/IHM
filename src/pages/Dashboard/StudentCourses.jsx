import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Clock, Star, Library } from 'lucide-react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/Dashboard/DashboardLayout';
import { fetchStudentCourses } from '../../utils/firebaseUtils';
import { getAuth } from 'firebase/auth';

const StudentCourses = () => {
	const [courses, setCourses] = useState([]);
	const [filteredCourses, setFilteredCourses] = useState([]);
	const [loading, setLoading] = useState(true);
	const [searchTerm, setSearchTerm] = useState('');
	const [filter, setFilter] = useState('all'); // all, in-progress, completed

	useEffect(() => {
		const auth = getAuth();
		const currentUser = auth.currentUser;

		if (!currentUser) return;

		const loadStudentCourses = async () => {
			try {
				const fetchedCourses = await fetchStudentCourses(currentUser.uid);
				setCourses(fetchedCourses);
				setFilteredCourses(fetchedCourses);
			} catch (error) {
				console.error('Error loading student courses:', error);
			} finally {
				setLoading(false);
			}
		};

		loadStudentCourses();
	}, []);

	useEffect(() => {
		// Apply filters when courses, searchTerm, or filter changes
		let result = courses;

		// Apply search filter
		if (searchTerm) {
			result = result.filter(
				(course) =>
					course.titre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
					course.description
						?.toLowerCase()
						.includes(searchTerm.toLowerCase()) ||
					course.formationTitle
						?.toLowerCase()
						.includes(searchTerm.toLowerCase()),
			);
		}

		// Apply status filter
		switch (filter) {
			case 'in-progress':
				result = result.filter(
					(course) => course.progress > 0 && course.progress < 100,
				);
				break;
			case 'completed':
				result = result.filter((course) => course.progress === 100);
				break;
			// 'all' - no filtering needed
		}

		setFilteredCourses(result);
	}, [courses, searchTerm, filter]);

	const getProgressColor = (progress) => {
		if (progress >= 75) return 'bg-green-500';
		if (progress >= 50) return 'bg-blue-500';
		if (progress >= 25) return 'bg-yellow-500';
		return 'bg-gray-300';
	};

	if (loading) {
		return (
			<DashboardLayout userType='student'>
				<div className='flex justify-center items-center h-[calc(100vh-200px)]'>
					<div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500'></div>
				</div>
			</DashboardLayout>
		);
	}

	return (
		<DashboardLayout userType='student'>
			<div className='mb-6'>
				<h1 className='text-2xl font-bold mb-1'>My Courses</h1>
				<p className='text-gray-500'>Manage and track your enrolled courses</p>
			</div>

			{/* Search and filter */}
			<div className='bg-white rounded-lg shadow p-4 mb-6'>
				<div className='flex flex-col md:flex-row gap-4'>
					<div className='flex-grow relative'>
						<input
							type='text'
							placeholder='Search your courses...'
							className='w-full pl-10 pr-4 py-2 border rounded-lg'
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
						/>
						<Search
							className='absolute left-3 top-2.5 text-gray-400'
							size={18}
						/>
					</div>
					<div>
						<select
							className='w-full px-4 py-2 border rounded-lg'
							value={filter}
							onChange={(e) => setFilter(e.target.value)}>
							<option value='all'>All Courses</option>
							<option value='in-progress'>In Progress</option>
							<option value='completed'>Completed</option>
						</select>
					</div>
				</div>
			</div>

			{filteredCourses.length === 0 ? (
				<div className='bg-white rounded-lg shadow p-8 text-center'>
					<Library
						size={48}
						className='mx-auto text-gray-300 mb-3'
					/>
					<h3 className='text-xl font-semibold mb-2'>No courses found</h3>
					<p className='text-gray-500 mb-4'>
						{courses.length === 0
							? "You haven't enrolled in any courses yet"
							: 'No courses match your current filters'}
					</p>
					{courses.length === 0 && (
						<Link
							to='/courses'
							className='inline-block px-4 py-2 bg-blue-600 text-white rounded-lg'>
							Browse Courses
						</Link>
					)}
				</div>
			) : (
				<div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
					{filteredCourses.map((course) => (
						<motion.div
							key={course.id}
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							className='bg-white rounded-lg shadow overflow-hidden'>
							<div className='flex flex-col md:flex-row'>
								<div className='md:w-1/3'>
									<img
										src={course.image || course.formationImage}
										alt={course.titre}
										className='w-full h-full object-cover'
									/>
								</div>
								<div className='p-4 flex-1'>
									<div className='flex justify-between mb-2'>
										<span className='px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800'>
											{course.formationCategory || 'Course'}
										</span>
										<div className='flex items-center text-amber-500'>
											<Star
												size={16}
												className='fill-amber-500'
											/>
											<span className='ml-1 text-sm'>
												{course.rating || 4.5}
											</span>
										</div>
									</div>
									<h3 className='font-bold text-lg mb-1'>{course.titre}</h3>
									<p className='text-gray-500 text-sm mb-3'>
										{course.formationTitle && `From: ${course.formationTitle}`}
									</p>

									<div className='mb-3'>
										<div className='flex justify-between text-sm mb-1'>
											<span>Progress</span>
											<span className='font-medium'>
												{course.progress || 0}%
											</span>
										</div>
										<div className='w-full h-2 bg-gray-200 rounded-full overflow-hidden'>
											<div
												className={`h-full ${getProgressColor(
													course.progress,
												)}`}
												style={{ width: `${course.progress || 0}%` }}></div>
										</div>
									</div>

									<div className='flex justify-between items-center'>
										<div className='text-gray-500 text-sm'>
											<div className='flex items-center'>
												<Clock
													size={14}
													className='mr-1'
												/>
												{course.duree || '0'} hours
											</div>
										</div>
										<Link
											to={`/course/${course.id}`}
											className='px-4 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700'>
											{course.progress === 100 ? 'Review' : 'Continue'}
										</Link>
									</div>
								</div>
							</div>
						</motion.div>
					))}
				</div>
			)}
		</DashboardLayout>
	);
};

export default StudentCourses;
