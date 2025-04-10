import React, { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./hooks/useAuth";
import ProtectedRoute from "./components/Auth/ProtectedRoute";
import OptimizedLoadingSpinner from "./components/Common/OptimizedLoadingSpinner";
import Navbar from "./components/Navbar/Navbar";
import Footer from "./components/Footer/Footer";
import ProfileRedirect from "./components/Redirects/ProfileRedirect";
import "./optimized-styles.css";

// Chargement différé des composants
const HomePage = lazy(() => import("./pages/HomePage"));
const CoursesPage = lazy(() => import("./pages/CoursesPage"));
const CourseDetails = lazy(() => import("./components/SubjectCard/CourseDetails"));
const ModulePage = lazy(() => import("./pages/ModulePage"));
const Login = lazy(() => import("./pages/Auth/Login"));
const Register = lazy(() => import("./pages/Auth/Register"));
const Profile = lazy(() => import("./pages/Profile/Profile"));
const MyCourses = lazy(() => import("./pages/Profile/MyCourses"));
const EditProfile = lazy(() => import("./pages/Profile/EditProfile"));
const StudentDashboard = lazy(() => import("./pages/Dashboard/StudentDashboard"));
const InstructorDashboard = lazy(() => import("./pages/Dashboard/InstructorDashboard"));
const AdminDashboard = lazy(() => import("./pages/Dashboard/AdminDashboard"));
const DatabaseCleanup = lazy(() => import("./pages/Admin/DatabaseCleanup"));
const DatabaseMigration = lazy(() => import("./pages/Admin/DatabaseMigration"));
const SpecialitesManager = lazy(() => import("./pages/Admin/SpecialitesManager"));
const AdminCourseForm = lazy(() => import("./pages/Admin/CourseForm"));
const InstructorCourseForm = lazy(() => import("./pages/Instructor/CourseForm"));
const InstructorCourses = lazy(() => import("./pages/Instructor/MyCourses"));
const InstructorCourseManagement = lazy(() => import("./pages/Instructor/InstructorCourseManagement"));
const MessagesPage = lazy(() => import("./pages/Messages/MessagesPage"));

// Composant de chargement global
const LoadingFallback = () => (
  <div className="flex justify-center items-center min-h-screen">
    <OptimizedLoadingSpinner size="large" text="Chargement en cours..." />
  </div>
);

function App() {
  const { isAuthenticated, userRole, loading } = useAuth();

  if (loading) {
    return <LoadingFallback />;
  }

  return (
    <BrowserRouter>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow">
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              {/* Routes publiques */}
              <Route path="/" element={<HomePage />} />
              <Route path="/courses" element={<CoursesPage />} />
              <Route path="/course/:id" element={<CourseDetails />} />
              <Route path="/module/:courseId/:moduleId" element={<ModulePage />} />
              <Route
                path="/login"
                element={
                  isAuthenticated ? <Navigate to="/dashboard" /> : <Login />
                }
              />
              <Route
                path="/register"
                element={
                  isAuthenticated ? <Navigate to="/dashboard" /> : <Register />
                }
              />

              {/* Redirection du tableau de bord en fonction du rôle */}
              <Route
                path="/dashboard"
                element={
                  <ProfileRedirect
                    isAuthenticated={isAuthenticated}
                    userRole={userRole}
                  />
                }
              />

              {/* Routes pour les étudiants */}
              <Route
                path="/student/*"
                element={
                  <ProtectedRoute allowedRoles={["student"]}>
                    <Routes>
                      <Route path="dashboard" element={<StudentDashboard />} />
                      <Route path="courses" element={<MyCourses />} />
                      <Route path="profile" element={<Profile />} />
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
                      <Route path="users" element={<div>Gestion des utilisateurs</div>} />
                      <Route path="cleanup" element={<DatabaseCleanup />} />
                      <Route path="migration" element={<DatabaseMigration />} />
                      <Route
                        path="specialites"
                        element={<SpecialitesManager />}
                      />
                      <Route path="course-form" element={<AdminCourseForm />} />
                      <Route
                        path="course-form/:id"
                        element={<AdminCourseForm />}
                      />
                      <Route path="messages" element={<MessagesPage />} />
                      <Route path="profile" element={<Profile />} />
                      <Route path="edit-profile" element={<EditProfile />} />
                    </Routes>
                  </ProtectedRoute>
                }
              />

              {/* Route par défaut - redirection vers la page d'accueil */}
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </Suspense>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;
