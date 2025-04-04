import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
	Search,
	SlidersHorizontal,
	Clock,
	Star,
	Library,
	Users,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { fetchCoursesFromDatabase } from '../utils/firebaseUtils';

const CoursesPage = () => {
	const [courses, setCourses] = useState([]);
	const [loading, setLoading] = useState(true);
	const [searchTerm, setSearchTerm] = useState('');
	const [selectedLevel, setSelectedLevel] = useState('');
	const [selectedCategory, setSelectedCategory] = useState('');
	const [sortOption, setSortOption] = useState('default');
	const levels = ['Débutant', 'Intermédiaire', 'Avancé'];
	const [categories, setCategories] = useState([]);

	useEffect(() => {
		const loadCourses = async () => {
			try {
				const coursesData = await fetchCoursesFromDatabase();
				setCourses(coursesData);

				// Extract unique categories
				const uniqueCategories = [
					...new Set(
						coursesData
							.map((course) => course.formationCategory)
							.filter(Boolean),
					),
				];
				setCategories(uniqueCategories);
			} catch (error) {
				console.error('Error loading courses:', error);
			} finally {
				setLoading(false);
			}
		};

		loadCourses();
	}, []);

	const filteredCourses = courses.filter((course) => {
		const matchesSearch =
			course.titre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
			course.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
			course.formationTitle?.toLowerCase().includes(searchTerm.toLowerCase());

		const matchesLevel =
			!selectedLevel ||
			course.level === selectedLevel ||
			course.formationLevel === selectedLevel;

		const matchesCategory =
			!selectedCategory || course.formationCategory === selectedCategory;

		return matchesSearch && matchesLevel && matchesCategory;
	});

	const sortedCourses = [...filteredCourses].sort((a, b) => {
		switch (sortOption) {
			case 'price-low':
				return (a.price || 0) - (b.price || 0);
			case 'price-high':
				return (b.price || 0) - (a.price || 0);
			case 'rating':
				return (b.rating || 0) - (a.rating || 0);
			case 'popular':
				return (b.students || 0) - (a.students || 0);
			default:
				return 0;
		}
	});

	if (loading) {
		return (
			<div className='container mx-auto px-4 py-16'>
				<div className='flex justify-center items-center h-64'>
					<div className='animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500'></div>
				</div>
			</div>
		);
	}

	return (
		<div className='container mx-auto px-4 py-16'>
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5 }}
				className='mb-8'>
				<h1 className='text-3xl font-bold mb-2'>Browse Our Courses</h1>
				<p className='text-gray-600'>
					Find the perfect course to enhance your skills and knowledge
				</p>
			</motion.div>

			{/* Search and Filter Section */}
			<div className='bg-white rounded-lg shadow-md p-6 mb-8'>
				<div className='flex flex-col md:flex-row gap-4 mb-6'>
					<div className='flex-grow relative'>
						<input
							type='text'
							placeholder='Search courses...'
							className='w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
						/>
						<Search
							className='absolute left-3 top-2.5 text-gray-400'
							size={18}
						/>
					</div>
					<div className='md:w-1/4'>
						<select
							className='w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
							value={sortOption}
							onChange={(e) => setSortOption(e.target.value)}>
							<option value='default'>Sort By</option>
							<option value='price-low'>Price: Low to High</option>
							<option value='price-high'>Price: High to Low</option>
							<option value='rating'>Highest Rated</option>
							<option value='popular'>Most Popular</option>
						</select>
					</div>
				</div>

				<div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
					<div>
						<label className='block text-sm font-medium text-gray-700 mb-1'>
							Level
						</label>
						<select
							className='w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
							value={selectedLevel}
							onChange={(e) => setSelectedLevel(e.target.value)}>
							<option value=''>All Levels</option>
							{levels.map((level) => (
								<option
									key={level}
									value={level}>
									{level}
								</option>
							))}
						</select>
					</div>
					<div>
						<label className='block text-sm font-medium text-gray-700 mb-1'>
							Category
						</label>
						<select
							className='w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
							value={selectedCategory}
							onChange={(e) => setSelectedCategory(e.target.value)}>
							<option value=''>All Categories</option>
							{categories.map((category) => (
								<option
									key={category}
									value={category}>
									{category}
								</option>
							))}
						</select>
					</div>
					<div className='flex items-end'>
						<button
							className='w-full bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg text-gray-600 font-medium flex items-center justify-center'
							onClick={() => {
								setSearchTerm('');
								setSelectedLevel('');
								setSelectedCategory('');
								setSortOption('default');
							}}>
							<SlidersHorizontal
								size={18}
								className='mr-2'
							/>{' '}
							Reset Filters
						</button>
					</div>
				</div>
			</div>

			{/* Course Cards */}
			{sortedCourses.length === 0 ? (
				<div className='text-center py-16'>
					<Library
						size={64}
						className='mx-auto text-gray-300 mb-4'
					/>
					<h3 className='text-xl font-semibold'>No courses found</h3>
					<p className='text-gray-500 mt-2'>
						Try adjusting your filters or search term
					</p>
				</div>
			) : (
				<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
					{sortedCourses.map((course) => (
						<motion.div
							key={course.id}
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							transition={{ duration: 0.5 }}
							className='bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow'>
							<Link to={`/course/${course.id}`}>
								<img
									src={course.image || course.formationImage}
									alt={course.titre}
									className='w-full h-48 object-cover'
								/>
							</Link>
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
									<h3 className='font-bold text-xl mb-2'>{course.titre}</h3>
								</Link>
								<p className='text-gray-600 text-sm mb-4 line-clamp-2'>
									{course.description}
								</p>
								<div className='flex items-center justify-between text-sm text-gray-500 mb-4'>
									<div className='flex items-center'>
										<Clock
											size={16}
											className='mr-1'
										/>
										<span>{course.duree || '0'} hours</span>
									</div>
									<div className='flex items-center'>
										<Users
											size={16}
											className='mr-1'
										/>
										<span>{course.students || 0} students</span>
									</div>
								</div>
								<div className='flex items-center justify-between'>
									<span className='font-bold text-lg'>
										${course.price || 0}
									</span>
									<Link
										to={`/checkout/${course.id}`}
										className='px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700'>
										Enroll Now
									</Link>
								</div>
							</div>
						</motion.div>
					))}
				</div>
			)}
		</div>
	);
};

export default CoursesPage;
