import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { fetchEnrolledCoursesForStudent } from "../../utils/firebaseUtils";
import { getUserOverallProgress } from "../../utils/progressUtils";
import LoadingSpinner from "../../components/Common/LoadingSpinner";
import StatCard from "../../components/Dashboard/StatCard";
import DashboardSection from "../../components/Dashboard/DashboardSection";
import DashboardTable from "../../components/Dashboard/DashboardTable";
import ActionButton from "../../components/Common/ActionButton";
import { MdSchool, MdTrendingUp, MdLibraryBooks, MdPlayCircleOutline, MdSearch } from "react-icons/md";

const StudentDashboard = () => {
  const { user, loading: authLoading, error: authError } = useAuth();
  const [progress, setProgress] = useState({ overallProgress: 0 }); // Default progress
  const [progressLoading, setProgressLoading] = useState(true);
  const [progressError, setProgressError] = useState("");
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [errorCourses, setErrorCourses] = useState("");

  const loadDashboardData = useCallback(async (userId) => {
    setProgressLoading(true);
    setLoadingCourses(true);
    setProgressError("");
    setErrorCourses("");
    try {
      const [progressData, enrolledData] = await Promise.all([
        getUserOverallProgress(userId).catch(err => ({ error: true, message: "Erreur chargement progression.", data: { overallProgress: 0 } })), // Handle specific error
        fetchEnrolledCoursesForStudent(userId).catch(err => ({ error: true, message: "Erreur chargement cours." })) // Handle specific error
      ]);

      if (progressData.error) {
        setProgressError(progressData.message);
        setProgress({ overallProgress: 0 }); // Set default
      } else {
        setProgress(progressData);
      }

      if (enrolledData.error) {
        setErrorCourses(enrolledData.message);
        setEnrolledCourses([]); // Set default
      } else {
        setEnrolledCourses(enrolledData);
      }

    } catch (error) { // Catch any unexpected parallel errors
      console.error("Error loading student dashboard data:", error);
      setProgressError("Erreur chargement progression.");
      setErrorCourses("Erreur chargement cours inscrits.");
    } finally {
      setProgressLoading(false);
      setLoadingCourses(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      loadDashboardData(user.uid);
    } else if (!authLoading) {
      setProgressLoading(false);
      setLoadingCourses(false);
      // Handle not logged in state if needed
    }
  }, [user, authLoading, loadDashboardData]);

  // Combined loading check
  if (authLoading) {
    return <LoadingSpinner />;
  }
  if (!user) {
      return <p className="text-center p-4">Veuillez vous connecter.</p>;
  }

  // Combined error display (show first error encountered)
  const combinedError = authError || progressError || errorCourses;

  // --- Define Columns and Actions for Enrolled Courses Table ---
  const enrolledCourseColumns = [
    {
      key: 'title',
      header: 'Titre',
      render: (course) => (
        <Link to={`/course/${course.id}`} className="hover:underline font-medium text-gray-900 flex items-center gap-2">
          <img 
            src={course.image || 'https://via.placeholder.com/40x20?text=C'} 
            alt="" // Alt handled by title link
            className="w-10 h-auto object-cover rounded mr-2 inline-block"
            onError={(e) => { e.target.style.display='none'}}
          />
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
      key: 'progress', // Placeholder for progress
      header: 'Progression',
      render: (course) => (
        <span className="text-gray-500">{/* TODO: Add progress bar/percentage */}--%</span>
      ),
    },
  ];

  const enrolledCourseActions = [
    {
      label: 'Continuer',
      icon: MdPlayCircleOutline,
      variant: 'primary',
      to: (course) => `/course/${course.id}`,
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
        Tableau de Bord Étudiant
      </motion.h1>

      {combinedError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <span className="block sm:inline">{combinedError}</span>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
        <StatCard
          title="Progression Globale"
          value={`${progress?.overallProgress?.toFixed(1) || 0}%`}
          icon={MdTrendingUp}
          color="green"
        />
        <StatCard
          title="Cours Inscrits"
          value={loadingCourses ? '-' : enrolledCourses.length}
          icon={MdLibraryBooks}
          color="blue"
        />
      </div>

      {/* Enrolled Courses Section using DashboardTable */}
      <DashboardSection
        title="Mes Cours Inscrits"
        isLoading={loadingCourses}
        actionButton={
          <ActionButton to="/courses" icon={MdSearch} variant="secondary">
            Explorer les Cours
          </ActionButton>
        }
      >
         <DashboardTable
          columns={enrolledCourseColumns}
          data={enrolledCourses}
          actions={enrolledCourseActions}
          isLoading={loadingCourses}
          maxRows={10} // Show more enrolled courses perhaps
          // No view all link needed if this shows all enrolled courses
        />
      </DashboardSection>

      {/* Removed Recommendations Section */}
    </>
  );
};

export default StudentDashboard;
