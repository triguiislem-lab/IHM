import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getAuth } from 'firebase/auth';
import { getDatabase, ref, get } from 'firebase/database';
import { ArrowLeft } from 'lucide-react';
import ModuleContent from '../components/CourseModules/ModuleContent';

const ModulePage = () => {
  const { id: courseId, moduleId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [module, setModule] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEnrolled, setIsEnrolled] = useState(false);

  const auth = getAuth();
  const database = getDatabase();

  useEffect(() => {
    const fetchData = async () => {
      if (!courseId || !moduleId) {
        setError('Identifiants de cours ou de module manquants');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError('');

        // Récupérer les informations du cours
        const courseRef = ref(database, `Elearning/Cours/${courseId}`);
        const courseSnapshot = await get(courseRef);

        if (!courseSnapshot.exists()) {
          setError('Cours non trouvé');
          setLoading(false);
          return;
        }

        const courseData = courseSnapshot.val();
        setCourse(courseData);

        // Récupérer les informations du module
        let moduleData = null;

        // Vérifier si les modules sont stockés sous forme d'objet ou de tableau
        if (courseData.modules) {
          if (Array.isArray(courseData.modules)) {
            // Si c'est un tableau, chercher par index ou par id
            if (!isNaN(moduleId)) {
              moduleData = courseData.modules[parseInt(moduleId)];
            } else {
              moduleData = courseData.modules.find(m => m.id === moduleId);
            }
          } else {
            // Si c'est un objet, chercher par clé
            moduleData = courseData.modules[moduleId];
          }
        }

        if (!moduleData) {
          setError('Module non trouvé');
          setLoading(false);
          return;
        }

        // Ajouter l'ID du cours et du module aux données du module
        moduleData = {
          ...moduleData,
          id: moduleId,
          courseId: courseId
        };

        setModule(moduleData);

        // Vérifier si l'utilisateur est inscrit au cours
        if (auth.currentUser) {
          const enrollmentRef = ref(database, `Elearning/Enrollments/${courseId}/${auth.currentUser.uid}`);
          const enrollmentSnapshot = await get(enrollmentRef);
          setIsEnrolled(enrollmentSnapshot.exists());
        }

        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError(`Erreur lors de la récupération des données: ${error.message}`);
        setLoading(false);
      }
    };

    fetchData();
  }, [courseId, moduleId, database, auth.currentUser]);

  const handleModuleComplete = (score) => {
    console.log(`Module completed with score: ${score}`);
    // Vous pouvez ajouter ici une logique pour mettre à jour la progression
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
          <h2 className="text-xl font-semibold text-red-700 mb-2">Erreur</h2>
          <p className="text-red-600">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 px-4 py-2 bg-secondary text-white rounded-md hover:bg-secondary/90 transition-colors duration-300"
          >
            Retour
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link
          to={`/course/${courseId}`}
          className="inline-flex items-center text-secondary hover:text-secondary/80 transition-colors duration-300"
        >
          <ArrowLeft size={16} className="mr-1" />
          Retour au cours
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6">
          <h1 className="text-2xl font-bold mb-2">
            {module.title || module.titre || `Module ${moduleId}`}
          </h1>
          <p className="text-gray-600 mb-6">
            {module.description || 'Aucune description disponible pour ce module.'}
          </p>

          {!isEnrolled && (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
              <div className="flex">
                <div className="ml-3">
                  <p className="text-sm text-yellow-700">
                    Vous n'êtes pas inscrit à ce cours. Certaines fonctionnalités peuvent être limitées.
                  </p>
                  <Link
                    to={`/course/${courseId}`}
                    className="mt-2 inline-block text-sm font-medium text-yellow-700 hover:text-yellow-600"
                  >
                    S'inscrire au cours
                  </Link>
                </div>
              </div>
            </div>
          )}

          <ModuleContent
            module={module}
            onComplete={handleModuleComplete}
            isEnrolled={isEnrolled}
          />
        </div>
      </div>
    </div>
  );
};

export default ModulePage;
