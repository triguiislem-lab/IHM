import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
	Book,
	BarChart3,
	Settings,
	LogOut,
	Menu,
	X,
	Home,
	BookOpen,
	Users,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { getAuth, signOut } from 'firebase/auth';

const DashboardLayout = ({ children, userType }) => {
	const [showSidebar, setShowSidebar] = useState(true);
	const location = useLocation();
	const navigate = useNavigate();
	const auth = getAuth();

	// On mobile, hide sidebar by default
	useEffect(() => {
		const handleResize = () => {
			setShowSidebar(window.innerWidth >= 768);
		};

		// Set initial state
		handleResize();

		// Add event listener
		window.addEventListener('resize', handleResize);

		// Clean up
		return () => window.removeEventListener('resize', handleResize);
	}, []);

	const handleLogout = async () => {
		try {
			await signOut(auth);
			navigate('/');
		} catch (error) {
			console.error('Error signing out:', error);
		}
	};

	// Navigation based on user type
	const getNavigationItems = () => {
		switch (userType) {
			case 'instructor':
			case 'formateur':
				return [
					{
						label: 'Dashboard',
						icon: <Home size={20} />,
						path: '/dashboard/instructor',
						active: location.pathname === '/dashboard/instructor',
					},
					{
						label: 'My Courses',
						icon: <BookOpen size={20} />,
						path: '/dashboard/instructor/courses',
						active: location.pathname.includes('/dashboard/instructor/courses'),
					},
					{
						label: 'Analytics',
						icon: <BarChart3 size={20} />,
						path: '/dashboard/instructor/analytics',
						active: location.pathname === '/dashboard/instructor/analytics',
					},
					{
						label: 'Settings',
						icon: <Settings size={20} />,
						path: '/dashboard/instructor/settings',
						active: location.pathname === '/dashboard/instructor/settings',
					},
				];
			case 'student':
			case 'apprenant':
				return [
					{
						label: 'Dashboard',
						icon: <Home size={20} />,
						path: '/dashboard/student',
						active: location.pathname === '/dashboard/student',
					},
					{
						label: 'My Courses',
						icon: <Book size={20} />,
						path: '/dashboard/student/courses',
						active: location.pathname === '/dashboard/student/courses',
					},
					{
						label: 'Progress',
						icon: <BarChart3 size={20} />,
						path: '/dashboard/student/progress',
						active: location.pathname === '/dashboard/student/progress',
					},
					{
						label: 'Settings',
						icon: <Settings size={20} />,
						path: '/dashboard/student/settings',
						active: location.pathname === '/dashboard/student/settings',
					},
				];
			case 'admin':
			case 'administrateur':
				return [
					{
						label: 'Dashboard',
						icon: <Home size={20} />,
						path: '/dashboard/admin',
						active: location.pathname === '/dashboard/admin',
					},
					{
						label: 'Users',
						icon: <Users size={20} />,
						path: '/dashboard/admin/users',
						active: location.pathname === '/dashboard/admin/users',
					},
					{
						label: 'Courses',
						icon: <BookOpen size={20} />,
						path: '/dashboard/admin/courses',
						active: location.pathname === '/dashboard/admin/courses',
					},
					{
						label: 'Settings',
						icon: <Settings size={20} />,
						path: '/dashboard/admin/settings',
						active: location.pathname === '/dashboard/admin/settings',
					},
				];
			default:
				return [];
		}
	};

	const navigationItems = getNavigationItems();

	return (
		<div className='flex h-screen bg-gray-50'>
			{/* Mobile menu button */}
			<div className='md:hidden fixed top-4 left-4 z-50'>
				<button
					onClick={() => setShowSidebar(!showSidebar)}
					className='p-2 rounded-md bg-white shadow-md'>
					{showSidebar ? <X size={24} /> : <Menu size={24} />}
				</button>
			</div>

			{/* Sidebar */}
			<motion.div
				initial={{ x: -300 }}
				animate={{ x: showSidebar ? 0 : -300 }}
				transition={{ duration: 0.3 }}
				className={`fixed inset-y-0 left-0 z-40 w-64 bg-white shadow-lg transform md:translate-x-0 md:relative`}>
				<div className='flex flex-col h-full'>
					{/* Dashboard Logo */}
					<div className='px-6 py-4 border-b'>
						<div className='flex items-center space-x-2'>
							<div className='w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-white'>
								<Book size={20} />
							</div>
							<div>
								<h1 className='text-xl font-bold'>E-Tutor</h1>
								<span className='text-xs text-gray-500 capitalize'>
									{userType} Portal
								</span>
							</div>
						</div>
					</div>

					{/* Navigation Links */}
					<nav className='flex-1 overflow-y-auto py-6 px-4'>
						<ul className='space-y-2'>
							{navigationItems.map((item) => (
								<li key={item.path}>
									<Link
										to={item.path}
										className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
											item.active
												? 'bg-secondary/10 text-secondary'
												: 'text-gray-700 hover:bg-gray-100'
										}`}>
										{item.icon}
										<span>{item.label}</span>
									</Link>
								</li>
							))}
						</ul>
					</nav>

					{/* Logout Button */}
					<div className='p-4 border-t'>
						<button
							onClick={handleLogout}
							className='flex items-center space-x-3 px-3 py-2 w-full text-left rounded-lg text-red-500 hover:bg-red-50 transition-colors'>
							<LogOut size={20} />
							<span>Logout</span>
						</button>
					</div>
				</div>
			</motion.div>

			{/* Main Content */}
			<div className='flex-1 overflow-x-hidden overflow-y-auto'>
				<div className='p-6 md:p-8'>{children}</div>
			</div>
		</div>
	);
};

export default DashboardLayout;
