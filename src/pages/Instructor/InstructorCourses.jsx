import React, { useState, useEffect, useCallback, Suspense, lazy } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getAuth } from "firebase/auth";
import { motion } from "framer-motion";
import {
  MdEdit,
  MdDelete,
  MdAdd,
  MdSchool,
  MdBook,
  MdPeople,
  MdAccessTime,
  MdArrowBack,
} from "react-icons/md";
import { fetchInstructorCourses } from "../../utils/moduleUtils";
import OptimizedLoadingSpinner from "../../components/Common/OptimizedLoadingSpinner";
import LazyImage from "../../components/Common/LazyImage";
import { useAuth } from "../../hooks/useAuth";

const InstructorCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  // Fonction optimisée pour charger les cours
  const loadCourses = useCallback(async () => {
    if (authLoading) return;

    if (!user) {
      navigate("/login");
      return;
    }

    try {
      setLoading(true);
      
      const instructorCourses = await fetchInstructorCourses(user.uid);
      
      setCourses(instructorCourses);
    } catch (error) {
      
      setError("Erreur lors du chargement des cours. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    loadCourses();
  }, [loadCourses]);

  // Afficher un état de chargement optimisé
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col justify-center items-center h-64">
          <OptimizedLoadingSpinner
            size="large"
            text="Chargement de vos cours..."
          />
          <p className="text-gray-500 text-sm mt-4">
            Chargement des données depuis Firebase...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Mes cours</h1>
          <p className="text-gray-600">
            Gérez vos cours, modules et évaluations
          </p>
        </div>
        <div className="flex gap-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors duration-300"
          >
            <MdArrowBack />
            Retour
          </button>
          <button
            onClick={() => navigate("/instructor/course-form")}
            className="flex items-center gap-2 px-4 py-2 bg-secondary text-white rounded-md hover:bg-secondary/90 transition-colors duration-300"
          >
            <MdAdd />
            Nouveau cours
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 p-4 rounded-lg mb-6">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {courses.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <MdSchool className="text-6xl text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Aucun cours trouvé</h2>
          <p className="text-gray-600 mb-6">
            Vous n'avez pas encore créé de cours. Commencez par en créer un
            nouveau.
          </p>
          <button
            onClick={() => navigate("/instructor/course-form")}
            className="flex items-center gap-2 px-4 py-2 bg-secondary text-white rounded-md hover:bg-secondary/90 transition-colors duration-300 mx-auto"
          >
            <MdAdd />
            Créer mon premier cours
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg shadow-md overflow-hidden"
            >
              <div className="relative h-40 bg-gray-200">
                <LazyImage
                  src={course.image}
                  alt={course.title || course.titre}
                  className="w-full h-full object-cover"
                  fallbackIcon={MdBook}
                  fallbackClassName="w-full h-full"
                />
              </div>

              <div className="p-4">
                <h2 className="text-lg font-semibold mb-2 truncate">
                  {course.title || course.titre || "Cours sans titre"}
                </h2>

                <div className="flex items-center text-sm text-gray-600 mb-3">
                  <MdPeople className="mr-1" />
                  <span>{course.students || 0} étudiants</span>
                  <span className="mx-2">•</span>
                  <MdAccessTime className="mr-1" />
                  <span>{course.modules?.length || 0} modules</span>
                </div>

                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {course.description || "Aucune description disponible."}
                </p>

                <div className="flex justify-between gap-2">
                  <button
                    className="flex items-center gap-1 px-3 py-1.5 bg-secondary text-white rounded-md hover:bg-secondary/90 transition-colors duration-300 flex-1 justify-center"
                    onClick={() => {
                      
                      window.location.href = `/instructor/course-management/${course.id}`;
                    }}
                  >
                    <MdBook />
                    <span>Modules</span>
                  </button>

                  <button
                    className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-300 flex-1 justify-center"
                    onClick={() => {
                      
                      window.location.href = `/instructor/course-form/${course.id}`;
                    }}
                  >
                    <MdEdit />
                    <span>Modifier</span>
                  </button>

                  <Link
                    to={`/course/${course.id}`}
                    className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors duration-300 flex-1 justify-center"
                  >
                    <span>Aperçu</span>
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default InstructorCourses;
