import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getAuth } from 'firebase/auth';
import { getDatabase, ref, get } from 'firebase/database';
import { 
  MdArrowBack, 
  MdEdit, 
  MdPeople, 
  MdSchool, 
  MdAccessTime,
  MdCalendarToday
} from 'react-icons/md';
import { motion } from 'framer-motion';
import ModuleManager from '../../components/CourseModules/ModuleManager';
import { fetchCourseById, fetchCourseEnrollments } from '../../utils/firebaseUtils';

const InstructorCourseManagement = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const auth = getAuth();
  const database = getDatabase();

  const [course, setCourse] = useState(null);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const loadCourseData = async () => {
      if (!auth.currentUser) {
        navigate('/login');
        return;
      }

      try {
        setLoading(true);
        setError('');

        // Récupérer les données du cours
        const courseData = await fetchCourseById(id);
        
        if (!courseData) {
          setError('Cours non trouvé');
          setLoading(false);
          return;
        }

        // Vérifier si l'utilisateur est l'instructeur du cours
        const instructorId = courseData.instructorId || courseData.formateur;
        if (instructorId !== auth.currentUser.uid) {
          setError('Vous n\'êtes pas autorisé à gérer ce cours');
          setTimeout(() => navigate('/instructor/courses'), 2000);
          return;
        }

        // Récupérer les inscriptions au cours
        const courseEnrollments = await fetchCourseEnrollments(id);
        
        setCourse(courseData);
        setEnrollments(courseEnrollments);
      } catch (error) {
        console.error('Error loading course data:', error);
        setError(`Erreur lors du chargement des données: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    loadCourseData();
  }, [id, auth.currentUser, navigate]);

  const handleModulesUpdated = async () => {
    try {
      setLoading(true);
      const updatedCourse = await fetchCourseById(id);
      setCourse(updatedCourse);
      setSuccess('Modules mis à jour avec succès');
      
      // Effacer le message de succès après 3 secondes
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error refreshing course data:', error);
      setError(`Erreur lors de la mise à jour: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
        <button
          onClick={() => navigate('/instructor/courses')}
          className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors duration-300"
        >
          <MdArrowBack />
          Retour à mes cours
        </button>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
          Cours non trouvé
        </div>
        <button
          onClick={() => navigate('/instructor/courses')}
          className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors duration-300"
        >
          <MdArrowBack />
          Retour à mes cours
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* En-tête */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">{course.title || course.titre || 'Cours sans titre'}</h1>
          <p className="text-gray-600">Gestion des modules et évaluations</p>
        </div>
        <div className="flex gap-4">
          <button
            onClick={() => navigate('/instructor/courses')}
            className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors duration-300"
          >
            <MdArrowBack />
            Retour à mes cours
          </button>
          <Link
            to={`/admin/course/edit/${course.id}`}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-300"
          >
            <MdEdit />
            Modifier le cours
          </Link>
        </div>
      </div>

      {/* Message de succès */}
      {success && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4"
        >
          {success}
        </motion.div>
      )}

      {/* Informations du cours */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-3 mb-4">
            <MdSchool className="text-3xl text-secondary" />
            <h2 className="text-xl font-semibold">Informations du cours</h2>
          </div>
          <div className="space-y-3">
            <p><strong>Titre:</strong> {course.title || course.titre || 'Non spécifié'}</p>
            <p><strong>Description:</strong> {course.description || 'Aucune description'}</p>
            <p><strong>Niveau:</strong> {course.level || 'Non spécifié'}</p>
            <p><strong>Spécialité:</strong> {course.specialiteName || 'Non spécifiée'}</p>
            <p><strong>Discipline:</strong> {course.disciplineName || 'Non spécifiée'}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-3 mb-4">
            <MdPeople className="text-3xl text-blue-600" />
            <h2 className="text-xl font-semibold">Inscriptions</h2>
          </div>
          <div className="space-y-3">
            <p><strong>Nombre d'étudiants:</strong> {enrollments.length}</p>
            <p><strong>Dernière inscription:</strong> {
              enrollments.length > 0 
                ? new Date(Math.max(...enrollments.map(e => new Date(e.enrolledAt || e.date || 0)))).toLocaleDateString() 
                : 'Aucune inscription'
            }</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-3 mb-4">
            <MdCalendarToday className="text-3xl text-green-600" />
            <h2 className="text-xl font-semibold">Dates</h2>
          </div>
          <div className="space-y-3">
            <p><strong>Créé le:</strong> {course.createdAt ? new Date(course.createdAt).toLocaleDateString() : 'Non spécifié'}</p>
            <p><strong>Dernière mise à jour:</strong> {course.updatedAt ? new Date(course.updatedAt).toLocaleDateString() : 'Non spécifié'}</p>
            <p><strong>Durée estimée:</strong> {course.duration || 'Non spécifiée'}</p>
          </div>
        </div>
      </div>

      {/* Gestionnaire de modules */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center gap-3 mb-4">
          <MdAccessTime className="text-3xl text-purple-600" />
          <h2 className="text-xl font-semibold">Modules et évaluations</h2>
        </div>
        
        <ModuleManager 
          course={course} 
          onModulesUpdated={handleModulesUpdated} 
        />
      </div>
    </div>
  );
};

export default InstructorCourseManagement;
