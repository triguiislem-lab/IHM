import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "../../hooks/useAuth";
import { fetchCoursesFromDatabase } from "../../utils/firebaseUtils";
import { MdSchool, MdPeople, MdAdd, MdMessage } from "react-icons/md";
import { Link } from "react-router-dom";
import LoadingSpinner from "../../components/Common/LoadingSpinner";

const InstructorDashboard = () => {
  const [courses, setCourses] = useState([]);
  const { user, role, loading: authLoading, error: authError } = useAuth();
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [coursesError, setCoursesError] = useState("");

  useEffect(() => {
    const loadCourses = async () => {
      if (!authLoading && user && role === "instructor") {
        try {
          setCoursesLoading(true);
          setCoursesError("");

          const allCourses = await fetchCoursesFromDatabase();

          const instructorCourses = allCourses.filter(
            (course) => course.instructorId === user.uid
          );

          setCourses(instructorCourses);
        } catch (error) {
          console.error("Error loading instructor courses:", error);
          setCoursesError(
            "Une erreur s'est produite lors du chargement des cours."
          );
        } finally {
          setCoursesLoading(false);
        }
      } else if (!authLoading && (!user || role !== "instructor")) {
        setCoursesLoading(false);
        setCourses([]);
      }
    };

    loadCourses();
  }, [user, role, authLoading]);

  if (authLoading) {
    return <LoadingSpinner />;
  }

  if (authError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-100 p-4 rounded-lg text-red-700">
          <p>{authError}</p>
        </div>
      </div>
    );
  }

  if (coursesError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-100 p-4 rounded-lg text-red-700">
          <p>{coursesError}</p>
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
            Bienvenue, {user?.prenom || "Formateur"}!
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
                  {courses.reduce(
                    (total, course) => total + (course.students || 0),
                    0
                  )}
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
              Explorer les cours
            </Link>
            <Link
              to="/profile"
              className="bg-blue-600 text-white p-4 rounded-lg text-center hover:bg-blue-700 transition-colors duration-300 flex items-center justify-center gap-2"
            >
              <MdPeople />
              Mon profil
            </Link>
            <Link
              to="/messages"
              className="bg-amber-600 text-white p-4 rounded-lg text-center hover:bg-amber-700 transition-colors duration-300 flex items-center justify-center gap-2"
            >
              <MdMessage />
              Messages
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <Link
              to="/admin/course/new"
              className="bg-green-600 text-white p-4 rounded-lg text-center hover:bg-green-700 transition-colors duration-300 flex items-center justify-center gap-2"
            >
              <MdAdd />
              Créer un nouveau cours
            </Link>
            <Link
              to="/instructor/courses"
              className="bg-purple-600 text-white p-4 rounded-lg text-center hover:bg-purple-700 transition-colors duration-300 flex items-center justify-center gap-2"
            >
              <MdSchool />
              Gérer mes cours
            </Link>
          </div>
        </div>

        {/* Liste des cours */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Mes cours</h2>
            {coursesLoading && <LoadingSpinner size="small" />}
            <Link
              to="/instructor/courses"
              className="text-secondary hover:underline flex items-center gap-1"
            >
              Voir tous mes cours
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </Link>
          </div>

          {coursesLoading ? (
            <div className="text-center py-8">Chargement des cours...</div>
          ) : courses.length > 0 ? (
            <div className="space-y-4">
              {courses.slice(0, 3).map((course) => (
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
                    <div className="flex space-x-2">
                      <Link
                        to={`/course/${course.id}`}
                        className="bg-secondary text-white px-3 py-1 rounded-md text-sm hover:bg-secondary/90 transition-colors duration-300"
                      >
                        Voir
                      </Link>
                      <Link
                        to={`/instructor/course/edit/${course.id}`}
                        className="bg-orange-600 text-white px-3 py-1 rounded-md text-sm hover:bg-orange-700 transition-colors duration-300"
                      >
                        Éditer
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
              {courses.length > 3 && (
                <div className="text-center mt-4">
                  <Link
                    to="/instructor/courses"
                    className="text-secondary hover:underline inline-flex items-center"
                  >
                    Voir tous mes cours ({courses.length})
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 ml-1"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <p className="text-gray-600 mb-4">
                {coursesError
                  ? coursesError
                  : "Vous n'avez pas encore créé de cours."}
              </p>
              <div className="mt-4 flex justify-center space-x-4">
                <Link
                  to="/admin/course/new"
                  className="bg-secondary text-white px-4 py-2 rounded-md hover:bg-secondary/90 transition-colors duration-300 flex items-center gap-2"
                >
                  <MdAdd />
                  Créer un cours
                </Link>
                <Link
                  to="/courses"
                  className="text-secondary border border-secondary px-4 py-2 rounded-md hover:bg-secondary/10 transition-colors duration-300"
                >
                  Explorer les cours
                </Link>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default InstructorDashboard;
