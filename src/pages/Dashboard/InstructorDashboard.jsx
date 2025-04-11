import React, { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import LoadingSpinner from "../../components/Common/LoadingSpinner";
import StatCard from "../../components/Dashboard/StatCard";
import DashboardSection from "../../components/Dashboard/DashboardSection";
import DashboardTable from "../../components/Dashboard/DashboardTable";
import ActionButton from "../../components/Common/ActionButton";
import { MdSchool, MdPeople, MdAddCircle, MdEdit, MdDelete, MdSettings } from 'react-icons/md';
import { getDatabase, ref, query, orderByChild, equalTo, get, remove } from 'firebase/database';
import { fetchCoursesByInstructor } from "../../utils/firebaseUtils"; // Assuming this function exists or will be created

const InstructorDashboard = () => {
  const { user, loading: authLoading, error: authError } = useAuth();
  const [courses, setCourses] = useState([]);
  const [stats, setStats] = useState({ courses: 0, students: 0 });
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [coursesError, setCoursesError] = useState("");

  const database = getDatabase();

  const loadInstructorData = useCallback(async (instructorId) => {
    setCoursesLoading(true);
    setCoursesError("");
    try {
      // Assuming fetchCoursesByInstructor gets courses and calculates total enrolled students
      const instructorCourses = await fetchCoursesByInstructor(instructorId);
      setCourses(instructorCourses);

      // Calculate stats
      let totalStudents = 0;
      instructorCourses.forEach(course => {
          totalStudents += Object.keys(course.enrollments || {}).length;
      });
      setStats({ courses: instructorCourses.length, students: totalStudents });

    } catch (err) {
      console.error("Error loading instructor data:", err);
      setCoursesError("Erreur lors du chargement des données formateur.");
    } finally {
      setCoursesLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user && user.normalizedRole === 'instructor') {
      loadInstructorData(user.uid);
    } else if (!authLoading) {
        setCoursesLoading(false);
         // Handle case where user is not an instructor if needed
    }
  }, [user, authLoading, loadInstructorData]);

  const handleDeleteCourse = async (courseId) => {
      if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette formation ?")) return;
      try {
        await remove(ref(database, `elearning/courses/${courseId}`));
        // Optionally remove related modules/enrollments
        setCourses(prev => prev.filter(c => c.id !== courseId));
        // Re-fetch data to update stats
        if (user) loadInstructorData(user.uid);
      } catch (err) {
          console.error("Error deleting course:", err);
          setCoursesError("Erreur lors de la suppression de la formation.");
      }
  };

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
      key: 'enrollments',
      header: 'Inscriptions',
      render: (course) => (
        // Optional: Link to a student list page for this course
        <span className="text-gray-500">{Object.keys(course.enrollments || {}).length}</span>
      ),
    },
     {
      key: 'status',
      header: 'Statut',
      render: (course) => (
          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${course.isPublished ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
              {course.isPublished ? 'Publié' : 'Brouillon'}
          </span>
      ),
    },
  ];

  const courseActions = [
     {
      label: 'Gérer Modules',
      icon: MdSettings,
      variant: 'secondary',
      to: (course) => `/instructor/course-management/${course.id}`,
    },
    {
      icon: MdEdit,
      variant: 'info',
      to: (course) => `/instructor/course-form/${course.id}`,
    },
    {
      icon: MdDelete,
      variant: 'danger',
      onClick: (course) => handleDeleteCourse(course.id),
    },
  ];

  // Combined loading/error checks
  if (authLoading) {
    return <LoadingSpinner />;
  }
  if (authError) {
       return <p className="text-red-500 text-center">{authError}</p>;
  }
   if (!user || user.normalizedRole !== 'instructor') {
      return <p className="text-red-500 text-center">Accès non autorisé.</p>;
  }

  return (
    <>
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-3xl font-bold text-gray-800 mb-6"
      >
        Tableau de Bord Formateur
      </motion.h1>

       {coursesError && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                <span className="block sm:inline">{coursesError}</span>
            </div>
        )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
        <StatCard title="Mes Formations" value={stats.courses} icon={MdSchool} color="blue" />
        <StatCard title="Étudiants Inscrits (Total)" value={stats.students} icon={MdPeople} color="green" />
      </div>

      {/* Courses Section using DashboardTable */}
      <DashboardSection
        title="Mes Formations Créées"
        isLoading={coursesLoading}
        actionButton={
          <ActionButton to="/instructor/course-form" icon={MdAddCircle}>
            Créer Formation
          </ActionButton>
        }
      >
        <DashboardTable
          columns={courseColumns}
          data={courses}
          actions={courseActions}
          isLoading={coursesLoading} // Pass loading state
          // No view all link needed if this shows all instructor courses
          maxRows={10} // Or however many you want to show initially
        />
      </DashboardSection>
    </>
  );
};

export default InstructorDashboard;
