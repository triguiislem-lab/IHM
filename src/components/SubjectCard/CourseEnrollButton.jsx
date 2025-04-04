import React, { useState, useEffect } from 'react';
import { getAuth } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { enrollStudentInCourse, formatPrice } from '../../utils/firebaseUtils';
import { ref, get } from 'firebase/database';
import { database } from '../../../firebaseConfig';
import { Loader2 } from 'lucide-react';

const CourseEnrollButton = ({ course }) => {
	const [isLoading, setIsLoading] = useState(false);
	const [isEnrolled, setIsEnrolled] = useState(false);
	const [user, setUser] = useState(null);
	const navigate = useNavigate();

	// Extract properties from course object
	const courseId = course?.id;
	const price = course?.price || 0;
	const isFree = price === 0;

	useEffect(() => {
		const auth = getAuth();
		const currentUser = auth.currentUser;

		if (currentUser && courseId) {
			setUser(currentUser);
			// Check if user is already enrolled
			const checkEnrollment = async () => {
				try {
					const enrollmentRef = ref(
						database,
						`user_enrollments/${currentUser.uid}/${courseId}`,
					);
					const snapshot = await get(enrollmentRef);
					setIsEnrolled(snapshot.exists());
				} catch (error) {
					console.error('Error checking enrollment status:', error);
				}
			};

			checkEnrollment();
		}
	}, [courseId]);

	const handleEnrollment = async () => {
		if (!user) {
			// Redirect to login if user is not authenticated
			navigate('/login', { state: { from: `/course/${courseId}` } });
			return;
		}

		if (!courseId) {
			console.error('Course ID is required for enrollment');
			return;
		}

		try {
			setIsLoading(true);

			if (isFree) {
				// For free courses, enroll directly
				await enrollStudentInCourse(user.uid, courseId, true); // Mark as paid since it's free
				setIsEnrolled(true);
				// Redirect to course content
				navigate(`/course/${courseId}`);
			} else {
				// For paid courses, redirect to checkout
				navigate(`/checkout/${courseId}`);
			}
		} catch (error) {
			console.error('Error enrolling in course:', error);
		} finally {
			setIsLoading(false);
		}
	};

	if (isEnrolled) {
		return (
			<button
				onClick={() => navigate(`/course/${courseId}`)}
				className='bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded-md transition-colors duration-300 flex items-center justify-center'>
				Continue Learning
			</button>
		);
	}

	return (
		<button
			onClick={handleEnrollment}
			disabled={isLoading}
			className={`${
				isFree
					? 'bg-secondary hover:bg-secondary/90'
					: 'bg-secondary hover:bg-secondary/90'
			} text-white font-semibold py-2 px-6 rounded-md transition-colors duration-300 flex items-center justify-center ${
				isLoading ? 'opacity-70 cursor-not-allowed' : ''
			}`}>
			{isLoading ? (
				<>
					<Loader2 className='w-4 h-4 mr-2 animate-spin' />
					Processing...
				</>
			) : (
				<>
					{isFree ? 'Enroll Now (Free)' : `Enroll Now (${formatPrice(price)})`}
				</>
			)}
		</button>
	);
};

export default CourseEnrollButton;
