import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  MdPlayCircle,
  MdDescription,
  MdQuiz,
  MdAssignment,
  MdAssessment,
  MdCheckCircle,
} from "react-icons/md";
import SimpleModuleResource from "../ModuleResource/SimpleModuleResource";
import ModuleEvaluation from "../Evaluation/ModuleEvaluation";
import { getAuth } from "firebase/auth";
import { getDatabase, ref, get, set } from "firebase/database";

const ModuleContent = ({ module, onComplete, isEnrolled = true }) => {
  const [activeResourceIndex, setActiveResourceIndex] = useState(0);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("resources"); // "resources" ou "evaluation"
  const [moduleProgress, setModuleProgress] = useState(null);
  const [progressUpdating, setProgressUpdating] = useState(false);

  const auth = getAuth();
  const database = getDatabase();

  // Charger les ressources du module
  useEffect(() => {
    if (module) {
      // Convertir les ressources du module en tableau
      const resourcesArray = module.resources
        ? Array.isArray(module.resources)
          ? module.resources
          : Object.values(module.resources)
        : [];

      // Si aucune ressource n'est définie, créer des ressources par défaut
      if (resourcesArray.length === 0) {
        // Créer des ressources par défaut basées sur le titre du module
        const defaultResources = [
          {
            id: `video_${module.id}`,
            title: `Vidéo: ${module.title || module.titre || "Introduction"}`,
            type: "video",
            url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", // Exemple de vidéo YouTube
            description: "Vidéo d'introduction au module",
          },
          {
            id: `pdf_${module.id}`,
            title: `Document: ${
              module.title || module.titre || "Support de cours"
            }`,
            type: "pdf",
            url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf", // Exemple de PDF
            description: "Support de cours au format PDF",
          },
        ];
        setResources(defaultResources);
      } else {
        setResources(resourcesArray);
      }

      setLoading(false);
    }
  }, [module]);

  // Charger la progression du module
  useEffect(() => {
    const fetchModuleProgress = async () => {
      if (!auth.currentUser || !module || !module.courseId || !isEnrolled)
        return;

      try {
        const progressRef = ref(
          database,
          `Elearning/Progression/${auth.currentUser.uid}/${module.courseId}/${module.id}`
        );
        const snapshot = await get(progressRef);

        if (snapshot.exists()) {
          setModuleProgress(snapshot.val());
          console.log(`Module progress loaded:`, snapshot.val());
        } else {
          // Initialiser la progression si elle n'existe pas
          const initialProgress = {
            moduleId: module.id,
            courseId: module.courseId,
            userId: auth.currentUser.uid,
            startDate: new Date().toISOString(),
            progress: 0,
            completed: false,
            lastUpdated: new Date().toISOString(),
          };

          await set(progressRef, initialProgress);
          setModuleProgress(initialProgress);
          console.log(`Module progress initialized:`, initialProgress);
        }
      } catch (error) {
        console.error(`Error fetching module progress:`, error);
      }
    };

    fetchModuleProgress();
  }, [auth.currentUser, module, database, isEnrolled]);

  // Fonction pour obtenir l'icône en fonction du type de ressource
  const getResourceIcon = (resource) => {
    if (!resource || !resource.type) return <MdDescription />;

    switch (resource.type.toLowerCase()) {
      case "video":
        return <MdPlayCircle className="text-red-600" />;
      case "pdf":
        return <MdDescription className="text-blue-600" />;
      case "quiz":
        return <MdQuiz className="text-green-600" />;
      case "assignment":
        return <MdAssignment className="text-orange-600" />;
      default:
        return <MdDescription className="text-gray-600" />;
    }
  };

  // Fonction pour gérer la complétion d'une évaluation
  const handleEvaluationComplete = async (score) => {
    console.log(`Evaluation completed with score: ${score}`);

    // Mettre à jour la progression du module
    await updateModuleProgress(score);

    // Appeler le callback onComplete si fourni
    if (onComplete) {
      onComplete(score);
    }
  };

  // Fonction pour mettre à jour la progression du module
  const updateModuleProgress = async (score = null) => {
    if (!auth.currentUser || !module || !module.courseId || !isEnrolled) return;

    try {
      setProgressUpdating(true);

      // Calculer la nouvelle progression
      const newProgress = moduleProgress
        ? {
            ...moduleProgress,
            progress: 100, // Marquer comme terminé
            completed: true,
            lastUpdated: new Date().toISOString(),
          }
        : {
            moduleId: module.id,
            courseId: module.courseId,
            userId: auth.currentUser.uid,
            progress: 100,
            completed: true,
            startDate: new Date().toISOString(),
            lastUpdated: new Date().toISOString(),
          };

      // Ajouter le score si fourni
      if (score !== null) {
        newProgress.score = score;
      }

      // Enregistrer la progression dans Firebase
      const progressRef = ref(
        database,
        `Elearning/Progression/${auth.currentUser.uid}/${module.courseId}/${module.id}`
      );
      await set(progressRef, newProgress);

      // Mettre à jour l'état local
      setModuleProgress(newProgress);
      console.log(`Module progress updated:`, newProgress);

      return newProgress;
    } catch (error) {
      console.error(`Error updating module progress:`, error);
      return null;
    } finally {
      setProgressUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary"></div>
      </div>
    );
  }

  if (!module) {
    return (
      <div className="bg-white p-8 rounded-lg shadow-md text-center">
        <p className="text-gray-600">Aucun module sélectionné</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-2">
          {module.title || module.titre || "Module sans titre"}
        </h2>
        <p className="text-gray-600 mb-6">
          {module.description || "Aucune description disponible."}
        </p>

        {/* Message d'accès restreint si l'utilisateur n'est pas inscrit */}
        {!isEnrolled && (
          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 mb-6">
            <p className="text-gray-700 mb-2 flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-yellow-500 mr-2"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              Vous devez être inscrit à ce cours pour accéder aux ressources et
              aux évaluations.
            </p>
          </div>
        )}

        {/* Onglets de navigation - visible uniquement si l'utilisateur est inscrit */}
        {isEnrolled && (
          <div className="flex border-b mb-6">
            <button
              className={`px-4 py-2 font-medium ${
                activeTab === "resources"
                  ? "text-secondary border-b-2 border-secondary"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveTab("resources")}
            >
              Ressources
            </button>
            <button
              className={`px-4 py-2 font-medium ${
                activeTab === "evaluation"
                  ? "text-secondary border-b-2 border-secondary"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveTab("evaluation")}
            >
              Évaluation
            </button>
          </div>
        )}

        {/* Contenu des onglets */}
        {isEnrolled && activeTab === "resources" ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Liste des ressources */}
            <div className="md:col-span-1">
              <h3 className="text-lg font-semibold mb-4">Ressources</h3>
              <div className="space-y-2">
                {resources.length > 0 ? (
                  resources.map((resource, index) => (
                    <motion.div
                      key={resource.id || index}
                      whileHover={{ scale: 1.02 }}
                      className={`p-3 rounded-lg cursor-pointer flex items-center gap-3 ${
                        activeResourceIndex === index
                          ? "bg-secondary text-white"
                          : "bg-gray-100 hover:bg-gray-200"
                      }`}
                      onClick={() => setActiveResourceIndex(index)}
                    >
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          activeResourceIndex === index
                            ? "bg-white text-secondary"
                            : "bg-white text-gray-600"
                        }`}
                      >
                        {getResourceIcon(resource)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">
                          {resource.title || `Ressource ${index + 1}`}
                        </p>
                        <p className="text-xs truncate">
                          {resource.type || "Document"}
                        </p>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-4">
                    Aucune ressource disponible
                  </p>
                )}
              </div>
            </div>

            {/* Contenu de la ressource active */}
            <div className="md:col-span-3">
              <SimpleModuleResource
                resource={resources[activeResourceIndex] || null}
              />
            </div>
          </div>
        ) : isEnrolled && activeTab === "evaluation" ? (
          <ModuleEvaluation
            moduleId={module.id}
            courseId={module.courseId}
            onComplete={handleEvaluationComplete}
          />
        ) : !isEnrolled ? (
          <div className="bg-gray-50 p-8 rounded-lg text-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-16 w-16 text-yellow-500 mx-auto mb-4"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                clipRule="evenodd"
              />
            </svg>
            <h3 className="text-xl font-semibold mb-2">Accès restreint</h3>
            <p className="text-gray-600 mb-4">
              Vous devez être inscrit à ce cours pour accéder aux ressources et
              aux évaluations.
            </p>
            <p className="text-sm text-gray-500">
              Inscrivez-vous pour débloquer l'accès complet à ce module et à
              tous les autres modules du cours.
            </p>
          </div>
        ) : null}

        {/* Bouton pour marquer le module comme terminé */}
        {isEnrolled && activeTab === "resources" && onComplete && (
          <div className="mt-8 text-center">
            {moduleProgress && moduleProgress.completed ? (
              <div className="flex flex-col items-center">
                <div className="flex items-center gap-2 text-green-600 mb-2">
                  <MdCheckCircle size={24} />
                  <span className="font-medium">Module terminé</span>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  {moduleProgress.score
                    ? `Score: ${moduleProgress.score}%`
                    : ""}
                  {moduleProgress.lastUpdated
                    ? ` - Dernière activité: ${new Date(
                        moduleProgress.lastUpdated
                      ).toLocaleDateString()}`
                    : ""}
                </p>
                <button
                  onClick={() => updateModuleProgress()}
                  className="text-secondary border border-secondary px-6 py-2 rounded-md hover:bg-secondary/10 transition-colors duration-300 flex items-center gap-2"
                  disabled={progressUpdating}
                >
                  {progressUpdating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-secondary border-t-transparent rounded-full animate-spin"></div>
                      <span>Mise à jour...</span>
                    </>
                  ) : (
                    <>
                      <MdCheckCircle />
                      <span>Marquer à nouveau</span>
                    </>
                  )}
                </button>
              </div>
            ) : (
              <button
                onClick={() => updateModuleProgress()}
                className="bg-secondary text-white px-6 py-2 rounded-md hover:bg-secondary/90 transition-colors duration-300 flex items-center gap-2"
                disabled={progressUpdating}
              >
                {progressUpdating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Mise à jour...</span>
                  </>
                ) : (
                  <>
                    <MdCheckCircle />
                    <span>Marquer comme terminé</span>
                  </>
                )}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ModuleContent;
