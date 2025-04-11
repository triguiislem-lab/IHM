import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./hooks/useAuth";
import ProtectedRoute from "./components/Auth/ProtectedRoute";
import LoadingSpinner from "./components/Common/LoadingSpinner";
import Navbar from "./components/Navbar/Navbar";
import HomePage from "./pages/HomePage";
import CoursesPage from "./pages/CoursesPage";
import CourseDetails from "./components/SubjectCard/CourseDetails";
import ModulePage from "./pages/ModulePage";
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";
import Footer from "./components/Footer/Footer";
import Profile from "./pages/Profile/Profile";
import MyCourses from "./pages/Profile/MyCourses";
import EditProfile from "./pages/Profile/EditProfile";
import StudentDashboard from "./pages/Dashboard/StudentDashboard";
import InstructorDashboard from "./pages/Dashboard/InstructorDashboard";
import AdminDashboard from "./pages/Dashboard/AdminDashboard";
import DatabaseCleanup from "./pages/Admin/DatabaseCleanup";
import DatabaseMigration from "./pages/Admin/DatabaseMigration";
import SpecialitesManager from "./pages/Admin/SpecialitesManager";
import AdminCourseForm from "./pages/Admin/CourseForm";
import InstructorCourseForm from "./pages/Instructor/CourseForm";
import InstructorCourses from "./pages/Instructor/MyCourses";
import InstructorCourseManagement from "./pages/Instructor/InstructorCourseManagement";
import MessagesPage from "./pages/Messages/MessagesPage";
import UsersManagement from "./pages/Admin/UsersManagement";
import AdminCoursesManagement from "./pages/Admin/AdminCoursesManagement";
import SettingsPage from "./pages/Admin/SettingsPage";
import UserDetailsPage from "./pages/Admin/UserDetailsPage";
import CourseEnrollmentsPage from "./pages/Admin/CourseEnrollmentsPage";

// Import new general pages
import AboutPage from './pages/AboutPage';
import ServicesPage from './pages/ServicesPage';
import ContactPage from './pages/ContactPage';
import ResourcesPage from './pages/ResourcesPage';
import ForStudentsPage from './pages/ForStudentsPage';

// Composants de redirection
import ProfileRedirect from "./components/Redirects/ProfileRedirect";
import EditProfileRedirect from "./components/Redirects/EditProfileRedirect";
import MessagesRedirect from "./components/Redirects/MessagesRedirect";

const App = () => {
  // Use isAuthenticated as well, which is derived from !!user
  const { loading, isAuthenticated, getDashboardPath } = useAuth(); 

  // *** REMOVED Log: Track loading state changes in App ***
  // console.log(`[App] Rendering. Loading state: ${loading}`);

  // Top-level loading spinner remains
  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <BrowserRouter>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow">
          {/* Removed conditional wrapper - Render Routes directly */}
              <Routes>
                {/* Routes publiques */}
                <Route path="/" element={<HomePage />} />
                <Route path="/courses" element={<CoursesPage />} />
                <Route path="/course/:id" element={<CourseDetails />} />
                <Route
                  path="/course/:id/module/:moduleId"
                  element={<ModulePage />}
                />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
    
                {/* New General Pages Routes */}
                <Route path="/about" element={<AboutPage />} />
                <Route path="/services" element={<ServicesPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/resources" element={<ResourcesPage />} />
                <Route path="/for-students" element={<ForStudentsPage />} />
    
                {/* Routes de redirection selon le rôle */} 
                <Route
                  path="/profile"
                  // *** TEMPORARILY REMOVED ProtectedRoute ***
                  element={<ProfileRedirect />}
                />
                <Route
                  path="/edit-profile"
                  element={
                    <ProtectedRoute allowedRoles={['admin', 'instructor', 'student']}>
                      <EditProfileRedirect />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/messages"
                  element={
                    <ProtectedRoute allowedRoles={['admin', 'instructor', 'student']}>
                      <MessagesRedirect />
                    </ProtectedRoute>
                  }
                />
    
                {/* Routes protégées par rôle (Keep ProtectedRoute here) */}
                {/* Routes pour les étudiants */}
                <Route
                  path="/student/*"
                  element={
                    <ProtectedRoute allowedRoles={["student"]}>
                      <Routes>
                        <Route path="dashboard" element={<StudentDashboard />} />
                        <Route path="profile" element={<Profile />} />
                        <Route path="enrollments" element={<MyCourses />} />
                        <Route path="my-courses" element={<MyCourses />} />{" "}
                        <Route path="edit-profile" element={<EditProfile />} />
                        <Route path="messages" element={<MessagesPage />} />
                      </Routes>
                    </ProtectedRoute>
                  }
                />
    
                {/* Routes pour les instructeurs */}
                <Route
                  path="/instructor/*"
                  element={
                    <ProtectedRoute allowedRoles={["instructor"]}>
                      <Routes>
                        <Route path="dashboard" element={<InstructorDashboard />} />
                        <Route path="courses" element={<InstructorCourses />} />
                        <Route
                          path="course-management/:id"
                          element={<InstructorCourseManagement />}
                        />
                        <Route
                          path="course-form"
                          element={<InstructorCourseForm />}
                        />
                        <Route
                          path="course-form/:id"
                          element={<InstructorCourseForm />}
                        />
                        <Route path="profile" element={<Profile />} />
                        <Route path="edit-profile" element={<EditProfile />} />
                        <Route path="messages" element={<MessagesPage />} />
                      </Routes>
                    </ProtectedRoute>
                  }
                />
    
                {/* Routes pour les administrateurs */}
                <Route
                  path="/admin/*"
                  element={
                    <ProtectedRoute allowedRoles={["admin"]}>
                      <Routes>
                        <Route path="dashboard" element={<AdminDashboard />} />
                        <Route path="users" element={<UsersManagement />} />
                        <Route path="courses" element={<AdminCoursesManagement />} />
                        <Route
                          path="database-cleanup"
                          element={<DatabaseCleanup />}
                        />
                        <Route
                          path="database-migration"
                          element={<DatabaseMigration />}
                        />
                        <Route
                          path="specialites"
                          element={<SpecialitesManager />} />
                        <Route path="course-form" element={<AdminCourseForm />} />
                        <Route
                          path="course-form/:id"
                          element={<AdminCourseForm />} />
                        <Route path="settings" element={<SettingsPage />} />
                        <Route path="user/:userId" element={<UserDetailsPage />} />
                        <Route path="course-enrollments/:courseId" element={<CourseEnrollmentsPage />} />
                      </Routes>
                    </ProtectedRoute>
                  }
                 />
    
                {/* Redirection par défaut */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          {/* Removed conditional closing tag */}
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
};

export default App;
