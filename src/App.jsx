import React from "react";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./hooks/useAuth";
import ProtectedRoute from "./components/Auth/ProtectedRoute";
import LoadingSpinner from "./components/Common/LoadingSpinner";

// Layouts
import AdminLayout from "./layouts/AdminLayout";
import InstructorLayout from "./layouts/InstructorLayout";
import StudentLayout from "./layouts/StudentLayout";
import PublicLayout from "./layouts/PublicLayout";

// Pages (Import necessary pages)
import HomePage from "./pages/HomePage";
import CoursesPage from "./pages/CoursesPage";
import CourseDetails from "./components/SubjectCard/CourseDetails";
import ModulePage from "./pages/ModulePage";
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";
import Profile from "./pages/Profile/Profile";
import EditProfile from "./pages/Profile/EditProfile";
import MessagesPage from "./pages/Messages/MessagesPage";
import MyCourses from "./pages/Profile/MyCourses";
import StudentDashboard from "./pages/Dashboard/StudentDashboard";
import InstructorDashboard from "./pages/Dashboard/InstructorDashboard";
import AdminDashboard from "./pages/Dashboard/AdminDashboard";
import UsersManagement from "./pages/Admin/UsersManagement";
import AdminCoursesManagement from "./pages/Admin/AdminCoursesManagement";
import SettingsPage from "./pages/Admin/SettingsPage";
import UserDetailsPage from "./pages/Admin/UserDetailsPage";
import CourseEnrollmentsPage from "./pages/Admin/CourseEnrollmentsPage";
import InstructorCourses from "./pages/Instructor/MyCourses";
import InstructorCourseManagement from "./pages/Instructor/InstructorCourseManagement";
import InstructorCourseForm from "./pages/Instructor/CourseForm";
import AdminCourseForm from "./pages/Admin/CourseForm";
import CategoriesManager from "./pages/Admin/CategoriesManager";
import DatabaseCleanup from "./pages/Admin/DatabaseCleanup";
import DatabaseMigration from "./pages/Admin/DatabaseMigration";
import AboutPage from './pages/AboutPage';
import ServicesPage from './pages/ServicesPage';
import ContactPage from './pages/ContactPage';
import ResourcesPage from './pages/ResourcesPage';
import ForStudentsPage from './pages/ForStudentsPage';

const App = () => {
  const { loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes using PublicLayout */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/courses" element={<CoursesPage />} />
          <Route path="/course/:id" element={<CourseDetails />} />
          <Route path="/course/:id/module/:moduleId" element={<ModulePage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/resources" element={<ResourcesPage />} />
          <Route path="/for-students" element={<ForStudentsPage />} />
          {/* Add other public routes here */}
        </Route>

        {/* Admin Routes using AdminLayout */}
        <Route element={<ProtectedRoute allowedRoles={["admin"]}><AdminLayout /></ProtectedRoute>}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/profile" element={<Profile />} />
            <Route path="/admin/edit-profile" element={<EditProfile />} />
            <Route path="/admin/messages" element={<MessagesPage />} />
            <Route path="/admin/users" element={<UsersManagement />} />
            <Route path="/admin/courses" element={<AdminCoursesManagement />} />
            <Route path="/admin/database-cleanup" element={<DatabaseCleanup />} />
            <Route path="/admin/database-migration" element={<DatabaseMigration />} />
            <Route path="/admin/categories" element={<CategoriesManager />} />
            <Route path="/admin/course-form" element={<AdminCourseForm />} />
            <Route path="/admin/course-form/:id" element={<AdminCourseForm />} />
            <Route path="/admin/settings" element={<SettingsPage />} />
            <Route path="/admin/user/:userId" element={<UserDetailsPage />} />
            <Route path="/admin/course-enrollments/:courseId" element={<CourseEnrollmentsPage />} />
            {/* Redirect any other /admin path to dashboard */}
            <Route path="/admin/*" element={<Navigate to="/admin/dashboard" replace />} />
        </Route>

        {/* Instructor Routes using InstructorLayout */}
        <Route element={<ProtectedRoute allowedRoles={["instructor"]}><InstructorLayout /></ProtectedRoute>}>
            <Route path="/instructor/dashboard" element={<InstructorDashboard />} />
            <Route path="/instructor/profile" element={<Profile />} />
            <Route path="/instructor/edit-profile" element={<EditProfile />} />
            <Route path="/instructor/messages" element={<MessagesPage />} />
            <Route path="/instructor/courses" element={<InstructorCourses />} />
            <Route path="/instructor/course-management/:id" element={<InstructorCourseManagement />} />
            <Route path="/instructor/course-form" element={<InstructorCourseForm />} />
            <Route path="/instructor/course-form/:id" element={<InstructorCourseForm />} />
             {/* Redirect any other /instructor path to dashboard */}
            <Route path="/instructor/*" element={<Navigate to="/instructor/dashboard" replace />} />
        </Route>

        {/* Student Routes using StudentLayout */}
        <Route element={<ProtectedRoute allowedRoles={["student"]}><StudentLayout /></ProtectedRoute>}>
            <Route path="/student/dashboard" element={<StudentDashboard />} />
            <Route path="/student/profile" element={<Profile />} />
            <Route path="/student/edit-profile" element={<EditProfile />} />
            <Route path="/student/messages" element={<MessagesPage />} />
            <Route path="/student/enrollments" element={<MyCourses />} />
             {/* Redirect /student/my-courses to /student/enrollments */}
            <Route path="/student/my-courses" element={<Navigate to="/student/enrollments" replace />} />
             {/* Redirect any other /student path to dashboard */}
            <Route path="/student/*" element={<Navigate to="/student/dashboard" replace />} />
        </Route>

        {/* Fallback for any other route - Redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
