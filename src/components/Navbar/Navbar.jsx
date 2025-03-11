import React, { useState, useEffect } from 'react';
import {
	publicMenu,
	studentMenu,
	instructorMenu,
	adminMenu,
} from '../../mockData/data.js';
import { MdComputer, MdMenu, MdLogout, MdPerson } from 'react-icons/md';
import { motion } from 'framer-motion';
import ResponsiveMenu from './ResponsiveMenu.jsx';
import { Link, useNavigate } from 'react-router-dom';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import { getDatabase, ref, get } from 'firebase/database';

const UserBadge = ({ userType }) => {
	const badgeColors = {
		student: 'bg-blue-100 text-blue-800',
		instructor: 'bg-purple-100 text-purple-800',
		admin: 'bg-red-100 text-red-800',
	};

	if (!userType) {
		return (
			<span className='px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800'>
				Guest
			</span>
		);
	}

	const formattedType =
		userType.charAt(0).toUpperCase() + userType.slice(1).toLowerCase();

	return (
		<span
			className={`px-2 py-1 text-xs font-medium rounded-full ${
				badgeColors[userType.toLowerCase()] || 'bg-gray-100 text-gray-800'
			}`}>
			{formattedType}
		</span>
	);
};

const UserMenu = ({ user, userType, handleLogout }) => {
	const [isOpen, setIsOpen] = useState(false);

	return (
		<div className='relative'>
			<button
				onClick={() => setIsOpen(!isOpen)}
				className='flex items-center gap-2 hover:text-secondary transition-colors duration-300'>
				<MdPerson className='text-xl' />
				<span className='font-semibold'>{user.displayName || 'User'}</span>
			</button>

			{isOpen && (
				<div className='absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50'>
					<div className='px-4 py-2 border-b'>
						<div className='font-semibold'>{user.displayName}</div>
						<div className='text-sm text-gray-500'>{user.email}</div>
						<div className='mt-2'>
							<UserBadge userType={userType} />
						</div>
					</div>
					<Link
						to={`/dashboard/${userType}`}
						className='block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100'>
						Dashboard
					</Link>
					<Link
						to='/profile'
						className='block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100'>
						Profile Settings
					</Link>
					<button
						onClick={handleLogout}
						className='w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 flex items-center gap-2'>
						<MdLogout />
						Logout
					</button>
				</div>
			)}
		</div>
	);
};

const Navbar = () => {
	const [isOpen, setIsOpen] = useState(false);
	const [user, setUser] = useState(null);
	const [userType, setUserType] = useState(null);
	const [loading, setLoading] = useState(true);
	const navigate = useNavigate();
	const auth = getAuth();

	useEffect(() => {
		const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
			setLoading(true);
			try {
				if (currentUser) {
					setUser(currentUser);
					// Fetch user type from database
					const db = getDatabase();
					const userRef = ref(db, `users/${currentUser.uid}`);
					const snapshot = await get(userRef);
					const userData = snapshot.val();
					setUserType(userData?.userType || null);
				} else {
					setUser(null);
					setUserType(null);
				}
			} catch (error) {
				console.error("Error fetching user data:", error);
				setUser(null);
				setUserType(null);
			} finally {
				setLoading(false);
			}
		});

		return () => unsubscribe();
	}, [auth]);

	const handleLogout = async () => {
		try {
			await signOut(auth);
			setUser(null);
			setUserType(null);
			navigate('/');
		} catch (error) {
			console.error('Error signing out:', error);
		}
	};

	const getMenuItems = () => {
		if (!user || !userType) return publicMenu;

		const menuMap = {
			student: [...publicMenu, ...studentMenu],
			instructor: [...publicMenu, ...instructorMenu],
			admin: [...publicMenu, ...adminMenu],
		};

		return menuMap[userType.toLowerCase()] || publicMenu;
	};

	if (loading) {
		return (
			<div className="container flex justify-between items-center py-6">
				<div className="text-2xl flex items-center gap-2 font-bold">
					<MdComputer className="text-3xl text-secondary" />
					<Link to="/">E-Tutor</Link>
				</div>
			</div>
		);
	}

	return (
		<>
			<motion.div
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				transition={{ duration: 0.5, delay: 0.5 }}>
				<div className='container flex justify-between items-center py-6'>
					{/* Logo section */}
					<div className='text-2xl flex items-center gap-2 font-bold'>
						<MdComputer className='text-3xl text-secondary' />
						<Link to='/'>E-Tutor</Link>
					</div>

					{/* Menu section */}
					<div className='hidden lg:block'>
						<ul className='flex items-center gap-6'>
							{getMenuItems().map((item) => (
								<li key={item.id}>
									<Link
										to={item.link}
										className='inline-block text-gray-600 text-sm xl:text-base py-1 px-2 xl:px-3 hover:text-secondary transition-all duration-300 font-semibold'>
										{item.title}
									</Link>
								</li>
							))}
						</ul>
					</div>
					{/* CTA Button section */}
					<div className='hidden lg:flex items-center space-x-6'>
						{user ? (
							<UserMenu
								user={user}
								userType={userType}
								handleLogout={handleLogout}
							/>
						) : (
							<>
								<Link
									to='/login'
									className='font-semibold hover:text-secondary transition-colors duration-300'>
									Sign in
								</Link>
								<Link
									to='/register'
									className='text-white bg-secondary font-semibold rounded-full px-6 py-2 hover:bg-secondary/90 transition-colors duration-300'>
									Register
								</Link>
							</>
						)}
					</div>
					{/* Mobile Hamburger Menu */}
					<div
						className='lg:hidden'
						onClick={() => setIsOpen(!isOpen)}>
						<MdMenu className='text-4xl' />
					</div>
				</div>
			</motion.div>

			{/* mobile Sidebar section */}
			<ResponsiveMenu
				isOpen={isOpen}
				user={user}
				userType={userType}
				handleLogout={handleLogout}
				menuItems={getMenuItems()}
			/>
		</>
	);
};

export default Navbar;
