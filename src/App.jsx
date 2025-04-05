import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getDatabase, ref, get } from "firebase/database";
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
import MessagesPage from "./pages/Messages/MessagesPage";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const [user, setUser] = React.useState(null);
  const [userRole, setUserRole] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);

      if (user) {
        // Récupérer le rôle de l'utilisateur depuis la base de données
        try {
          const database = getDatabase();
          const userRef = ref(database, `Elearning/Utilisateurs/${user.uid}`);
          const snapshot = await get(userRef);

          if (snapshot.exists()) {
            const userData = snapshot.val();
            setUserRole(userData.userType || "student");
          } else {
            // Vérifier dans d'autres chemins
            const altUserRef = ref(database, `users/${user.uid}`);
            const altSnapshot = await get(altUserRef);

            if (altSnapshot.exists()) {
              const altUserData = altSnapshot.val();
              setUserRole(altUserData.userType || "student");
            } else {
              setUserRole("student"); // Rôle par défaut
            }
          }
        } catch (error) {
          console.error("Error fetching user role:", error);
          setUserRole("student"); // Rôle par défaut en cas d'erreur
        }
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  // Vérifier si l'utilisateur a le rôle requis
  if (
    allowedRoles &&
    allowedRoles.length > 0 &&
    !allowedRoles.includes(userRole)
  ) {
    return <Navigate to="/" />;
  }

  return children;
};

const App = () => {
  return (
    <BrowserRouter>
      <main className="min-h-screen">
        <Navbar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/courses" element={<CoursesPage />} />
          <Route path="/course/:id" element={<CourseDetails />} />
          <Route path="/course/:id/module/:moduleId" element={<ModulePage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/my-courses" element={<MyCourses />} />
          <Route path="/edit-profile" element={<EditProfile />} />

          {/* Protected routes */}
          <Route
            path="/dashboard/student"
            element={
              <ProtectedRoute allowedRoles={["student", "apprenant"]}>
                <StudentDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/instructor"
            element={
              <ProtectedRoute allowedRoles={["instructor", "formateur"]}>
                <InstructorDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/admin"
            element={
              <ProtectedRoute allowedRoles={["admin", "administrateur"]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/database-cleanup"
            element={
              <ProtectedRoute allowedRoles={["admin", "administrateur"]}>
                <DatabaseCleanup />
              </ProtectedRoute>
            }
          />
          <Route
            path="/messages"
            element={
              <ProtectedRoute
                allowedRoles={[
                  "admin",
                  "administrateur",
                  "formateur",
                  "instructor",
                  "student",
                  "apprenant",
                ]}
              >
                <MessagesPage />
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
