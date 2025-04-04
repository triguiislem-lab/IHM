import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { registerUser } from '../../utils/authUtils';

const Register = () => {
	const navigate = useNavigate();
	const [userType, setUserType] = useState('');
	const [showPassword, setShowPassword] = useState(false);
	const [error, setError] = useState('');
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [formData, setFormData] = useState({
		fullName: '',
		email: '',
		password: '',
		confirmPassword: '',
	});

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError('');
		setIsSubmitting(true);

		// Validate form data
		if (
			!formData.fullName ||
			!formData.email ||
			!formData.password ||
			!formData.confirmPassword
		) {
			setError('All fields are required');
			setIsSubmitting(false);
			return;
		}

		// Validate full name
		if (formData.fullName.trim().length < 3) {
			setError('Full name must be at least 3 characters long');
			setIsSubmitting(false);
			return;
		}

		// Validate email format
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(formData.email)) {
			setError('Please enter a valid email address');
			setIsSubmitting(false);
			return;
		}

		// Validate passwords match
		if (formData.password !== formData.confirmPassword) {
			setError('Passwords do not match');
			setIsSubmitting(false);
			return;
		}

		// Validate password strength
		if (formData.password.length < 6) {
			setError('Password must be at least 6 characters long');
			setIsSubmitting(false);
			return;
		}

		// Validate user type
		if (
			!userType ||
			!['apprenant', 'formateur', 'administrateur'].includes(userType)
		) {
			setError('Please select a valid user type');
			setIsSubmitting(false);
			return;
		}

		try {
			console.log('Register.jsx - Registering user with type:', userType);
			const user = await registerUser(
				formData.email,
				formData.password,
				formData.fullName,
				userType,
			);
			console.log('Register.jsx - Registration successful:', user);

			// Get the user type from the returned user object
			const registeredUserType = user.userType || userType;
			console.log(
				'Register.jsx - User type for redirection:',
				registeredUserType,
			);

			// Redirect based on user type
			switch (registeredUserType) {
				case 'apprenant':
					navigate('/dashboard/student');
					break;
				case 'formateur':
					navigate('/dashboard/instructor');
					break;
				case 'administrateur':
					navigate('/dashboard/admin');
					break;
				default:
					navigate('/');
			}
		} catch (error) {
			console.error('Register.jsx - Registration error:', error);

			// Format error message for user
			let errorMessage = error.message;

			// Handle common Firebase auth errors
			if (errorMessage.includes('auth/email-already-in-use')) {
				errorMessage =
					'This email is already registered. Please use a different email or login.';
			} else if (errorMessage.includes('auth/invalid-email')) {
				errorMessage = 'Invalid email address format.';
			} else if (errorMessage.includes('auth/weak-password')) {
				errorMessage = 'Password is too weak. Please use a stronger password.';
			} else if (errorMessage.includes('auth/network-request-failed')) {
				errorMessage = 'Network error. Please check your internet connection.';
			}

			setError(errorMessage);
		} finally {
			setIsSubmitting(false);
		}
	};

	const userTypes = [
		{
			id: 'apprenant',
			label: 'Student',
			description: 'Access courses and learn',
		},
		{
			id: 'formateur',
			label: 'Instructor',
			description: 'Teach and manage courses',
		},
		{
			id: 'administrateur',
			label: 'Admin',
			description: 'Manage the platform',
		},
	];

	return (
		<section className='bg-[#f9f9f9] py-14 md:py-24'>
			<div className='container'>
				<div className='max-w-md mx-auto bg-white rounded-2xl shadow-md p-8'>
					<div className='text-center mb-8'>
						<h3 className='uppercase font-semibold text-orange-500'>Join Us</h3>
						<h2 className='text-3xl font-semibold mt-2'>Create Your Account</h2>
					</div>

					{!userType ? (
						<div className='space-y-4'>
							<h3 className='text-lg font-medium text-center mb-6'>
								Select User Type
							</h3>
							{userTypes.map((type) => (
								<motion.button
									key={type.id}
									whileHover={{ scale: 1.02 }}
									whileTap={{ scale: 0.98 }}
									onClick={() => setUserType(type.id)}
									className='w-full p-4 border rounded-lg text-left hover:border-secondary transition-colors duration-300'>
									<div className='font-semibold text-lg'>{type.label}</div>
									<div className='text-sm text-gray-600'>
										{type.description}
									</div>
								</motion.button>
							))}
						</div>
					) : (
						<form
							onSubmit={handleSubmit}
							className='space-y-6'>
							{error && (
								<div className='text-red-500 text-sm text-center mb-4'>
									{error}
								</div>
							)}
							<div>
								<label className='block text-sm font-medium text-gray-700 mb-2'>
									Full Name
								</label>
								<input
									type='text'
									required
									className='w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary/20'
									placeholder='Enter your full name'
									value={formData.fullName}
									onChange={(e) =>
										setFormData({ ...formData, fullName: e.target.value })
									}
									disabled={isSubmitting}
								/>
							</div>

							<div>
								<label className='block text-sm font-medium text-gray-700 mb-2'>
									Email Address
								</label>
								<input
									type='email'
									required
									className='w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary/20'
									placeholder='Enter your email'
									value={formData.email}
									onChange={(e) =>
										setFormData({ ...formData, email: e.target.value })
									}
									disabled={isSubmitting}
								/>
							</div>

							<div>
								<label className='block text-sm font-medium text-gray-700 mb-2'>
									Password
								</label>
								<div className='relative'>
									<input
										type={showPassword ? 'text' : 'password'}
										required
										className='w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary/20'
										placeholder='Create a password'
										value={formData.password}
										onChange={(e) =>
											setFormData({ ...formData, password: e.target.value })
										}
										disabled={isSubmitting}
									/>
									<button
										type='button'
										onClick={() => setShowPassword(!showPassword)}
										className='absolute right-3 top-2.5 text-gray-400'
										disabled={isSubmitting}>
										{showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
									</button>
								</div>
							</div>

							<div>
								<label className='block text-sm font-medium text-gray-700 mb-2'>
									Confirm Password
								</label>
								<div className='relative'>
									<input
										type={showPassword ? 'text' : 'password'}
										required
										className='w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary/20'
										placeholder='Confirm your password'
										value={formData.confirmPassword}
										onChange={(e) =>
											setFormData({
												...formData,
												confirmPassword: e.target.value,
											})
										}
										disabled={isSubmitting}
									/>
								</div>
							</div>

							<div className='flex items-center justify-between'>
								<button
									type='button'
									onClick={() => setUserType('')}
									className='text-secondary hover:underline'
									disabled={isSubmitting}>
									Change User Type
								</button>
							</div>

							<button
								type='submit'
								disabled={isSubmitting}
								className={`w-full bg-secondary text-white font-semibold py-2 rounded-lg flex items-center justify-center ${
									isSubmitting
										? 'opacity-70 cursor-not-allowed'
										: 'hover:bg-secondary/90'
								} transition-colors duration-300`}>
								{isSubmitting ? (
									<>
										<Loader2 className='w-4 h-4 mr-2 animate-spin' />
										Creating Account...
									</>
								) : (
									'Create Account'
								)}
							</button>

							<p className='text-center text-gray-600'>
								Already have an account?{' '}
								<Link
									to='/login'
									className='text-secondary hover:underline'>
									Login
								</Link>
							</p>
						</form>
					)}
				</div>
			</div>
		</section>
	);
};

export default Register;
