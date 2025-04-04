import React, { useState, useEffect } from 'react';
import { Clock, Star, Library, Users, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
	fetchCoursesFromDatabase,
	formatPrice,
} from '../../utils/firebaseUtils';

const Course = ({ course, index }) => {
	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			whileInView={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.5, delay: index * 0.1 }}
			whileHover={{ y: -5 }}
			className='bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 hover:shadow-xl transition-all duration-300'>
			<div className='relative'>
				<img
					src={course.image || course.formationImage}
					alt={course.titre}
					className='w-full h-56 object-cover'
				/>
				<div className='absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 flex items-center gap-1 shadow-md'>
					<Clock className='w-4 h-4 text-secondary' />
					<span className='text-sm'>{course.duree || '0'} hours</span>
				</div>
			</div>

			<div className='p-6'>
				<div className='flex justify-between items-start mb-2'>
					<span className='px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800'>
						{course.formationCategory || 'Course'}
					</span>
					<span className='flex items-center text-amber-500'>
						<Star
							size={16}
							className='fill-amber-500 mr-1'
						/>
						<span className='font-medium'>{course.rating || 4.5}</span>
						<span className='text-gray-400 text-xs ml-1'>
							({course.totalRatings || 0})
						</span>
					</span>
				</div>

				<Link to={`/course/${course.id}`}>
					<h3 className='text-xl font-bold mb-4 hover:text-secondary transition-colors duration-300'>
						{course.titre}
					</h3>
				</Link>

				<p className='text-gray-600 text-sm mb-4 line-clamp-2'>
					{course.description}
				</p>

				<div className='flex justify-between items-center mb-4'>
					<span className='text-2xl font-bold text-secondary'>
						{course.price === 0 ? 'Free' : formatPrice(course.price || 0)}
					</span>
				</div>

				<div className='flex items-center justify-between pt-4 border-t'>
					<div className='flex items-center gap-2 text-gray-600'>
						<Library className='w-4 h-4' />
						<span className='text-sm'>{course.lessons || 0} Lessons</span>
					</div>
					<div className='flex items-center gap-2 text-gray-600'>
						<Users className='w-4 h-4' />
						<span className='text-sm'>{course.students || 0} Students</span>
					</div>
				</div>
			</div>
		</motion.div>
	);
};

export const Courses = () => {
	const [courses, setCourses] = useState([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const loadCourses = async () => {
			try {
				const coursesData = await fetchCoursesFromDatabase();
				setCourses(coursesData);
			} catch (error) {
				console.error('Error loading courses:', error);
			} finally {
				setLoading(false);
			}
		};

		loadCourses();
	}, []);

	if (loading) {
		return (
			<div className='min-h-screen flex items-center justify-center'>
				<div className='animate-spin rounded-full h-12 w-12 border-b-2 border-secondary'></div>
			</div>
		);
	}

	return (
		<section className='bg-[#f9f9f9] py-14 md:py-24'>
			<div className='container'>
				<div className='space-y-4 text-center max-w-[600px] mx-auto mb-12'>
					<h3 className='uppercase font-semibold text-orange-500'>
						Popular Courses
					</h3>
					<h2 className='text-4xl font-semibold'>
						Pick A Course To Get Started
					</h2>
				</div>

				<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
					{courses.map((course, index) => (
						<Course
							key={course.id}
							course={course}
							index={index}
						/>
					))}
				</div>

				<motion.div
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					className='text-center mt-12'>
					<Link
						to='/courses'
						className='primary-btn inline-flex items-center gap-2'>
						<span>Browse more courses</span>
						<ArrowRight className='w-4 h-4' />
					</Link>
				</motion.div>
			</div>
		</section>
	);
};
