import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getAuth } from 'firebase/auth';
import { motion } from 'framer-motion';
import {
	fetchCoursesFromDatabase,
	enrollStudentInCourse,
	formatPrice,
} from '../utils/firebaseUtils';
import { ArrowLeft, CreditCard, CheckCircle } from 'lucide-react';

const CheckoutPage = () => {
	const { courseId } = useParams();
	const navigate = useNavigate();
	const [course, setCourse] = useState(null);
	const [loading, setLoading] = useState(true);
	const [processingPayment, setProcessingPayment] = useState(false);
	const [paymentComplete, setPaymentComplete] = useState(false);
	const [user, setUser] = useState(null);

	useEffect(() => {
		const auth = getAuth();
		const currentUser = auth.currentUser;

		if (!currentUser) {
			navigate('/login', { state: { from: `/checkout/${courseId}` } });
			return;
		}

		setUser(currentUser);

		const loadCourse = async () => {
			try {
				const coursesData = await fetchCoursesFromDatabase();
				const foundCourse = coursesData.find((c) => c.id === courseId);

				if (!foundCourse) {
					navigate('/courses');
					return;
				}

				setCourse(foundCourse);
			} catch (error) {
				console.error('Error loading course:', error);
			} finally {
				setLoading(false);
			}
		};

		loadCourse();
	}, [courseId, navigate]);

	const handlePayment = async () => {
		if (!user || !course) return;

		try {
			setProcessingPayment(true);

			// In a real app, you would integrate with a payment gateway like Stripe here
			// For now, we'll simulate a successful payment after a short delay
			await new Promise((resolve) => setTimeout(resolve, 1500));

			// After successful payment, enroll the student
			await enrollStudentInCourse(user.uid, courseId, true);

			setPaymentComplete(true);

			// Redirect to course after a brief display of the success message
			setTimeout(() => {
				navigate(`/course/${courseId}`);
			}, 2000);
		} catch (error) {
			console.error('Error processing payment:', error);
			alert('There was an error processing your payment. Please try again.');
		} finally {
			setProcessingPayment(false);
		}
	};

	if (loading) {
		return (
			<div className='min-h-screen flex items-center justify-center'>
				<div className='animate-spin rounded-full h-12 w-12 border-b-2 border-secondary'></div>
			</div>
		);
	}

	if (!course) {
		return (
			<div className='min-h-screen flex items-center justify-center'>
				<div className='text-center'>
					<h1 className='text-2xl font-bold mb-4'>Course Not Found</h1>
					<button
						onClick={() => navigate('/courses')}
						className='primary-btn flex items-center mx-auto'>
						<ArrowLeft
							size={16}
							className='mr-2'
						/>
						Browse Courses
					</button>
				</div>
			</div>
		);
	}

	return (
		<div className='min-h-screen bg-gray-50 py-12'>
			<div className='container max-w-4xl mx-auto px-4'>
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5 }}
					className='bg-white rounded-xl shadow-lg overflow-hidden'>
					<div className='p-8'>
						<div className='flex items-center mb-8'>
							<button
								onClick={() => navigate(`/course/${courseId}`)}
								className='text-gray-500 hover:text-secondary mr-4'>
								<ArrowLeft size={20} />
							</button>
							<h1 className='text-2xl font-bold'>Complete Your Purchase</h1>
						</div>

						{paymentComplete ? (
							<div className='text-center py-12'>
								<div className='w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4'>
									<CheckCircle
										size={32}
										className='text-green-600'
									/>
								</div>
								<h2 className='text-xl font-semibold mb-2'>
									Payment Successful!
								</h2>
								<p className='text-gray-600 mb-8'>
									You are now enrolled in this course.
								</p>
								<p className='text-gray-500'>
									Redirecting you to the course...
								</p>
							</div>
						) : (
							<>
								<div className='flex flex-col md:flex-row mb-8'>
									{/* Course Summary */}
									<div className='md:w-2/3 pr-0 md:pr-8 mb-6 md:mb-0'>
										<h2 className='text-lg font-semibold mb-4'>
											Order Summary
										</h2>
										<div className='flex items-start'>
											<img
												src={course.image}
												alt={course.title}
												className='w-24 h-24 object-cover rounded-md mr-4'
											/>
											<div>
												<h3 className='font-medium'>{course.title}</h3>
												<p className='text-gray-500 text-sm'>
													{course.instructor.name}
												</p>
												<div className='flex items-center mt-1 text-sm'>
													<span>{course.lessons} lessons</span>
													<span className='mx-2'>•</span>
													<span>{course.duration}</span>
												</div>
											</div>
										</div>
									</div>

									{/* Price Summary */}
									<div className='md:w-1/3 border-t md:border-t-0 md:border-l pt-6 md:pt-0 md:pl-8'>
										<h2 className='text-lg font-semibold mb-4'>
											Price Details
										</h2>
										<div className='flex justify-between mb-2'>
											<span className='text-gray-600'>Course Price</span>
											<span>{formatPrice(course.price)}</span>
										</div>
										<div className='border-t border-dashed pt-2 mt-2'>
											<div className='flex justify-between font-semibold'>
												<span>Total</span>
												<span className='text-lg'>
													{formatPrice(course.price)}
												</span>
											</div>
										</div>
									</div>
								</div>

								{/* Payment Form */}
								<div className='border-t pt-8'>
									<h2 className='text-lg font-semibold mb-6'>Payment Method</h2>

									{/* In a real app, you would integrate a secure payment form here */}
									<div className='p-4 border rounded-md mb-6'>
										<div className='flex items-center'>
											<CreditCard
												size={20}
												className='text-gray-500 mr-2'
											/>
											<span className='font-medium'>Credit / Debit Card</span>
										</div>

										<div className='mt-4 space-y-4'>
											<div>
												<label className='block text-sm text-gray-600 mb-1'>
													Card Number
												</label>
												<input
													type='text'
													placeholder='1234 1234 1234 1234'
													className='w-full p-2 border rounded'
													disabled={processingPayment}
												/>
											</div>

											<div className='flex gap-4'>
												<div className='w-1/2'>
													<label className='block text-sm text-gray-600 mb-1'>
														Expiration Date
													</label>
													<input
														type='text'
														placeholder='MM / YY'
														className='w-full p-2 border rounded'
														disabled={processingPayment}
													/>
												</div>

												<div className='w-1/2'>
													<label className='block text-sm text-gray-600 mb-1'>
														CVC
													</label>
													<input
														type='text'
														placeholder='123'
														className='w-full p-2 border rounded'
														disabled={processingPayment}
													/>
												</div>
											</div>

											<div>
												<label className='block text-sm text-gray-600 mb-1'>
													Cardholder Name
												</label>
												<input
													type='text'
													placeholder='John Doe'
													className='w-full p-2 border rounded'
													disabled={processingPayment}
												/>
											</div>
										</div>
									</div>

									<button
										onClick={handlePayment}
										disabled={processingPayment}
										className='primary-btn w-full flex items-center justify-center'>
										{processingPayment ? (
											<>
												<div className='animate-spin rounded-full h-4 w-4 border-2 border-white mr-2'></div>
												Processing...
											</>
										) : (
											`Pay ${formatPrice(course.price)} Now`
										)}
									</button>

									<p className='text-xs text-gray-500 mt-4 text-center'>
										By completing your purchase you agree to our Terms of
										Service and Privacy Policy.
									</p>
								</div>
							</>
						)}
					</div>
				</motion.div>
			</div>
		</div>
	);
};

export default CheckoutPage;
