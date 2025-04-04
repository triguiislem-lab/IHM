import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { loginUser } from '../../utils/authUtils';

const Login = () => {
	const navigate = useNavigate();
	const [showPassword, setShowPassword] = useState(false);
	const [error, setError] = useState('');
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [formData, setFormData] = useState({
		email: '',
		password: '',
	});

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError('');
		setIsSubmitting(true);

		try {
			// Validate form data
			if (!formData.email || !formData.password) {
				setError('Email and password are required');
				setIsSubmitting(false);
				return;
			}

			console.log('Login.jsx - Attempting login with email:', formData.email);
			const result = await loginUser(formData.email, formData.password);

			const { user, userType } = result;
			console.log('Login.jsx - Login result:', result);
			console.log('Login.jsx - User:', user);
			console.log('Login.jsx - User type:', userType);

			if (!userType) {
				console.error('Login.jsx - No user type found after login');
				setError('User type not found. Please contact support.');
				setIsSubmitting(false);
				return;
			}

			// Redirect based on user type
			switch (userType) {
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
			console.error('Login.jsx - Login error:', error);

			// Format error message for user
			let errorMessage = error.message;

			// Handle common Firebase auth errors
			if (
				errorMessage.includes('auth/user-not-found') ||
				errorMessage.includes('auth/wrong-password')
			) {
				errorMessage = 'Invalid email or password';
			} else if (errorMessage.includes('auth/too-many-requests')) {
				errorMessage =
					'Too many failed login attempts. Please try again later.';
			} else if (errorMessage.includes('auth/network-request-failed')) {
				errorMessage = 'Network error. Please check your internet connection.';
			}

			setError(errorMessage);
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<section className='bg-[#f9f9f9] py-14 md:py-24'>
			<div className='container'>
				<div className='max-w-md mx-auto bg-white rounded-2xl shadow-md p-8'>
					<div className='text-center mb-8'>
						<h3 className='uppercase font-semibold text-orange-500'>
							Welcome Back
						</h3>
						<h2 className='text-3xl font-semibold mt-2'>
							Login to Your Account
						</h2>
					</div>

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
									placeholder='Enter your password'
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

						<div className='flex items-center justify-end'>
							<Link
								to='/forgot-password'
								className='text-secondary hover:underline'>
								Forgot Password?
							</Link>
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
									Logging in...
								</>
							) : (
								'Login'
							)}
						</button>

						<p className='text-center text-gray-600'>
							Don't have an account?{' '}
							<Link
								to='/register'
								className='text-secondary hover:underline'>
								Register
							</Link>
						</p>
					</form>
				</div>
			</div>
		</section>
	);
};

export default Login;
