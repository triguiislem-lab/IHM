import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { useAuth } from "../../hooks/useAuth";
import {
  fetchCoursesFromDatabase,
  fetchUsersFromDatabase,
  fetchCourseEnrollments,
  fetchSpecialitesFromDatabase,
  fetchDisciplinesFromDatabase,
} from "../../utils/firebaseUtils";
import {
  MdSchool,
  MdPeople,
  MdPerson,
  MdSettings,
  MdStorage,
  MdMessage,
  MdCategory,
  MdAddCircle,
} from "react-icons/md";
import { Link } from "react-router-dom";
import LoadingSpinner from "../../components/Common/LoadingSpinner";

const AdminDashboard = () => {
  const { user, role, loading: authLoading } = useAuth();

  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [totalEnrollments, setTotalEnrollments] = useState(0);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState("");

  const loadAdminData = useCallback(async () => {
    if (authLoading || !user || role !== "admin") {
      if (!authLoading && role !== "admin") {
        setError("Accès non autorisé.");
        setLoadingData(false);
      }
      return;
    }

    try {
      setLoadingData(true);
      setError("");

      const [specialites, disciplines, allCoursesRaw, allUsers] =
        await Promise.all([
          fetchSpecialitesFromDatabase(),
          fetchDisciplinesFromDatabase(),
          fetchCoursesFromDatabase(),
          fetchUsersFromDatabase(),
        ]);

      const coursesWithDetails = await Promise.all(
        allCoursesRaw.map(async (course) => {
          try {
            const enrollments = await fetchCourseEnrollments(course.id);
            const specialite = specialites.find(
              (s) => s.id === course.specialiteId
            );
            const discipline = disciplines.find(
              (d) => d.id === course.disciplineId
            );

            return {
              ...course,
              students: enrollments.length,
              enrollments: enrollments,
              specialiteName: specialite?.name || "",
              disciplineName: discipline?.name || "",
            };
          } catch (error) {
            
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

      const sortedCourses = [...coursesWithDetails].sort(
        (a, b) => (b.students || 0) - (a.students || 0)
      );
      setCourses(sortedCourses);

      const totalEnrollmentsCount = coursesWithDetails.reduce(
        (total, course) => total + (course.students || 0),
        0
      );
      setTotalEnrollments(totalEnrollmentsCount);

      const studentsList = allUsers.filter((u) => u.role === "student");
      setStudents(studentsList);
      const instructorsList = allUsers.filter((u) => u.role === "instructor");
      setInstructors(instructorsList);
    } catch (err) {
      
      setError("Une erreur s'est produite lors du chargement des données.");
    } finally {
      setLoadingData(false);
    }
  }, [user, role, authLoading]);

  useEffect(() => {
    loadAdminData();
  }, [loadAdminData]);

  const isLoading = authLoading || loadingData;

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <div className="bg-red-100 p-4 rounded-lg text-red-700">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p>Utilisateur non trouvé.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        <h1 className="text-3xl font-bold mb-8">
          Tableau de bord administrateur
        </h1>

        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">
            Bienvenue, {user?.firstName || "Admin"}!
          </h2>
          <p className="text-gray-600">
            Gérez la plateforme, les utilisateurs et les cours.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6 flex items-center gap-4 border border-gray-200">
            <div className="bg-blue-100 p-3 rounded-full">
              <MdSchool className="text-blue-600 text-2xl" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-700">
                Cours Actifs
              </h3>
              <p className="text-3xl font-bold text-blue-600">
                {courses.length}
              </p>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 flex items-center gap-4 border border-gray-200">
            <div className="bg-green-100 p-3 rounded-full">
              <MdPerson className="text-green-600 text-2xl" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-700">Étudiants</h3>
              <p className="text-3xl font-bold text-green-600">
                {students.length}
              </p>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 flex items-center gap-4 border border-gray-200">
            <div className="bg-purple-100 p-3 rounded-full">
              <MdPeople className="text-purple-600 text-2xl" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-700">
                Formateurs
              </h3>
              <p className="text-3xl font-bold text-purple-600">
                {instructors.length}
              </p>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 flex items-center gap-4 border border-gray-200">
            <div className="bg-yellow-100 p-3 rounded-full">
              <MdPeople className="text-yellow-600 text-2xl" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-700">
                Inscriptions
              </h3>
              <p className="text-3xl font-bold text-yellow-600">
                {totalEnrollments}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Actions rapides</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <Link
              to="/admin/courses"
              className="bg-indigo-600 text-white p-4 rounded-lg text-center hover:bg-indigo-700 transition-colors duration-300 flex items-center justify-center gap-2"
            >
              <MdSchool />
              Gérer Cours
            </Link>
            <Link
              to="/admin/users"
              className="bg-green-600 text-white p-4 rounded-lg text-center hover:bg-green-700 transition-colors duration-300 flex items-center justify-center gap-2"
            >
              <MdPeople />
              Gérer Utilisateurs
            </Link>
            <Link
              to="/admin/specialites"
              className="bg-yellow-600 text-white p-4 rounded-lg text-center hover:bg-yellow-700 transition-colors duration-300 flex items-center justify-center gap-2"
            >
              <MdCategory />
              Spécialités
            </Link>
            <Link
              to="/admin/course-form"
              className="bg-teal-600 text-white p-4 rounded-lg text-center hover:bg-teal-700 transition-colors duration-300 flex items-center justify-center gap-2"
            >
              <MdAddCircle />
              Nouveau Cours
            </Link>
            <Link
              to="/messages"
              className="bg-amber-600 text-white p-4 rounded-lg text-center hover:bg-amber-700 transition-colors duration-300 flex items-center justify-center gap-2"
            >
              <MdMessage />
              Messages
            </Link>
            <Link
              to="/admin/database-cleanup"
              className="bg-red-600 text-white p-4 rounded-lg text-center hover:bg-red-700 transition-colors duration-300 flex items-center justify-center gap-2"
            >
              <MdStorage />
              Nettoyage BDD
            </Link>
            <Link
              to="/admin/database-migration"
              className="bg-purple-600 text-white p-4 rounded-lg text-center hover:bg-purple-700 transition-colors duration-300 flex items-center justify-center gap-2"
            >
              <MdStorage />
              Migration BDD
            </Link>
            <Link
              to="/admin/settings"
              className="bg-gray-500 text-white p-4 rounded-lg text-center hover:bg-gray-600 transition-colors duration-300 flex items-center justify-center gap-2"
            >
              <MdSettings />
              Paramètres
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-6 text-gray-700">
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
                          to={`/admin/user/${user.id || user.uid}`}
                          className="text-indigo-600 hover:text-indigo-800 hover:underline text-sm"
                        >
                          Détails
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

        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-6 text-gray-700">
            Étudiants ({students.length}) - 10 derniers
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
                          to={`/admin/user/${user.id || user.uid}`}
                          className="text-indigo-600 hover:text-indigo-800 hover:underline text-sm"
                        >
                          Détails
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

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-6 text-gray-700">
            Cours Actifs ({courses.length})
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
                            to={`/admin/course-enrollments/${course.id}`}
                            className="ml-2 text-xs text-blue-600 hover:underline"
                          >
                            (Voir liste)
                          </Link>
                        )}
                      </td>
                      <td className="py-3 px-4 flex space-x-3 whitespace-nowrap">
                        <Link
                          to={`/course/${course.id}`}
                          className="text-blue-600 hover:text-blue-800 hover:underline text-sm"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Voir Public
                        </Link>
                        <Link
                          to={`/admin/course-form/${course.id}`}
                          className="text-orange-600 hover:text-orange-800 hover:underline text-sm"
                        >
                          Éditer
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
