import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getDatabase, ref, get } from 'firebase/database';
import Navbar from './components/Navbar/Navbar';
import HomePage from './pages/HomePage';
import CoursesPage from './pages/CoursesPage';
import CourseDetails from './components/SubjectCard/CourseDetails';
import CoursePage from './pages/CoursePage';
import CheckoutPage from './pages/CheckoutPage';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import ForgotPassword from './pages/Auth/ForgotPassword';
import Footer from './components/Footer/Footer';

// Student Dashboard Pages
import StudentDashboard from './pages/Dashboard/StudentDashboard';
import StudentCourses from './pages/Dashboard/StudentCourses';
import StudentProgress from './pages/Dashboard/StudentProgress';

// Instructor Dashboard Pages
import InstructorDashboard from './pages/Dashboard/InstructorDashboard';
import CourseForm from './pages/Dashboard/CourseForm';
import ChapterManager from './pages/Dashboard/ChapterManager';

const ProtectedRoute = ({ children, allowedRoles }) => {
	const [user, setUser] = React.useState(null);
	const [userRole, setUserRole] = React.useState(null);
	const [loading, setLoading] = React.useState(true);

	React.useEffect(() => {
		const auth = getAuth();
		const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
			setLoading(true);
			try {
				if (currentUser) {
					setUser(currentUser);

					// Fetch user type from database to check role
					const db = getDatabase();
					const userRef = ref(db, `Elearning/Utilisateurs/${currentUser.uid}`);
					const snapshot = await get(userRef);
					const userData = snapshot.val();
					console.log('App.jsx - User data from Firebase:', userData);
					console.log('App.jsx - User ID:', currentUser.uid);
					console.log(
						'App.jsx - Database path:',
						`Elearning/Utilisateurs/${currentUser.uid}`,
					);

					if (!userData) {
						console.error('App.jsx - No user data found in database');
					} else if (!userData.userType) {
						console.error(
							'App.jsx - User data found but no userType property:',
							userData,
						);
					}

					setUserRole(userData?.userType || null);
					console.log(
						'App.jsx - Setting userRole to:',
						userData?.userType || null,
					);
				} else {
					setUser(null);
					setUserRole(null);
				}
			} catch (error) {
				console.error('Error fetching user data:', error);
				setUser(null);
				setUserRole(null);
			} finally {
				setLoading(false);
			}
		});

		return () => unsubscribe();
	}, []);

	if (loading) {
		return (
			<div className='flex justify-center items-center h-screen'>
				<div className='animate-spin rounded-full h-12 w-12 border-b-2 border-secondary'></div>
			</div>
		);
	}

	if (!user) {
		return <Navigate to='/login' />;
	}

	// Role-based access check
	console.log('ProtectedRoute - Checking access for role:', userRole);
	console.log('ProtectedRoute - Allowed roles:', allowedRoles);
	if (allowedRoles && !allowedRoles.includes(userRole)) {
		console.log('ProtectedRoute - Access denied, redirecting to home');
		return <Navigate to='/' />;
	}
	console.log('ProtectedRoute - Access granted');

	return children;
};

const App = () => {
	return (
		<BrowserRouter>
			<main className='min-h-screen'>
				<Routes>
					{/* Public routes that include Navbar and Footer */}
					<Route
						path='/'
						element={
							<>
								<Navbar />
								<HomePage />
								<Footer />
							</>
						}
					/>
					<Route
						path='/courses'
						element={
							<>
								<Navbar />
								<CoursesPage />
								<Footer />
							</>
						}
					/>
					<Route
						path='/course/:id'
						element={
							<>
								<Navbar />
								<CourseDetails />
								<Footer />
							</>
						}
					/>
					<Route
						path='/login'
						element={
							<>
								<Navbar />
								<Login />
								<Footer />
							</>
						}
					/>
					<Route
						path='/register'
						element={
							<>
								<Navbar />
								<Register />
								<Footer />
							</>
						}
					/>
					<Route
						path='/forgot-password'
						element={
							<>
								<Navbar />
								<ForgotPassword />
								<Footer />
							</>
						}
					/>

					{/* Checkout route */}
					<Route
						path='/checkout/:courseId'
						element={
							<ProtectedRoute
								allowedRoles={['apprenant', 'formateur', 'administrateur']}>
								<CheckoutPage />
							</ProtectedRoute>
						}
					/>

					{/* Course content routes - for enrolled students */}
					<Route
						path='/course/:courseId/chapter/:chapterId'
						element={
							<ProtectedRoute
								allowedRoles={['apprenant', 'formateur', 'administrateur']}>
								<CoursePage />
							</ProtectedRoute>
						}
					/>
					<Route
						path='/course/:courseId'
						element={
							<ProtectedRoute
								allowedRoles={['apprenant', 'formateur', 'administrateur']}>
								<CoursePage />
							</ProtectedRoute>
						}
					/>

					{/* Protected routes */}
					{/* Student Dashboard Routes */}
					<Route
						path='/dashboard/student'
						element={
							<ProtectedRoute allowedRoles={['apprenant']}>
								<StudentDashboard />
							</ProtectedRoute>
						}
					/>
					<Route
						path='/dashboard/student/courses'
						element={
							<ProtectedRoute allowedRoles={['apprenant']}>
								<StudentCourses />
							</ProtectedRoute>
						}
					/>
					<Route
						path='/dashboard/student/progress'
						element={
							<ProtectedRoute allowedRoles={['apprenant']}>
								<StudentProgress />
							</ProtectedRoute>
						}
					/>

					{/* Instructor Routes */}
					<Route
						path='/dashboard/instructor'
						element={
							<ProtectedRoute allowedRoles={['formateur']}>
								<InstructorDashboard />
							</ProtectedRoute>
						}
					/>
					<Route
						path='/dashboard/instructor/courses/new'
						element={
							<ProtectedRoute allowedRoles={['formateur']}>
								<CourseForm />
							</ProtectedRoute>
						}
					/>
					<Route
						path='/dashboard/instructor/courses/:courseId'
						element={
							<ProtectedRoute allowedRoles={['formateur']}>
								<CourseForm />
							</ProtectedRoute>
						}
					/>
					<Route
						path='/dashboard/instructor/courses/:courseId/chapters'
						element={
							<ProtectedRoute allowedRoles={['formateur']}>
								<ChapterManager />
							</ProtectedRoute>
						}
					/>

					{/* Admin Routes */}
					<Route
						path='/dashboard/admin/*'
						element={
							<ProtectedRoute allowedRoles={['administrateur']}>
								{/* Add your admin dashboard component here */}
								<div>Admin Dashboard</div>
							</ProtectedRoute>
						}
					/>

					{/* Fallback route */}
					<Route
						path='*'
						element={<Navigate to='/' />}
					/>
				</Routes>
			</main>
		</BrowserRouter>
	);
};

export default App;
