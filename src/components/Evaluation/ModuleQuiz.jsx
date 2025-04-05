import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { MdCheck, MdClose, MdRefresh } from "react-icons/md";
import { getAuth } from "firebase/auth";
import { getDatabase, ref, set, get } from "firebase/database";

const ModuleQuiz = ({ moduleId, courseId, quiz, onComplete }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [previousAttempt, setPreviousAttempt] = useState(null);
  const [showPreviousAttempt, setShowPreviousAttempt] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [bestScore, setBestScore] = useState(0);

  const auth = getAuth();
  const database = getDatabase();

  // Vérifier s'il y a des tentatives précédentes
  useEffect(() => {
    const checkPreviousAttempts = async () => {
      if (!auth.currentUser) return;

      try {
        const attemptRef = ref(
          database,
          `Elearning/Evaluations/${moduleId}/${auth.currentUser.uid}`
        );
        const snapshot = await get(attemptRef);

        if (snapshot.exists()) {
          const attemptData = snapshot.val();
          setPreviousAttempt(attemptData);
          console.log("Previous attempt found:", attemptData);

          // Stocker le meilleur score
          if (attemptData.bestScore) {
            setBestScore(attemptData.bestScore);
          } else {
            setBestScore(attemptData.score);
          }
        }

        // Vérifier également les tentatives dans le cours
        const courseAttemptsRef = ref(
          database,
          `Elearning/Cours/${courseId}/modules/${moduleId}/evaluations/${auth.currentUser.uid}`
        );
        const courseSnapshot = await get(courseAttemptsRef);

        if (courseSnapshot.exists()) {
          const courseAttemptData = courseSnapshot.val();
          console.log("Course attempt found:", courseAttemptData);

          // Mettre à jour le meilleur score si nécessaire
          if (
            courseAttemptData.bestScore &&
            courseAttemptData.bestScore > bestScore
          ) {
            setBestScore(courseAttemptData.bestScore);
          } else if (courseAttemptData.score > bestScore) {
            setBestScore(courseAttemptData.score);
          }
        }
      } catch (error) {
        console.error("Error checking previous attempts:", error);
      }
    };

    checkPreviousAttempts();
  }, [auth.currentUser, database, moduleId, courseId, bestScore]);

  // Fonction pour soumettre les réponses
  const handleSubmit = async () => {
    setLoading(true);
    setError("");

    try {
      // Vérifier si quiz et quiz.questions existent
      if (!quiz || !quiz.questions || !Array.isArray(quiz.questions)) {
        setError(
          "Impossible de soumettre le quiz : données de quiz invalides."
        );
        setLoading(false);
        return;
      }

      // Calculer le score
      let correctAnswers = 0;
      const questionResults = {};

      quiz.questions.forEach((question, index) => {
        const userAnswer = selectedAnswers[index];
        const isCorrect = userAnswer === question.correctAnswer;

        if (isCorrect) {
          correctAnswers++;
        }

        questionResults[index] = {
          questionId: index,
          userAnswer,
          correctAnswer: question.correctAnswer,
          isCorrect,
        };
      });

      const finalScore = Math.round(
        (correctAnswers / quiz.questions.length) * 100
      );
      setScore(finalScore);

      // Enregistrer les résultats dans Firebase
      if (auth.currentUser) {
        // Déterminer le meilleur score
        const newBestScore = Math.max(finalScore, bestScore);
        setBestScore(newBestScore);

        const attemptData = {
          userId: auth.currentUser.uid,
          moduleId,
          courseId,
          score: finalScore,
          bestScore: newBestScore, // Stocker le meilleur score
          date: new Date().toISOString(),
          answers: questionResults,
          passed: finalScore >= 70,
          confirmed: false, // Pas encore confirmé
        };

        try {
          // Enregistrer dans Elearning/Evaluations/{moduleId}/{userId}
          const attemptRef = ref(
            database,
            `Elearning/Evaluations/${moduleId}/${auth.currentUser.uid}`
          );
          await set(attemptRef, attemptData);
          console.log(
            `Evaluation results saved to Elearning/Evaluations/${moduleId}/${auth.currentUser.uid}`
          );

          // Enregistrer également dans le module lui-même
          const moduleEvalRef = ref(
            database,
            `Elearning/Cours/${courseId}/modules/${moduleId}/evaluations/${auth.currentUser.uid}`
          );
          await set(moduleEvalRef, attemptData);
          console.log(`Evaluation results saved to module evaluations`);
        } catch (error) {
          console.error("Error saving evaluation results:", error);
        }

        // Mettre à jour le statut du module si le score est suffisant
        if (finalScore >= 70) {
          try {
            // Mettre à jour la progression dans Elearning/Progression
            const moduleStatusRef = ref(
              database,
              `Elearning/Progression/${auth.currentUser.uid}/${courseId}/${moduleId}`
            );
            await set(moduleStatusRef, {
              completed: true,
              score: finalScore,
              lastUpdated: new Date().toISOString(),
            });
            console.log(`Module status updated in Elearning/Progression`);

            // Mettre à jour le statut directement dans le module
            const moduleRef = ref(
              database,
              `Elearning/Cours/${courseId}/modules/${moduleId}/status`
            );
            await set(moduleRef, "completed");
            console.log(`Module status updated directly in the module`);
          } catch (error) {
            console.error("Error updating module status:", error);
          }

          // Appeler le callback onComplete si fourni
          if (onComplete) {
            onComplete(finalScore);
          }
        }
      }

      setShowResults(true);
    } catch (error) {
      console.error("Error submitting quiz:", error);
      setError(
        "Une erreur s'est produite lors de la soumission du quiz. Veuillez réessayer."
      );
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour sélectionner une réponse
  const handleSelectAnswer = (questionIndex, answerIndex) => {
    if (showResults) return; // Ne pas permettre de changer les réponses après soumission

    setSelectedAnswers({
      ...selectedAnswers,
      [questionIndex]: answerIndex,
    });
  };

  // Fonction pour recommencer le quiz
  const handleRetry = () => {
    setSelectedAnswers({});
    setCurrentQuestion(0);
    setShowResults(false);
    setScore(0);
    setConfirmed(false);
  };

  // Fonction pour confirmer le score et mettre à jour le statut du module
  const handleConfirmScore = async () => {
    if (!auth.currentUser) return;

    setLoading(true);
    setError("");

    try {
      // Mettre à jour le statut de confirmation dans les tentatives
      const attemptRef = ref(
        database,
        `Elearning/Evaluations/${moduleId}/${auth.currentUser.uid}`
      );
      const snapshot = await get(attemptRef);

      if (snapshot.exists()) {
        const attemptData = snapshot.val();
        await set(attemptRef, {
          ...attemptData,
          confirmed: true,
          bestScore: Math.max(attemptData.score, bestScore),
        });
      }

      // Mettre à jour également dans le module
      const moduleEvalRef = ref(
        database,
        `Elearning/Cours/${courseId}/modules/${moduleId}/evaluations/${auth.currentUser.uid}`
      );
      const moduleSnapshot = await get(moduleEvalRef);

      if (moduleSnapshot.exists()) {
        const moduleAttemptData = moduleSnapshot.val();
        await set(moduleEvalRef, {
          ...moduleAttemptData,
          confirmed: true,
          bestScore: Math.max(moduleAttemptData.score, bestScore),
        });
      }

      // Mettre à jour le statut du module si le meilleur score est suffisant
      if (bestScore >= 70) {
        // Mettre à jour la progression dans Elearning/Progression
        const moduleStatusRef = ref(
          database,
          `Elearning/Progression/${auth.currentUser.uid}/${courseId}/${moduleId}`
        );
        await set(moduleStatusRef, {
          completed: true,
          score: bestScore,
          lastUpdated: new Date().toISOString(),
        });
        console.log(`Module status updated in Elearning/Progression`);

        // Mettre à jour le statut directement dans le module
        const moduleRef = ref(
          database,
          `Elearning/Cours/${courseId}/modules/${moduleId}/status`
        );
        await set(moduleRef, "completed");
        console.log(`Module status updated directly in the module`);

        // Vérifier si tous les modules du cours sont complétés
        await checkCourseCompletion();
      }

      setConfirmed(true);
      setLoading(false);

      // Appeler le callback onComplete si fourni
      if (onComplete) {
        onComplete(bestScore);
      }
    } catch (error) {
      console.error("Error confirming score:", error);
      setError("Une erreur s'est produite lors de la confirmation du score.");
      setLoading(false);
    }
  };

  // Fonction pour vérifier si tous les modules du cours sont complétés
  const checkCourseCompletion = async () => {
    try {
      // Récupérer tous les modules du cours
      const coursesRef = ref(database, `Elearning/Cours/${courseId}/modules`);
      const coursesSnapshot = await get(coursesRef);

      if (coursesSnapshot.exists()) {
        const modules = coursesSnapshot.val();
        const moduleIds = Object.keys(modules);

        // Vérifier la progression de chaque module
        let totalScore = 0;
        let completedModules = 0;

        for (const modId of moduleIds) {
          const progressionRef = ref(
            database,
            `Elearning/Progression/${auth.currentUser.uid}/${courseId}/${modId}`
          );
          const progressionSnapshot = await get(progressionRef);

          if (progressionSnapshot.exists()) {
            const progression = progressionSnapshot.val();
            if (progression.completed) {
              completedModules++;
              totalScore += progression.score || 0;
            }
          }
        }

        // Calculer le score moyen et vérifier si tous les modules sont complétés
        const averageScore =
          completedModules > 0 ? totalScore / completedModules : 0;
        const allModulesCompleted = completedModules === moduleIds.length;

        console.log(
          `Course completion: ${completedModules}/${moduleIds.length} modules completed, average score: ${averageScore}%`
        );

        // Mettre à jour le statut du cours si tous les modules sont complétés
        if (allModulesCompleted) {
          const courseStatusRef = ref(
            database,
            `Elearning/Cours/${courseId}/status`
          );
          await set(courseStatusRef, {
            completed: true,
            score: averageScore,
            completedAt: new Date().toISOString(),
            passed: averageScore >= 70,
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
          });

          console.log(
            `Course status updated: completed with score ${averageScore}%`
          );
        }
      }
    } catch (error) {
      console.error("Error checking course completion:", error);
    }
  };

  // Si aucun quiz n'est fourni ou s'il n'y a pas de questions
  if (
    !quiz ||
    !quiz.questions ||
    !Array.isArray(quiz.questions) ||
    quiz.questions.length === 0
  ) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-bold mb-4">Évaluation non disponible</h2>
        <p className="text-gray-600">
          Aucune évaluation n'est disponible pour ce module.
        </p>
      </div>
    );
  }

  // Afficher les résultats d'une tentative précédente
  if (showPreviousAttempt && previousAttempt) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Résultats précédents</h2>
          <button
            onClick={() => setShowPreviousAttempt(false)}
            className="text-gray-600 hover:text-gray-800"
          >
            Retour au quiz
          </button>
        </div>

        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <p className="text-lg font-medium">Score:</p>
            <p
              className={`text-lg font-bold ${
                previousAttempt.score >= 70 ? "text-green-600" : "text-red-600"
              }`}
            >
              {previousAttempt.score}%
            </p>
          </div>
          <div className="flex justify-between items-center mb-2">
            <p className="text-lg font-medium">Statut:</p>
            <p
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                previousAttempt.passed
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {previousAttempt.passed ? "Réussi" : "Échoué"}
            </p>
          </div>
          <div className="flex justify-between items-center">
            <p className="text-lg font-medium">Date:</p>
            <p className="text-gray-600">
              {new Date(previousAttempt.date).toLocaleDateString()} à{" "}
              {new Date(previousAttempt.date).toLocaleTimeString()}
            </p>
          </div>
        </div>

        <div className="space-y-6">
          <h3 className="text-lg font-semibold">Détail des réponses</h3>
          {quiz &&
            quiz.questions &&
            Array.isArray(quiz.questions) &&
            quiz.questions.map((question, index) => {
              const answerData = previousAttempt.answers[index];
              return (
                <div key={index} className="border p-4 rounded-lg">
                  <p className="font-medium mb-2">{question.question}</p>
                  <div className="space-y-2 ml-4">
                    {question.options.map((option, optionIndex) => (
                      <div
                        key={optionIndex}
                        className={`flex items-center p-2 rounded ${
                          optionIndex === question.correctAnswer
                            ? "bg-green-100"
                            : optionIndex === answerData.userAnswer &&
                              optionIndex !== question.correctAnswer
                            ? "bg-red-100"
                            : ""
                        }`}
                      >
                        <span className="mr-2">
                          {optionIndex === question.correctAnswer ? (
                            <MdCheck className="text-green-600" />
                          ) : optionIndex === answerData.userAnswer &&
                            optionIndex !== question.correctAnswer ? (
                            <MdClose className="text-red-600" />
                          ) : null}
                        </span>
                        <span>{option}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
        </div>

        <div className="mt-6 flex justify-center">
          <button
            onClick={() => setShowPreviousAttempt(false)}
            className="bg-secondary text-white px-6 py-2 rounded-md hover:bg-secondary/90 transition-colors duration-300"
          >
            Retenter le quiz
          </button>
        </div>
      </div>
    );
  }

  // Afficher les résultats du quiz actuel
  if (showResults) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-white p-6 rounded-lg shadow-md"
      >
        <h2 className="text-xl font-bold mb-6">Résultats de l'évaluation</h2>

        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <div>
              <p className="text-lg font-medium">Votre score:</p>
              {bestScore > score && (
                <p className="text-sm text-gray-600">
                  Meilleur score: {bestScore}%
                </p>
              )}
            </div>
            <div className="text-right">
              <p
                className={`text-2xl font-bold ${
                  score >= 70 ? "text-green-600" : "text-red-600"
                }`}
              >
                {score}%
              </p>
              {bestScore > score && (
                <p className="text-sm text-gray-600">
                  Le meilleur score sera conservé
                </p>
              )}
            </div>
          </div>

          <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
            <div
              className={`h-4 rounded-full ${
                score >= 70 ? "bg-green-600" : "bg-red-600"
              }`}
              style={{ width: `${score}%` }}
            ></div>
          </div>

          {bestScore > score && (
            <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
              <div
                className="h-2 rounded-full bg-blue-500"
                style={{ width: `${bestScore}%` }}
              ></div>
              <p className="text-xs text-gray-500 text-right">Meilleur score</p>
            </div>
          )}

          <p className="mt-4 text-center font-medium">
            {Math.max(score, bestScore) >= 70
              ? "Félicitations ! Vous avez réussi cette évaluation."
              : "Vous n'avez pas atteint le score minimum requis (70%). Essayez à nouveau."}
          </p>

          {!confirmed && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
              <p className="text-sm text-gray-700 mb-3">
                Cliquez sur "Confirmer le score" pour enregistrer votre résultat
                et mettre à jour votre progression.
                {bestScore > score && " Votre meilleur score sera conservé."}
              </p>
              <button
                onClick={handleConfirmScore}
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Traitement...</span>
                  </>
                ) : (
                  "Confirmer le score"
                )}
              </button>
            </div>
          )}

          {confirmed && (
            <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-100">
              <p className="text-sm text-green-700 flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                Score confirmé et progression mise à jour
              </p>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <h3 className="text-lg font-semibold">Détail des réponses</h3>
          {quiz &&
            quiz.questions &&
            Array.isArray(quiz.questions) &&
            quiz.questions.map((question, index) => (
              <div key={index} className="border p-4 rounded-lg">
                <p className="font-medium mb-2">{question.question}</p>
                <div className="space-y-2 ml-4">
                  {question.options.map((option, optionIndex) => (
                    <div
                      key={optionIndex}
                      className={`flex items-center p-2 rounded ${
                        optionIndex === question.correctAnswer
                          ? "bg-green-100"
                          : optionIndex === selectedAnswers[index] &&
                            optionIndex !== question.correctAnswer
                          ? "bg-red-100"
                          : ""
                      }`}
                    >
                      <span className="mr-2">
                        {optionIndex === question.correctAnswer ? (
                          <MdCheck className="text-green-600" />
                        ) : optionIndex === selectedAnswers[index] &&
                          optionIndex !== question.correctAnswer ? (
                          <MdClose className="text-red-600" />
                        ) : null}
                      </span>
                      <span>{option}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
        </div>

        <div className="mt-8 flex justify-center gap-4">
          {(!confirmed || Math.max(score, bestScore) < 70) && (
            <button
              onClick={handleRetry}
              className="bg-secondary text-white px-6 py-2 rounded-md flex items-center gap-2 hover:bg-secondary/90 transition-colors duration-300"
            >
              <MdRefresh />
              Recommencer le quiz
            </button>
          )}

          {confirmed && Math.max(score, bestScore) >= 70 && (
            <div className="bg-green-100 text-green-800 p-4 rounded-lg text-center">
              <p className="font-medium mb-2">Formation réussie !</p>
              <p className="text-sm">
                Vous avez complété ce module avec succès.
              </p>
            </div>
          )}

          {confirmed && Math.max(score, bestScore) < 70 && (
            <div className="bg-yellow-100 text-yellow-800 p-4 rounded-lg text-center">
              <p className="font-medium mb-2">Score insuffisant</p>
              <p className="text-sm">
                Vous devez obtenir au moins 70% pour réussir ce module.
              </p>
              <p className="text-sm mt-2">
                Cliquez sur "Recommencer le quiz" pour réessayer.
              </p>
            </div>
          )}
        </div>
      </motion.div>
    );
  }

  // Afficher le quiz
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      {previousAttempt && (
        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <div className="flex justify-between items-center">
            <div>
              <p className="font-medium">Tentative précédente trouvée</p>
              <p className="text-sm text-gray-600">
                Score: {previousAttempt.score}% -{" "}
                {previousAttempt.passed ? "Réussi" : "Échoué"}
              </p>
            </div>
            <button
              onClick={() => setShowPreviousAttempt(true)}
              className="text-blue-600 hover:text-blue-800 underline"
            >
              Voir les détails
            </button>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">
          {quiz.title || "Évaluation du module"}
        </h2>
        <div className="text-sm text-gray-600">
          Question {currentQuestion + 1} sur{" "}
          {quiz && quiz.questions && Array.isArray(quiz.questions)
            ? quiz.questions.length
            : 0}
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}

      <div className="mb-8">
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-secondary h-2 rounded-full"
            style={{
              width: `${
                ((currentQuestion + 1) /
                  (quiz && quiz.questions && Array.isArray(quiz.questions)
                    ? quiz.questions.length
                    : 1)) *
                100
              }%`,
            }}
          ></div>
        </div>
      </div>

      <div className="mb-8">
        {quiz &&
        quiz.questions &&
        Array.isArray(quiz.questions) &&
        quiz.questions[currentQuestion] ? (
          <>
            <h3 className="text-lg font-medium mb-4">
              {quiz.questions[currentQuestion].question}
            </h3>
            <div className="space-y-3">
              {quiz.questions[currentQuestion].options &&
                Array.isArray(quiz.questions[currentQuestion].options) &&
                quiz.questions[currentQuestion].options.map((option, index) => (
                  <div
                    key={index}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors duration-200 ${
                      selectedAnswers[currentQuestion] === index
                        ? "bg-secondary text-white border-secondary"
                        : "hover:bg-gray-50"
                    }`}
                    onClick={() => handleSelectAnswer(currentQuestion, index)}
                  >
                    <div className="flex items-center">
                      <div
                        className={`w-6 h-6 flex items-center justify-center rounded-full mr-3 ${
                          selectedAnswers[currentQuestion] === index
                            ? "bg-white text-secondary"
                            : "bg-gray-200"
                        }`}
                      >
                        {String.fromCharCode(65 + index)}
                      </div>
                      <span>{option}</span>
                    </div>
                  </div>
                ))}
            </div>
          </>
        ) : (
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-gray-600">
              Impossible de charger les questions du quiz.
            </p>
          </div>
        )}
      </div>

      <div className="flex justify-between">
        <button
          onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
          disabled={currentQuestion === 0}
          className={`px-4 py-2 rounded-md ${
            currentQuestion === 0
              ? "bg-gray-200 text-gray-500 cursor-not-allowed"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          Précédent
        </button>

        {currentQuestion < quiz.questions.length - 1 ? (
          <button
            onClick={() => setCurrentQuestion(currentQuestion + 1)}
            disabled={selectedAnswers[currentQuestion] === undefined}
            className={`px-4 py-2 rounded-md ${
              selectedAnswers[currentQuestion] === undefined
                ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                : "bg-secondary text-white hover:bg-secondary/90"
            }`}
          >
            Suivant
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={
              loading ||
              Object.keys(selectedAnswers).length !== quiz.questions.length
            }
            className={`px-6 py-2 rounded-md ${
              loading ||
              Object.keys(selectedAnswers).length !== quiz.questions.length
                ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                : "bg-secondary text-white hover:bg-secondary/90"
            }`}
          >
            {loading ? "Soumission..." : "Soumettre"}
          </button>
        )}
      </div>
    </div>
  );
};

export default ModuleQuiz;
