import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  MdQuiz,
  MdAssignment,
  MdCheck,
  MdAccessTime,
  MdAutorenew,
} from "react-icons/md";
import { ChevronLeft } from "lucide-react";
import ModuleQuiz from "./ModuleQuiz";
import { getAuth } from "firebase/auth";
import { getDatabase, ref, get, set } from "firebase/database";
import { createStaticQuiz } from "../../utils/quizGenerator";

const ModuleEvaluation = ({
  moduleId,
  courseId,
  onComplete,
  isEnrolled = true,
}) => {
  const [evaluations, setEvaluations] = useState([]);
  const [selectedEvaluation, setSelectedEvaluation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [generatingQuiz, setGeneratingQuiz] = useState(false);
  const [moduleProgress, setModuleProgress] = useState(null);

  const auth = getAuth();
  const database = getDatabase();

  // Récupérer les évaluations du module
  useEffect(() => {
    const fetchEvaluations = async () => {
      if (!moduleId) return;

      setLoading(true);
      setError("");

      try {
        // Vérifier d'abord dans le chemin standardisé
        const evaluationsRef = ref(
          database,
          `elearning/evaluations/${moduleId}`
        );
        const snapshot = await get(evaluationsRef);

        if (snapshot.exists()) {
          const evaluationsData = snapshot.val();

          // Filtrer les évaluations pour ne garder que les quiz statiques et les quiz API
          const filteredEvaluations = Object.entries(evaluationsData)
            .filter(
              ([key, value]) =>
                key === "static_quiz" ||
                key === "quiz_api" ||
                (value && value.type === "quiz")
            )
            .map(([key, value]) => ({
              id: key,
              ...value,
            }));

          setEvaluations(filteredEvaluations);
          console.log(
            `Found ${filteredEvaluations.length} evaluations for module ${moduleId}`
          );
        } else {
          console.log(
            `No evaluations found for module ${moduleId}, checking in course modules`
          );

          // Vérifier dans le chemin standardisé
          if (courseId) {
            const moduleEvaluationsRef = ref(
              database,
              `elearning/courses/${courseId}/modules/${moduleId}/evaluations`
            );
            const moduleSnapshot = await get(moduleEvaluationsRef);

            if (moduleSnapshot.exists()) {
              const moduleEvaluationsData = moduleSnapshot.val();

              // Filtrer les évaluations pour ne garder que les quiz
              const filteredEvaluations = Object.entries(moduleEvaluationsData)
                .filter(
                  ([key, value]) =>
                    key === "static_quiz" ||
                    key === "quiz_api" ||
                    (value && value.type === "quiz")
                )
                .map(([key, value]) => ({
                  id: key,
                  ...value,
                }));

              setEvaluations(filteredEvaluations);
              console.log(
                `Found ${filteredEvaluations.length} evaluations in course module ${moduleId}`
              );
            } else {
              console.log(
                `No evaluations found in course module ${moduleId}, generating static quiz`
              );

              // Générer un quiz statique si aucune évaluation n'est trouvée
              await generateStaticQuiz();
            }
          } else {
            console.log(`No courseId provided, generating static quiz`);

            // Générer un quiz statique si aucune évaluation n'est trouvée
            await generateStaticQuiz();
          }
        }
      } catch (error) {
        console.error(
          `Error fetching evaluations for module ${moduleId}:`,
          error
        );
        setError(
          `Erreur lors de la récupération des évaluations: ${error.message}`
        );
      } finally {
        setLoading(false);
      }
    };

    fetchEvaluations();
  }, [moduleId, courseId, database]);

  // Récupérer les informations du module pour générer un quiz statique
  const generateStaticQuiz = async () => {
    setGeneratingQuiz(true);
    setError("");

    try {
      // Récupérer les informations du module
      let moduleInfo = { id: moduleId, courseId };

      if (courseId) {
        const moduleRef = ref(
          database,
          `elearning/courses/${courseId}/modules/${moduleId}`
        );
        const moduleSnapshot = await get(moduleRef);

        if (moduleSnapshot.exists()) {
          moduleInfo = { ...moduleInfo, ...moduleSnapshot.val() };
        }
      }

      // Générer un quiz statique
      const staticQuiz = createStaticQuiz(moduleInfo);

      // Enregistrer le quiz dans Firebase
      const quizRef = ref(
        database,
        `elearning/evaluations/${moduleId}/static_quiz`
      );
      await set(quizRef, staticQuiz);

      console.log(`Static quiz generated and saved for module ${moduleId}`);

      // Mettre à jour les évaluations
      const updatedEvaluations = [
        ...evaluations,
        { id: "static_quiz", ...staticQuiz },
      ];
      setEvaluations(updatedEvaluations);
      setGeneratingQuiz(false);
    } catch (error) {
      console.error(`Error generating quiz:`, error);
      setError(`Erreur lors de la génération du quiz: ${error.message}`);
      setGeneratingQuiz(false);
    }
  };

  // Vérifier la progression du module
  useEffect(() => {
    const fetchModuleProgress = async () => {
      if (!auth.currentUser || !moduleId || !courseId) return;

      try {
        const progressRef = ref(
          database,
          `elearning/progress/${auth.currentUser.uid}/${courseId}/${moduleId}`
        );
        const snapshot = await get(progressRef);

        if (snapshot.exists()) {
          setModuleProgress(snapshot.val());
        }
      } catch (error) {
        console.error(`Error fetching module progress:`, error);
      }
    };

    fetchModuleProgress();
  }, [auth.currentUser, moduleId, courseId, database]);

  // Gérer la complétion d'une évaluation
  const handleEvaluationComplete = async (score) => {
    console.log(`Evaluation completed with score: ${score}`);

    try {
      // Mettre à jour le statut du module dans l'état local
      const newProgress = {
        completed: score >= 70,
        score,
        date: new Date().toISOString(),
      };
      setModuleProgress(newProgress);

      // Mettre à jour la progression dans Firebase
      if (auth.currentUser && moduleId && courseId) {
        try {
          const progressRef = ref(
            database,
            `elearning/progress/${auth.currentUser.uid}/${courseId}/${moduleId}`
          );

          // Récupérer la progression existante pour la mettre à jour
          const snapshot = await get(progressRef);
          let updatedProgress = newProgress;

          if (snapshot.exists()) {
            const existingProgress = snapshot.val();
            // Conserver le meilleur score
            const bestScore = Math.max(existingProgress.score || 0, score);

            updatedProgress = {
              ...existingProgress,
              ...newProgress,
              score: bestScore,
              bestScore: bestScore,
              lastUpdated: new Date().toISOString(),
            };
          } else {
            updatedProgress = {
              moduleId,
              courseId,
              userId: auth.currentUser.uid,
              progress: 100,
              completed: score >= 70,
              score,
              bestScore: score,
              startDate: new Date().toISOString(),
              lastUpdated: new Date().toISOString(),
            };
          }

          // Enregistrer la progression mise à jour
          await set(progressRef, updatedProgress);
          console.log(`Module progress updated in Firebase:`, updatedProgress);

          // Vérifier si tous les modules du cours sont complétés
          await checkCourseCompletion(score);
        } catch (firebaseError) {
          console.error("Error updating progress in Firebase:", firebaseError);
        }
      }

      // Revenir à la liste des évaluations
      setSelectedEvaluation(null);

      // Appeler le callback onComplete si fourni
      if (onComplete) {
        onComplete(score);
      }
    } catch (error) {
      console.error("Error handling evaluation completion:", error);
      setError(
        "Une erreur s'est produite lors de la mise à jour de votre progression."
      );
    }
  };

  // Fonction pour vérifier si tous les modules du cours sont complétés
  const checkCourseCompletion = async (currentModuleScore) => {
    try {
      if (!auth.currentUser || !courseId) {
        console.log(
          "Cannot check course completion: missing user or course ID"
        );
        return null;
      }

      // Récupérer tous les modules du cours
      const coursesRef = ref(database, `Elearning/Cours/${courseId}/modules`);
      const coursesSnapshot = await get(coursesRef);

      if (!coursesSnapshot.exists()) {
        console.log(`No modules found for course ${courseId}`);
        return null;
      }

      const modules = coursesSnapshot.val();
      const moduleIds = Object.keys(modules);

      if (moduleIds.length === 0) {
        console.log(`Course ${courseId} has no modules`);
        return null;
      }

      // Vérifier la progression de chaque module
      let totalScore = 0;
      let completedModules = 0;
      let moduleScores = {};

      for (const modId of moduleIds) {
        // Pour le module actuel, utiliser le score qui vient d'être obtenu
        if (modId === moduleId) {
          completedModules++;
          totalScore += currentModuleScore;
          moduleScores[modId] = currentModuleScore;
          continue;
        }

        // Pour les autres modules, vérifier la progression
        try {
          const progressionRef = ref(
            database,
            `Elearning/Progression/${auth.currentUser.uid}/${courseId}/${modId}`
          );
          const progressionSnapshot = await get(progressionRef);

          if (progressionSnapshot.exists()) {
            const progression = progressionSnapshot.val();
            if (progression.completed) {
              completedModules++;
              // Utiliser le meilleur score disponible
              const moduleScore =
                progression.bestScore || progression.score || 0;
              totalScore += moduleScore;
              moduleScores[modId] = moduleScore;
            }
          }
        } catch (moduleError) {
          console.error(
            `Error checking progression for module ${modId}:`,
            moduleError
          );
        }
      }

      // Calculer le score moyen et vérifier si tous les modules sont complétés
      const averageScore =
        completedModules > 0 ? totalScore / completedModules : 0;
      const allModulesCompleted = completedModules === moduleIds.length;

      console.log(
        `Course completion: ${completedModules}/${
          moduleIds.length
        } modules completed, average score: ${averageScore.toFixed(1)}%`
      );

      // Enregistrer les détails de progression pour chaque module
      const progressDetails = {
        totalModules: moduleIds.length,
        completedModules,
        moduleScores,
        averageScore,
        lastUpdated: new Date().toISOString(),
      };

      // Mettre à jour le statut du cours si tous les modules sont complétés
      if (allModulesCompleted) {
        try {
          // Mettre à jour le statut du cours
          const courseStatusRef = ref(
            database,
            `Elearning/Cours/${courseId}/status`
          );
          await set(courseStatusRef, {
            completed: true,
            score: averageScore,
            completedAt: new Date().toISOString(),
            passed: averageScore >= 70,
            details: progressDetails,
          });

          // Mettre à jour également dans la progression de l'utilisateur
          const userCourseRef = ref(
            database,
            `Elearning/Progression/${auth.currentUser.uid}/${courseId}`
          );
          await set(userCourseRef, {
            completed: true,
            score: averageScore,
            completedAt: new Date().toISOString(),
            passed: averageScore >= 70,
            details: progressDetails,
          });

          console.log(
            `Course status updated: completed with score ${averageScore.toFixed(
              1
            )}%`
          );

          // Afficher un message de succès ou d'échec
          if (averageScore >= 70) {
            // Succès
            alert(
              `Félicitations ! Vous avez complété la formation avec un score de ${averageScore.toFixed(
                1
              )}%.`
            );
          } else {
            // Échec
            alert(
              `Vous avez complété tous les modules, mais votre score moyen de ${averageScore.toFixed(
                1
              )}% est inférieur au minimum requis (70%). Veuillez refaire certains quiz pour améliorer votre score.`
            );
          }
        } catch (updateError) {
          console.error("Error updating course status:", updateError);
        }
      } else {
        // Mettre à jour la progression partielle
        try {
          const partialProgressRef = ref(
            database,
            `Elearning/Progression/${auth.currentUser.uid}/${courseId}`
          );
          await set(partialProgressRef, {
            completed: false,
            score: averageScore,
            progress: (completedModules / moduleIds.length) * 100,
            lastUpdated: new Date().toISOString(),
            details: progressDetails,
          });
          console.log(
            `Course partial progress updated: ${completedModules}/${moduleIds.length} modules completed`
          );
        } catch (partialError) {
          console.error("Error updating partial progress:", partialError);
        }
      }

      return {
        allModulesCompleted,
        averageScore,
        completedModules,
        totalModules: moduleIds.length,
      };
    } catch (error) {
      console.error("Error checking course completion:", error);
      return null;
    }
  };

  // Afficher un message de chargement
  if (loading) {
    return (
      <div className="p-4 bg-white rounded-lg shadow-md">
        <div className="flex items-center justify-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-secondary"></div>
          <span className="ml-2 text-gray-600">
            Chargement des évaluations...
          </span>
        </div>
      </div>
    );
  }

  // Afficher un message d'erreur
  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-600">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors duration-300"
        >
          Réessayer
        </button>
      </div>
    );
  }

  // Afficher le quiz sélectionné
  if (selectedEvaluation) {
    return (
      <div className="p-4 bg-white rounded-lg shadow-md">
        <button
          onClick={() => setSelectedEvaluation(null)}
          className="mb-4 flex items-center text-gray-600 hover:text-gray-900 transition-colors duration-300"
        >
          <ChevronLeft className="mr-1" size={16} />
          Retour aux évaluations
        </button>

        <ModuleQuiz
          quiz={selectedEvaluation}
          moduleId={moduleId}
          courseId={courseId}
          onComplete={handleEvaluationComplete}
        />
      </div>
    );
  }

  // Afficher la liste des évaluations
  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Évaluations du module</h2>

      {evaluations.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500 mb-4">
            Aucune évaluation disponible pour ce module.
          </p>
          <button
            onClick={generateStaticQuiz}
            disabled={generatingQuiz}
            className="px-4 py-2 bg-secondary text-white rounded-md hover:bg-secondary/90 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 mx-auto"
          >
            {generatingQuiz ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Génération en cours...
              </>
            ) : (
              <>
                <MdAutorenew />
                Générer une évaluation
              </>
            )}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {evaluations.map((evaluation) => (
            <div
              key={evaluation.id}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-300"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start">
                  <div className="mr-3 mt-1">
                    {evaluation.type === "assignment" ? (
                      <MdAssignment className="text-blue-500 text-2xl" />
                    ) : (
                      <MdQuiz className="text-secondary text-2xl" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-medium">
                      {evaluation.title ||
                        `Évaluation: ${
                          evaluation.type === "assignment" ? "Devoir" : "Quiz"
                        }`}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {evaluation.description ||
                        "Évaluez vos connaissances sur ce module"}
                    </p>
                    <div className="flex items-center mt-2 text-xs text-gray-500">
                      {evaluation.timeLimit && (
                        <span className="flex items-center mr-3">
                          <MdAccessTime className="mr-1" />
                          {Math.floor(evaluation.timeLimit / 60)} minutes
                        </span>
                      )}
                      {evaluation.passingScore && (
                        <span className="flex items-center">
                          <MdCheck className="mr-1" />
                          Score minimum: {evaluation.passingScore}%
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    if (isEnrolled) {
                      setSelectedEvaluation(evaluation);
                    } else {
                      alert(
                        "Vous devez être inscrit à ce cours pour accéder aux évaluations."
                      );
                    }
                  }}
                  className={`px-3 py-1 rounded-md text-sm ${
                    isEnrolled
                      ? "bg-secondary text-white hover:bg-secondary/90"
                      : "bg-gray-200 text-gray-500 cursor-not-allowed"
                  } transition-colors duration-300`}
                  disabled={!isEnrolled}
                >
                  {isEnrolled ? "Commencer" : "Inscription requise"}
                </button>
              </div>

              {moduleProgress && moduleProgress.completed && (
                <div className="mt-3 pt-3 border-t border-gray-100 flex items-center text-sm">
                  <div
                    className={`flex items-center ${
                      moduleProgress.score >= 70
                        ? "text-green-600"
                        : "text-orange-500"
                    }`}
                  >
                    <MdCheck className="mr-1" />
                    <span>
                      Complété avec un score de {moduleProgress.score}%
                    </span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ModuleEvaluation;
