import React, { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import {
  fetchCourseById,
  fetchSpecialitesFromDatabase,
  fetchDisciplinesFromDatabase,
  fetchInstructorById,
  fetchCompleteUserInfo,
} from "../../utils/firebaseUtils";
import { database } from "../../../firebaseConfig";
import { ref, set } from "firebase/database";
import { getAuth } from "firebase/auth";
// Fonction pour générer un ID unique sans dépendre de la bibliothèque uuid
const generateUniqueId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

const CourseForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const auth = getAuth();
  const isEditMode = !!id;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [specialites, setSpecialites] = useState([]);
  const [disciplines, setDisciplines] = useState([]);
  const [filteredDisciplines, setFilteredDisciplines] = useState([]);
  const [userInfo, setUserInfo] = useState(null);

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

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        // Vérifier si l'utilisateur est connecté
        if (!auth.currentUser) {
          setError("Vous devez être connecté pour accéder à cette page");
          setTimeout(() => {
            navigate("/login");
          }, 2000);
          return;
        }

        // Récupérer les informations de l'utilisateur
        const userInfoData = await fetchCompleteUserInfo(auth.currentUser.uid);
        setUserInfo(userInfoData);

        // Vérifier si l'utilisateur est un instructeur ou un admin
        const isInstructor =
          userInfoData?.role === "instructor" ||
          userInfoData?.role === "formateur" ||
          userInfoData?.userType === "formateur";

        const isAdmin =
          userInfoData?.role === "admin" ||
          userInfoData?.userType === "administrateur";

        if (!isInstructor && !isAdmin) {
          setError(
            "Vous n'avez pas les droits pour créer ou modifier un cours"
          );
          setTimeout(() => {
            navigate("/dashboard");
          }, 2000);
          return;
        }

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
            const isAdmin =
              userInfoData?.role === "admin" ||
              userInfoData?.userType === "administrateur";

            if (course.instructorId !== auth.currentUser.uid && !isAdmin) {
              setError("Vous n'avez pas les droits pour modifier ce cours");
              setTimeout(() => {
                navigate("/dashboard");
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
              instructorId: course.instructorId || auth.currentUser?.uid || "",
            });

            // Filtrer les disciplines en fonction de la spécialité sélectionnée
            if (course.specialiteId) {
              const filtered = disciplinesData.filter(
                (discipline) => discipline.specialiteId === course.specialiteId
              );
              setFilteredDisciplines(filtered);
            }
          } else {
            setError("Cours non trouvé");
          }
        } else {
          // En mode création, définir l'instructeur actuel comme instructeur par défaut
          setCourseData((prev) => ({
            ...prev,
            instructorId: auth.currentUser?.uid || "",
          }));
        }
      } catch (error) {
        console.error("Error loading data:", error);
        setError("Erreur lors du chargement des données");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id, isEditMode, auth.currentUser, navigate]);

  // Mettre à jour les disciplines filtrées lorsque la spécialité change
  useEffect(() => {
    if (courseData.specialiteId) {
      const filtered = disciplines.filter(
        (discipline) => discipline.specialiteId === courseData.specialiteId
      );
      setFilteredDisciplines(filtered);

      // Réinitialiser la discipline si elle n'appartient pas à la spécialité sélectionnée
      if (courseData.disciplineId) {
        const disciplineExists = filtered.some(
          (d) => d.id === courseData.disciplineId
        );
        if (!disciplineExists) {
          setCourseData((prev) => ({ ...prev, disciplineId: "" }));
        }
      }
    } else {
      setFilteredDisciplines([]);
      setCourseData((prev) => ({ ...prev, disciplineId: "" }));
    }
  }, [courseData.specialiteId, disciplines]);

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
      // Valider les données
      if (!courseData.title || courseData.title.trim().length < 5) {
        throw new Error(
          "Le titre est obligatoire et doit contenir au moins 5 caractères"
        );
      }

      if (
        !courseData.description ||
        courseData.description.trim().length < 20
      ) {
        throw new Error(
          "La description est obligatoire et doit contenir au moins 20 caractères"
        );
      }

      if (!courseData.specialiteId) {
        throw new Error("La spécialité est obligatoire");
      }

      if (!courseData.disciplineId) {
        throw new Error("La discipline est obligatoire");
      }

      if (!courseData.level) {
        throw new Error("Le niveau est obligatoire");
      }

      if (
        !courseData.duration ||
        isNaN(courseData.duration) ||
        parseInt(courseData.duration) <= 0
      ) {
        throw new Error("La durée doit être un nombre positif");
      }

      // Préparer les données du cours
      const courseId = isEditMode ? id : generateUniqueId();
      const timestamp = new Date().toISOString();

      const courseToSave = {
        ...courseData,
        id: courseId,
        updatedAt: timestamp,
        createdAt: isEditMode ? undefined : timestamp,
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
        navigate(`/instructor/courses`);
      }, 2000);
    } catch (error) {
      console.error("Error saving course:", error);
      setError(`Erreur: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-4">
          <Link
            to="/dashboard"
            className="bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 transition-colors duration-300 flex items-center"
            title="Retour au tableau de bord"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
            </svg>
          </Link>
          <Link
            to="/instructor/courses"
            className="bg-green-600 text-white p-2 rounded-md hover:bg-green-700 transition-colors duration-300 flex items-center"
            title="Mes cours"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
            </svg>
          </Link>
          <h1 className="text-3xl font-bold">
            {isEditMode ? "Modifier le cours" : "Créer un nouveau cours"}
          </h1>
        </div>
        <div className="text-sm text-gray-600">
          Connecté en tant que:{" "}
          <span className="font-semibold">
            {userInfo?.firstName || userInfo?.prenom || ""}{" "}
            {userInfo?.lastName || userInfo?.nom || ""}
          </span>
          <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
            {userInfo?.role === "instructor" ||
            userInfo?.userType === "formateur"
              ? "Formateur"
              : "Administrateur"}
          </span>
        </div>
      </div>

      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-blue-500"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">
              Informations importantes
            </h3>
            <div className="mt-2 text-sm text-blue-700">
              <ul className="list-disc pl-5 space-y-1">
                <li>
                  Tous les champs marqués d'un astérisque (*) sont obligatoires.
                </li>
                <li>
                  Vous devez sélectionner une spécialité avant de pouvoir
                  choisir une discipline.
                </li>
                <li>
                  Une fois le cours créé, vous pourrez ajouter des modules et
                  des ressources.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

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

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-lg shadow-md p-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Titre*
            </label>
            <input
              type="text"
              name="title"
              value={courseData.title}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Titre du cours"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Image (URL)
            </label>
            <input
              type="url"
              name="image"
              value={courseData.image}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="URL de l'image"
            />
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Description du cours*
          </label>
          <div className="mb-2">
            <textarea
              name="description"
              value={courseData.description}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Décrivez votre cours en détail. Incluez les objectifs d'apprentissage, les prérequis et ce que les étudiants vont apprendre."
              rows="6"
              required
            />
          </div>
          <div className="bg-gray-50 p-3 rounded-md text-sm text-gray-600">
            <p className="font-medium mb-1">
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Niveau
            </label>
            <select
              name="level"
              value={courseData.level}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            >
              <option value="Débutant">Débutant</option>
              <option value="Intermédiaire">Intermédiaire</option>
              <option value="Avancé">Avancé</option>
            </select>
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Durée (heures)
            </label>
            <input
              type="number"
              name="duration"
              value={courseData.duration}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Durée en heures"
              min="1"
            />
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Prix (€)
            </label>
            <input
              type="number"
              name="price"
              value={courseData.price}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Prix"
              min="0"
              step="0.01"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Spécialité*
            </label>
            <select
              name="specialiteId"
              value={courseData.specialiteId}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            >
              <option value="">Sélectionner une spécialité</option>
              {specialites.map((specialite) => (
                <option key={specialite.id} value={specialite.id}>
                  {specialite.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Discipline*
            </label>
            <select
              name="disciplineId"
              value={courseData.disciplineId}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              disabled={!courseData.specialiteId}
              required
            >
              <option value="">Sélectionner une discipline</option>
              {filteredDisciplines.map((discipline) => (
                <option key={discipline.id} value={discipline.id}>
                  {discipline.name}
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

        <div className="border-t border-gray-200 mt-8 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-sm text-gray-600 mb-4 md:mb-0">
              <span className="text-red-500">*</span> Champs obligatoires
            </div>

            <div className="flex">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="bg-gray-300 text-gray-800 px-4 py-2 rounded-md mr-2 hover:bg-gray-400 transition-colors duration-300 flex items-center"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-1"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                    clipRule="evenodd"
                  />
                </svg>
                Annuler
              </button>

              <button
                type="submit"
                className="bg-secondary text-white px-6 py-2 rounded-md hover:bg-secondary/90 transition-colors duration-300 flex items-center"
                disabled={saving}
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Enregistrement...
                  </>
                ) : (
                  <>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-1"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {isEditMode ? "Mettre à jour" : "Créer le cours"}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CourseForm;
