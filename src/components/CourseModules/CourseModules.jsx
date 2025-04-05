import React, { useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import {
  MdExpandMore,
  MdExpandLess,
  MdCheckCircle,
  MdAccessTime,
  MdPlayCircle,
  MdAssignment,
  MdQuiz,
  MdArrowForward,
} from "react-icons/md";
import {
  calculateCourseScore,
  calculateCourseProgress,
  isCourseCompleted,
} from "../../utils/firebaseUtils";

const CourseModules = ({ course, onModuleSelect, isEnrolled = false }) => {
  const [expandedModules, setExpandedModules] = useState({});
  const navigate = useNavigate();

  // Vérifier si le cours a des modules
  const hasModules = course?.modules && course.modules.length > 0;

  // Calculer le score total du cours
  const courseScore = hasModules ? calculateCourseScore(course.modules) : 0;

  // Calculer le taux de progression
  const progressPercentage = hasModules
    ? calculateCourseProgress(course.modules)
    : 0;

  // Déterminer si le cours est complété
  const courseCompleted = hasModules
    ? isCourseCompleted(course.modules)
    : false;

  const toggleModule = (moduleId) => {
    setExpandedModules((prev) => ({
      ...prev,
      [moduleId]: !prev[moduleId],
    }));
  };

  // Fonction pour obtenir la couleur en fonction du score
  const getScoreColor = (score) => {
    if (score >= 80) return "text-green-600";
    if (score >= 70) return "text-yellow-600";
    return "text-red-600";
  };

  // Fonction pour obtenir le statut en français
  const getStatusText = (status) => {
    return status === "completed" ? "Complété" : "En cours";
  };

  // Fonction pour obtenir la couleur du statut
  const getStatusColor = (status) => {
    return status === "completed"
      ? "bg-green-100 text-green-800"
      : "bg-yellow-100 text-yellow-800";
  };

  if (!hasModules) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-bold mb-4">Modules du cours</h2>
        <p className="text-gray-600">Aucun module disponible pour ce cours.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Modules du cours</h2>
        <div className="flex items-center space-x-4">
          <div className="text-center">
            <p className="text-sm text-gray-600">Score total</p>
            <p className={`text-lg font-bold ${getScoreColor(courseScore)}`}>
              {courseScore}%
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">Progression</p>
            <p className="text-lg font-bold text-blue-600">
              {progressPercentage}%
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">Statut</p>
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${
                courseCompleted
                  ? "bg-green-100 text-green-800"
                  : "bg-yellow-100 text-yellow-800"
              }`}
            >
              {courseCompleted ? "Réussi" : "En cours"}
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {course.modules.map((module, index) => (
          <motion.div
            key={module.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="border rounded-lg overflow-hidden"
          >
            {/* Module Header */}
            <div
              className={`flex justify-between items-center p-4 cursor-pointer ${
                module.status === "completed" ? "bg-green-50" : "bg-gray-50"
              }`}
              onClick={() => toggleModule(module.id)}
            >
              <div className="flex-1 flex items-center space-x-3">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    module.status === "completed"
                      ? "bg-green-100 text-green-600"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {module.status === "completed" ? (
                    <MdCheckCircle className="w-5 h-5" />
                  ) : (
                    <MdAccessTime className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <h3 className="font-medium">
                    Module {index + 1}:{" "}
                    {module.title || module.titre || "Module sans titre"}
                  </h3>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs ${getStatusColor(
                        module.status
                      )}`}
                    >
                      {getStatusText(module.status)}
                    </span>
                    <span
                      className={`font-medium ${getScoreColor(module.score)}`}
                    >
                      Score: {module.score}%
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (isEnrolled) {
                      navigate(`/course/${course.id}/module/${module.id}`);
                    } else {
                      // Si l'utilisateur n'est pas inscrit, utiliser le callback onModuleSelect
                      if (onModuleSelect) {
                        onModuleSelect(module);
                      }
                    }
                  }}
                  className="flex items-center gap-1 px-3 py-1 bg-secondary text-white rounded-md hover:bg-secondary/90 transition-colors duration-300"
                >
                  <span>{isEnrolled ? "Accéder" : "Aperçu"}</span>
                  <MdArrowForward size={16} />
                </button>
                {onModuleSelect && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation(); // Empêcher le toggle du module
                      onModuleSelect(module);
                    }}
                    className="bg-secondary text-white px-3 py-1 rounded-md text-sm hover:bg-secondary/90 transition-colors duration-300 mr-2"
                  >
                    Ouvrir
                  </button>
                )}
                {expandedModules[module.id] ? (
                  <MdExpandLess className="w-6 h-6 text-gray-600" />
                ) : (
                  <MdExpandMore className="w-6 h-6 text-gray-600" />
                )}
              </div>
            </div>

            {/* Module Content */}
            {expandedModules[module.id] && (
              <div className="p-4 bg-white border-t">
                <div className="mb-4">
                  <p className="text-gray-700">
                    {module.description || "Aucune description disponible."}
                  </p>
                </div>

                {/* Module Resources */}
                {module.resources && module.resources.length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-medium mb-2">Ressources</h4>
                    <ul className="space-y-2">
                      {module.resources.map((resource, idx) => (
                        <li
                          key={idx}
                          className="flex items-center space-x-2 text-blue-600 hover:text-blue-800"
                        >
                          <MdPlayCircle className="w-5 h-5" />
                          <a
                            href={resource.url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {resource.title || "Ressource"}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Module Evaluations */}
                {module.evaluations && module.evaluations.length > 0 ? (
                  <div>
                    <h4 className="font-medium mb-2">Évaluations</h4>
                    <div className="space-y-3">
                      {module.evaluations.map((evaluation, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                        >
                          <div className="flex items-center space-x-3">
                            {evaluation.type === "quiz" ? (
                              <MdQuiz className="w-5 h-5 text-blue-600" />
                            ) : (
                              <MdAssignment className="w-5 h-5 text-orange-600" />
                            )}
                            <div>
                              <p className="font-medium">
                                {evaluation.title || `Évaluation ${idx + 1}`}
                              </p>
                              <p className="text-sm text-gray-600">
                                {evaluation.type === "quiz" ? "Quiz" : "Devoir"}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p
                              className={`font-bold ${getScoreColor(
                                evaluation.score || 0
                              )}`}
                            >
                              {evaluation.score || 0}%
                            </p>
                            <p className="text-xs text-gray-600">
                              {evaluation.date
                                ? new Date(evaluation.date).toLocaleDateString()
                                : "Non daté"}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-600">Aucune évaluation disponible.</p>
                )}
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default CourseModules;
