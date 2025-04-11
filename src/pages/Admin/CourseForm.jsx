import { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import {
  fetchCourseById,
  fetchSpecialitesFromDatabase,
  fetchDisciplinesFromDatabase,
  fetchFormateursFromDatabase,
} from "../../utils/firebaseUtils";
import { database } from "../../../firebaseConfig";
import { ref, set } from "firebase/database";
import { useAuth } from "../../hooks/useAuth";
import ModuleManagerCreation from "../../components/CourseModules/ModuleManagerCreation";
import LoadingSpinner from "../../components/Common/LoadingSpinner";
import CourseFormFields from "../../components/Course/CourseFormFields";
import ActionButton from "../../components/Common/ActionButton";
import { MdSave, MdCancel, MdArrowBack } from "react-icons/md";

// Fonction pour générer un ID unique sans dépendre de la bibliothèque uuid
const generateUniqueId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

const CourseForm = () => {
  const { id: courseIdParam } = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const isEditMode = !!courseIdParam;

  const [loadingData, setLoadingData] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [permissionError, setPermissionError] = useState("");
  const [success, setSuccess] = useState("");
  const [specialites, setSpecialites] = useState([]);
  const [disciplines, setDisciplines] = useState([]);
  const [filteredDisciplines, setFilteredDisciplines] = useState([]);
  const [allInstructors, setAllInstructors] = useState([]);

  const [courseData, setCourseData] = useState({
    title: "",
    description: "",
    image: "",
    level: "Débutant",
    duration: "",
    price: undefined,
    specialiteId: "",
    disciplineId: "",
    instructorId: "",
  });

  const [courseModules, setCourseModules] = useState([]);
  const [activeTab, setActiveTab] = useState("info");

  const loadInitialData = useCallback(async () => {
    if (authLoading || !user) return;

    try {
      setLoadingData(true);
      setError("");
      setPermissionError("");

      const [specialitesData, disciplinesData, instructorsData] = await Promise.all([
        fetchSpecialitesFromDatabase(),
        fetchDisciplinesFromDatabase(),
        fetchFormateursFromDatabase(),
      ]);
      setSpecialites(specialitesData);
      setDisciplines(disciplinesData);
      setAllInstructors(instructorsData);

      if (isEditMode) {
        const course = await fetchCourseById(courseIdParam);
        if (course) {
          if (user.normalizedRole !== 'admin') {
            if (course.instructorId !== user.uid) {
              setPermissionError("Accès refusé.");
              return;
            }
          }

          setCourseData({
            title: course.title || "",
            description: course.description || "",
            image: course.image || "",
            level: course.level || "Débutant",
            duration: course.duration || "",
            price: course.price === undefined ? '' : course.price,
            specialiteId: course.specialiteId || "",
            disciplineId: course.disciplineId || "",
            instructorId: course.instructorId || "",
          });

          if (course.modules) {
            const modulesArray = Object.entries(course.modules).map(
              ([moduleId, moduleData]) => ({
                ...moduleData,
                id: moduleId,
                evaluations: moduleData.evaluations || {},
              })
            );
            const sortedModules = modulesArray.sort(
              (a, b) => (a.order || 0) - (b.order || 0)
            );
            setCourseModules(sortedModules);
          }

          if (course.specialiteId) {
            const filtered = disciplinesData.filter(
              (discipline) => discipline.specialiteId === course.specialiteId
            );
            setFilteredDisciplines(filtered);
          }
        } else {
          setError("Cours non trouvé.");
        }
      } else {
        // Create Mode: Set default instructor if needed, or leave empty for selection
      }
    } catch (err) {
      console.error("Error loading form data:", err);
      setError("Erreur lors du chargement des données.");
    } finally {
      setLoadingData(false);
    }
  }, [courseIdParam, isEditMode, user, authLoading]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

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
  }, [courseData.specialiteId, courseData.disciplineId, disciplines]);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    const val = type === 'number' ? (value === '' ? undefined : parseFloat(value)) : value;
    setCourseData((prev) => ({ ...prev, [name]: val }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user || user.normalizedRole !== 'admin') {
      setError("Permission refusée.");
      return;
    }

    if (!courseData.instructorId) {
      throw new Error("Veuillez assigner un formateur.");
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      if (!courseData.title || courseData.title.trim().length < 5) {
        throw new Error("Le titre est obligatoire et doit contenir au moins 5 caractères");
      }
      if (
        !courseData.description ||
        courseData.description.trim().length < 10
      ) {
        throw new Error("La description est obligatoire et doit contenir au moins 10 caractères");
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

      const courseId = isEditMode ? courseIdParam : generateUniqueId();
      const coursePath = `elearning/courses/${courseId}`;

      const dataToSave = {
        ...courseData,
        id: courseId,
        createdAt: isEditMode ? (await get(ref(database, `${coursePath}/createdAt`))).val() || new Date().toISOString() : new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        price: courseData.price === undefined ? 0 : Number(courseData.price),
        duration: courseData.duration === undefined ? 0 : Number(courseData.duration),
      };

      await set(ref(database, coursePath), dataToSave);

      setSuccess(`Formation ${isEditMode ? 'mise à jour' : 'créée'} avec succès !`);
      if (!isEditMode) {
        setCourseData({ ...courseData, instructorId: '' });
        setActiveTab('info');
        setCourseModules([]);
      }
      setTimeout(() => setSuccess(""), 4000);
    } catch (error) {
      console.error("Error saving course:", error);
      setError(error.message || "Erreur lors de la sauvegarde.");
    } finally {
      setSaving(false);
    }
  };

  const handleModulesChange = (newModules) => {
    setCourseModules(newModules);
  };

  if (authLoading || loadingData) {
    return <LoadingSpinner />;
  }
  if (permissionError) {
    return <p className="text-red-500 p-4">{permissionError}</p>;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Link to="/admin/courses" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4">
        <MdArrowBack className="mr-2" /> Retour à la liste
      </Link>
      <h1 className="text-2xl font-bold mb-6">
        {isEditMode ? "Modifier la Formation" : "Créer une Nouvelle Formation"}
      </h1>

      {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}
      {success && <div className="bg-green-100 text-green-700 p-3 rounded mb-4">{success}</div>}

      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          <button
            onClick={() => setActiveTab("info")}
            className={
              (activeTab === "info"
                ? "border-indigo-500 text-indigo-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300") +
              " whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm"
            }
          >
            Infos Générales
          </button>
          <button
            onClick={() => setActiveTab("modules")}
            className={
              (activeTab === "modules"
                ? "border-indigo-500 text-indigo-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300") +
              " whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm"
            }
          >
            Modules du Cours
          </button>
        </nav>
      </div>

      <form onSubmit={handleSubmit}>
        {activeTab === 'info' && (
          <CourseFormFields
            formData={courseData}
            handleChange={handleChange}
            specialites={specialites}
            filteredDisciplines={filteredDisciplines}
            allInstructors={allInstructors}
            isInstructorForm={false}
          />
        )}

        {activeTab === 'modules' && isEditMode && (
          <ModuleManagerCreation
            courseId={courseIdParam}
            initialModules={courseModules}
            onModulesChange={handleModulesChange}
          />
        )}
        {activeTab === 'modules' && !isEditMode && (
          <p className="text-center text-gray-500 p-4">Sauvegardez d'abord les informations générales pour pouvoir ajouter des modules.</p>
        )}

        <div className="mt-8 pt-5 border-t border-gray-200 flex justify-end gap-3">
          <ActionButton
            type="button"
            variant="light"
            onClick={() => navigate('/admin/courses')}
            icon={MdCancel}
            disabled={saving}
          >
            Annuler
          </ActionButton>
          <ActionButton
            type="submit"
            variant="primary"
            icon={MdSave}
            disabled={saving || activeTab === 'modules'}
          >
            {saving ? 'Sauvegarde...' : (isEditMode ? 'Mettre à Jour' : 'Créer Formation')}
          </ActionButton>
        </div>
      </form>
    </div>
  );
};

export default CourseForm;
