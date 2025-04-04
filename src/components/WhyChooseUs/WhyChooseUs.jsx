import React, { useState, useEffect } from 'react';
import { GrYoga } from 'react-icons/gr';
import { FaDumbbell } from 'react-icons/fa6';
import { GiGymBag } from 'react-icons/gi';
import { motion } from 'framer-motion';
import { SlideLeft } from '../../utility/animation';
import { fetchWhyChooseUsContent } from '../../utils/firebaseUtils';

// Icon mapping function to convert string icon names to React components
const getIconComponent = (iconName) => {
	switch (iconName) {
		case 'GrYoga':
			return <GrYoga />;
		case 'FaDumbbell':
			return <FaDumbbell />;
		case 'GiGymBag':
		default:
			return <GiGymBag />;
	}
};

const WhyChooseUs = () => {
	const [features, setFeatures] = useState([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const loadFeatures = async () => {
			try {
				const featuresData = await fetchWhyChooseUsContent();
				setFeatures(featuresData);
			} catch (error) {
				console.error('Error loading features:', error);
			} finally {
				setLoading(false);
			}
		};

		loadFeatures();
	}, []);

	// Loading skeleton
	if (loading) {
		return (
			<div className='bg-[#f9fafc]'>
				<div className='container py-24'>
					<div className='space-y-4 p-6 text-center max-w-[500px] mx-auto mb-5'>
						<h1 className='uppercase font-semibold text-orange-600'>
							Why Choose Us
						</h1>
						<p className='font-semibold text-3xl'>
							Benefits of online tutoring services with us
						</p>
					</div>
					<div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6'>
						{[1, 2, 3, 4].map((i) => (
							<div
								key={i}
								className='space-y-4 p-6 rounded-xl shadow-[0_0_22px_rgba(0,0,0,0.15)] animate-pulse'>
								<div className='w-10 h-10 rounded-lg bg-gray-300'></div>
								<div className='h-4 bg-gray-300 rounded w-24'></div>
								<div className='h-3 bg-gray-200 rounded w-full'></div>
							</div>
						))}
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className='bg-[#f9fafc]'>
			<div className='container py-24'>
				{/* header section */}
				<div className='space-y-4 p-6 text-center max-w-[500px] mx-auto mb-5'>
					<h1 className='uppercase font-semibold text-orange-600'>
						Why Choose Us
					</h1>
					<p className='font-semibold text-3xl'>
						Benefits of online tutoring services with us
					</p>
				</div>
				{/* cards section */}
				<div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6'>
					{features.map((item) => {
						return (
							<motion.div
								key={item.id}
								variants={SlideLeft(item.delay)}
								initial='hidden'
								whileInView={'visible'}
								className='space-y-4 p-6 rounded-xl shadow-[0_0_22px_rgba(0,0,0,0.15)]'>
								{/* icon section */}
								<div
									style={{ backgroundColor: item.bgColor }}
									className='w-10 h-10 rounded-lg flex justify-center items-center text-white'>
									<div className='text-2xl'>{getIconComponent(item.icon)}</div>
								</div>
								<p className='font-semibold'>{item.title}</p>
								<p className='text-sm text-gray-500'>{item.desc}</p>
							</motion.div>
						);
					})}
				</div>
			</div>
		</div>
	);
};

export default WhyChooseUs;
