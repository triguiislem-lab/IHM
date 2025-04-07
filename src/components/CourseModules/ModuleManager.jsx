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
} from "react-icons/md";
import {
  addModuleToCourse,
  addEvaluationToModule,
  createTestModulesForCourse,
  checkUserEnrollment,
  syncEnrollmentStatus,
} from "../../utils/firebaseUtils";

const ModuleManager = ({ course, onModulesUpdated }) => {
  const [showAddModule, setShowAddModule] = useState(false);
  const [showAddEvaluation, setShowAddEvaluation] = useState(false);
  const [selectedModule, setSelectedModule] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // États pour le formulaire d'ajout de module
  const [moduleData, setModuleData] = useState({
    title: "",
    description: "",
    order: 1,
  });

  // États pour le formulaire d'ajout d'évaluation
  const [evaluationData, setEvaluationData] = useState({
    title: "",
    type: "quiz",
    description: "",
    maxScore: 100,
    score: 0,
  });

  const handleAddModule = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const moduleId = await addModuleToCourse(course.id, moduleData);
      if (moduleId) {
        setSuccess(`Module ajouté avec succès (ID: ${moduleId})`);
        setModuleData({
          title: "",
          description: "",
          order: moduleData.order + 1,
        });
        setShowAddModule(false);
        if (onModulesUpdated) onModulesUpdated();
      } else {
        setError("Erreur lors de l'ajout du module");
      }
    } catch (error) {
      console.error("Error adding module:", error);
      setError(`Erreur: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleAddEvaluation = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const evalId = await addEvaluationToModule(
        course.id,
        selectedModule.id,
        evaluationData
      );
      if (evalId) {
        setSuccess(`Évaluation ajoutée avec succès (ID: ${evalId})`);
        setEvaluationData({
          title: "",
          type: "quiz",
          description: "",
          maxScore: 100,
          score: 0,
        });
        setShowAddEvaluation(false);
        setSelectedModule(null);
        if (onModulesUpdated) onModulesUpdated();
      } else {
        setError("Erreur lors de l'ajout de l'évaluation");
      }
    } catch (error) {
      console.error("Error adding evaluation:", error);
      setError(`Erreur: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTestModules = async () => {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const result = await createTestModulesForCourse(course.id);
      if (result) {
        setSuccess("Modules de test créés avec succès");
        if (onModulesUpdated) onModulesUpdated();
      } else {
        setError("Erreur lors de la création des modules de test");
      }
    } catch (error) {
      console.error("Error creating test modules:", error);
      setError(`Erreur: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-xl font-bold mb-4">Gestion des modules</h2>

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

        <button
          onClick={handleCreateTestModules}
          className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center gap-2 hover:bg-blue-700 transition-colors duration-300"
          disabled={loading}
        >
          {loading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          ) : (
            <MdAdd />
          )}
          Créer des modules de test
        </button>
      </div>

      {/* Liste des modules existants */}
      {course.modules && course.modules.length > 0 ? (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Modules existants</h3>
          {course.modules.map((module) => (
            <div
              key={module.id}
              className="border rounded-lg p-4 hover:bg-gray-50 transition-colors duration-300"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium">
                    {module.title || module.titre || "Module sans titre"}
                  </h4>
                  <p className="text-sm text-gray-600 mt-1">
                    {module.description || "Aucune description"}
                  </p>
                </div>
                <div className="flex gap-2">
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
                </div>
              </div>

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
                            <span className="text-sm font-medium">
                              Score: {evaluation.score || 0}/
                              {evaluation.maxScore || 100}
                            </span>
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
            Utilisez les boutons ci-dessus pour ajouter des modules.
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg p-6 w-full max-w-md"
          >
            <h3 className="text-xl font-bold mb-4">
              Ajouter une évaluation au module "
              {selectedModule.title || selectedModule.titre}"
            </h3>
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
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddEvaluation(false);
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

export default ModuleManager;
