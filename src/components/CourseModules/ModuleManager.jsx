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
} from "../../utils/firebaseUtils";

const ModuleManager = ({ course, onModulesUpdated, instructorId }) => {
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
    order: course?.modules?.length + 1 || 1, // Default order
  });

  // États pour le formulaire d'ajout d'évaluation
  const [evaluationData, setEvaluationData] = useState({
    title: "",
    type: "quiz",
    description: "",
    maxScore: 100,
    // score: 0, // Score likely calculated elsewhere or upon submission
  });

  // --- Permission Check Helper ---
  const canModifyCourse = () => {
    // Basic check: ensure instructorId prop is passed and matches course instructor
    // Note: Assumes parent component verified the user IS an instructor.
    // Add role === 'admin' check here if needed and role is passed down.
    if (!instructorId || !course || course.instructorId !== instructorId) {
      setError("Vous n'avez pas les permissions pour modifier ce cours.");
      return false;
    }
    setError(""); // Clear error if permission is okay
    return true;
  };

  const handleAddModule = async (e) => {
    e.preventDefault();
    if (!canModifyCourse()) return; // Permission check

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      // Ensure order is correctly calculated based on current modules
      const nextOrder = (course?.modules?.length || 0) + 1;
      const dataToSave = { ...moduleData, order: nextOrder };

      // Pass instructorId for potential use in utility (though not currently used there)
      const moduleId = await addModuleToCourse(
        course.id,
        dataToSave,
        instructorId
      );
      if (moduleId) {
        setSuccess(`Module ajouté avec succès`); // Simpler success message
        setModuleData({
          title: "",
          description: "",
          order: nextOrder + 1, // Increment default for next potential add
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
    if (!canModifyCourse() || !selectedModule) return; // Permission & module selection check

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      // Pass instructorId for potential use in utility
      const evalId = await addEvaluationToModule(
        course.id,
        selectedModule.id,
        evaluationData,
        instructorId
      );
      if (evalId) {
        setSuccess(`Évaluation ajoutée avec succès`);
        setEvaluationData({
          title: "",
          type: "quiz",
          description: "",
          maxScore: 100,
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
    if (!canModifyCourse()) return; // Permission check

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      // Pass instructorId for potential use in utility
      const result = await createTestModulesForCourse(course.id, instructorId);
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

  // Function to handle opening the add evaluation modal
  const openAddEvaluation = (module) => {
    if (!canModifyCourse()) return;
    setSelectedModule(module);
    setEvaluationData({
      // Reset form for new evaluation
      title: "",
      type: "quiz",
      description: "",
      maxScore: 100,
    });
    setError(""); // Clear errors
    setShowAddEvaluation(true);
  };

  // Calculate modules safely
  const modules = Array.isArray(course?.modules) ? course.modules : [];

  return (
    // Style adjusted for consistency
    <div className="space-y-6">
      {/* Error/Success Messages */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded shadow-sm">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded shadow-sm">
          {success}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => {
            if (!canModifyCourse()) return;
            setModuleData({
              // Reset form
              title: "",
              description: "",
              order: (modules.length || 0) + 1,
            });
            setError("");
            setShowAddModule(true);
          }}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md shadow-sm text-sm font-medium hover:bg-indigo-700 inline-flex items-center gap-2 disabled:opacity-50"
          disabled={loading}
        >
          <MdAdd />
          Ajouter Module
        </button>

        <button
          onClick={handleCreateTestModules}
          className="bg-blue-500 text-white px-4 py-2 rounded-md shadow-sm text-sm font-medium hover:bg-blue-600 inline-flex items-center gap-2 disabled:opacity-50"
          disabled={loading}
          title="Ajouter des modules pré-remplis pour tester"
        >
          {loading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          ) : (
            <MdAdd /> // Consider a different icon? Like MdBuild
          )}
          Créer Modules Test
        </button>
      </div>

      {/* Module List */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">
          Modules du Cours ({modules.length})
        </h3>
        {modules.length > 0 ? (
          modules.map((module, index) => (
            <motion.div
              key={module.id || index} // Use index as fallback key
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="border rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow duration-200"
            >
              <div className="flex justify-between items-start gap-4">
                {/* Module Info */}
                <div className="flex-grow">
                  <h4 className="font-semibold text-gray-800">
                    {`Module ${module.order || index + 1}: ${
                      module.title || module.titre || "Sans titre"
                    }`}
                  </h4>
                  <p className="text-sm text-gray-600 mt-1">
                    {module.description || "Pas de description"}
                  </p>
                </div>
                {/* Module Actions */}
                <div className="flex flex-col sm:flex-row gap-2 flex-shrink-0">
                  <button
                    onClick={() => openAddEvaluation(module)}
                    className="bg-green-100 text-green-700 p-2 rounded-md hover:bg-green-200 transition-colors duration-200 text-xs inline-flex items-center gap-1 disabled:opacity-50"
                    title="Ajouter une évaluation à ce module"
                    disabled={loading}
                  >
                    <MdQuiz size={16} /> Ajouter Éval.
                  </button>
                  {/* Add Edit/Delete buttons here if needed */}
                  {/* <button className="..." title="Modifier Module"><MdEdit size={16} /></button> */}
                  {/* <button className="..." title="Supprimer Module"><MdDelete size={16} /></button> */}
                </div>
              </div>

              {/* Evaluations List */}
              {module.evaluations &&
                Object.keys(module.evaluations).length > 0 && (
                  <div className="mt-4 pl-4 border-l-2 border-indigo-100 space-y-2">
                    <h5 className="text-sm font-medium text-gray-500 mb-2">
                      Évaluations
                    </h5>
                    {Object.entries(module.evaluations).map(
                      ([evalId, evaluation]) => (
                        <div
                          key={evalId}
                          className="flex justify-between items-center p-2 bg-gray-50 rounded-md text-sm"
                        >
                          <div className="flex items-center gap-2">
                            {evaluation.type === "quiz" ? (
                              <MdQuiz className="text-blue-600 flex-shrink-0" />
                            ) : (
                              <MdAssignment className="text-orange-600 flex-shrink-0" />
                            )}
                            <span className="truncate" title={evaluation.title}>
                              {evaluation.title || "Évaluation sans titre"}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 flex-shrink-0">
                            <span className="text-xs font-medium text-gray-700 whitespace-nowrap">
                              Score: {evaluation.score ?? "N/A"} /{" "}
                              {evaluation.maxScore || 100}
                            </span>
                            {/* Add Edit/Delete buttons here if needed */}
                            {/* <button className="..." title="Modifier Évaluation"><MdEdit size={14} /></button> */}
                            {/* <button className="..." title="Supprimer Évaluation"><MdDelete size={14} /></button> */}
                          </div>
                        </div>
                      )
                    )}
                  </div>
                )}
            </motion.div>
          ))
        ) : (
          <div className="text-center py-8 px-4 bg-gray-50 rounded-lg border border-dashed">
            <p className="text-gray-500">Aucun module ajouté pour ce cours.</p>
          </div>
        )}
      </div>

      {/* --- Modals --- */}

      {/* Add Module Modal */}
      <AnimatePresence>
        {showAddModule && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-lg shadow-xl w-full max-w-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <form onSubmit={handleAddModule}>
                <div className="p-5 border-b flex justify-between items-center">
                  <h3 className="text-lg font-semibold">
                    Ajouter un Nouveau Module
                  </h3>
                  <button
                    type="button"
                    onClick={() => setShowAddModule(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <MdClose size={24} />
                  </button>
                </div>
                <div className="p-6 space-y-4">
                  {/* Error message specific to modal if needed */}
                  <div>
                    <label
                      htmlFor="moduleTitle"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Titre du Module
                    </label>
                    <input
                      type="text"
                      id="moduleTitle"
                      value={moduleData.title}
                      onChange={(e) =>
                        setModuleData({ ...moduleData, title: e.target.value })
                      }
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="moduleDescription"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Description
                    </label>
                    <textarea
                      id="moduleDescription"
                      rows={3}
                      value={moduleData.description}
                      onChange={(e) =>
                        setModuleData({
                          ...moduleData,
                          description: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="moduleOrder"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Ordre (sera recalculé)
                    </label>
                    <input
                      type="number"
                      id="moduleOrder"
                      value={moduleData.order}
                      readOnly // Order is calculated automatically now
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100"
                    />
                  </div>
                </div>
                <div className="p-4 bg-gray-50 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowAddModule(false)}
                    className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
                  >
                    <MdSave className="mr-2 -ml-1" />
                    {loading ? "Ajout..." : "Ajouter Module"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Evaluation Modal */}
      <AnimatePresence>
        {showAddEvaluation && selectedModule && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-lg shadow-xl w-full max-w-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <form onSubmit={handleAddEvaluation}>
                <div className="p-5 border-b flex justify-between items-center">
                  <h3 className="text-lg font-semibold">
                    Ajouter Évaluation à "{selectedModule.title}"
                  </h3>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddEvaluation(false);
                      setSelectedModule(null);
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <MdClose size={24} />
                  </button>
                </div>
                <div className="p-6 space-y-4">
                  {/* Error message specific to modal if needed */}
                  <div>
                    <label
                      htmlFor="evalTitle"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Titre Évaluation
                    </label>
                    <input
                      type="text"
                      id="evalTitle"
                      value={evaluationData.title}
                      onChange={(e) =>
                        setEvaluationData({
                          ...evaluationData,
                          title: e.target.value,
                        })
                      }
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="evalType"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Type
                    </label>
                    <select
                      id="evalType"
                      value={evaluationData.type}
                      onChange={(e) =>
                        setEvaluationData({
                          ...evaluationData,
                          type: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                    >
                      <option value="quiz">Quiz</option>
                      <option value="assignment">Devoir / Exercice</option>
                    </select>
                  </div>
                  <div>
                    <label
                      htmlFor="evalDescription"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Description
                    </label>
                    <textarea
                      id="evalDescription"
                      rows={3}
                      value={evaluationData.description}
                      onChange={(e) =>
                        setEvaluationData({
                          ...evaluationData,
                          description: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="evalMaxScore"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Score Maximum
                    </label>
                    <input
                      type="number"
                      id="evalMaxScore"
                      value={evaluationData.maxScore}
                      onChange={(e) =>
                        setEvaluationData({
                          ...evaluationData,
                          maxScore: parseInt(e.target.value) || 100,
                        })
                      }
                      min="1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                </div>
                <div className="p-4 bg-gray-50 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddEvaluation(false);
                      setSelectedModule(null);
                    }}
                    className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
                  >
                    <MdSave className="mr-2 -ml-1" />
                    {loading ? "Ajout..." : "Ajouter Évaluation"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ModuleManager;
