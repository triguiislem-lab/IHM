import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Clock,
  Star,
  Library,
  Users,
  X,
  ChevronLeft,
} from "lucide-react";
import { motion } from "framer-motion";
import {
  fetchCoursesFromDatabase,
  fetchFormationsFromDatabase,
  testFirebasePaths,
  fetchCourseById,
} from "../../utils/firebaseUtils";
import { getAuth } from "firebase/auth";
import { database } from "../../../firebaseConfig";
import { ref, get, push, set } from "firebase/database";
import CourseModules from "../CourseModules/CourseModules";
import ModuleContent from "../CourseModules/ModuleContent";

const CourseDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showEnrollPopup, setShowEnrollPopup] = useState(false);
  const [enrollmentLoading, setEnrollmentLoading] = useState(false);
  const [enrollmentSuccess, setEnrollmentSuccess] = useState(false);
  const [enrollmentError, setEnrollmentError] = useState(null);
  const [isFormateur, setIsFormateur] = useState(false);
  const [refreshModules, setRefreshModules] = useState(false);
  const [activeModule, setActiveModule] = useState(null);
  const [showModuleContent, setShowModuleContent] = useState(false);

  // Firebase refs
  const auth = getAuth();

  // Vérifier si l'utilisateur est un formateur
  useEffect(() => {
    const checkUserRole = async () => {
      try {
        const user = auth.currentUser;
        if (user) {
          // Vérifier si l'utilisateur est un formateur
          const formateurRef = ref(
            database,
            `Elearning/Formateurs/${user.uid}`
          );
          const formateurSnapshot = await get(formateurRef);
          setIsFormateur(formateurSnapshot.exists());
        }
      } catch (error) {
        console.error("Error checking user role:", error);
      }
    };

    checkUserRole();
  }, [auth]);

  // Charger les détails du cours
  useEffect(() => {
    const loadCourse = async () => {
      try {
        console.log("Loading course with ID:", id);

        // Utiliser la nouvelle fonction fetchCourseById qui récupère également les modules et évaluations
        const courseWithModules = await fetchCourseById(id);

        if (courseWithModules) {
          console.log("Course found with fetchCourseById:", courseWithModules);
          setCourse(courseWithModules);
          return;
        }

        // Si le cours n'est pas trouvé avec fetchCourseById, essayer les anciennes méthodes
        console.log(
          "Course not found with fetchCourseById, trying old methods"
        );

        // Tester les chemins Firebase disponibles
        await testFirebasePaths();

        // Essayer d'abord de charger depuis les cours
        const coursesData = await fetchCoursesFromDatabase();
        console.log("Courses data:", coursesData);

        let foundCourse = coursesData.find((c) => c.id === id);
        console.log("Found in courses?", !!foundCourse);

        // Si pas trouvé dans les cours, essayer dans les formations
        if (!foundCourse) {
          console.log("Course not found in courses, trying formations");
          const formationsData = await fetchFormationsFromDatabase();
          console.log("Formations data:", formationsData);

          foundCourse = formationsData.find((f) => f.id === id);
          console.log("Found in formations?", !!foundCourse);

          // Adapter le format si c'est une formation
          if (foundCourse) {
            console.log("Adapting formation to course format");
            // Adapter les propriétés pour correspondre au format attendu
            foundCourse.title = foundCourse.titre || "Formation";
            foundCourse.duration = foundCourse.duree
              ? `${foundCourse.duree} heures`
              : "300 heures";
            foundCourse.lessons = 10;
            foundCourse.students = 25;
            foundCourse.rating = 4.7;
            foundCourse.totalRatings = 15;
            foundCourse.price = 49.99;
            foundCourse.category = foundCourse.category || "Formation";
            foundCourse.level = foundCourse.level || "Intermédiaire";
            foundCourse.topics = foundCourse.description
              ? foundCourse.description
                  .split(". ")
                  .filter((topic) => topic.trim() !== "")
              : ["Module 1", "Module 2", "Module 3"];
            foundCourse.instructor = {
              name: "Formateur",
              bio: "Expert dans ce domaine",
              avatar:
                "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
            };
            foundCourse.updatedAt =
              foundCourse.dateFin || new Date().toISOString();
          }
        }

        // Si aucun cours n'est trouvé, créer un cours factice basé sur l'ID
        if (!foundCourse) {
          console.log(
            "No course found with ID:",
            id,
            "- creating dummy course"
          );
          foundCourse = {
            id: id,
            title: `Formation ${id}`,
            description:
              "Cette formation complète vous permettra d'acquérir les compétences nécessaires pour maîtriser les technologies modernes. Vous apprendrez les fondamentaux et les techniques avancées à travers des projets pratiques et des études de cas réelles.",
            duration: "300 heures",
            lessons: 10,
            students: 25,
            rating: 4.5,
            totalRatings: 10,
            price: 49.99,
            category: "Formation",
            level: "Intermédiaire",
            topics: [
              "Module 1: Introduction aux concepts de base",
              "Module 2: Techniques avancées",
              "Module 3: Applications pratiques",
              "Module 4: Projets et études de cas",
            ],
            instructor: {
              name: "Formateur Expert",
              bio: "Expert dans ce domaine avec plus de 10 ans d'expérience dans l'industrie et l'enseignement. Certifié et reconnu par les plus grandes entreprises du secteur.",
              avatar:
                "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
            },
            image:
              "https://images.unsplash.com/photo-1498050108023-c5249f4df085?ixlib=rb-1.2.1&auto=format&fit=crop&w=700&q=80",
            updatedAt: new Date().toISOString(),
            objectives: [
              "Comprendre les concepts fondamentaux de la discipline",
              "Maîtriser les outils et technologies essentiels",
              "Développer des compétences pratiques à travers des projets réels",
              "Acquérir une expérience professionnelle valorisable sur le marché du travail",
            ],
            prerequisites: [
              "Connaissances de base en informatique",
              "Familiarité avec l'environnement de travail numérique",
              "Motivation et engagement pour l'apprentissage",
            ],
            targetAudience: [
              "Étudiants souhaitant acquérir des compétences professionnelles",
              "Professionnels en reconversion",
              "Employés cherchant à améliorer leurs compétences",
            ],
            testimonials: [
              {
                name: "Sophie Martin",
                role: "Développeuse Web",
                comment:
                  "Cette formation a transformé ma carrière. Les compétences acquises m'ont permis de trouver un emploi dans une entreprise innovante.",
                avatar:
                  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
                rating: 5,
              },
              {
                name: "Thomas Dubois",
                role: "Chef de projet",
                comment:
                  "Formation complète et bien structurée. Les projets pratiques sont particulièrement utiles pour consolider les connaissances.",
                avatar:
                  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
                rating: 4.5,
              },
            ],
            faq: [
              {
                question:
                  "Combien de temps faut-il pour compléter la formation ?",
                answer:
                  "La durée moyenne est de 3 mois à raison de 25 heures par semaine. Cependant, vous pouvez adapter votre rythme selon vos disponibilités.",
              },
              {
                question: "Y a-t-il un certificat à la fin de la formation ?",
                answer:
                  "Oui, vous recevrez un certificat de réussite reconnu par l'industrie après avoir complété tous les modules et projets.",
              },
              {
                question:
                  "Est-ce que je peux accéder au contenu après la fin de la formation ?",
                answer:
                  "Oui, vous aurez un accès à vie au contenu de la formation, y compris aux mises à jour futures.",
              },
            ],
          };
        }

        // S'assurer que l'objet course a toujours un instructor défini
        if (foundCourse && !foundCourse.instructor) {
          foundCourse.instructor = {
            name: "Formateur",
            bio: "Expert dans ce domaine",
            avatar:
              "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
          };
        }

        console.log("Final course data:", foundCourse);
        setCourse(foundCourse);
      } catch (error) {
        console.error("Error loading course:", error);
        // En cas d'erreur, créer un cours factice
        const dummyCourse = {
          id: id,
          title: `Formation ${id}`,
          description:
            "Cette formation complète vous permettra d'acquérir les compétences nécessaires pour maîtriser les technologies modernes. Vous apprendrez les fondamentaux et les techniques avancées à travers des projets pratiques et des études de cas réelles.",
          duration: "300 heures",
          lessons: 10,
          students: 25,
          rating: 4.5,
          totalRatings: 10,
          price: 49.99,
          category: "Formation",
          level: "Intermédiaire",
          topics: [
            "Module 1: Introduction aux concepts de base",
            "Module 2: Techniques avancées",
            "Module 3: Applications pratiques",
            "Module 4: Projets et études de cas",
          ],
          instructor: {
            name: "Formateur Expert",
            bio: "Expert dans ce domaine avec plus de 10 ans d'expérience dans l'industrie et l'enseignement. Certifié et reconnu par les plus grandes entreprises du secteur.",
            avatar:
              "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
          },
          image:
            "https://images.unsplash.com/photo-1498050108023-c5249f4df085?ixlib=rb-1.2.1&auto=format&fit=crop&w=700&q=80",
          updatedAt: new Date().toISOString(),
          objectives: [
            "Comprendre les concepts fondamentaux de la discipline",
            "Maîtriser les outils et technologies essentiels",
            "Développer des compétences pratiques à travers des projets réels",
            "Acquérir une expérience professionnelle valorisable sur le marché du travail",
          ],
          prerequisites: [
            "Connaissances de base en informatique",
            "Familiarité avec l'environnement de travail numérique",
            "Motivation et engagement pour l'apprentissage",
          ],
          targetAudience: [
            "Étudiants souhaitant acquérir des compétences professionnelles",
            "Professionnels en reconversion",
            "Employés cherchant à améliorer leurs compétences",
          ],
          testimonials: [
            {
              name: "Sophie Martin",
              role: "Développeuse Web",
              comment:
                "Cette formation a transformé ma carrière. Les compétences acquises m'ont permis de trouver un emploi dans une entreprise innovante.",
              avatar:
                "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
              rating: 5,
            },
            {
              name: "Thomas Dubois",
              role: "Chef de projet",
              comment:
                "Formation complète et bien structurée. Les projets pratiques sont particulièrement utiles pour consolider les connaissances.",
              avatar:
                "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
              rating: 4.5,
            },
          ],
          faq: [
            {
              question:
                "Combien de temps faut-il pour compléter la formation ?",
              answer:
                "La durée moyenne est de 3 mois à raison de 25 heures par semaine. Cependant, vous pouvez adapter votre rythme selon vos disponibilités.",
            },
            {
              question: "Y a-t-il un certificat à la fin de la formation ?",
              answer:
                "Oui, vous recevrez un certificat de réussite reconnu par l'industrie après avoir complété tous les modules et projets.",
            },
            {
              question:
                "Est-ce que je peux accéder au contenu après la fin de la formation ?",
              answer:
                "Oui, vous aurez un accès à vie au contenu de la formation, y compris aux mises à jour futures.",
            },
          ],
        };
        setCourse(dummyCourse);
      } finally {
        setLoading(false);
      }
    };

    loadCourse();
  }, [id, refreshModules]);

  const handleEnrollClick = async () => {
    const currentUser = auth.currentUser;

    if (!currentUser) {
      navigate("/login", {
        state: {
          returnPath: `/course/${id}`,
          message: "Please login to enroll in this course",
        },
      });
      return;
    }

    // Vérifier si l'utilisateur est déjà inscrit au cours
    try {
      // Vérifier dans plusieurs chemins possibles
      const paths = ["enrollments", "Inscriptions", "Elearning/Inscriptions"];

      let userAlreadyEnrolled = false;

      for (const path of paths) {
        const enrollmentsRef = ref(database, path);
        const snapshot = await get(enrollmentsRef);

        if (snapshot.exists()) {
          const enrollments = snapshot.val();
          const isEnrolled = Object.values(enrollments).some(
            (enrollment) =>
              enrollment.userId === currentUser.uid &&
              enrollment.courseId === course.id
          );

          if (isEnrolled) {
            userAlreadyEnrolled = true;
            break;
          }
        }
      }

      if (userAlreadyEnrolled) {
        setEnrollmentError("Vous êtes déjà inscrit à ce cours.");
        return;
      }
    } catch (error) {
      console.error("Error checking enrollment status:", error);
    }

    setShowEnrollPopup(true);
  };

  const handleConfirmEnrollment = async () => {
    const currentUser = auth.currentUser;

    if (!currentUser || !course) return;

    try {
      setEnrollmentLoading(true);

      // Préparer les données d'inscription avec des valeurs par défaut pour éviter les undefined
      const enrollmentData = {
        userId: currentUser.uid,
        userName: currentUser.displayName || "Unknown User",
        userEmail: currentUser.email || "",
        courseId: course.id,
        courseName: course.title || course.titre || `Cours ${course.id}`,
        enrolledAt: new Date().toISOString(),
      };

      // Vérifier que toutes les propriétés sont définies
      console.log("Enrollment data:", enrollmentData);

      // Enregistrer l'inscription dans Firebase - essayer plusieurs chemins
      try {
        // 1. Essayer d'abord dans /enrollments (chemin standard)
        const enrollmentsRef = ref(database, "enrollments");
        const newEnrollmentRef = push(enrollmentsRef);
        await set(newEnrollmentRef, enrollmentData);
        console.log("Enrollment saved to /enrollments");
      } catch (error) {
        console.error(
          "Error saving to /enrollments, trying alternative path:",
          error
        );

        // 2. Essayer dans /Inscriptions (chemin alternatif)
        try {
          const inscriptionsRef = ref(database, "Inscriptions");
          const newInscriptionRef = push(inscriptionsRef);
          await set(newInscriptionRef, enrollmentData);
          console.log("Enrollment saved to /Inscriptions");
        } catch (inscriptionError) {
          console.error(
            "Error saving to /Inscriptions, trying last resort path:",
            inscriptionError
          );

          // 3. Dernier recours: Elearning/Inscriptions
          const elearningInscriptionsRef = ref(
            database,
            "Elearning/Inscriptions"
          );
          const newElearningInscriptionRef = push(elearningInscriptionsRef);
          await set(newElearningInscriptionRef, enrollmentData);
          console.log("Enrollment saved to Elearning/Inscriptions");

          // 4. Initialiser la progression de l'étudiant pour ce cours
          const progressionRef = ref(
            database,
            `Elearning/Progression/${currentUser.uid}/${course.id}`
          );
          await set(progressionRef, {
            courseId: course.id,
            userId: currentUser.uid,
            startDate: new Date().toISOString(),
            progress: 0,
            completed: false,
            lastUpdated: new Date().toISOString(),
          });
          console.log("Progression initialized for the course");
        }
      }

      // Show success message
      setEnrollmentSuccess(true);

      // Close popup after 3 seconds on success
      setTimeout(() => {
        setShowEnrollPopup(false);
        setEnrollmentSuccess(false);
      }, 3000);
    } catch (error) {
      console.error("Error creating enrollment:", error);
    } finally {
      setEnrollmentLoading(false);
    }
  };

  const EnrollmentPopup = () => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">Confirm Enrollment</h3>
          <button
            onClick={() => setShowEnrollPopup(false)}
            className="p-1 rounded-full hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {enrollmentSuccess ? (
          <div className="text-center py-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-green-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                ></path>
              </svg>
            </div>
            <h4 className="text-lg font-medium mb-2">Enrollment Successful!</h4>
            <p className="text-gray-600">
              You have been enrolled in {course.title}
            </p>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <p className="text-gray-600 mb-4">You are about to enroll in:</p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium">{course?.title}</h4>
                <p className="text-gray-600 text-sm">
                  {course?.instructor?.name}
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowEnrollPopup(false)}
                className="flex-1 py-2 px-4 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmEnrollment}
                className="flex-1 py-2 px-4 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={enrollmentLoading}
              >
                {enrollmentLoading ? "Processing..." : "Confirm Enrollment"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary"></div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex flex-col">
        <div className="flex-1 flex flex-col items-center justify-center p-6">
          <h1 className="text-2xl font-bold mb-4">Cours non trouvé</h1>
          <p className="text-gray-600 mb-8">
            Le cours que vous recherchez n'existe pas.
          </p>
          <button
            onClick={() => navigate("/")}
            className="primary-btn flex items-center gap-2"
          >
            <ArrowLeft size={16} />
            Retour à l'accueil
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1">
        <section className="bg-[#f9f9f9] py-14 md:py-24">
          <div className="container">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-4xl mx-auto"
            >
              {/* Course Header */}
              <div className="mb-8">
                <span className="inline-block bg-primary/10 text-secondary px-4 py-1 rounded-full text-sm font-medium mb-4">
                  {course.category || "Formation"}
                </span>
                <h1 className="text-3xl font-bold mb-4">{course.title}</h1>
                <div className="flex items-center gap-4 text-gray-600">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{course.duration || "300 heures"}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Library className="w-4 h-4" />
                    <span>{course.lessons || 10} Lessons</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    <span>{course.students || 20} Students</span>
                  </div>
                </div>
              </div>

              {/* Course Image */}
              <img
                src={
                  course.image ||
                  "https://images.unsplash.com/photo-1498050108023-c5249f4df085?ixlib=rb-1.2.1&auto=format&fit=crop&w=700&q=80"
                }
                alt={course.title}
                className="w-full h-[400px] object-cover rounded-xl mb-8"
                onError={(e) => {
                  e.target.src =
                    "https://images.unsplash.com/photo-1498050108023-c5249f4df085?ixlib=rb-1.2.1&auto=format&fit=crop&w=700&q=80";
                }}
              />

              <div className="grid md:grid-cols-3 gap-8">
                {/* Course Main Content */}
                <div className="md:col-span-2">
                  {/* Course Description */}
                  <div className="bg-white p-6 rounded-xl shadow-sm mb-8">
                    <h2 className="text-xl font-semibold mb-4">
                      Description du cours
                    </h2>
                    <p className="text-gray-600">{course.description}</p>
                  </div>

                  {/* Module Content (when a module is selected) */}
                  {showModuleContent && activeModule && (
                    <div className="mb-8">
                      <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold">
                          Contenu du module
                        </h2>
                        <button
                          onClick={() => {
                            setShowModuleContent(false);
                            setActiveModule(null);
                          }}
                          className="text-gray-600 hover:text-gray-800 flex items-center gap-1 text-sm"
                        >
                          <ChevronLeft size={16} />
                          Retour aux modules
                        </button>
                      </div>
                      <ModuleContent
                        module={activeModule}
                        onComplete={() => {
                          // Mettre à jour le statut du module
                          console.log(
                            `Module ${activeModule.id} marked as completed`
                          );
                          // Recharger le cours pour mettre à jour les modules
                          fetchCourseById(id).then((updatedCourse) => {
                            if (updatedCourse) {
                              setCourse(updatedCourse);
                            }
                          });
                          setShowModuleContent(false);
                          setActiveModule(null);
                        }}
                      />
                    </div>
                  )}

                  {/* Course Modules and Evaluations (when no module is selected) */}
                  {!showModuleContent &&
                    (course.modules && course.modules.length > 0 ? (
                      <CourseModules
                        course={course}
                        onModuleSelect={(module) => {
                          console.log("Module selected:", module);
                          setActiveModule(module);
                          setShowModuleContent(true);
                        }}
                      />
                    ) : (
                      <div className="bg-white p-6 rounded-xl shadow-sm mb-8">
                        <h2 className="text-xl font-semibold mb-4">
                          Modules du cours
                        </h2>
                        <div className="text-center py-8 bg-gray-50 rounded-lg">
                          <p className="text-gray-600 mb-4">
                            Aucun module n&apos;a été ajouté à ce cours.
                          </p>
                          <p className="text-sm text-gray-500">
                            Ce cours ne contient pas encore de modules.
                          </p>
                        </div>
                      </div>
                    ))}

                  {/* Topics */}
                  <div className="bg-white p-6 rounded-xl shadow-sm mb-8">
                    <h2 className="text-xl font-semibold mb-4">
                      Ce que vous apprendrez
                    </h2>
                    <div className="grid grid-cols-2 gap-3">
                      {course.topics?.map((topic, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-secondary rounded-full"></div>
                          <span>{topic}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Instructor */}
                  <div className="bg-white p-6 rounded-xl shadow-sm mb-8">
                    <h2 className="text-xl font-semibold mb-4">Formateur</h2>
                    <div className="flex items-center gap-4">
                      <img
                        src={
                          course.instructor?.avatar ||
                          "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                        }
                        alt={course.instructor?.name || "Instructor"}
                        className="w-16 h-16 rounded-full object-cover"
                        onError={(e) => {
                          e.target.src =
                            "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80";
                        }}
                      />
                      <div>
                        <h3 className="font-semibold">
                          {course.instructor?.name || "Instructor"}
                        </h3>
                        <p className="text-gray-600">
                          {course.instructor?.bio ||
                            "Expert instructor with years of experience"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Objectifs du cours */}
                  {course.objectives && course.objectives.length > 0 && (
                    <div className="bg-white p-6 rounded-xl shadow-sm mb-8">
                      <h2 className="text-xl font-semibold mb-4">
                        Objectifs du cours
                      </h2>
                      <ul className="space-y-2">
                        {course.objectives.map((objective, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <div className="text-secondary mt-1">
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
                            </div>
                            <span>{objective}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Prérequis */}
                  {course.prerequisites && course.prerequisites.length > 0 && (
                    <div className="bg-white p-6 rounded-xl shadow-sm mb-8">
                      <h2 className="text-xl font-semibold mb-4">Prérequis</h2>
                      <ul className="space-y-2">
                        {course.prerequisites.map((prerequisite, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <div className="text-primary mt-1">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </div>
                            <span>{prerequisite}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Public cible */}
                  {course.targetAudience &&
                    course.targetAudience.length > 0 && (
                      <div className="bg-white p-6 rounded-xl shadow-sm mb-8">
                        <h2 className="text-xl font-semibold mb-4">
                          Public cible
                        </h2>
                        <ul className="space-y-2">
                          {course.targetAudience.map((audience, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <div className="text-secondary mt-1">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-5 w-5"
                                  viewBox="0 0 20 20"
                                  fill="currentColor"
                                >
                                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                                </svg>
                              </div>
                              <span>{audience}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                  {/* Témoignages d'étudiants */}
                  {course.testimonials && course.testimonials.length > 0 && (
                    <div className="bg-white p-6 rounded-xl shadow-sm mb-8">
                      <h2 className="text-xl font-semibold mb-4">
                        Témoignages d'étudiants
                      </h2>
                      <div className="space-y-6">
                        {course.testimonials.map((testimonial, index) => (
                          <div
                            key={index}
                            className="border-l-4 border-secondary pl-4 py-2"
                          >
                            <p className="text-gray-600 italic mb-3">
                              "{testimonial.comment}"
                            </p>
                            <div className="flex items-center gap-3">
                              <img
                                src={testimonial.avatar}
                                alt={testimonial.name}
                                className="w-10 h-10 rounded-full object-cover"
                                onError={(e) => {
                                  e.target.src =
                                    "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80";
                                }}
                              />
                              <div>
                                <h4 className="font-medium">
                                  {testimonial.name}
                                </h4>
                                <p className="text-sm text-gray-500">
                                  {testimonial.role}
                                </p>
                              </div>
                              <div className="ml-auto flex text-primary">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`w-4 h-4 ${
                                      i < Math.round(testimonial.rating)
                                        ? "fill-current"
                                        : ""
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* FAQ */}
                  {course.faq && course.faq.length > 0 && (
                    <div className="bg-white p-6 rounded-xl shadow-sm mb-8">
                      <h2 className="text-xl font-semibold mb-4">
                        Questions fréquentes
                      </h2>
                      <div className="space-y-4">
                        {course.faq.map((item, index) => (
                          <div
                            key={index}
                            className="border-b pb-4 last:border-b-0 last:pb-0"
                          >
                            <h3 className="font-medium text-lg mb-2">
                              {item.question}
                            </h3>
                            <p className="text-gray-600">{item.answer}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Course Sidebar */}
                <div>
                  <div className="bg-white p-6 rounded-xl shadow-lg sticky top-4">
                    <div className="mb-6">
                      <h3 className="text-3xl font-bold mb-4">
                        ${(course.price || 49.99).toFixed(2)}
                      </h3>
                      <button
                        className="w-full primary-btn mb-4"
                        onClick={handleEnrollClick}
                      >
                        Enroll Now
                      </button>
                      {enrollmentError && (
                        <div
                          className="error-message"
                          style={{ color: "red", margin: "10px 0" }}
                        >
                          {enrollmentError}
                        </div>
                      )}
                    </div>

                    <div className="space-y-4 border-t pt-4">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Level</span>
                        <span className="font-medium">
                          {course.level || "Intermédiaire"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Rating</span>
                        <div className="flex items-center gap-1">
                          <div className="flex text-primary">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${
                                  i < Math.round(course.rating || 4.5)
                                    ? "fill-current"
                                    : ""
                                }`}
                              />
                            ))}
                          </div>
                          <span>({course.totalRatings || 10})</span>
                        </div>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Last Updated</span>
                        <span className="font-medium">
                          {course.updatedAt
                            ? new Date(course.updatedAt).toLocaleDateString()
                            : new Date().toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      {/* Enrollment Popup */}
      {showEnrollPopup && <EnrollmentPopup />}
    </div>
  );
};

export default CourseDetails;
