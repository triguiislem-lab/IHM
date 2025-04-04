// src/pages/Dashboard/ChapterManager.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
	ArrowLeft,
	PlusCircle,
	List,
	Video,
	Edit,
	Trash,
	GripVertical,
	Check,
	X,
} from 'lucide-react';
import DashboardLayout from '../../components/Dashboard/DashboardLayout';
import { getAuth } from 'firebase/auth';
import { getDatabase, ref, get, update, push, remove } from 'firebase/database';
import {
	getStorage,
	ref as storageRef,
	uploadBytes,
	getDownloadURL,
} from 'firebase/storage';

// Simple drag-and-drop reordering component (simplified version)
const ChaptersList = ({ chapters, onEdit, onDelete, onReorder }) => {
	const [draggedIndex, setDraggedIndex] = useState(null);

	const handleDragStart = (index) => {
		setDraggedIndex(index);
	};

	const handleDragOver = (e, index) => {
		e.preventDefault();
		if (draggedIndex !== null && draggedIndex !== index) {
			const newChapters = [...chapters];
			const draggedItem = newChapters[draggedIndex];

			// Remove dragged item
			newChapters.splice(draggedIndex, 1);
			// Add it at new position
			newChapters.splice(index, 0, draggedItem);

			// Update positions
			const reorderedChapters = newChapters.map((chapter, idx) => ({
				...chapter,
				position: idx,
			}));

			onReorder(reorderedChapters);
			setDraggedIndex(index);
		}
	};

	const handleDragEnd = () => {
		setDraggedIndex(null);
	};

	return (
		<div className='space-y-2'>
			{chapters.map((chapter, index) => (
				<div
					key={chapter.id}
					draggable
					onDragStart={() => handleDragStart(index)}
					onDragOver={(e) => handleDragOver(e, index)}
					onDragEnd={handleDragEnd}
					className={`flex items-center p-3 bg-white border rounded-md ${
						draggedIndex === index ? 'opacity-50' : ''
					}`}>
					<div className='cursor-move mr-2'>
						<GripVertical size={16} />
					</div>
					<div className='flex-1'>
						<div className='flex items-center'>
							<span className='font-medium'>{chapter.title}</span>
							{chapter.isFree && (
								<span className='ml-2 px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full'>
									Free
								</span>
							)}
							{chapter.isPublished && (
								<span className='ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full'>
									Published
								</span>
							)}
						</div>
						{chapter.description && (
							<p className='text-xs text-gray-500 mt-1'>
								{chapter.description.substring(0, 100)}...
							</p>
						)}
					</div>
					<div className='flex space-x-2'>
						<button
							onClick={() => onEdit(chapter.id)}
							className='p-1 text-blue-600 hover:text-blue-800'>
							<Edit size={16} />
						</button>
						<button
							onClick={() => onDelete(chapter.id)}
							className='p-1 text-red-600 hover:text-red-800'>
							<Trash size={16} />
						</button>
					</div>
				</div>
			))}
		</div>
	);
};

const ChapterManager = () => {
	const { courseId } = useParams();
	const navigate = useNavigate();

	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [course, setCourse] = useState(null);
	const [chapters, setChapters] = useState([]);
	const [editingChapter, setEditingChapter] = useState(null);
	const [chapterForm, setChapterForm] = useState({
		title: '',
		description: '',
		isFree: false,
		isPublished: false,
		videoUrl: '',
	});
	const [videoFile, setVideoFile] = useState(null);

	useEffect(() => {
		const auth = getAuth();
		const currentUser = auth.currentUser;

		if (!currentUser) {
			navigate('/login');
			return;
		}

		const fetchData = async () => {
			try {
				const db = getDatabase();
				const courseRef = ref(db, `courses/${courseId}`);
				const courseSnapshot = await get(courseRef);

				if (!courseSnapshot.exists()) {
					navigate('/dashboard/instructor');
					return;
				}

				const courseData = courseSnapshot.val();
				setCourse(courseData);

				// Check if instructor is the owner
				if (courseData.instructorId !== currentUser.uid) {
					navigate('/dashboard/instructor');
					return;
				}

				// Fetch chapters
				const chaptersRef = ref(db, `chapters/${courseId}`);
				const chaptersSnapshot = await get(chaptersRef);

				let chaptersArray = [];
				if (chaptersSnapshot.exists()) {
					const chaptersData = chaptersSnapshot.val();
					chaptersArray = Object.entries(chaptersData).map(([id, data]) => ({
						id,
						...data,
					}));

					// Sort by position
					chaptersArray.sort((a, b) => (a.position || 0) - (b.position || 0));
				}

				setChapters(chaptersArray);
			} catch (error) {
				console.error('Error fetching data:', error);
			} finally {
				setLoading(false);
			}
		};

		fetchData();
	}, [courseId, navigate]);

	const handleChapterChange = (e) => {
		const { name, value, type, checked } = e.target;
		setChapterForm({
			...chapterForm,
			[name]: type === 'checkbox' ? checked : value,
		});
	};

	const handleVideoChange = (e) => {
		setVideoFile(e.target.files[0]);
	};

	const uploadVideo = async () => {
		if (!videoFile) return chapterForm.videoUrl || '';

		const storage = getStorage();
		const fileRef = storageRef(
			storage,
			`courseVideos/${courseId}/${editingChapter || Date.now()}_${
				videoFile.name
			}`,
		);

		await uploadBytes(fileRef, videoFile);
		return await getDownloadURL(fileRef);
	};

	const resetChapterForm = () => {
		setChapterForm({
			title: '',
			description: '',
			isFree: false,
			isPublished: false,
			videoUrl: '',
		});
		setVideoFile(null);
		setEditingChapter(null);
	};

	const handleEditChapter = (chapterId) => {
		const chapter = chapters.find((c) => c.id === chapterId);
		if (chapter) {
			setEditingChapter(chapterId);
			setChapterForm({
				title: chapter.title || '',
				description: chapter.description || '',
				isFree: chapter.isFree || false,
				isPublished: chapter.isPublished || false,
				videoUrl: chapter.videoUrl || '',
			});
		}
	};

	const handleDeleteChapter = async (chapterId) => {
		if (!window.confirm('Are you sure you want to delete this chapter?')) {
			return;
		}

		try {
			const db = getDatabase();
			await remove(ref(db, `chapters/${courseId}/${chapterId}`));

			// Update chapters list
			setChapters(chapters.filter((c) => c.id !== chapterId));
		} catch (error) {
			console.error('Error deleting chapter:', error);
			alert('Error deleting chapter. Please try again.');
		}
	};

	const handleReorderChapters = async (reorderedChapters) => {
		setChapters(reorderedChapters);

		// Update positions in database
		try {
			const db = getDatabase();
			const updates = {};

			reorderedChapters.forEach((chapter) => {
				updates[`chapters/${courseId}/${chapter.id}/position`] =
					chapter.position;
			});

			await update(ref(db), updates);
		} catch (error) {
			console.error('Error reordering chapters:', error);
		}
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setSaving(true);

		try {
			const db = getDatabase();
			let chapterId = editingChapter;

			// Upload video if changed
			const videoUrl = await uploadVideo();

			const chapterData = {
				...chapterForm,
				videoUrl,
				courseId,
				updatedAt: Date.now(),
			};

			if (editingChapter) {
				// Update existing chapter
				await update(ref(db, `chapters/${courseId}/${chapterId}`), chapterData);

				// Update chapter in state
				setChapters(
					chapters.map((c) =>
						c.id === chapterId ? { ...c, ...chapterData, id: chapterId } : c,
					),
				);
			} else {
				// Create new chapter
				const newChapterRef = push(ref(db, `chapters/${courseId}`));
				chapterId = newChapterRef.key;

				const newChapterData = {
					...chapterData,
					position: chapters.length,
					createdAt: Date.now(),
				};

				await update(
					ref(db, `chapters/${courseId}/${chapterId}`),
					newChapterData,
				);

				// Add new chapter to state
				setChapters([...chapters, { ...newChapterData, id: chapterId }]);
			}

			resetChapterForm();
		} catch (error) {
			console.error('Error saving chapter:', error);
			alert('Error saving chapter. Please try again.');
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

	if (!course) {
		return (
			<DashboardLayout userType='instructor'>
				<div className='text-center mt-10'>
					<h2 className='text-xl font-bold'>Course not found</h2>
					<button
						onClick={() => navigate('/dashboard/instructor')}
						className='mt-4 bg-secondary text-white px-4 py-2 rounded-lg'>
						Back to Dashboard
					</button>
				</div>
			</DashboardLayout>
		);
	}

	return (
		<DashboardLayout userType='instructor'>
			<div className='mb-8'>
				<button
					onClick={() => navigate(`/dashboard/instructor/courses/${courseId}`)}
					className='flex items-center text-gray-600 hover:text-gray-900 mb-4'>
					<ArrowLeft
						size={16}
						className='mr-2'
					/>
					Back to Course
				</button>
				<h1 className='text-2xl font-bold'>Manage Chapters: {course.title}</h1>
				<p className='text-gray-600'>
					Organize your course content into chapters
				</p>
			</div>

			<div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
				<div className='md:col-span-2'>
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						className='bg-white rounded-xl shadow-sm p-6 mb-8'>
						<div className='flex justify-between items-center mb-6'>
							<h2 className='text-xl font-semibold flex items-center'>
								<List className='mr-2' />
								{chapters.length} Chapter{chapters.length !== 1 ? 's' : ''}
							</h2>
							{!editingChapter && (
								<button
									onClick={resetChapterForm}
									className='flex items-center gap-2 bg-secondary text-white px-4 py-2 rounded-lg hover:bg-secondary/90 transition'>
									<PlusCircle size={16} />
									<span>Add Chapter</span>
								</button>
							)}
						</div>

						{chapters.length > 0 ? (
							<ChaptersList
								chapters={chapters}
								onEdit={handleEditChapter}
								onDelete={handleDeleteChapter}
								onReorder={handleReorderChapters}
							/>
						) : (
							<div className='text-center py-10 border border-dashed rounded-lg'>
								<Video className='mx-auto h-12 w-12 text-gray-400 mb-4' />
								<h3 className='text-lg font-medium text-gray-900'>
									No chapters yet
								</h3>
								<p className='text-gray-500 mt-1'>
									Add your first chapter to get started
								</p>
							</div>
						)}

						{chapters.length > 1 && (
							<p className='text-xs text-gray-500 mt-4'>
								Drag and drop chapters to reorder them
							</p>
						)}
					</motion.div>
				</div>

				<div>
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						className='bg-white rounded-xl shadow-sm p-6 mb-8 sticky top-20'>
						<h2 className='text-xl font-semibold mb-4'>
							{editingChapter ? 'Edit Chapter' : 'Add New Chapter'}
						</h2>

						<form
							onSubmit={handleSubmit}
							className='space-y-4'>
							<div>
								<label className='block text-sm font-medium text-gray-700 mb-1'>
									Chapter Title
								</label>
								<input
									type='text'
									name='title'
									value={chapterForm.title}
									onChange={handleChapterChange}
									className='w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-secondary focus:border-transparent'
									required
									placeholder='e.g. Introduction to the course'
								/>
							</div>

							<div>
								<label className='block text-sm font-medium text-gray-700 mb-1'>
									Description
								</label>
								<textarea
									name='description'
									value={chapterForm.description}
									onChange={handleChapterChange}
									rows={3}
									className='w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-secondary focus:border-transparent'
									placeholder='Brief overview of this chapter...'
								/>
							</div>

							<div>
								<label className='block text-sm font-medium text-gray-700 mb-1'>
									Video
								</label>
								<input
									type='file'
									accept='video/*'
									onChange={handleVideoChange}
									className='block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 p-2'
								/>
								{chapterForm.videoUrl && !videoFile && (
									<div className='mt-2'>
										<p className='text-sm'>
											Current video: {chapterForm.videoUrl.split('/').pop()}
										</p>
									</div>
								)}
							</div>

							<div className='flex items-center'>
								<input
									type='checkbox'
									id='isFree'
									name='isFree'
									checked={chapterForm.isFree}
									onChange={handleChapterChange}
									className='h-4 w-4 text-secondary focus:ring-secondary border-gray-300 rounded'
								/>
								<label
									htmlFor='isFree'
									className='ml-2 block text-sm text-gray-900'>
									Free preview (Available without purchase)
								</label>
							</div>

							<div className='flex items-center'>
								<input
									type='checkbox'
									id='isPublished'
									name='isPublished'
									checked={chapterForm.isPublished}
									onChange={handleChapterChange}
									className='h-4 w-4 text-secondary focus:ring-secondary border-gray-300 rounded'
								/>
								<label
									htmlFor='isPublished'
									className='ml-2 block text-sm text-gray-900'>
									Publish this chapter
								</label>
							</div>

							<div className='flex justify-between pt-4'>
								{editingChapter && (
									<button
										type='button'
										onClick={resetChapterForm}
										className='flex items-center bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition'>
										<X
											size={16}
											className='mr-1'
										/>
										Cancel
									</button>
								)}

								<button
									type='submit'
									disabled={saving}
									className='flex items-center bg-secondary text-white px-4 py-2 rounded-lg hover:bg-secondary/90 transition ml-auto'>
									{saving && (
										<div className='animate-spin rounded-full h-4 w-4 border-2 border-white mr-2'></div>
									)}
									<Check
										size={16}
										className='mr-1'
									/>
									{saving
										? 'Saving...'
										: editingChapter
										? 'Update Chapter'
										: 'Add Chapter'}
								</button>
							</div>
						</form>
					</motion.div>
				</div>
			</div>
		</DashboardLayout>
	);
};

export default ChapterManager;
