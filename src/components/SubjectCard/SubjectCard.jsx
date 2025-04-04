import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaComputer, FaBook } from 'react-icons/fa6';
import { fetchFormationCategories } from '../../utils/firebaseUtils';

// Icon mapping function to convert string icon names to React components
const getIconComponent = (iconName) => {
	switch (iconName) {
		case 'FaComputer':
			return <FaComputer />;
		case 'FaBook':
		default:
			return <FaBook />;
	}
};

const SubjectCard = () => {
	const [categories, setCategories] = useState([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const loadCategories = async () => {
			try {
				const categoriesData = await fetchFormationCategories();
				setCategories(categoriesData);
			} catch (error) {
				console.error('Error loading categories:', error);
			} finally {
				setLoading(false);
			}
		};

		loadCategories();
	}, []);

	// Display placeholder or loading state if needed
	if (loading) {
		return (
			<div className='container py-14 md:py-24'>
				<div className='space-y-4 p-6 text-center max-w-[600px] mx-auto mb-5'>
					<h1 className='uppercase font-semibold text-orange-500'>
						Our tutor subjects
					</h1>
					<p className='font-semibold text-3xl'>
						Find Online Tutor in Any Subject
					</p>
				</div>
				<div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6'>
					{[1, 2, 3, 4].map((i) => (
						<div
							key={i}
							className='border rounded-lg border-secondary/20 p-4 flex justify-start items-center gap-4 animate-pulse'>
							<div className='w-10 h-10 rounded-md bg-gray-200'></div>
							<div className='h-4 bg-gray-200 rounded w-20'></div>
						</div>
					))}
				</div>
			</div>
		);
	}

	// Add a "See all" option if needed
	const displayCategories = [...categories];
	if (
		categories.length > 0 &&
		!categories.some((cat) => cat.name === 'See all')
	) {
		displayCategories.push({
			id: categories.length + 1,
			name: 'See all',
			color: '#464646',
			icon: 'FaBook',
			delay: 0.2 + categories.length * 0.1,
		});
	}

	return (
		<>
			<div className='container py-14 md:py-24'>
				{/* header section */}
				<div className='space-y-4 p-6 text-center max-w-[600px] mx-auto mb-5'>
					<h1 className='uppercase font-semibold text-orange-500'>
						Our tutor subjects
					</h1>
					<p className='font-semibold text-3xl'>
						Find Online Tutor in Any Subject
					</p>
				</div>
				{/* cards section */}
				<div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 '>
					{displayCategories.map((category) => {
						return (
							<motion.div
								key={category.id}
								initial={{ opacity: 0, x: -200 }}
								whileInView={{ opacity: 1, x: 0 }}
								transition={{
									type: 'spring',
									stiffness: 100,
									delay: category.delay,
								}}
								className='border rounded-lg border-secondary/20 p-4 flex justify-start items-center gap-4 hover:!scale-105 hover:!shadow-xl duration-200 cursor-pointer'>
								<div
									style={{
										color: category.color,
										backgroundColor: category.color + '20',
									}}
									className='w-10 h-10 rounded-md flex justify-center items-center'>
									{getIconComponent(category.icon)}
								</div>
								<p>{category.name}</p>
							</motion.div>
						);
					})}
				</div>
			</div>
		</>
	);
};

export default SubjectCard;
