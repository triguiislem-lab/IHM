import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { useAuth } from "../../hooks/useAuth";
import { Link } from "react-router-dom";
import LoadingSpinner from "../../components/Common/LoadingSpinner";
import StatCard from "../../components/Dashboard/StatCard";
import DashboardSection from "../../components/Dashboard/DashboardSection";
import DashboardTable from "../../components/Dashboard/DashboardTable";
import ActionButton from "../../components/Common/ActionButton";
import {
  MdSchool,
  MdPeople,
  MdPerson,
  MdSettings,
  MdStorage,
  MdMessage,
  MdCategory,
  MdAddCircle,
  MdEdit,
  MdDelete,
  MdOutlineAssignment,
} from "react-icons/md";
import { getDatabase, ref, get, remove } from "firebase/database";
import { 
    fetchUsersFromDatabase, 
    fetchCoursesFromDatabase, 
    fetchSpecialitesFromDatabase 
} from "../../utils/firebaseUtils";

const AdminDashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const [stats, setStats] = useState({ users: 0, instructors: 0, students: 0, courses: 0, specialites: 0 });
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState("");

  const database = getDatabase();

  const loadAdminData = useCallback(async () => {
    setLoadingData(true);
    setError("");
    try {
      const [fetchedUsers, fetchedCourses, fetchedSpecialites] = await Promise.all([
        fetchUsersFromDatabase(),
        fetchCoursesFromDatabase(),
        fetchSpecialitesFromDatabase()
      ]);

      setUsers(fetchedUsers);
      setCourses(fetchedCourses);
      setStats({
        users: fetchedUsers.length,
        instructors: fetchedUsers.filter(u => u.role === 'instructor').length,
        students: fetchedUsers.filter(u => u.role === 'student').length,
        courses: fetchedCourses.length,
        specialites: fetchedSpecialites.length
      });

    } catch (err) {
      console.error("Error loading admin data:", err);
      setError("Erreur lors du chargement des données administrateur.");
    } finally {
      setLoadingData(false);
    }
  }, []);

  useEffect(() => {
    loadAdminData();
  }, [loadAdminData]);

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cet utilisateur ?")) return;
    try {
      await remove(ref(database, `elearning/users/${userId}`));
      // Consider removing related data (enrollments, messages, etc.) or marking as inactive
      setUsers(prevUsers => prevUsers.filter(u => u.id !== userId));
      // Update stats
      loadAdminData(); // Re-fetch to update stats accurately
    } catch (err) {
      console.error("Error deleting user:", err);
      setError("Erreur lors de la suppression de l'utilisateur.");
    }
  };

  const handleDeleteCourse = async (courseId) => {
     if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette formation ?")) return;
    try {
      await remove(ref(database, `elearning/courses/${courseId}`));
      // Consider removing related data (modules, enrollments, etc.)
      setCourses(prevCourses => prevCourses.filter(c => c.id !== courseId));
       // Update stats
      loadAdminData(); // Re-fetch to update stats accurately
    } catch (err) {
      console.error("Error deleting course:", err);
      setError("Erreur lors de la suppression de la formation.");
    }
  };

  if (authLoading) {
    return <LoadingSpinner />;
  }

  if (!user || user.normalizedRole !== 'admin') {
      // This case should ideally be handled by ProtectedRoute + AdminLayout
      return <p className="text-red-500 text-center">Accès non autorisé.</p>;
  }

  // --- Define Columns and Actions for Users Table ---
  const userColumns = [
    {
      key: 'name',
      header: 'Nom',
      render: (user) => (
        <Link to={`/admin/user/${user.id}`} className="hover:underline font-medium text-gray-900">
          {user.firstName || ''} {user.lastName || ''}
        </Link>
      ),
    },
    {
      key: 'email',
      header: 'Email',
      render: (user) => <span className="text-gray-500">{user.email}</span>,
    },
    {
      key: 'role',
      header: 'Rôle',
      render: (user) => <span className="capitalize text-gray-500">{user.role}</span>,
    },
  ];

  const userActions = [
    {
      label: 'Détails',
      variant: 'info',
      to: (user) => `/admin/user/${user.id}`,
    },
    {
      icon: MdDelete,
      variant: 'danger',
      onClick: (user) => handleDeleteUser(user.id),
    },
  ];

  // --- Define Columns and Actions for Courses Table ---
  const courseColumns = [
    {
      key: 'title',
      header: 'Titre',
      render: (course) => (
        <Link to={`/course/${course.id}`} className="hover:underline font-medium text-gray-900">
          {course.title || 'Formation sans titre'}
        </Link>
      ),
    },
    {
      key: 'instructor',
      header: 'Formateur',
      render: (course) => <span className="text-gray-500">{course.instructor?.name || 'N/A'}</span>,
    },
    {
      key: 'enrollments',
      header: 'Inscriptions',
      render: (course) => (
        <Link to={`/admin/course-enrollments/${course.id}`} className="hover:underline text-blue-600">
          {Object.keys(course.enrollments || {}).length}
        </Link>
      ),
    },
  ];

  const courseActions = [
    {
      icon: MdEdit,
      variant: 'info',
      to: (course) => `/admin/course-form/${course.id}`,
    },
    {
      icon: MdDelete,
      variant: 'danger',
      onClick: (course) => handleDeleteCourse(course.id),
    },
  ];

  return (
    <>
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-3xl font-bold text-gray-800 mb-6"
      >
        Tableau de Bord Administrateur
      </motion.h1>

       {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                <span className="block sm:inline">{error}</span>
            </div>
        )}

      {/* Stats Grid using StatCard */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5 mb-8">
        <StatCard title="Utilisateurs Totals" value={stats.users} icon={MdPeople} color="blue" />
        <StatCard title="Formateurs" value={stats.instructors} icon={MdPerson} color="indigo" />
        <StatCard title="Apprenants" value={stats.students} icon={MdSchool} color="green" />
        <StatCard title="Formations" value={stats.courses} icon={MdOutlineAssignment} color="purple" />
        <StatCard title="Spécialités" value={stats.specialites} icon={MdCategory} color="orange" />
      </div>

      {/* Users Section using DashboardTable */}
      <DashboardSection
        title="Gestion des Utilisateurs"
        isLoading={loadingData}
        actionButton={
          <ActionButton to="/admin/users" icon={MdPeople}>
            Voir Tout
          </ActionButton>
        }
      >
        <DashboardTable
          columns={userColumns}
          data={users}
          actions={userActions}
          isLoading={loadingData}
          viewAllLink="/admin/users"
          viewAllText="Voir tous les utilisateurs"
        />
      </DashboardSection>

      {/* Courses Section using DashboardTable */}
      <DashboardSection
        title="Gestion des Formations"
        isLoading={loadingData}
        actionButton={
          <ActionButton to="/admin/courses" icon={MdSchool}>
            Voir Tout
          </ActionButton>
        }
      >
        <DashboardTable
          columns={courseColumns}
          data={courses}
          actions={courseActions}
          isLoading={loadingData}
          viewAllLink="/admin/courses"
          viewAllText="Voir toutes les formations"
        />
      </DashboardSection>

      {/* Add other sections (e.g., Quick Actions, Settings links) using DashboardSection if desired */}

    </>
  );
};

export default AdminDashboard;
