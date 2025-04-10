import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  MdAdd,
  MdSave,
  MdCancel,
  MdDelete,
  MdEdit,
  MdQuiz,
  MdAssignment,
  MdDragIndicator,
  MdPlayCircle,
  MdPictureAsPdf,
  MdLink,
  MdAttachFile,
} from "react-icons/md";

const ModuleManagerCreation = ({ modules, setModules }) => {
  const [showAddModule, setShowAddModule] = useState(false);
  const [showAddEvaluation, setShowAddEvaluation] = useState(false);
  const [showAddResource, setShowAddResource] = useState(false);
  const [selectedModule, setSelectedModule] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // États pour le formulaire d'ajout de module
  const [moduleData, setModuleData] = useState({
    title: "",
    description: "",
    order: modules.length + 1,
  });

  // États pour le formulaire d'ajout d'évaluation
  const [evaluationData, setEvaluationData] = useState({
    title: "",
    type: "quiz",
    description: "",
    maxScore: 100,
    score: 0,
    questions: [],
  });

  // États pour la gestion des questions
  const [currentQuestion, setCurrentQuestion] = useState({
    question: "",
    options: ["", "", "", ""],
    correctAnswer: 0,
    explanation: "",
  });

  const [showAddQuestion, setShowAddQuestion] = useState(false);
  const [editingQuestionIndex, setEditingQuestionIndex] = useState(-1);

  // États pour le formulaire d'ajout de ressource
  const [resourceData, setResourceData] = useState({
    title: "",
    type: "video",
    url: "",
    description: "",
  });

  const handleAddModule = (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      // Générer un ID temporaire pour le module
      const tempModuleId = `temp_module_${Date.now()}`;

      // Créer le nouveau module
      const newModule = {
        ...moduleData,
        id: tempModuleId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: "active",
        evaluations: {},
        resources: [],
      };

      // Ajouter le module à la liste
      setModules([...modules, newModule]);

      // Réinitialiser le formulaire
      setModuleData({
        title: "",
        description: "",
        order: modules.length + 2,
      });

      setShowAddModule(false);
      setSuccess("Module ajouté avec succès");

      // Effacer le message de succès après 3 secondes
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      console.error("Error adding module:", error);
      setError(`Erreur: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleAddQuestion = (e) => {
    e.preventDefault();
    console.log("handleAddQuestion called"); // Debug log

    // Vérifier que la question est valide
    if (!currentQuestion.question.trim()) {
      setError("Veuillez saisir une question");
      return;
    }

    // Vérifier que toutes les options sont remplies
    if (currentQuestion.options.some((option) => !option.trim())) {
      setError("Veuillez remplir toutes les options de réponse");
      return;
    }

    try {
      // Ajouter ou mettre à jour la question
      const updatedQuestions = [...evaluationData.questions];

      if (editingQuestionIndex >= 0) {
        // Mise à jour d'une question existante
        updatedQuestions[editingQuestionIndex] = {
          ...currentQuestion,
          id:
            updatedQuestions[editingQuestionIndex].id ||
            `q_${Date.now()}_${Math.random().toString(36).substring(2)}`,
        };
      } else {
        // Ajout d'une nouvelle question
        updatedQuestions.push({
          ...currentQuestion,
          id: `q_${Date.now()}_${Math.random().toString(36).substring(2)}`,
        });
      }

      // Mettre à jour l'évaluation avec la nouvelle question
      setEvaluationData({
        ...evaluationData,
        questions: updatedQuestions,
      });

      // Réinitialiser le formulaire de question
      setCurrentQuestion({
        question: "",
        options: ["", "", "", ""],
        correctAnswer: 0,
        explanation: "",
      });

      setEditingQuestionIndex(-1);

      // Fermer explicitement le popup
      console.log("Closing popup"); // Debug log
      setShowAddQuestion(false);

      setSuccess("Question ajoutée avec succès");

      // Effacer le message de succès après 3 secondes
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      console.error("Error adding question:", error);
      setError(`Erreur: ${error.message}`);
    }
  };

  const handleEditQuestion = (index) => {
    setCurrentQuestion(evaluationData.questions[index]);
    setEditingQuestionIndex(index);
    setShowAddQuestion(true);
  };

  const handleDeleteQuestion = (index) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cette question ?")) {
      const updatedQuestions = [...evaluationData.questions];
      updatedQuestions.splice(index, 1);

      setEvaluationData({
        ...evaluationData,
        questions: updatedQuestions,
      });

      setSuccess("Question supprimée avec succès");
      setTimeout(() => setSuccess(""), 3000);
    }
  };

  const handleOptionChange = (index, value) => {
    const updatedOptions = [...currentQuestion.options];
    updatedOptions[index] = value;

    setCurrentQuestion({
      ...currentQuestion,
      options: updatedOptions,
    });
  };

  const handleAddEvaluation = (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      if (!selectedModule) {
        throw new Error("Aucun module sélectionné");
      }

      // Vérifier que l'évaluation a au moins une question si c'est un quiz
      if (
        evaluationData.type === "quiz" &&
        evaluationData.questions.length === 0
      ) {
        throw new Error("Veuillez ajouter au moins une question à ce quiz");
      }

      // Générer un ID temporaire pour l'évaluation
      const tempEvalId = `temp_eval_${Date.now()}`;

      // Créer la nouvelle évaluation
      const newEvaluation = {
        ...evaluationData,
        id: tempEvalId,
        moduleId: selectedModule.id,
        date: new Date().toISOString(),
      };

      // Mettre à jour le module sélectionné avec la nouvelle évaluation
      const updatedModules = modules.map((module) => {
        if (module.id === selectedModule.id) {
          return {
            ...module,
            evaluations: {
              ...module.evaluations,
              [tempEvalId]: newEvaluation,
            },
          };
        }
        return module;
      });

      setModules(updatedModules);

      // Réinitialiser le formulaire
      setEvaluationData({
        title: "",
        type: "quiz",
        description: "",
        maxScore: 100,
        score: 0,
        questions: [],
      });

      setShowAddEvaluation(false);
      setSelectedModule(null);
      setSuccess("Évaluation ajoutée avec succès");

      // Effacer le message de succès après 3 secondes
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      console.error("Error adding evaluation:", error);
      setError(`Erreur: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleAddResource = (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      if (!selectedModule) {
        throw new Error("Aucun module sélectionné");
      }

      // Valider l'URL
      if (!resourceData.url) {
        throw new Error("L'URL de la ressource est obligatoire");
      }

      // Générer un ID temporaire pour la ressource
      const tempResourceId = `temp_resource_${Date.now()}`;

      // Créer la nouvelle ressource
      const newResource = {
        ...resourceData,
        id: tempResourceId,
        moduleId: selectedModule.id,
        createdAt: new Date().toISOString(),
      };

      // Mettre à jour le module sélectionné avec la nouvelle ressource
      const updatedModules = modules.map((module) => {
        if (module.id === selectedModule.id) {
          return {
            ...module,
            resources: [...(module.resources || []), newResource],
          };
        }
        return module;
      });

      setModules(updatedModules);

      // Réinitialiser le formulaire
      setResourceData({
        title: "",
        type: "video",
        url: "",
        description: "",
      });

      setShowAddResource(false);
      setSelectedModule(null);
      setSuccess("Ressource ajoutée avec succès");

      // Effacer le message de succès après 3 secondes
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      console.error("Error adding resource:", error);
      setError(`Erreur: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteModule = (moduleId) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce module ?")) {
      const updatedModules = modules.filter((module) => module.id !== moduleId);

      // Réorganiser les ordres des modules restants
      const reorderedModules = updatedModules.map((module, index) => ({
        ...module,
        order: index + 1,
      }));

      setModules(reorderedModules);
      setSuccess("Module supprimé avec succès");

      // Effacer le message de succès après 3 secondes
      setTimeout(() => setSuccess(""), 3000);
    }
  };

  const handleDeleteEvaluation = (moduleId, evalId) => {
    if (
      window.confirm("Êtes-vous sûr de vouloir supprimer cette évaluation ?")
    ) {
      const updatedModules = modules.map((module) => {
        if (module.id === moduleId) {
          const { [evalId]: deletedEval, ...remainingEvals } =
            module.evaluations;
          return {
            ...module,
            evaluations: remainingEvals,
          };
        }
        return module;
      });

      setModules(updatedModules);
      setSuccess("Évaluation supprimée avec succès");

      // Effacer le message de succès après 3 secondes
      setTimeout(() => setSuccess(""), 3000);
    }
  };

  const handleDeleteResource = (moduleId, resourceId) => {
    if (
      window.confirm("Êtes-vous sûr de vouloir supprimer cette ressource ?")
    ) {
      const updatedModules = modules.map((module) => {
        if (module.id === moduleId) {
          return {
            ...module,
            resources: (module.resources || []).filter(
              (resource) => resource.id !== resourceId
            ),
          };
        }
        return module;
      });

      setModules(updatedModules);
      setSuccess("Ressource supprimée avec succès");

      // Effacer le message de succès après 3 secondes
      setTimeout(() => setSuccess(""), 3000);
    }
  };

  const handleMoveModule = (moduleId, direction) => {
    const moduleIndex = modules.findIndex((module) => module.id === moduleId);
    if (moduleIndex === -1) return;

    const newModules = [...modules];

    if (direction === "up" && moduleIndex > 0) {
      // Échanger avec le module précédent
      [newModules[moduleIndex], newModules[moduleIndex - 1]] = [
        newModules[moduleIndex - 1],
        newModules[moduleIndex],
      ];
    } else if (direction === "down" && moduleIndex < modules.length - 1) {
      // Échanger avec le module suivant
      [newModules[moduleIndex], newModules[moduleIndex + 1]] = [
        newModules[moduleIndex + 1],
        newModules[moduleIndex],
      ];
    }

    // Mettre à jour les ordres
    const reorderedModules = newModules.map((module, index) => ({
      ...module,
      order: index + 1,
    }));

    setModules(reorderedModules);
  };

  return (
    <div className="bg-white rounded-lg p-6 mb-6">
      <h2 className="text-xl font-bold mb-4">Modules et évaluations</h2>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}

      <div className="flex flex-wrap gap-3 mb-6">
        <button
          onClick={() => setShowAddModule(true)}
          className="bg-secondary text-white px-4 py-2 rounded-md flex items-center gap-2 hover:bg-secondary/90 transition-colors duration-300"
          disabled={loading}
        >
          <MdAdd />
          Ajouter un module
        </button>
      </div>

      {/* Liste des modules existants */}
      {modules.length > 0 ? (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Modules du cours</h3>
          {modules.map((module) => (
            <div
              key={module.id}
              className="border rounded-lg p-4 hover:bg-gray-50 transition-colors duration-300"
            >
              <div className="flex justify-between items-start">
                <div className="flex items-start gap-2">
                  <div className="flex flex-col items-center mt-1">
                    <button
                      onClick={() => handleMoveModule(module.id, "up")}
                      className="text-gray-500 hover:text-gray-700 disabled:opacity-30"
                      disabled={module.order === 1}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 15l7-7 7 7"
                        />
                      </svg>
                    </button>
                    <span className="text-xs font-medium my-1">
                      {module.order}
                    </span>
                    <button
                      onClick={() => handleMoveModule(module.id, "down")}
                      className="text-gray-500 hover:text-gray-700 disabled:opacity-30"
                      disabled={module.order === modules.length}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </button>
                  </div>
                  <div>
                    <h4 className="font-medium">
                      {module.title || "Module sans titre"}
                    </h4>
                    <p className="text-sm text-gray-600 mt-1">
                      {module.description || "Aucune description"}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setSelectedModule(module);
                      setShowAddResource(true);
                    }}
                    className="bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 transition-colors duration-300"
                    title="Ajouter une ressource"
                  >
                    <MdAttachFile size={18} />
                  </button>
                  <button
                    onClick={() => {
                      setSelectedModule(module);
                      setShowAddEvaluation(true);
                    }}
                    className="bg-green-600 text-white p-2 rounded-md hover:bg-green-700 transition-colors duration-300"
                    title="Ajouter une évaluation"
                  >
                    <MdQuiz size={18} />
                  </button>
                  <button
                    onClick={() => handleDeleteModule(module.id)}
                    className="bg-red-600 text-white p-2 rounded-md hover:bg-red-700 transition-colors duration-300"
                    title="Supprimer le module"
                  >
                    <MdDelete size={18} />
                  </button>
                </div>
              </div>

              {/* Liste des ressources du module */}
              {module.resources && module.resources.length > 0 && (
                <div className="mt-3 pl-4 border-l-2 border-blue-200">
                  <h5 className="text-sm font-medium mb-2">Ressources</h5>
                  <div className="space-y-2">
                    {module.resources.map((resource) => (
                      <div
                        key={resource.id}
                        className="flex justify-between items-center p-2 bg-blue-50 rounded-md"
                      >
                        <div className="flex items-center gap-2">
                          {resource.type === "video" ? (
                            <MdPlayCircle className="text-red-600" />
                          ) : resource.type === "pdf" ? (
                            <MdPictureAsPdf className="text-blue-600" />
                          ) : (
                            <MdLink className="text-green-600" />
                          )}
                          <span>{resource.title}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <a
                            href={resource.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 text-sm"
                          >
                            Voir
                          </a>
                          <button
                            onClick={() =>
                              handleDeleteResource(module.id, resource.id)
                            }
                            className="text-red-600 hover:text-red-800"
                            title="Supprimer la ressource"
                          >
                            <MdDelete size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Liste des évaluations du module */}
              {module.evaluations &&
                Object.keys(module.evaluations).length > 0 && (
                  <div className="mt-3 pl-4 border-l-2 border-gray-200">
                    <h5 className="text-sm font-medium mb-2">Évaluations</h5>
                    <div className="space-y-2">
                      {Object.entries(module.evaluations).map(
                        ([evalId, evaluation]) => (
                          <div
                            key={evalId}
                            className="flex justify-between items-center p-2 bg-gray-50 rounded-md"
                          >
                            <div className="flex items-center gap-2">
                              {evaluation.type === "quiz" ? (
                                <MdQuiz className="text-blue-600" />
                              ) : (
                                <MdAssignment className="text-orange-600" />
                              )}
                              <span>{evaluation.title}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium">
                                Score: {evaluation.score || 0}/
                                {evaluation.maxScore || 100}
                              </span>
                              <button
                                onClick={() =>
                                  handleDeleteEvaluation(module.id, evalId)
                                }
                                className="text-red-600 hover:text-red-800"
                                title="Supprimer l'évaluation"
                              >
                                <MdDelete size={16} />
                              </button>
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <p className="text-gray-600 mb-4">
            Aucun module n'a été ajouté à ce cours.
          </p>
          <p className="text-sm text-gray-500">
            Utilisez le bouton ci-dessus pour ajouter des modules.
          </p>
        </div>
      )}

      {/* Modal pour ajouter un module */}
      {showAddModule && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg p-6 w-full max-w-md"
          >
            <h3 className="text-xl font-bold mb-4">Ajouter un module</h3>
            <form onSubmit={handleAddModule}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Titre
                </label>
                <input
                  type="text"
                  value={moduleData.title}
                  onChange={(e) =>
                    setModuleData({ ...moduleData, title: e.target.value })
                  }
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  placeholder="Titre du module"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Description
                </label>
                <textarea
                  value={moduleData.description}
                  onChange={(e) =>
                    setModuleData({
                      ...moduleData,
                      description: e.target.value,
                    })
                  }
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  placeholder="Description du module"
                  rows="3"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Ordre
                </label>
                <input
                  type="number"
                  value={moduleData.order}
                  onChange={(e) =>
                    setModuleData({
                      ...moduleData,
                      order: parseInt(e.target.value),
                    })
                  }
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  min="1"
                  required
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAddModule(false)}
                  className="bg-gray-300 text-gray-800 px-4 py-2 rounded-md flex items-center gap-2 hover:bg-gray-400 transition-colors duration-300"
                >
                  <MdCancel />
                  Annuler
                </button>
                <button
                  type="submit"
                  className="bg-secondary text-white px-4 py-2 rounded-md flex items-center gap-2 hover:bg-secondary/90 transition-colors duration-300"
                  disabled={loading}
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <MdSave />
                  )}
                  Enregistrer
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Modal pour ajouter une évaluation */}
      {showAddEvaluation && selectedModule && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto py-10"
          onClick={(e) => {
            // Fermer le popup uniquement si l'utilisateur clique sur l'arrière-plan (pas sur le contenu)
            if (e.target === e.currentTarget) {
              setShowAddEvaluation(false);
              setSelectedModule(null);
            }
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto relative my-auto"
            onClick={(e) => e.stopPropagation()} // Empêcher la propagation du clic vers l'arrière-plan
          >
            <div className="flex justify-between items-center mb-4 sticky top-0 bg-white pb-2 border-b">
              <h3 className="text-xl font-bold">
                Ajouter une évaluation au module "
                {selectedModule.title || "Module"}"
              </h3>
              <button
                type="button"
                onClick={() => {
                  setShowAddEvaluation(false);
                  setSelectedModule(null);
                }}
                className="text-gray-500 hover:text-gray-700 text-xl font-bold"
                aria-label="Fermer"
              >
                &times;
              </button>
            </div>
            <form onSubmit={handleAddEvaluation}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Titre
                </label>
                <input
                  type="text"
                  value={evaluationData.title}
                  onChange={(e) =>
                    setEvaluationData({
                      ...evaluationData,
                      title: e.target.value,
                    })
                  }
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  placeholder="Titre de l'évaluation"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Type
                </label>
                <select
                  value={evaluationData.type}
                  onChange={(e) =>
                    setEvaluationData({
                      ...evaluationData,
                      type: e.target.value,
                    })
                  }
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required
                >
                  <option value="quiz">Quiz</option>
                  <option value="assignment">Devoir</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Description
                </label>
                <textarea
                  value={evaluationData.description}
                  onChange={(e) =>
                    setEvaluationData({
                      ...evaluationData,
                      description: e.target.value,
                    })
                  }
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  placeholder="Description de l'évaluation"
                  rows="3"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Score maximum
                </label>
                <input
                  type="number"
                  value={evaluationData.maxScore}
                  onChange={(e) =>
                    setEvaluationData({
                      ...evaluationData,
                      maxScore: parseInt(e.target.value),
                    })
                  }
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  min="1"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Score obtenu
                </label>
                <input
                  type="number"
                  value={evaluationData.score}
                  onChange={(e) =>
                    setEvaluationData({
                      ...evaluationData,
                      score: parseInt(e.target.value),
                    })
                  }
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  min="0"
                  max={evaluationData.maxScore}
                  required
                />
              </div>
              {evaluationData.type === "quiz" && (
                <div className="mb-6 border-t border-gray-200 pt-4 mt-4">
                  <h4 className="text-lg font-semibold mb-3">
                    Questions du quiz
                  </h4>

                  {evaluationData.questions.length > 0 ? (
                    <div className="space-y-3 mb-4">
                      {evaluationData.questions.map((question, index) => (
                        <div
                          key={question.id || index}
                          className="border border-gray-200 rounded-lg p-3"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium">{question.question}</p>
                              <ul className="mt-2 space-y-1 pl-4">
                                {question.options.map((option, optIndex) => (
                                  <li
                                    key={optIndex}
                                    className={
                                      optIndex === question.correctAnswer
                                        ? "text-green-600 font-medium"
                                        : ""
                                    }
                                  >
                                    {option}{" "}
                                    {optIndex === question.correctAnswer &&
                                      "(Réponse correcte)"}
                                  </li>
                                ))}
                              </ul>
                            </div>
                            <div className="flex space-x-2">
                              <button
                                type="button"
                                onClick={() => handleEditQuestion(index)}
                                className="text-blue-600 hover:text-blue-800"
                                title="Modifier la question"
                              >
                                <MdEdit size={18} />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteQuestion(index)}
                                className="text-red-600 hover:text-red-800"
                                title="Supprimer la question"
                              >
                                <MdDelete size={18} />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 mb-4">
                      Aucune question ajoutée. Utilisez le bouton ci-dessous
                      pour ajouter des questions.
                    </p>
                  )}

                  <button
                    type="button"
                    onClick={() => setShowAddQuestion(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center gap-2 hover:bg-blue-700 transition-colors duration-300 mb-4"
                  >
                    <MdAdd />
                    Ajouter une question
                  </button>
                </div>
              )}

              <div className="mt-6 pt-4 border-t sticky bottom-0 bg-white">
                <div className="flex justify-between items-center">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddEvaluation(false);
                      setSelectedModule(null);
                    }}
                    className="text-gray-500 hover:text-gray-700 underline"
                  >
                    Fermer sans enregistrer
                  </button>

                  <div className="flex space-x-3">
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddEvaluation(false);
                        setSelectedModule(null);
                      }}
                      className="bg-gray-300 text-gray-800 px-6 py-3 rounded-md flex items-center gap-2 hover:bg-gray-400 transition-colors duration-300 font-medium"
                    >
                      <MdCancel size={20} />
                      Annuler
                    </button>
                    <button
                      type="submit"
                      className="bg-secondary text-white px-6 py-3 rounded-md flex items-center gap-2 hover:bg-secondary/90 transition-colors duration-300 font-medium"
                      disabled={loading}
                    >
                      {loading ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      ) : (
                        <MdSave size={20} />
                      )}
                      Enregistrer
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Modal pour ajouter une question */}
      {showAddQuestion && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={(e) => {
            // Fermer le popup uniquement si l'utilisateur clique sur l'arrière-plan (pas sur le contenu)
            if (e.target === e.currentTarget) {
              console.log("Background clicked"); // Debug log
              setShowAddQuestion(false);
              setEditingQuestionIndex(-1);
              setCurrentQuestion({
                question: "",
                options: ["", "", "", ""],
                correctAnswer: 0,
                explanation: "",
              });
            }
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg p-6 w-full max-w-md"
            onClick={(e) => e.stopPropagation()} // Empêcher la propagation du clic vers l'arrière-plan
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">
                {editingQuestionIndex >= 0 ? "Modifier" : "Ajouter"} une
                question
              </h3>
              <button
                type="button"
                onClick={() => {
                  setShowAddQuestion(false);
                  setEditingQuestionIndex(-1);
                  setCurrentQuestion({
                    question: "",
                    options: ["", "", "", ""],
                    correctAnswer: 0,
                    explanation: "",
                  });
                }}
                className="text-gray-500 hover:text-gray-700 text-xl font-bold"
                aria-label="Fermer"
              >
                &times;
              </button>
            </div>
            <form onSubmit={handleAddQuestion}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Question
                </label>
                <input
                  type="text"
                  value={currentQuestion.question}
                  onChange={(e) =>
                    setCurrentQuestion({
                      ...currentQuestion,
                      question: e.target.value,
                    })
                  }
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  placeholder="Saisissez votre question"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Options de réponse
                </label>
                {currentQuestion.options.map((option, index) => (
                  <div key={index} className="flex items-center mb-2">
                    <input
                      type="text"
                      value={option}
                      onChange={(e) =>
                        handleOptionChange(index, e.target.value)
                      }
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      placeholder={`Option ${index + 1}`}
                      required
                    />
                    <div className="ml-2">
                      <input
                        type="radio"
                        name="correctAnswer"
                        checked={currentQuestion.correctAnswer === index}
                        onChange={() =>
                          setCurrentQuestion({
                            ...currentQuestion,
                            correctAnswer: index,
                          })
                        }
                        className="mr-1"
                      />
                      <label className="text-sm">Correcte</label>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Explication (optionnelle)
                </label>
                <textarea
                  value={currentQuestion.explanation}
                  onChange={(e) =>
                    setCurrentQuestion({
                      ...currentQuestion,
                      explanation: e.target.value,
                    })
                  }
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  placeholder="Explication de la réponse correcte"
                  rows="3"
                />
              </div>

              <div className="flex justify-end space-x-3 mt-6 border-t pt-4">
                <button
                  type="button"
                  onClick={() => {
                    console.log("Cancel button clicked"); // Debug log
                    setShowAddQuestion(false);
                    setEditingQuestionIndex(-1);
                    setCurrentQuestion({
                      question: "",
                      options: ["", "", "", ""],
                      correctAnswer: 0,
                      explanation: "",
                    });
                  }}
                  className="bg-gray-300 text-gray-800 px-6 py-3 rounded-md flex items-center gap-2 hover:bg-gray-400 transition-colors duration-300 font-medium"
                >
                  <MdCancel size={20} />
                  Annuler
                </button>
                <button
                  type="submit"
                  className="bg-secondary text-white px-6 py-3 rounded-md flex items-center gap-2 hover:bg-secondary/90 transition-colors duration-300 font-medium"
                >
                  <MdSave size={20} />
                  {editingQuestionIndex >= 0 ? "Mettre à jour" : "Ajouter"}
                </button>
              </div>

              {/* Bouton de fermeture supplémentaire */}
              <div className="text-center mt-4">
                <button
                  type="button"
                  onClick={() => {
                    console.log("Extra close button clicked"); // Debug log
                    setShowAddQuestion(false);
                    setEditingQuestionIndex(-1);
                    setCurrentQuestion({
                      question: "",
                      options: ["", "", "", ""],
                      correctAnswer: 0,
                      explanation: "",
                    });
                  }}
                  className="text-gray-500 hover:text-gray-700 underline"
                >
                  Fermer sans enregistrer
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Modal pour ajouter une ressource */}
      {showAddResource && selectedModule && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg p-6 w-full max-w-md"
          >
            <h3 className="text-xl font-bold mb-4">
              Ajouter une ressource au module "
              {selectedModule.title || "Module"}"
            </h3>
            <form onSubmit={handleAddResource}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Titre
                </label>
                <input
                  type="text"
                  value={resourceData.title}
                  onChange={(e) =>
                    setResourceData({
                      ...resourceData,
                      title: e.target.value,
                    })
                  }
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  placeholder="Titre de la ressource"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Type
                </label>
                <select
                  value={resourceData.type}
                  onChange={(e) =>
                    setResourceData({
                      ...resourceData,
                      type: e.target.value,
                    })
                  }
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required
                >
                  <option value="video">Vidéo</option>
                  <option value="pdf">Document PDF</option>
                  <option value="link">Lien externe</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  URL
                </label>
                <input
                  type="url"
                  value={resourceData.url}
                  onChange={(e) =>
                    setResourceData({
                      ...resourceData,
                      url: e.target.value,
                    })
                  }
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  placeholder="URL de la ressource (YouTube, PDF, etc.)"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Description
                </label>
                <textarea
                  value={resourceData.description}
                  onChange={(e) =>
                    setResourceData({
                      ...resourceData,
                      description: e.target.value,
                    })
                  }
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  placeholder="Description de la ressource"
                  rows="3"
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddResource(false);
                    setSelectedModule(null);
                  }}
                  className="bg-gray-300 text-gray-800 px-4 py-2 rounded-md flex items-center gap-2 hover:bg-gray-400 transition-colors duration-300"
                >
                  <MdCancel />
                  Annuler
                </button>
                <button
                  type="submit"
                  className="bg-secondary text-white px-4 py-2 rounded-md flex items-center gap-2 hover:bg-secondary/90 transition-colors duration-300"
                  disabled={loading}
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <MdSave />
                  )}
                  Enregistrer
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default ModuleManagerCreation;
