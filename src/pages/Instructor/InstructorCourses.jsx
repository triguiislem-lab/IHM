import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getAuth } from 'firebase/auth';
import { motion } from 'framer-motion';
import { 
  MdEdit, 
  MdDelete, 
  MdAdd, 
  MdSchool, 
  MdBook, 
  MdPeople, 
  MdAccessTime,
  MdArrowBack
} from 'react-icons/md';
import { fetchInstructorCourses } from '../../utils/moduleUtils';

const InstructorCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const auth = getAuth();

  useEffect(() => {
    const loadCourses = async () => {
      if (!auth.currentUser) {
        navigate('/login');
        return;
      }

      try {
        setLoading(true);
        const instructorCourses = await fetchInstructorCourses(auth.currentUser.uid);
        setCourses(instructorCourses);
      } catch (error) {
        console.error('Error loading instructor courses:', error);
        setError('Erreur lors du chargement des cours. Veuillez réessayer.');
      } finally {
        setLoading(false);
      }
    };

    loadCourses();
  }, [auth.currentUser, navigate]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Mes cours</h1>
          <p className="text-gray-600">Gérez vos cours, modules et évaluations</p>
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
            onClick={() => navigate('/instructor/course/new')}
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
            Vous n'avez pas encore créé de cours. Commencez par en créer un nouveau.
          </p>
          <button
            onClick={() => navigate('/instructor/course/new')}
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
                {course.image ? (
                  <img
                    src={course.image}
                    alt={course.title || course.titre}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100">
                    <MdBook className="text-5xl text-gray-400" />
                  </div>
                )}
                <div className="absolute top-2 right-2 flex gap-2">
                  <Link
                    to={`/instructor/course/${course.id}/edit`}
                    className="p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors duration-300"
                  >
                    <MdEdit className="text-gray-700" />
                  </Link>
                </div>
              </div>
              
              <div className="p-4">
                <h2 className="text-lg font-semibold mb-2 truncate">
                  {course.title || course.titre || 'Cours sans titre'}
                </h2>
                
                <div className="flex items-center text-sm text-gray-600 mb-3">
                  <MdPeople className="mr-1" />
                  <span>{course.students || 0} étudiants</span>
                  <span className="mx-2">•</span>
                  <MdAccessTime className="mr-1" />
                  <span>{course.modules?.length || 0} modules</span>
                </div>
                
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {course.description || 'Aucune description disponible.'}
                </p>
                
                <div className="flex justify-between">
                  <Link
                    to={`/instructor/course/${course.id}`}
                    className="flex items-center gap-1 px-3 py-1.5 bg-secondary text-white rounded-md hover:bg-secondary/90 transition-colors duration-300"
                  >
                    <span>Gérer</span>
                  </Link>
                  
                  <Link
                    to={`/course/${course.id}`}
                    className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors duration-300"
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
