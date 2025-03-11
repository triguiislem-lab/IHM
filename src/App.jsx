import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import Navbar from './components/Navbar/Navbar';
import HomePage from './pages/HomePage';
import CoursesPage from './pages/CoursesPage';
import CourseDetails from './components/SubjectCard/CourseDetails';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import ForgotPassword from './pages/Auth/ForgotPassword';
import Footer from './components/Footer/Footer';

const ProtectedRoute = ({ children, allowedRoles }) => {
	const [user, setUser] = React.useState(null);
	const [loading, setLoading] = React.useState(true);

	React.useEffect(() => {
		const auth = getAuth();
		const unsubscribe = onAuthStateChanged(auth, (user) => {
			setUser(user);
			setLoading(false);
		});

		return () => unsubscribe();
	}, []);

	if (loading) {
		return <div>Loading...</div>;
	}

	if (!user) {
		return <Navigate to='/login' />;
	}

	// Add role check here if needed
	return children;
};

const App = () => {
	return (
		<BrowserRouter>
			<main className='min-h-screen'>
				<Navbar />
				<Routes>
					<Route
						path='/'
						element={<HomePage />}
					/>
					<Route
						path='/courses'
						element={<CoursesPage />}
					/>
					<Route
						path='/course/:id'
						element={<CourseDetails />}
					/>
					<Route
						path='/login'
						element={<Login />}
					/>
					<Route
						path='/register'
						element={<Register />}
					/>
					<Route
						path='/forgot-password'
						element={<ForgotPassword />}
					/>

					{/* Protected routes */}
					<Route
						path='/dashboard/student/*'
						element={
							<ProtectedRoute allowedRoles={['student']}>
								{/* Add your student dashboard component here */}
							</ProtectedRoute>
						}
					/>
					<Route
						path='/dashboard/instructor/*'
						element={
							<ProtectedRoute allowedRoles={['instructor']}>
								{/* Add your instructor dashboard component here */}
							</ProtectedRoute>
						}
					/>
					<Route
						path='/dashboard/admin/*'
						element={
							<ProtectedRoute allowedRoles={['admin']}>
								{/* Add your admin dashboard component here */}
							</ProtectedRoute>
						}
					/>
				</Routes>
				<Footer />
			</main>
		</BrowserRouter>
	);
};

export default App;
