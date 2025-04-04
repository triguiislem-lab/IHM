import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { sendResetPasswordEmail } from '../../utils/authUtils';

const ForgotPassword = () => {
	const [email, setEmail] = useState('');
	const [status, setStatus] = useState({ type: '', message: '' });
	const [isSubmitting, setIsSubmitting] = useState(false);

	const handleSubmit = async (e) => {
		e.preventDefault();
		setIsSubmitting(true);
		setStatus({ type: '', message: '' });

		try {
			await sendResetPasswordEmail(email);
			setStatus({
				type: 'success',
				message: 'Password reset email sent! Check your inbox.',
			});
			setEmail('');
		} catch (error) {
			setStatus({ type: 'error', message: error.message });
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
							Reset Password
						</h3>
						<h2 className='text-3xl font-semibold mt-2'>
							Forgot Your Password?
						</h2>
						<p className='text-gray-600 mt-4'>
							Enter your email address and we'll send you instructions to reset
							your password.
						</p>
					</div>

					<form
						onSubmit={handleSubmit}
						className='space-y-6'>
						{status.message && (
							<div
								className={`text-sm text-center p-3 rounded ${
									status.type === 'success'
										? 'bg-green-100 text-green-700'
										: 'bg-red-100 text-red-700'
								}`}>
								{status.message}
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
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								disabled={isSubmitting}
							/>
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
									Sending...
								</>
							) : (
								'Send Reset Link'
							)}
						</button>

						<div className='text-center space-y-2'>
							<p className='text-gray-600'>
								Remember your password?{' '}
								<Link
									to='/login'
									className='text-secondary hover:underline'>
									Login
								</Link>
							</p>
							<p className='text-gray-600'>
								Don't have an account?{' '}
								<Link
									to='/register'
									className='text-secondary hover:underline'>
									Register
								</Link>
							</p>
						</div>
					</form>
				</div>
			</div>
		</section>
	);
};

export default ForgotPassword;
