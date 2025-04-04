import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Clock, Award, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/Dashboard/DashboardLayout';
import { fetchStudentCourses } from '../../utils/firebaseUtils';
import { getAuth } from 'firebase/auth';

const StudentDashboard = () => {
	const [stats, setStats] = useState({
		enrolledCourses: 0,
		completedCourses: 0,
		totalProgress: 0,
		lastAccessedCourse: null,
	});
	const [user, setUser] = useState(null);
	const [loading, setLoading] = useState(true);
	const [recentCourses, setRecentCourses] = useState([]);

	useEffect(() => {
		const auth = getAuth();
		const currentUser = auth.currentUser;

		if (!currentUser) return;

		setUser(currentUser);

		const loadStudentData = async () => {
			try {
				// Fetch student's courses
				const courses = await fetchStudentCourses(currentUser.uid);
				
				// Calculate stats
				const completed = courses.filter(course => course.progress === 100).length;
				const avgProgress = courses.length > 0 
					? courses.reduce((sum, course) => sum + (course.progress || 0), 0) / courses.length
					: 0;

				// Sort by most recently enrolled and take the top 3
				const sortedCourses = [...courses].sort((a, b) => {
					return new Date(b.enrolledDate) - new Date(a.enrolledDate);
				}).slice(0, 3);

				setRecentCourses(sortedCourses);
				setStats({
					enrolledCourses: courses.length,
					completedCourses: completed,
					totalProgress: Math.round(avgProgress),
					lastAccessedCourse: sortedCourses[0] || null,
				});
			} catch (error) {
				console.error('Error loading student data:', error);
			} finally {
				setLoading(false);
			}
		};

		loadStudentData();
	}, []);

	if (loading) {
		return (
			<DashboardLayout userType="student">
				<div className="flex justify-center items-center h-[calc(100vh-200px)]">
					<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
				</div>
			</DashboardLayout>
		);
	}

	return (
		<DashboardLayout userType="student">
			<div className="mb-6">
				<h1 className="text-2xl font-bold mb-1">Student Dashboard</h1>
				<p className="text-gray-500">
					Welcome back, {user?.displayName || 'Student'}!
				</p>
			</div>

			{/* Stats Cards */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.3 }}
					className="bg-white rounded-lg shadow p-6"
				>
					<div className="flex items-center mb-4">
						<div className="p-3 bg-blue-100 rounded-full mr-4">
							<BookOpen size={20} className="text-blue-600" />
						</div>
						<h3 className="font-semibold text-gray-600">Enrolled Courses</h3>
					</div>
					<p className="text-3xl font-bold">{stats.enrolledCourses}</p>
					<Link
						to="/dashboard/student/courses"
						className="text-blue-600 text-sm font-medium inline-flex items-center mt-2"
					>
						View all courses <ArrowRight size={14} className="ml-1" />
					</Link>
				</motion.div>

				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.3, delay: 0.1 }}
					className="bg-white rounded-lg shadow p-6"
				>
					<div className="flex items-center mb-4">
						<div className="p-3 bg-green-100 rounded-full mr-4">
							<Award size={20} className="text-green-600" />
						</div>
						<h3 className="font-semibold text-gray-600">Completed Courses</h3>
					</div>
					<p className="text-3xl font-bold">{stats.completedCourses}</p>
					<p className="text-green-600 text-sm font-medium inline-flex items-center mt-2">
						{stats.enrolledCourses > 0
							? Math.round((stats.completedCourses / stats.enrolledCourses) * 100)
							: 0}
						% completion rate
					</p>
				</motion.div>

				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.3, delay: 0.2 }}
					className="bg-white rounded-lg shadow p-6"
				>
					<div className="flex items-center mb-4">
						<div className="p-3 bg-purple-100 rounded-full mr-4">
							<Clock size={20} className="text-purple-600" />
						</div>
						<h3 className="font-semibold text-gray-600">Overall Progress</h3>
					</div>
					<div className="mb-2">
						<span className="text-3xl font-bold">{stats.totalProgress}%</span>
					</div>
					<div className="w-full h-2 bg-gray-200 rounded-full">
						<div
							className="h-full bg-purple-600 rounded-full"
							style={{ width: `${stats.totalProgress}%` }}
						></div>
					</div>
				</motion.div>
			</div>

			{/* Recent Courses Section */}
			<motion.div
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				transition={{ duration: 0.5, delay: 0.3 }}
				className="bg-white rounded-lg shadow p-6 mb-8"
			>
				<div className="flex justify-between items-center mb-6">
					<h2 className="text-xl font-bold">Recent Courses</h2>
					<Link
						to="/dashboard/student/courses"
						className="text-blue-600 font-medium text-sm"
					>
						View All
					</Link>
				</div>

				{recentCourses.length === 0 ? (
					<div className="text-center py-8">
						<BookOpen size={48} className="mx-auto text-gray-300 mb-3" />
						<p className="text-gray-500">
							You haven't enrolled in any courses yet
						</p>
						<Link
							to="/courses"
							className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-lg text-sm"
						>
							Browse Courses
						</Link>
					</div>
				) : (
					<div className="space-y-4">
						{recentCourses.map((course) => (
							<div
								key={course.id}
								className="border rounded-lg p-4 flex flex-col md:flex-row items-center"
							>
								<img
									src={course.image || course.formationImage}
									alt={course.titre}
									className="w-full md:w-24 h-24 object-cover rounded-lg mb-4 md:mb-0 md:mr-4"
								/>
								<div className="flex-1 md:ml-2">
									<h3 className="font-semibold mb-1">{course.titre}</h3>
									<p className="text-sm text-gray-500 mb-2">
										{course.formationTitle}
									</p>
									<div className="flex justify-between items-center">
										<div className="w-40 h-1.5 bg-gray-200 rounded-full overflow-hidden">
											<div
												className="h-full bg-blue-600"
												style={{ width: `${course.progress || 0}%` }}
											></div>
										</div>
										<span className="text-sm font-medium">
											{course.progress || 0}%
										</span>
									</div>
								</div>
								<Link
									to={`/course/${course.id}`}
									className="md:ml-4 mt-3 md:mt-0 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg"
								>
									Continue
								</Link>
							</div>
						))}
					</div>
				)}
			</motion.div>

			{/* Learning Schedule / Timeline (could be implemented later) */}
			<motion.div
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				transition={{ duration: 0.5, delay: 0.4 }}
				className="bg-white rounded-lg shadow p-6"
			>
				<h2 className="text-xl font-bold mb-6">Learning Schedule</h2>
				<div className="text-center py-8">
					<Clock size={48} className="mx-auto text-gray-300 mb-3" />
					<p className="text-gray-500">
						Your learning schedule will be displayed here
					</p>
				</div>
			</motion.div>
		</DashboardLayout>
	);
};

export default StudentDashboard;
