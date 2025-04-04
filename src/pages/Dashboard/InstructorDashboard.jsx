import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { getAuth } from "firebase/auth";
import { fetchCompleteUserInfo, fetchCoursesFromDatabase } from "../../utils/firebaseUtils";
import { MdSchool, MdPeople, MdAdd } from "react-icons/md";
import { Link } from "react-router-dom";

const InstructorDashboard = () => {
  const [userInfo, setUserInfo] = useState(null);
  const [courses, setCourses] = useState([]);
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

          // Récupérer tous les cours
          const allCourses = await fetchCoursesFromDatabase();
          
          // Filtrer les cours de l'instructeur
          const instructorCourses = allCourses.filter(
            course => course.instructorId === auth.currentUser.uid
          );
          
          setCourses(instructorCourses);
        }
      } catch (error) {
        console.error("Error loading instructor data:", error);
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
        <h1 className="text-3xl font-bold mb-8">Tableau de bord formateur</h1>

        {/* Carte de bienvenue */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">
            Bienvenue, {userInfo?.prenom || "Formateur"}!
          </h2>
          <p className="text-gray-600">
            Gérez vos cours et suivez les progrès de vos étudiants.
          </p>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center gap-4">
              <div className="bg-blue-100 p-3 rounded-full">
                <MdSchool className="text-blue-600 text-2xl" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Mes cours</h3>
                <p className="text-3xl font-bold text-blue-600">
                  {courses.length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center gap-4">
              <div className="bg-green-100 p-3 rounded-full">
                <MdPeople className="text-green-600 text-2xl" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Étudiants inscrits</h3>
                <p className="text-3xl font-bold text-green-600">
                  {courses.reduce((total, course) => total + (course.students || 0), 0)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions rapides */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Actions rapides</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              to="/courses"
              className="bg-secondary text-white p-4 rounded-lg text-center hover:bg-secondary/90 transition-colors duration-300 flex items-center justify-center gap-2"
            >
              <MdSchool />
              Voir tous les cours
            </Link>
            <Link
              to="/profile"
              className="bg-blue-600 text-white p-4 rounded-lg text-center hover:bg-blue-700 transition-colors duration-300 flex items-center justify-center gap-2"
            >
              <MdPeople />
              Mon profil
            </Link>
            <Link
              to="/courses"
              className="bg-green-600 text-white p-4 rounded-lg text-center hover:bg-green-700 transition-colors duration-300 flex items-center justify-center gap-2"
            >
              <MdAdd />
              Créer un cours
            </Link>
          </div>
        </div>

        {/* Liste des cours */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-6">Mes cours</h2>
          
          {courses.length > 0 ? (
            <div className="space-y-4">
              {courses.map((course) => (
                <div
                  key={course.id}
                  className="border rounded-lg p-4 hover:bg-gray-50 transition-colors duration-300"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-lg">
                        {course.title || course.titre || "Cours sans titre"}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {course.students || 0} étudiants inscrits
                      </p>
                    </div>
                    <Link
                      to={`/course/${course.id}`}
                      className="bg-secondary text-white px-3 py-1 rounded-md text-sm hover:bg-secondary/90 transition-colors duration-300"
                    >
                      Gérer
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <p className="text-gray-600 mb-4">
                Vous n'avez pas encore créé de cours.
              </p>
              <Link
                to="/courses"
                className="bg-secondary text-white px-4 py-2 rounded-md hover:bg-secondary/90 transition-colors duration-300"
              >
                Créer un cours
              </Link>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default InstructorDashboard;
