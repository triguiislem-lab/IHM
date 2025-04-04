import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, BookMarked, Clock, Award } from 'lucide-react';
import DashboardLayout from '../../components/Dashboard/DashboardLayout';
import { fetchStudentCourses } from '../../utils/firebaseUtils';
import { getAuth } from 'firebase/auth';

const ProgressBar = ({ value, color = 'bg-secondary' }) => {
	return (
		<div className='w-full h-3 bg-gray-200 rounded-full overflow-hidden'>
			<div
				className={`h-full ${color}`}
				style={{ width: `${value}%` }}></div>
		</div>
	);
};

const StudentProgress = () => {
	const [loading, setLoading] = useState(true);
	const [courses, setCourses] = useState([]);
	const [progressStats, setProgressStats] = useState({
		totalProgress: 0,
		totalCourses: 0,
		completedCourses: 0,
		inProgressCourses: 0,
		notStartedCourses: 0,
		totalLessons: 0,
		completedLessons: 0,
		learningHours: 0,
	});

	useEffect(() => {
		const auth = getAuth();
		const currentUser = auth.currentUser;

		if (!currentUser) return;

		const loadProgress = async () => {
			try {
				const studentCourses = await fetchStudentCourses(currentUser.uid);
				setCourses(studentCourses);

				// Calculate overall stats
				const totalCourses = studentCourses.length;
				const completedCourses = studentCourses.filter(
					(c) => c.progress >= 100,
				).length;
				const inProgressCourses = studentCourses.filter(
					(c) => c.progress > 0 && c.progress < 100,
				).length;
				const notStartedCourses = studentCourses.filter(
					(c) => c.progress === 0,
				).length;

				// Sum all courses progress
				const totalProgressSum = studentCourses.reduce(
					(sum, course) => sum + (course.progress || 0),
					0,
				);
				const overallProgress =
					totalCourses > 0 ? totalProgressSum / totalCourses : 0;

				// Calculate total lessons and completed lessons
				const totalLessons = studentCourses.reduce(
					(sum, course) => sum + (course.lessons || 0),
					0,
				);
				const completedLessons = studentCourses.reduce((sum, course) => {
					const lessonCount = course.lessons || 0;
					const completedCount = Math.round(
						(course.progress / 100) * lessonCount,
					);
					return sum + completedCount;
				}, 0);

				// Estimate learning hours based on lesson progress and course duration
				const learningHours = studentCourses.reduce((sum, course) => {
					// Extract hours from duration (assuming format like "10h 30m")
					const durationMatch = (course.duration || '').match(/(\d+)h/);
					const courseHours = durationMatch
						? parseInt(durationMatch[1], 10)
						: 0;

					// Calculate hours based on progress percentage
					return sum + courseHours * (course.progress / 100);
				}, 0);

				setProgressStats({
					totalProgress: overallProgress,
					totalCourses,
					completedCourses,
					inProgressCourses,
					notStartedCourses,
					totalLessons,
					completedLessons,
					learningHours: Math.round(learningHours),
				});
			} catch (error) {
				console.error('Error loading student progress:', error);
			} finally {
				setLoading(false);
			}
		};

		loadProgress();
	}, []);

	if (loading) {
		return (
			<DashboardLayout userType='student'>
				<div className='flex justify-center items-center h-[calc(100vh-200px)]'>
					<div className='animate-spin rounded-full h-12 w-12 border-b-2 border-secondary'></div>
				</div>
			</DashboardLayout>
		);
	}

	return (
		<DashboardLayout userType='student'>
			<div className='mb-8'>
				<h1 className='text-2xl font-bold'>My Progress</h1>
				<p className='text-gray-600'>Track your learning journey</p>
			</div>

			{/* Overall Progress Card */}
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				className='bg-white rounded-xl shadow-sm p-6 mb-8'>
				<div className='flex justify-between items-center mb-4'>
					<h2 className='text-lg font-semibold'>Overall Progress</h2>
					<div className='text-2xl font-bold text-secondary'>
						{progressStats.totalProgress.toFixed(0)}%
					</div>
				</div>

				<ProgressBar value={progressStats.totalProgress} />

				<div className='mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-center'>
					<div className='p-3 rounded-lg bg-gray-50'>
						<p className='text-sm text-gray-500'>Total Courses</p>
						<p className='text-xl font-semibold'>
							{progressStats.totalCourses}
						</p>
					</div>
					<div className='p-3 rounded-lg bg-green-50'>
						<p className='text-sm text-gray-500'>Completed</p>
						<p className='text-xl font-semibold text-green-600'>
							{progressStats.completedCourses}
						</p>
					</div>
					<div className='p-3 rounded-lg bg-blue-50'>
						<p className='text-sm text-gray-500'>In Progress</p>
						<p className='text-xl font-semibold text-blue-600'>
							{progressStats.inProgressCourses}
						</p>
					</div>
					<div className='p-3 rounded-lg bg-yellow-50'>
						<p className='text-sm text-gray-500'>Not Started</p>
						<p className='text-xl font-semibold text-yellow-600'>
							{progressStats.notStartedCourses}
						</p>
					</div>
				</div>
			</motion.div>

			{/* Learning Stats */}
			<div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-10'>
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.3, delay: 0.1 }}
					className='bg-white p-6 rounded-xl shadow-sm'>
					<div className='flex items-center justify-between mb-4'>
						<h3 className='font-semibold'>Lessons Completed</h3>
						<div className='w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center'>
							<BookMarked
								className='text-purple-600'
								size={20}
							/>
						</div>
					</div>
					<div className='text-3xl font-bold'>
						{progressStats.completedLessons}/{progressStats.totalLessons}
					</div>
					<div className='mt-2 text-sm text-gray-500'>
						{(
							(progressStats.completedLessons / progressStats.totalLessons) *
								100 || 0
						).toFixed(0)}
						% of all lessons
					</div>
				</motion.div>

				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.3, delay: 0.2 }}
					className='bg-white p-6 rounded-xl shadow-sm'>
					<div className='flex items-center justify-between mb-4'>
						<h3 className='font-semibold'>Learning Hours</h3>
						<div className='w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center'>
							<Clock
								className='text-blue-600'
								size={20}
							/>
						</div>
					</div>
					<div className='text-3xl font-bold'>
						{progressStats.learningHours} hrs
					</div>
					<div className='mt-2 text-sm text-gray-500'>
						Total time spent learning
					</div>
				</motion.div>

				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.3, delay: 0.3 }}
					className='bg-white p-6 rounded-xl shadow-sm'>
					<div className='flex items-center justify-between mb-4'>
						<h3 className='font-semibold'>Completed Courses</h3>
						<div className='w-12 h-12 bg-green-100 rounded-full flex items-center justify-center'>
							<Award
								className='text-green-600'
								size={20}
							/>
						</div>
					</div>
					<div className='text-3xl font-bold'>
						{progressStats.completedCourses}
					</div>
					<div className='mt-2 text-sm text-gray-500'>
						{progressStats.totalCourses > 0
							? (
									(progressStats.completedCourses /
										progressStats.totalCourses) *
									100
							  ).toFixed(0)
							: 0}
						% course completion rate
					</div>
				</motion.div>
			</div>

			{/* Individual Course Progress */}
			<div className='bg-white rounded-xl shadow-sm p-6'>
				<h2 className='text-lg font-semibold mb-6'>Course Progress</h2>

				{courses.length === 0 ? (
					<div className='text-center py-10'>
						<p className='text-gray-500'>
							You haven't enrolled in any courses yet.
						</p>
					</div>
				) : (
					<div className='space-y-6'>
						{courses.map((course) => (
							<motion.div
								key={course.id}
								initial={{ opacity: 0, x: -20 }}
								animate={{ opacity: 1, x: 0 }}
								className='border-b pb-4 last:border-0 last:pb-0'>
								<div className='flex justify-between items-center mb-2'>
									<div className='font-semibold'>{course.title}</div>
									<div className='text-sm font-medium'>{course.progress}%</div>
								</div>
								<ProgressBar
									value={course.progress}
									color={
										course.progress >= 100
											? 'bg-green-500'
											: course.progress > 0
											? 'bg-secondary'
											: 'bg-yellow-400'
									}
								/>
								<div className='flex justify-between mt-1 text-xs text-gray-500'>
									<span>
										{course.progress === 0
											? 'Not started'
											: `${Math.round(
													(course.progress / 100) * course.lessons,
											  )} of ${course.lessons} lessons`}
									</span>
									{course.progress === 100 && <span>Completed</span>}
								</div>
							</motion.div>
						))}
					</div>
				)}
			</div>
		</DashboardLayout>
	);
};

export default StudentProgress;
