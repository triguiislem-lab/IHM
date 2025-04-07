import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { getAuth } from "firebase/auth";
import {
  fetchCompleteUserInfo,
  fetchCoursesFromDatabase,
  fetchUsersFromDatabase,
  fetchCourseEnrollments,
  fetchSpecialitesFromDatabase,
  fetchDisciplinesFromDatabase,
} from "../../utils/firebaseUtils";
import {
  MdSchool,
  MdPeople,
  MdAdminPanelSettings,
  MdPerson,
  MdSettings,
  MdStorage,
  MdMessage,
  MdCategory,
  MdAddCircle,
} from "react-icons/md";
import { Link } from "react-router-dom";

const AdminDashboard = () => {
  const [userInfo, setUserInfo] = useState(null);
  const [courses, setCourses] = useState([]);
  const [users, setUsers] = useState([]);
  const [students, setStudents] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [totalEnrollments, setTotalEnrollments] = useState(0);
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

          // Récupérer les spécialités et disciplines pour les noms
          const specialites = await fetchSpecialitesFromDatabase();
          const disciplines = await fetchDisciplinesFromDatabase();

          // Récupérer tous les cours
          const allCourses = await fetchCoursesFromDatabase();

          // Récupérer les inscriptions pour chaque cours et ajouter les noms des spécialités/disciplines
          const coursesWithEnrollments = await Promise.all(
            allCourses.map(async (course) => {
              try {
                // Récupérer les inscriptions
                const enrollments = await fetchCourseEnrollments(course.id);

                // Trouver la spécialité et la discipline associées au cours
                let specialiteName = "";
                let disciplineName = "";

                if (course.specialiteId) {
                  const specialite = specialites.find(
                    (s) => s.id === course.specialiteId
                  );
                  if (specialite) {
                    specialiteName = specialite.name;
                  }
                }

                if (course.disciplineId) {
                  const discipline = disciplines.find(
                    (d) => d.id === course.disciplineId
                  );
                  if (discipline) {
                    disciplineName = discipline.name;
                  }
                }

                return {
                  ...course,
                  students: enrollments.length,
                  enrollments: enrollments,
                  specialiteName,
                  disciplineName,
                };
              } catch (error) {
                console.error(
                  `Error fetching enrollments for course ${course.id}:`,
                  error
                );
                return {
                  ...course,
                  students: 0,
                  enrollments: [],
                  specialiteName: "",
                  disciplineName: "",
                };
              }
            })
          );

          // Trier les cours par nombre d'étudiants (du plus grand au plus petit)
          const sortedCourses = [...coursesWithEnrollments].sort(
            (a, b) => (b.students || 0) - (a.students || 0)
          );

          setCourses(sortedCourses);

          // Calculer le nombre total d'inscriptions
          const totalEnrollmentsCount = coursesWithEnrollments.reduce(
            (total, course) => total + (course.students || 0),
            0
          );
          setTotalEnrollments(totalEnrollmentsCount);

          // Récupérer tous les utilisateurs
          const allUsers = await fetchUsersFromDatabase();
          setUsers(allUsers);

          // Séparer les utilisateurs par rôle
          const studentsList = allUsers.filter(
            (user) => user.role === "student" || user.userType === "apprenant"
          );
          setStudents(studentsList);

          const instructorsList = allUsers.filter(
            (user) =>
              user.role === "instructor" || user.userType === "formateur"
          );
          setInstructors(instructorsList);
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
                  {students.length}
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
                  {instructors.length}
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
                <h3 className="text-lg font-semibold">Total Inscriptions</h3>
                <p className="text-3xl font-bold text-purple-600">
                  {totalEnrollments}
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
            <Link
              to="/admin/database-migration"
              className="bg-indigo-600 text-white p-4 rounded-lg text-center hover:bg-indigo-700 transition-colors duration-300 flex items-center justify-center gap-2"
            >
              <MdStorage />
              Migration BDD
            </Link>
            <Link
              to="/admin/specialites"
              className="bg-yellow-600 text-white p-4 rounded-lg text-center hover:bg-yellow-700 transition-colors duration-300 flex items-center justify-center gap-2"
            >
              <MdCategory />
              Spécialités & Disciplines
            </Link>
            {/* Seuls les formateurs peuvent créer des cours */}
            {(userInfo?.role === "instructor" ||
              userInfo?.role === "formateur" ||
              userInfo?.userType === "formateur") && (
              <Link
                to="/admin/course/new"
                className="bg-teal-600 text-white p-4 rounded-lg text-center hover:bg-teal-700 transition-colors duration-300 flex items-center justify-center gap-2"
              >
                <MdAddCircle />
                Créer un cours
              </Link>
            )}
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

        {/* Formateurs */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-6">
            Formateurs ({instructors.length})
          </h2>

          {instructors.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="py-3 px-4 text-left">Nom</th>
                    <th className="py-3 px-4 text-left">Email</th>
                    <th className="py-3 px-4 text-left">Expertise</th>
                    <th className="py-3 px-4 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {instructors.map((user) => (
                    <tr key={user.id || user.uid} className="hover:bg-gray-50">
                      <td className="py-3 px-4">
                        {user.firstName || user.prenom || ""}{" "}
                        {user.lastName || user.nom || ""}
                      </td>
                      <td className="py-3 px-4">{user.email}</td>
                      <td className="py-3 px-4">
                        {user.expertise || "Non spécifié"}
                      </td>
                      <td className="py-3 px-4">
                        <Link
                          to={`/admin/users/${user.id || user.uid}`}
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
              <p className="text-gray-600">Aucun formateur trouvé.</p>
            </div>
          )}
        </div>

        {/* Étudiants */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-6">
            Étudiants ({students.length})
          </h2>

          {students.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="py-3 px-4 text-left">Nom</th>
                    <th className="py-3 px-4 text-left">Email</th>
                    <th className="py-3 px-4 text-left">Inscriptions</th>
                    <th className="py-3 px-4 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {students.slice(0, 10).map((user) => (
                    <tr key={user.id || user.uid} className="hover:bg-gray-50">
                      <td className="py-3 px-4">
                        {user.firstName || user.prenom || ""}{" "}
                        {user.lastName || user.nom || ""}
                      </td>
                      <td className="py-3 px-4">{user.email}</td>
                      <td className="py-3 px-4">
                        {user.enrollments?.length || 0}
                      </td>
                      <td className="py-3 px-4">
                        <Link
                          to={`/admin/users/${user.id || user.uid}`}
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
              <p className="text-gray-600">Aucun étudiant trouvé.</p>
            </div>
          )}
        </div>

        {/* Liste des cours */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-6">
            Liste des cours ({courses.length})
          </h2>

          {courses.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="py-3 px-4 text-left">Titre</th>
                    <th className="py-3 px-4 text-left">Niveau</th>
                    <th className="py-3 px-4 text-left">
                      Spécialité/Discipline
                    </th>
                    <th className="py-3 px-4 text-left">Étudiants inscrits</th>
                    <th className="py-3 px-4 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {courses.map((course) => (
                    <tr key={course.id} className="hover:bg-gray-50">
                      <td className="py-3 px-4">
                        {course.title || course.titre || "Cours sans titre"}
                      </td>
                      <td className="py-3 px-4">
                        {course.level || "Intermédiaire"}
                      </td>
                      <td className="py-3 px-4">
                        {course.specialiteName ||
                          course.disciplineName ||
                          "Non spécifié"}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-semibold">
                          {course.students || 0}
                        </span>
                        {course.students > 0 && (
                          <Link
                            to={`/admin/course/${course.id}/students`}
                            className="ml-2 text-xs text-blue-600 hover:underline"
                          >
                            Voir la liste
                          </Link>
                        )}
                      </td>
                      <td className="py-3 px-4 flex space-x-2">
                        <Link
                          to={`/course/${course.id}`}
                          className="text-secondary hover:underline"
                        >
                          Voir
                        </Link>
                        {(userInfo?.role === "instructor" ||
                          userInfo?.role === "formateur" ||
                          userInfo?.role === "admin" ||
                          userInfo?.userType === "formateur" ||
                          userInfo?.userType === "administrateur") && (
                          <Link
                            to={`/admin/course/edit/${course.id}`}
                            className="text-orange-600 hover:underline"
                          >
                            Éditer
                          </Link>
                        )}
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
