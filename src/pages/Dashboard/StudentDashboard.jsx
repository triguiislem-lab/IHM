import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { getAuth } from "firebase/auth";
import { fetchCompleteUserInfo } from "../../utils/firebaseUtils";
import { getUserOverallProgress } from "../../utils/progressUtils";
import { MdSchool, MdAssignment, MdBarChart } from "react-icons/md";
import { Link } from "react-router-dom";

const StudentDashboard = () => {
  const [userInfo, setUserInfo] = useState(null);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const auth = getAuth();

  useEffect(() => {
    const loadUserData = async () => {
      try {
        setLoading(true);
        setError("");

        if (auth.currentUser) {
          // Récupérer les informations de l'utilisateur
          const info = await fetchCompleteUserInfo(auth.currentUser.uid);
          setUserInfo(info);

          // Récupérer la progression globale
          const progressData = await getUserOverallProgress(auth.currentUser.uid);
          setProgress(progressData);
        }
      } catch (error) {
        console.error("Error loading user data:", error);
        setError("Une erreur s'est produite lors du chargement des données.");
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [auth.currentUser]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-100 p-4 rounded-lg text-red-700">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold mb-8">Tableau de bord étudiant</h1>

        {/* Carte de bienvenue */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">
            Bienvenue, {userInfo?.prenom || "Étudiant"}!
          </h2>
          <p className="text-gray-600">
            Voici un aperçu de votre progression et de vos activités récentes.
          </p>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center gap-4">
              <div className="bg-blue-100 p-3 rounded-full">
                <MdSchool className="text-blue-600 text-2xl" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Cours inscrits</h3>
                <p className="text-3xl font-bold text-blue-600">
                  {progress?.enrolledCourses || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center gap-4">
              <div className="bg-green-100 p-3 rounded-full">
                <MdAssignment className="text-green-600 text-2xl" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Cours complétés</h3>
                <p className="text-3xl font-bold text-green-600">
                  {progress?.completedCourses || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center gap-4">
              <div className="bg-purple-100 p-3 rounded-full">
                <MdBarChart className="text-purple-600 text-2xl" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Progression globale</h3>
                <p className="text-3xl font-bold text-purple-600">
                  {progress?.overallProgress || 0}%
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions rapides */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Actions rapides</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              to="/my-courses"
              className="bg-secondary text-white p-4 rounded-lg text-center hover:bg-secondary/90 transition-colors duration-300"
            >
              Mes cours
            </Link>
            <Link
              to="/courses"
              className="bg-blue-600 text-white p-4 rounded-lg text-center hover:bg-blue-700 transition-colors duration-300"
            >
              Explorer les cours
            </Link>
            <Link
              to="/profile"
              className="bg-green-600 text-white p-4 rounded-lg text-center hover:bg-green-700 transition-colors duration-300"
            >
              Mon profil
            </Link>
            <Link
              to="/edit-profile"
              className="bg-purple-600 text-white p-4 rounded-lg text-center hover:bg-purple-700 transition-colors duration-300"
            >
              Modifier mon profil
            </Link>
          </div>
        </div>

        {/* Message d'encouragement */}
        <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
          <p className="text-blue-800 text-center">
            Continuez à apprendre et à progresser ! N'hésitez pas à explorer de nouveaux cours pour enrichir vos connaissances.
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default StudentDashboard;
