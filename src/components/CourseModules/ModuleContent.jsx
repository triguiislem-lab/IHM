import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  MdPlayCircle,
  MdDescription,
  MdQuiz,
  MdAssignment,
  MdAssessment,
} from "react-icons/md";
import SimpleModuleResource from "../ModuleResource/SimpleModuleResource";
import ModuleEvaluation from "../Evaluation/ModuleEvaluation";

const ModuleContent = ({ module, onComplete }) => {
  const [activeResourceIndex, setActiveResourceIndex] = useState(0);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("resources"); // "resources" ou "evaluation"

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
  const handleEvaluationComplete = (score) => {
    console.log(`Evaluation completed with score: ${score}`);

    // Appeler le callback onComplete si fourni
    if (onComplete) {
      onComplete(score);
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

        {/* Onglets de navigation */}
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

        {/* Contenu des onglets */}
        {activeTab === "resources" ? (
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
        ) : (
          <ModuleEvaluation
            moduleId={module.id}
            courseId={module.courseId}
            onComplete={handleEvaluationComplete}
          />
        )}

        {/* Bouton pour marquer le module comme terminé */}
        {activeTab === "resources" && onComplete && (
          <div className="mt-8 text-center">
            <button
              onClick={onComplete}
              className="bg-secondary text-white px-6 py-2 rounded-md hover:bg-secondary/90 transition-colors duration-300"
            >
              Marquer comme terminé
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ModuleContent;
