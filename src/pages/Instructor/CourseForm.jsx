import React, { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import {
  fetchCourseById,
  fetchSpecialitesFromDatabase,
  fetchDisciplinesFromDatabase,
} from "../../utils/firebaseUtils";
import { database } from "../../../firebaseConfig";
import { ref, set } from "firebase/database";
import { useAuth } from "../../hooks/useAuth";
import ModuleManagerCreation from "../../components/CourseModules/ModuleManagerCreation";

// Fonction pour générer un ID unique
const generateUniqueId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

const CourseForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, userRole, loading } = useAuth();
  const isEditMode = !!id;

  const [loadingData, setLoadingData] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [specialites, setSpecialites] = useState([]);
  const [disciplines, setDisciplines] = useState([]);
  const [filteredDisciplines, setFilteredDisciplines] = useState([]);

  const [courseData, setCourseData] = useState({
    title: "",
    description: "",
    image: "",
    level: "Débutant",
    duration: "",
    price: 0,
    specialiteId: "",
    disciplineId: "",
    instructorId: "",
  });

  // État pour les modules du cours
  const [courseModules, setCourseModules] = useState([]);

  // État pour suivre l'onglet actif
  const [activeTab, setActiveTab] = useState("info"); // "info" ou "modules"

  useEffect(() => {
    const loadData = async () => {
      try {
        // Attendre que l'authentification soit chargée
        if (loading) return;

        // Vérifier si l'utilisateur est connecté
        if (!user) {
          setError("Vous devez être connecté pour accéder à cette page");
          setTimeout(() => {
            navigate("/login");
          }, 2000);
          return;
        }

        // Vérifier si l'utilisateur est un instructeur ou un admin
        
        const isInstructor =
          userRole === "instructor" ||
          userRole === "formateur" ||
          user?.userType === "formateur" ||
          user?.role === "instructor" ||
          user?.role === "formateur" ||
          user?.normalizedRole === "instructor";

        const isAdmin =
          userRole === "admin" ||
          userRole === "administrateur" ||
          user?.userType === "administrateur" ||
          user?.role === "admin" ||
          user?.role === "administrateur" ||
          user?.normalizedRole === "admin";

        if (!isInstructor && !isAdmin) {
          setError(
            "Vous n'avez pas les droits pour créer ou modifier un cours"
          );
          setTimeout(() => {
            if (isAdmin) {
              navigate("/admin/dashboard");
            } else if (isInstructor) {
              navigate("/instructor/dashboard");
            } else {
              navigate("/student/dashboard");
            }
          }, 2000);
          return;
        }

        setLoadingData(true);

        // Charger les spécialités
        const specialitesData = await fetchSpecialitesFromDatabase();
        setSpecialites(specialitesData);

        // Charger les disciplines
        const disciplinesData = await fetchDisciplinesFromDatabase();
        setDisciplines(disciplinesData);

        // Si on est en mode édition, charger les données du cours
        if (isEditMode) {
          const course = await fetchCourseById(id);
          if (course) {
            // Vérifier si l'utilisateur est l'instructeur du cours ou un admin
            if (course.instructorId !== user.uid && !isAdmin) {
              setError("Vous n'avez pas les droits pour modifier ce cours");
              setTimeout(() => {
                if (isAdmin) {
                  navigate("/admin/dashboard");
                } else if (isInstructor) {
                  navigate("/instructor/dashboard");
                } else {
                  navigate("/student/dashboard");
                }
              }, 2000);
              return;
            }

            setCourseData({
              title: course.title || course.titre || "",
              description: course.description || "",
              image: course.image || "",
              level: course.level || "Débutant",
              duration: course.duration || course.duree || "",
              price: course.price || 0,
              specialiteId: course.specialiteId || "",
              disciplineId: course.disciplineId || "",
              instructorId: course.instructorId || user.uid || "",
            });

            // Filtrer les disciplines en fonction de la spécialité sélectionnée
            if (course.specialiteId) {
              const filtered = disciplinesData.filter(
                (discipline) => discipline.specialiteId === course.specialiteId
              );
              setFilteredDisciplines(filtered);
            }

            // Charger les modules du cours s'ils existent
            if (course.modules) {
              // Convertir les modules de format objet à tableau
              const modulesArray = Object.entries(course.modules).map(
                ([moduleId, moduleData]) => {
                  // Convertir les évaluations de format objet à tableau si elles existent
                  let evaluations = {};
                  if (moduleData.evaluations) {
                    evaluations = moduleData.evaluations;
                  }

                  return {
                    ...moduleData,
                    id: moduleId,
                    evaluations: evaluations,
                  };
                }
              );

              // Trier les modules par ordre
              const sortedModules = modulesArray.sort(
                (a, b) => (a.order || 0) - (b.order || 0)
              );
              setCourseModules(sortedModules);
            }
          } else {
            setError("Cours non trouvé");
          }
        } else {
          // En mode création, définir l'instructeur actuel comme instructeur par défaut
          setCourseData((prev) => ({
            ...prev,
            instructorId: user.uid || "",
          }));
        }
      } catch (error) {
        
        setError("Erreur lors du chargement des données");
      } finally {
        setLoadingData(false);
      }
    };

    loadData();
  }, [id, isEditMode, navigate, user, userRole, loading]);

  // Effet pour filtrer les disciplines lorsque la spécialité change
  useEffect(() => {
    if (courseData.specialiteId) {
      const filtered = disciplines.filter(
        (discipline) => discipline.specialiteId === courseData.specialiteId
      );
      setFilteredDisciplines(filtered);
      if (
        courseData.disciplineId &&
        !filtered.some((d) => d.id === courseData.disciplineId)
      ) {
        setCourseData((prev) => ({ ...prev, disciplineId: "" }));
      }
    } else {
      setFilteredDisciplines([]);
      setCourseData((prev) => ({ ...prev, disciplineId: "" }));
    }
  }, [courseData.specialiteId, disciplines, courseData.disciplineId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCourseData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      // Validation
      if (!courseData.title || courseData.title.trim().length < 5) {
        throw new Error(
          "Le titre est obligatoire et doit contenir au moins 5 caractères"
        );
      }
      if (
        !courseData.description ||
        courseData.description.trim().length < 10
      ) {
        throw new Error(
          "La description est obligatoire et doit contenir au moins 10 caractères"
        );
      }
      if (!courseData.duration) {
        throw new Error("La durée estimée est obligatoire");
      }
      if (courseData.price < 0) {
        throw new Error("Le prix ne peut pas être négatif");
      }
      if (!courseData.specialiteId) {
        throw new Error("Veuillez sélectionner une spécialité");
      }
      if (!courseData.disciplineId) {
        throw new Error("Veuillez sélectionner une discipline");
      }

      const timestamp = new Date().toISOString();
      const courseId = isEditMode ? id : generateUniqueId();
      

      // Préparer les modules
      const modulesData = {};
      if (courseModules.length > 0) {
        courseModules.forEach((module, index) => {
          // Générer un ID pour le module s'il n'en a pas
          const moduleId = module.id || `m${Date.now()}_${index}`;

          // Préparer les évaluations si présentes
          const evaluationsData = {};
          if (
            module.evaluations &&
            Object.keys(module.evaluations).length > 0
          ) {
            Object.entries(module.evaluations).forEach(
              ([tempEvalId, evaluation]) => {
                // Créer un ID permanent pour l'évaluation
                const evalId = tempEvalId.startsWith("temp_")
                  ? `e${Date.now()}_${Math.random().toString(36).substring(2)}`
                  : tempEvalId;

                // S'assurer qu'aucune valeur n'est undefined
                const cleanEvaluation = {};
                Object.entries(evaluation).forEach(([key, value]) => {
                  cleanEvaluation[key] = value === undefined ? null : value;
                });

                evaluationsData[evalId] = {
                  ...cleanEvaluation,
                  id: evalId,
                  moduleId: moduleId,
                  date: cleanEvaluation.date || new Date().toISOString(),
                };
              }
            );
          }

          // Préparer les ressources si présentes
          let resourcesData = [];
          if (module.resources && module.resources.length > 0) {
            resourcesData = module.resources.map((resource) => {
              // S'assurer qu'aucune valeur n'est undefined
              const cleanResource = {};
              Object.entries(resource).forEach(([key, value]) => {
                cleanResource[key] = value === undefined ? null : value;
              });

              return {
                ...cleanResource,
                id: resource.id,
                moduleId: moduleId,
                createdAt: resource.createdAt || new Date().toISOString(),
              };
            });
          }

          // Nettoyer le module de toute valeur undefined
          const cleanModule = {};
          Object.entries(module).forEach(([key, value]) => {
            // Ignorer les propriétés evaluations et resources car on les traite séparément
            if (key !== "evaluations" && key !== "resources") {
              cleanModule[key] = value === undefined ? null : value;
            }
          });

          // Ajouter le module avec ses évaluations et ressources
          modulesData[moduleId] = {
            ...cleanModule,
            id: moduleId,
            courseId: courseId,
            evaluations: evaluationsData,
            resources: resourcesData,
            createdAt: cleanModule.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            status: cleanModule.status || "active",
          };
        });
      }

      // Nettoyer les données du cours de toute valeur undefined
      const cleanCourseData = {};
      Object.entries(courseData).forEach(([key, value]) => {
        cleanCourseData[key] = value === undefined ? null : value;
      });

      const courseToSave = {
        ...cleanCourseData,
        id: courseId,
        updatedAt: timestamp,
        createdAt: isEditMode
          ? cleanCourseData.createdAt || timestamp
          : timestamp,
        modules: modulesData,
      };

      // Sauvegarder le cours dans la base de données
      
      const courseRef = ref(database, `elearning/courses/${courseId}`);
      await set(courseRef, courseToSave);
      

      // Ajouter une référence du cours dans la liste des cours de l'instructeur
      const instructorCoursesRef = ref(
        database,
        `elearning/users/${courseData.instructorId}/courses/${courseId}`
      );
      await set(instructorCoursesRef, {
        id: courseId,
        title: courseData.title,
        createdAt: timestamp,
        updatedAt: timestamp,
        role: "instructor",
      });

      // Ajouter le cours à la liste des cours par spécialité et discipline
      if (courseData.specialiteId) {
        const specialiteCoursesRef = ref(
          database,
          `elearning/specialites/${courseData.specialiteId}/courses/${courseId}`
        );
        await set(specialiteCoursesRef, {
          id: courseId,
          title: courseData.title,
          updatedAt: timestamp,
        });
      }

      if (courseData.disciplineId) {
        const disciplineCoursesRef = ref(
          database,
          `elearning/disciplines/${courseData.disciplineId}/courses/${courseId}`
        );
        await set(disciplineCoursesRef, {
          id: courseId,
          title: courseData.title,
          updatedAt: timestamp,
        });
      }

      setSuccess(
        isEditMode ? "Cours mis à jour avec succès" : "Cours créé avec succès"
      );

      // Rediriger vers la page des cours de l'instructeur après un court délai
      setTimeout(() => {
        const isAdmin = userRole === "admin";
        if (isAdmin) {
          navigate(`/admin/courses`);
        } else {
          navigate(`/instructor/courses`);
        }
      }, 2000);
    } catch (error) {
      
      setError(`Erreur: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading || loadingData) {
    return (
      <div className="container py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">
        {isEditMode ? "Modifier le cours" : "Créer un nouveau cours"}
      </h1>

      {/* Onglets */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab("info")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "info"
                ? "border-secondary text-secondary"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Informations générales
          </button>
          <button
            onClick={() => setActiveTab("modules")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "modules"
                ? "border-secondary text-secondary"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Modules et contenu
          </button>
        </nav>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 p-4 rounded-lg mb-6">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 p-4 rounded-lg mb-6">
          <p className="text-green-600">{success}</p>
        </div>
      )}

      {activeTab === "info" && (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Titre du cours *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={courseData.title}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-secondary focus:border-secondary"
              placeholder="Ex: Introduction à React"
            />
          </div>

          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Description *
            </label>
            <textarea
              id="description"
              name="description"
              rows={4}
              value={courseData.description}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-secondary focus:border-secondary"
              placeholder="Décrivez le contenu et les objectifs du cours"
            />
            <div className="mt-2 text-sm text-blue-700">
              <p className="font-medium">
                Conseils pour une bonne description :
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Expliquez clairement les objectifs d'apprentissage</li>
                <li>Mentionnez les prérequis nécessaires</li>
                <li>Décrivez à qui s'adresse ce cours</li>
                <li>Précisez les compétences que les étudiants acquerront</li>
              </ul>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="level"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Niveau *
              </label>
              <select
                id="level"
                name="level"
                value={courseData.level}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-secondary focus:border-secondary"
              >
                <option value="Débutant">Débutant</option>
                <option value="Intermédiaire">Intermédiaire</option>
                <option value="Avancé">Avancé</option>
              </select>
            </div>
            <div>
              <label
                htmlFor="duration"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Durée estimée *
              </label>
              <input
                type="text"
                id="duration"
                name="duration"
                value={courseData.duration}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-secondary focus:border-secondary"
                placeholder="Ex: 10 heures, 3 semaines"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="price"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Prix (0 pour gratuit) *
              </label>
              <input
                type="number"
                id="price"
                name="price"
                value={courseData.price}
                onChange={handleChange}
                min="0"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-secondary focus:border-secondary"
              />
            </div>
            <div>
              <label
                htmlFor="image"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                URL de l'image (optionnel)
              </label>
              <input
                type="url"
                id="image"
                name="image"
                value={courseData.image}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-secondary focus:border-secondary"
                placeholder="https://example.com/image.jpg"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="specialiteId"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Spécialité *
              </label>
              <select
                id="specialiteId"
                name="specialiteId"
                value={courseData.specialiteId}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-secondary focus:border-secondary"
              >
                <option value="">-- Sélectionnez une spécialité --</option>
                {specialites.map((spec) => (
                  <option key={spec.id} value={spec.id}>
                    {spec.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                htmlFor="disciplineId"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Discipline *
              </label>
              <select
                id="disciplineId"
                name="disciplineId"
                value={courseData.disciplineId}
                onChange={handleChange}
                required
                disabled={!courseData.specialiteId}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-secondary focus:border-secondary disabled:bg-gray-100"
              >
                <option value="">-- Sélectionnez une discipline --</option>
                {filteredDisciplines.map((disc) => (
                  <option key={disc.id} value={disc.id}>
                    {disc.name}
                  </option>
                ))}
              </select>
              {!courseData.specialiteId && (
                <p className="text-sm text-gray-500 mt-1">
                  Veuillez d'abord sélectionner une spécialité
                </p>
              )}
            </div>
          </div>

          <div className="mt-2 text-sm text-blue-700">
            <ul className="list-disc pl-5 space-y-1">
              <li>
                Tous les champs marqués d'un astérisque (*) sont obligatoires.
              </li>
              <li>
                Vous devez sélectionner une spécialité avant de pouvoir
                sélectionner une discipline.
              </li>
            </ul>
          </div>

          <div className="flex justify-end space-x-4 pt-4">
            <Link
              to="/instructor/courses"
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Annuler
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-secondary hover:bg-secondary/90 disabled:opacity-50"
            >
              {saving
                ? "Sauvegarde en cours..."
                : isEditMode
                ? "Mettre à jour le cours"
                : "Créer le cours"}
            </button>
          </div>
        </form>
      )}

      {activeTab === "modules" && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Gestion des modules</h2>
          <p className="mb-4 text-sm text-gray-600">
            Ajoutez, modifiez et organisez les modules de votre cours. Chaque
            module peut contenir des ressources (vidéos, documents, etc.) et des
            évaluations.
          </p>

          <ModuleManagerCreation
            modules={courseModules}
            setModules={setCourseModules}
            courseId={id}
          />

          <div className="flex justify-end space-x-4 mt-8">
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-secondary hover:bg-secondary/90 disabled:opacity-50"
            >
              {saving
                ? "Sauvegarde en cours..."
                : "Sauvegarder le cours et les modules"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseForm;
