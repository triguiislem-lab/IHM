import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { getAuth } from "firebase/auth";
import {
  fetchCompleteUserInfo,
  fetchCoursesFromDatabase,
  fetchUsersFromDatabase,
} from "../../utils/firebaseUtils";
import {
  MdSchool,
  MdPeople,
  MdAdminPanelSettings,
  MdPerson,
  MdSettings,
  MdStorage,
  MdMessage,
} from "react-icons/md";
import { Link } from "react-router-dom";

const AdminDashboard = () => {
  const [userInfo, setUserInfo] = useState(null);
  const [courses, setCourses] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const auth = getAuth();

  useEffect(() => {
    const loadAdminData = async () => {
      try {
        setLoading(true);
        setError("");

        if (auth.currentUser) {
          // Récupérer les informations de l'administrateur
          const info = await fetchCompleteUserInfo(auth.currentUser.uid);
          setUserInfo(info);

          // Récupérer tous les cours
          const allCourses = await fetchCoursesFromDatabase();
          setCourses(allCourses);

          // Récupérer tous les utilisateurs
          const allUsers = await fetchUsersFromDatabase();
          setUsers(allUsers);
        }
      } catch (error) {
        console.error("Error loading admin data:", error);
        setError("Une erreur s'est produite lors du chargement des données.");
      } finally {
        setLoading(false);
      }
    };

    loadAdminData();
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

  // Compter les utilisateurs par type
  const userCounts = {
    student: users.filter(
      (user) => user.userType === "student" || user.userType === "apprenant"
    ).length,
    instructor: users.filter(
      (user) => user.userType === "instructor" || user.userType === "formateur"
    ).length,
    admin: users.filter(
      (user) => user.userType === "admin" || user.userType === "administrateur"
    ).length,
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold mb-8">
          Tableau de bord administrateur
        </h1>

        {/* Carte de bienvenue */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">
            Bienvenue, {userInfo?.prenom || "Administrateur"}!
          </h2>
          <p className="text-gray-600">
            Gérez la plateforme, les utilisateurs et les cours.
          </p>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center gap-4">
              <div className="bg-blue-100 p-3 rounded-full">
                <MdSchool className="text-blue-600 text-2xl" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Cours</h3>
                <p className="text-3xl font-bold text-blue-600">
                  {courses.length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center gap-4">
              <div className="bg-green-100 p-3 rounded-full">
                <MdPerson className="text-green-600 text-2xl" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Étudiants</h3>
                <p className="text-3xl font-bold text-green-600">
                  {userCounts.student}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center gap-4">
              <div className="bg-purple-100 p-3 rounded-full">
                <MdPeople className="text-purple-600 text-2xl" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Formateurs</h3>
                <p className="text-3xl font-bold text-purple-600">
                  {userCounts.instructor}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center gap-4">
              <div className="bg-red-100 p-3 rounded-full">
                <MdAdminPanelSettings className="text-red-600 text-2xl" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Administrateurs</h3>
                <p className="text-3xl font-bold text-red-600">
                  {userCounts.admin}
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
              Gérer les cours
            </Link>
            <Link
              to="/profile"
              className="bg-blue-600 text-white p-4 rounded-lg text-center hover:bg-blue-700 transition-colors duration-300 flex items-center justify-center gap-2"
            >
              <MdPerson />
              Mon profil
            </Link>
            <Link
              to="/admin/database-cleanup"
              className="bg-purple-600 text-white p-4 rounded-lg text-center hover:bg-purple-700 transition-colors duration-300 flex items-center justify-center gap-2"
            >
              <MdStorage />
              Nettoyage BDD
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <Link
              to="/courses"
              className="bg-green-600 text-white p-4 rounded-lg text-center hover:bg-green-700 transition-colors duration-300 flex items-center justify-center gap-2"
            >
              <MdPeople />
              Gérer utilisateurs
            </Link>
            <Link
              to="/messages"
              className="bg-amber-600 text-white p-4 rounded-lg text-center hover:bg-amber-700 transition-colors duration-300 flex items-center justify-center gap-2"
            >
              <MdMessage />
              Messages
            </Link>
            <Link
              to="/courses"
              className="bg-gray-600 text-white p-4 rounded-lg text-center hover:bg-gray-700 transition-colors duration-300 flex items-center justify-center gap-2"
            >
              <MdSettings />
              Paramètres
            </Link>
          </div>
        </div>

        {/* Utilisateurs récents */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-6">Utilisateurs récents</h2>

          {users.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="py-3 px-4 text-left">Nom</th>
                    <th className="py-3 px-4 text-left">Email</th>
                    <th className="py-3 px-4 text-left">Type</th>
                    <th className="py-3 px-4 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {users.slice(0, 5).map((user) => (
                    <tr key={user.id || user.uid} className="hover:bg-gray-50">
                      <td className="py-3 px-4">
                        {user.prenom} {user.nom}
                      </td>
                      <td className="py-3 px-4">{user.email}</td>
                      <td className="py-3 px-4 capitalize">{user.userType}</td>
                      <td className="py-3 px-4">
                        <button className="text-secondary hover:underline">
                          Voir
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <p className="text-gray-600">Aucun utilisateur trouvé.</p>
            </div>
          )}
        </div>

        {/* Cours récents */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-6">Cours récents</h2>

          {courses.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="py-3 px-4 text-left">Titre</th>
                    <th className="py-3 px-4 text-left">Niveau</th>
                    <th className="py-3 px-4 text-left">Étudiants</th>
                    <th className="py-3 px-4 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {courses.slice(0, 5).map((course) => (
                    <tr key={course.id} className="hover:bg-gray-50">
                      <td className="py-3 px-4">
                        {course.title || course.titre || "Cours sans titre"}
                      </td>
                      <td className="py-3 px-4">
                        {course.level || "Intermédiaire"}
                      </td>
                      <td className="py-3 px-4">{course.students || 0}</td>
                      <td className="py-3 px-4">
                        <Link
                          to={`/course/${course.id}`}
                          className="text-secondary hover:underline"
                        >
                          Voir
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <p className="text-gray-600">Aucun cours trouvé.</p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default AdminDashboard;
