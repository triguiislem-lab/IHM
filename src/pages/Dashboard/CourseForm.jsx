// src/pages/Dashboard/CourseForm.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Save, ArrowLeft, Upload, Plus, Trash, Loader2, File } from 'lucide-react';
import DashboardLayout from '../../components/Dashboard/DashboardLayout';
import { getAuth } from 'firebase/auth';
import { getDatabase, ref, set, get, push } from 'firebase/database';
import {
	getStorage,
	ref as storageRef,
	uploadBytes,
	getDownloadURL,
} from 'firebase/storage';

const CourseForm = () => {
	const { courseId } = useParams();
	const navigate = useNavigate();
	const isEditing = !!courseId;

	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [course, setCourse] = useState({
		title: '',
		description: '',
		price: 0,
		category: '',
		level: 'Beginner',
		isPublished: false,
		image: '',
		chapters: [],
		attachments: [],
	});
	const [imageFile, setImageFile] = useState(null);
	const [imagePreview, setImagePreview] = useState('');
	const [attachment, setAttachment] = useState(null);

	const categories = [
		'Development',
		'Business',
		'Marketing',
		'Design',
		'Health',
		'Music',
	];
	const levels = ['Beginner', 'Intermediate', 'Advanced'];

	useEffect(() => {
		const auth = getAuth();
		const currentUser = auth.currentUser;

		if (!currentUser) {
			navigate('/login');
			return;
		}

		if (isEditing) {
			// Fetch existing course data if editing
			const fetchCourse = async () => {
				try {
					const db = getDatabase();
					const courseRef = ref(db, `courses/${courseId}`);
					const snapshot = await get(courseRef);

					if (snapshot.exists()) {
						const courseData = snapshot.val();
						setCourse(courseData);
						if (courseData.image) {
							setImagePreview(courseData.image);
						}
					} else {
						navigate('/dashboard/instructor/courses');
					}
				} catch (error) {
					console.error('Error fetching course:', error);
				} finally {
					setLoading(false);
				}
			};

			fetchCourse();
		} else {
			// Set default values for new course
			setCourse({
				...course,
				instructorId: currentUser.uid,
				instructorName: currentUser.displayName,
				createdAt: Date.now(),
				updatedAt: Date.now(),
			});
			setLoading(false);
		}
	}, [courseId, isEditing, navigate]);

	const handleChange = (e) => {
		const { name, value, type, checked } = e.target;
		setCourse({
			...course,
			[name]: type === 'checkbox' ? checked : value,
		});
	};

	const handleImageChange = (e) => {
		const file = e.target.files[0];
		if (file) {
			setImageFile(file);
			const previewUrl = URL.createObjectURL(file);
			setImagePreview(previewUrl);
		}
	};

	const handleAttachmentChange = (e) => {
		setAttachment(e.target.files[0]);
	};

	const uploadImage = async () => {
		if (!imageFile) return course.image || '';

		const storage = getStorage();
		const fileRef = storageRef(
			storage,
			`courseImages/${courseId || Date.now()}_${imageFile.name}`,
		);

		await uploadBytes(fileRef, imageFile);
		return await getDownloadURL(fileRef);
	};

	const uploadAttachment = async () => {
		if (!attachment) return null;

		const storage = getStorage();
		const fileRef = storageRef(
			storage,
			`courseAttachments/${courseId || Date.now()}_${attachment.name}`,
		);

		await uploadBytes(fileRef, attachment);
		const url = await getDownloadURL(fileRef);

		return {
			name: attachment.name,
			url: url,
			type: attachment.type,
			size: attachment.size,
			uploadedAt: Date.now(),
		};
	};

	const removeAttachment = (index) => {
		setCourse({
			...course,
			attachments: course.attachments.filter((_, i) => i !== index),
		});
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setSaving(true);

		try {
			const db = getDatabase();
			let finalCourseId = courseId;

			// Upload image if changed
			const imageUrl = await uploadImage();

			// Upload attachment if added
			let updatedAttachments = [...(course.attachments || [])];
			if (attachment) {
				const newAttachment = await uploadAttachment();
				if (newAttachment) {
					updatedAttachments.push(newAttachment);
				}
			}

			const updatedCourse = {
				...course,
				image: imageUrl,
				attachments: updatedAttachments,
				updatedAt: Date.now(),
			};

			if (isEditing) {
				// Update existing course
				await set(ref(db, `courses/${courseId}`), updatedCourse);
			} else {
				// Create new course
				const newCourseRef = push(ref(db, 'courses'));
				finalCourseId = newCourseRef.key;
				await set(newCourseRef, updatedCourse);
			}

			navigate(`/dashboard/instructor/courses/${finalCourseId}`);
		} catch (error) {
			console.error('Error saving course:', error);
			alert('Error saving course. Please try again.');
		} finally {
			setSaving(false);
		}
	};

	if (loading) {
		return (
			<DashboardLayout userType='instructor'>
				<div className='flex justify-center items-center h-[calc(100vh-200px)]'>
					<div className='animate-spin rounded-full h-12 w-12 border-b-2 border-secondary'></div>
				</div>
			</DashboardLayout>
		);
	}

	return (
		<DashboardLayout userType='instructor'>
			<div className='mb-8'>
				<button
					onClick={() => navigate('/dashboard/instructor')}
					className='flex items-center text-gray-600 hover:text-gray-900 mb-4'>
					<ArrowLeft
						size={16}
						className='mr-2'
					/>
					Back to Dashboard
				</button>
				<h1 className='text-2xl font-bold'>
					{isEditing ? 'Edit Course' : 'Create New Course'}
				</h1>
			</div>

			<motion.div
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				className='bg-white rounded-xl shadow-sm p-6 mb-8'>
				<form
					onSubmit={handleSubmit}
					className='space-y-6'>
					{/* Course Basic Information */}
					<div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
						<div>
							<label className='block text-sm font-medium text-gray-700 mb-1'>
								Course Title
							</label>
							<input
								type='text'
								name='title'
								value={course.title}
								onChange={handleChange}
								className='w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-secondary focus:border-transparent'
								required
								placeholder='e.g. Web Development Masterclass'
							/>
						</div>

						<div>
							<label className='block text-sm font-medium text-gray-700 mb-1'>
								Price ($)
							</label>
							<input
								type='number'
								name='price'
								value={course.price}
								onChange={handleChange}
								className='w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-secondary focus:border-transparent'
								min='0'
								step='0.01'
							/>
						</div>

						<div>
							<label className='block text-sm font-medium text-gray-700 mb-1'>
								Category
							</label>
							<select
								name='category'
								value={course.category}
								onChange={handleChange}
								className='w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-secondary focus:border-transparent'
								required>
								<option value=''>Select a category</option>
								{categories.map((category) => (
									<option
										key={category}
										value={category}>
										{category}
									</option>
								))}
							</select>
						</div>

						<div>
							<label className='block text-sm font-medium text-gray-700 mb-1'>
								Level
							</label>
							<select
								name='level'
								value={course.level}
								onChange={handleChange}
								className='w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-secondary focus:border-transparent'>
								{levels.map((level) => (
									<option
										key={level}
										value={level}>
										{level}
									</option>
								))}
							</select>
						</div>

						<div className='md:col-span-2'>
							<label className='block text-sm font-medium text-gray-700 mb-1'>
								Course Description
							</label>
							<textarea
								name='description'
								value={course.description}
								onChange={handleChange}
								rows={4}
								className='w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-secondary focus:border-transparent'
								placeholder='Provide a detailed description of your course...'
							/>
						</div>
					</div>

					{/* Course Image */}
					<div>
						<label className='block text-sm font-medium text-gray-700 mb-1'>
							Course Image
						</label>
						<div className='flex items-start space-x-4'>
							{imagePreview && (
								<img
									src={imagePreview}
									alt='Course preview'
									className='h-40 w-40 object-cover rounded-md'
								/>
							)}
							<div className='flex-1'>
								<div className='flex items-center justify-center w-full'>
									<label className='flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100'>
										<div className='flex flex-col items-center justify-center pt-5 pb-6'>
											<Upload className='w-8 h-8 mb-3 text-gray-500' />
											<p className='text-sm text-gray-500'>
												Click to upload course image
											</p>
										</div>
										<input
											type='file'
											accept='image/*'
											onChange={handleImageChange}
											className='hidden'
										/>
									</label>
								</div>
								<p className='text-xs text-gray-500 mt-2'>
									Recommended size: 1280x720 (16:9 ratio)
								</p>
							</div>
						</div>
					</div>

					{/* Course Attachments */}
					<div>
						<label className='block text-sm font-medium text-gray-700 mb-3'>
							Course Attachments
						</label>

						<div className='mb-4'>
							{(course.attachments || []).length > 0 && (
								<div className='space-y-2 mb-4'>
									{course.attachments.map((item, index) => (
										<div
											key={index}
											className='flex items-center justify-between p-3 bg-gray-50 rounded-md'>
											<div className='flex items-center'>
												<File className='w-4 h-4 mr-2 text-gray-500' />
												<span className='text-sm'>{item.name}</span>
											</div>
											<button
												type='button'
												onClick={() => removeAttachment(index)}
												className='text-red-500 hover:text-red-700'>
												<Trash className='w-4 h-4' />
											</button>
										</div>
									))}
								</div>
							)}

							<div className='flex items-center space-x-2'>
								<div className='relative flex-1'>
									<input
										type='file'
										onChange={handleAttachmentChange}
										className='block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 p-2'
									/>
								</div>
								{attachment && (
									<p className='text-sm text-gray-500'>{attachment.name}</p>
								)}
							</div>
							<p className='text-xs text-gray-500 mt-1'>
								Add resources for your students (PDF, documents, etc.)
							</p>
						</div>
					</div>

					{/* Published Status */}
					<div className='flex items-center'>
						<input
							type='checkbox'
							id='isPublished'
							name='isPublished'
							checked={course.isPublished}
							onChange={handleChange}
							className='h-4 w-4 text-secondary focus:ring-secondary border-gray-300 rounded'
						/>
						<label
							htmlFor='isPublished'
							className='ml-2 block text-sm text-gray-900'>
							Publish this course (Make it visible to students)
						</label>
					</div>

					{/* Submit Button */}
					<div className='flex justify-end pt-6'>
						<button
							type='submit'
							disabled={saving}
							className='flex items-center bg-secondary text-white px-6 py-2 rounded-lg hover:bg-secondary/90 transition disabled:bg-gray-300'>
							{saving ? (
								<>
									<Loader2 className='animate-spin h-4 w-4 mr-2' />
									Saving...
								</>
							) : (
								<>
									<Save
										className='mr-2'
										size={18}
									/>
									Save Course
								</>
							)}
						</button>
					</div>
				</form>
			</motion.div>
		</DashboardLayout>
	);
};

export default CourseForm;
