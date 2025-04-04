import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { MdQuiz, MdAssignment, MdCheck, MdAccessTime } from "react-icons/md";
import ModuleQuiz from "./ModuleQuiz";
import { getAuth } from "firebase/auth";
import { getDatabase, ref, get } from "firebase/database";

const ModuleEvaluation = ({ moduleId, courseId, onComplete }) => {
  const [evaluations, setEvaluations] = useState([]);
  const [selectedEvaluation, setSelectedEvaluation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [moduleProgress, setModuleProgress] = useState(null);

  const auth = getAuth();
  const database = getDatabase();

  // Charger les évaluations du module
  useEffect(() => {
    const loadEvaluations = async () => {
      if (!moduleId) return;

      setLoading(true);
      setError("");

      try {
        // Vérifier d'abord si le module a des évaluations
        const evaluationsRef = ref(database, `Elearning/Evaluations/${moduleId}`);
        const snapshot = await get(evaluationsRef);

        if (snapshot.exists()) {
          // Des évaluations existent déjà
          console.log("Evaluations found for module:", moduleId);
          
          // Vérifier si l'utilisateur a déjà passé des évaluations
          if (auth.currentUser) {
            const userEvalRef = ref(database, `Elearning/Evaluations/${moduleId}/${auth.currentUser.uid}`);
            const userEvalSnapshot = await get(userEvalRef);
            
            if (userEvalSnapshot.exists()) {
              const evalData = userEvalSnapshot.val();
              console.log("User evaluation data:", evalData);
              
              // Mettre à jour le statut du module
              setModuleProgress({
                completed: evalData.passed,
                score: evalData.score,
                date: evalData.date
              });
            }
          }
        } else {
          // Créer des évaluations par défaut si aucune n'existe
          console.log("No evaluations found, creating default ones");
          
          const defaultEvaluations = [
            {
              id: `quiz_${moduleId}`,
              type: "quiz",
              title: "Quiz du module",
              description: "Évaluez vos connaissances sur ce module",
              questions: [
                {
                  question: "Quelle est la principale fonctionnalité de ce module?",
                  options: [
                    "Apprentissage des bases",
                    "Pratique avancée",
                    "Évaluation des connaissances",
                    "Révision du contenu"
                  ],
                  correctAnswer: 0
                },
                {
                  question: "Quel est l'objectif principal de ce cours?",
                  options: [
                    "Divertissement",
                    "Acquisition de compétences",
                    "Obtention d'un diplôme",
                    "Réseautage professionnel"
                  ],
                  correctAnswer: 1
                },
                {
                  question: "Quelle méthode est recommandée pour l'apprentissage?",
                  options: [
                    "Mémorisation passive",
                    "Lecture rapide",
                    "Pratique active",
                    "Écoute occasionnelle"
                  ],
                  correctAnswer: 2
                },
                {
                  question: "Quel est le format principal du contenu de ce module?",
                  options: [
                    "Texte uniquement",
                    "Vidéos et documents",
                    "Audio seulement",
                    "Exercices pratiques"
                  ],
                  correctAnswer: 1
                },
                {
                  question: "Comment peut-on valider ce module?",
                  options: [
                    "Par un examen final",
                    "Par la présence",
                    "Par un quiz en ligne",
                    "Par un projet pratique"
                  ],
                  correctAnswer: 2
                }
              ]
            }
          ];
          
          setEvaluations(defaultEvaluations);
        }
        
        // Vérifier la progression du module
        if (auth.currentUser) {
          const progressRef = ref(
            database,
            `Elearning/Progression/${auth.currentUser.uid}/${courseId}/${moduleId}`
          );
          const progressSnapshot = await get(progressRef);
          
          if (progressSnapshot.exists()) {
            const progressData = progressSnapshot.val();
            console.log("Module progress data:", progressData);
            setModuleProgress(progressData);
          }
        }
        
      } catch (error) {
        console.error("Error loading evaluations:", error);
        setError("Impossible de charger les évaluations. Veuillez réessayer.");
      } finally {
        setLoading(false);
      }
    };

    loadEvaluations();
  }, [auth.currentUser, database, moduleId, courseId]);

  // Gérer la complétion d'une évaluation
  const handleEvaluationComplete = (score) => {
    console.log(`Evaluation completed with score: ${score}`);
    
    // Mettre à jour le statut du module
    setModuleProgress({
      completed: score >= 70,
      score,
      date: new Date().toISOString()
    });
    
    // Revenir à la liste des évaluations
    setSelectedEvaluation(null);
    
    // Appeler le callback onComplete si fourni
    if (onComplete) {
      onComplete(score);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 p-4 rounded-lg text-red-700">
        <p>{error}</p>
      </div>
    );
  }

  // Afficher une évaluation spécifique
  if (selectedEvaluation) {
    if (selectedEvaluation.type === "quiz") {
      return (
        <ModuleQuiz
          moduleId={moduleId}
          courseId={courseId}
          quiz={selectedEvaluation}
          onComplete={handleEvaluationComplete}
        />
      );
    }
    
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">{selectedEvaluation.title}</h2>
          <button
            onClick={() => setSelectedEvaluation(null)}
            className="text-gray-600 hover:text-gray-800"
          >
            Retour aux évaluations
          </button>
        </div>
        <p className="text-gray-600 mb-4">
          Type d'évaluation non pris en charge.
        </p>
      </div>
    );
  }

  // Afficher la liste des évaluations
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-6">Évaluations du module</h2>
      
      {moduleProgress && (
        <div className={`mb-6 p-4 rounded-lg ${moduleProgress.completed ? "bg-green-50" : "bg-yellow-50"}`}>
          <div className="flex items-center gap-3">
            {moduleProgress.completed ? (
              <MdCheck className="text-green-600 text-xl" />
            ) : (
              <MdAccessTime className="text-yellow-600 text-xl" />
            )}
            <div>
              <p className="font-medium">
                {moduleProgress.completed
                  ? "Module complété"
                  : "Module en cours"}
              </p>
              <p className="text-sm text-gray-600">
                Score: {moduleProgress.score}% - 
                {moduleProgress.date && `Dernière mise à jour: ${new Date(moduleProgress.date).toLocaleDateString()}`}
              </p>
            </div>
          </div>
        </div>
      )}
      
      {evaluations.length > 0 ? (
        <div className="space-y-4">
          {evaluations.map((evaluation) => (
            <motion.div
              key={evaluation.id}
              whileHover={{ scale: 1.02 }}
              className="border p-4 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors duration-200"
              onClick={() => setSelectedEvaluation(evaluation)}
            >
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-full ${evaluation.type === "quiz" ? "bg-blue-100" : "bg-orange-100"}`}>
                  {evaluation.type === "quiz" ? (
                    <MdQuiz className={`text-xl ${evaluation.type === "quiz" ? "text-blue-600" : "text-orange-600"}`} />
                  ) : (
                    <MdAssignment className={`text-xl ${evaluation.type === "quiz" ? "text-blue-600" : "text-orange-600"}`} />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-lg">{evaluation.title}</h3>
                  <p className="text-gray-600">{evaluation.description}</p>
                  {evaluation.type === "quiz" && (
                    <p className="text-sm text-gray-500 mt-1">
                      {evaluation.questions.length} questions
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <p className="text-gray-600">
            Aucune évaluation disponible pour ce module.
          </p>
        </div>
      )}
    </div>
  );
};

export default ModuleEvaluation;
