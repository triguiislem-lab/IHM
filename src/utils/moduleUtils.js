import { database } from '../../firebaseConfig';
import { ref, get, set, push, update, remove } from 'firebase/database';
import { getAuth } from 'firebase/auth';
import { getCachedData, setCachedData } from './cacheUtils';

// Ajouter un nouveau module à un cours
export const addModuleToCourse = async (courseId, moduleData) => {
  try {
    const auth = getAuth();
    if (!auth.currentUser) {
      throw new Error('Utilisateur non authentifié');
    }

    // Vérifier si l'utilisateur est le formateur du cours
    const courseRef = ref(database, `elearning/courses/${courseId}`);
    const courseSnapshot = await get(courseRef);

    if (!courseSnapshot.exists()) {
      throw new Error('Cours non trouvé');
    }

    const courseData = courseSnapshot.val();
    const instructorId = courseData.formateur || courseData.instructorId;

    if (instructorId !== auth.currentUser.uid) {
      throw new Error('Vous n\'êtes pas autorisé à modifier ce cours');
    }

    // Préparer les données du module
    const newModule = {
      ...moduleData,
      id: Date.now().toString(), // Générer un ID unique
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'active',
      order: moduleData.order || 0
    };

    // Récupérer les modules existants
    let modules = [];
    if (courseData.modules) {
      if (Array.isArray(courseData.modules)) {
        modules = [...courseData.modules];
      } else {
        // Si modules est un objet, le convertir en tableau
        modules = Object.values(courseData.modules);
      }
    }

    // Ajouter le nouveau module
    modules.push(newModule);

    // Mettre à jour le cours avec le nouveau module
    await update(courseRef, { modules });

    return newModule;
  } catch (error) {
    
    throw error;
  }
};

// Mettre à jour un module existant
export const updateModule = async (courseId, moduleId, moduleData) => {
  try {
    const auth = getAuth();
    if (!auth.currentUser) {
      throw new Error('Utilisateur non authentifié');
    }

    // Vérifier si l'utilisateur est le formateur du cours
    const courseRef = ref(database, `elearning/courses/${courseId}`);
    const courseSnapshot = await get(courseRef);

    if (!courseSnapshot.exists()) {
      throw new Error('Cours non trouvé');
    }

    const courseData = courseSnapshot.val();
    const instructorId = courseData.formateur || courseData.instructorId;

    if (instructorId !== auth.currentUser.uid) {
      throw new Error('Vous n\'êtes pas autorisé à modifier ce cours');
    }

    // Récupérer les modules existants
    let modules = [];
    if (courseData.modules) {
      if (Array.isArray(courseData.modules)) {
        modules = [...courseData.modules];
      } else {
        modules = Object.values(courseData.modules);
      }
    }

    // Trouver l'index du module à mettre à jour
    const moduleIndex = modules.findIndex(module => module.id === moduleId);

    if (moduleIndex === -1) {
      throw new Error('Module non trouvé');
    }

    // Mettre à jour le module
    modules[moduleIndex] = {
      ...modules[moduleIndex],
      ...moduleData,
      updatedAt: new Date().toISOString()
    };

    // Mettre à jour le cours avec le module modifié
    await update(courseRef, { modules });

    return modules[moduleIndex];
  } catch (error) {
    
    throw error;
  }
};

// Supprimer un module
export const deleteModule = async (courseId, moduleId) => {
  try {
    const auth = getAuth();
    if (!auth.currentUser) {
      throw new Error('Utilisateur non authentifié');
    }

    // Vérifier si l'utilisateur est le formateur du cours
    const courseRef = ref(database, `elearning/courses/${courseId}`);
    const courseSnapshot = await get(courseRef);

    if (!courseSnapshot.exists()) {
      throw new Error('Cours non trouvé');
    }

    const courseData = courseSnapshot.val();
    const instructorId = courseData.formateur || courseData.instructorId;

    if (instructorId !== auth.currentUser.uid) {
      throw new Error('Vous n\'êtes pas autorisé à modifier ce cours');
    }

    // Récupérer les modules existants
    let modules = [];
    if (courseData.modules) {
      if (Array.isArray(courseData.modules)) {
        modules = [...courseData.modules];
      } else {
        modules = Object.values(courseData.modules);
      }
    }

    // Filtrer le module à supprimer
    const updatedModules = modules.filter(module => module.id !== moduleId);

    if (modules.length === updatedModules.length) {
      throw new Error('Module non trouvé');
    }

    // Mettre à jour le cours sans le module supprimé
    await update(courseRef, { modules: updatedModules });

    return true;
  } catch (error) {
    
    throw error;
  }
};

// Ajouter une évaluation à un module
export const addEvaluationToModule = async (courseId, moduleId, evaluationData) => {
  try {
    const auth = getAuth();
    if (!auth.currentUser) {
      throw new Error('Utilisateur non authentifié');
    }

    // Vérifier si l'utilisateur est le formateur du cours
    const courseRef = ref(database, `elearning/courses/${courseId}`);
    const courseSnapshot = await get(courseRef);

    if (!courseSnapshot.exists()) {
      throw new Error('Cours non trouvé');
    }

    const courseData = courseSnapshot.val();
    const instructorId = courseData.formateur || courseData.instructorId;

    if (instructorId !== auth.currentUser.uid) {
      throw new Error('Vous n\'êtes pas autorisé à modifier ce cours');
    }

    // Récupérer les modules existants
    let modules = [];
    if (courseData.modules) {
      if (Array.isArray(courseData.modules)) {
        modules = [...courseData.modules];
      } else {
        modules = Object.values(courseData.modules);
      }
    }

    // Trouver l'index du module
    const moduleIndex = modules.findIndex(module => module.id === moduleId);

    if (moduleIndex === -1) {
      throw new Error('Module non trouvé');
    }

    // Préparer les données de l'évaluation
    const newEvaluation = {
      ...evaluationData,
      id: Date.now().toString(), // Générer un ID unique
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Ajouter l'évaluation au module
    if (!modules[moduleIndex].evaluations) {
      modules[moduleIndex].evaluations = [];
    }

    modules[moduleIndex].evaluations.push(newEvaluation);

    // Mettre à jour le cours avec le module modifié
    await update(courseRef, { modules });

    return newEvaluation;
  } catch (error) {
    
    throw error;
  }
};

// Mettre à jour une évaluation
export const updateEvaluation = async (courseId, moduleId, evaluationId, evaluationData) => {
  try {
    const auth = getAuth();
    if (!auth.currentUser) {
      throw new Error('Utilisateur non authentifié');
    }

    // Vérifier si l'utilisateur est le formateur du cours
    const courseRef = ref(database, `elearning/courses/${courseId}`);
    const courseSnapshot = await get(courseRef);

    if (!courseSnapshot.exists()) {
      throw new Error('Cours non trouvé');
    }

    const courseData = courseSnapshot.val();
    const instructorId = courseData.formateur || courseData.instructorId;

    if (instructorId !== auth.currentUser.uid) {
      throw new Error('Vous n\'êtes pas autorisé à modifier ce cours');
    }

    // Récupérer les modules existants
    let modules = [];
    if (courseData.modules) {
      if (Array.isArray(courseData.modules)) {
        modules = [...courseData.modules];
      } else {
        modules = Object.values(courseData.modules);
      }
    }

    // Trouver l'index du module
    const moduleIndex = modules.findIndex(module => module.id === moduleId);

    if (moduleIndex === -1) {
      throw new Error('Module non trouvé');
    }

    // Vérifier si le module a des évaluations
    if (!modules[moduleIndex].evaluations || !Array.isArray(modules[moduleIndex].evaluations)) {
      throw new Error('Aucune évaluation trouvée dans ce module');
    }

    // Trouver l'index de l'évaluation
    const evaluationIndex = modules[moduleIndex].evaluations.findIndex(eval => eval.id === evaluationId);

    if (evaluationIndex === -1) {
      throw new Error('Évaluation non trouvée');
    }

    // Mettre à jour l'évaluation
    modules[moduleIndex].evaluations[evaluationIndex] = {
      ...modules[moduleIndex].evaluations[evaluationIndex],
      ...evaluationData,
      updatedAt: new Date().toISOString()
    };

    // Mettre à jour le cours avec le module modifié
    await update(courseRef, { modules });

    return modules[moduleIndex].evaluations[evaluationIndex];
  } catch (error) {
    
    throw error;
  }
};

// Supprimer une évaluation
export const deleteEvaluation = async (courseId, moduleId, evaluationId) => {
  try {
    const auth = getAuth();
    if (!auth.currentUser) {
      throw new Error('Utilisateur non authentifié');
    }

    // Vérifier si l'utilisateur est le formateur du cours
    const courseRef = ref(database, `elearning/courses/${courseId}`);
    const courseSnapshot = await get(courseRef);

    if (!courseSnapshot.exists()) {
      throw new Error('Cours non trouvé');
    }

    const courseData = courseSnapshot.val();
    const instructorId = courseData.formateur || courseData.instructorId;

    if (instructorId !== auth.currentUser.uid) {
      throw new Error('Vous n\'êtes pas autorisé à modifier ce cours');
    }

    // Récupérer les modules existants
    let modules = [];
    if (courseData.modules) {
      if (Array.isArray(courseData.modules)) {
        modules = [...courseData.modules];
      } else {
        modules = Object.values(courseData.modules);
      }
    }

    // Trouver l'index du module
    const moduleIndex = modules.findIndex(module => module.id === moduleId);

    if (moduleIndex === -1) {
      throw new Error('Module non trouvé');
    }

    // Vérifier si le module a des évaluations
    if (!modules[moduleIndex].evaluations || !Array.isArray(modules[moduleIndex].evaluations)) {
      throw new Error('Aucune évaluation trouvée dans ce module');
    }

    // Filtrer l'évaluation à supprimer
    const updatedEvaluations = modules[moduleIndex].evaluations.filter(eval => eval.id !== evaluationId);

    if (modules[moduleIndex].evaluations.length === updatedEvaluations.length) {
      throw new Error('Évaluation non trouvée');
    }

    // Mettre à jour le module avec les évaluations filtrées
    modules[moduleIndex].evaluations = updatedEvaluations;

    // Mettre à jour le cours avec le module modifié
    await update(courseRef, { modules });

    return true;
  } catch (error) {
    
    throw error;
  }
};

// Récupérer les cours d'un formateur avec mise en cache
export const fetchInstructorCourses = async (instructorId) => {
  try {
    // Vérifier si les données sont en cache
    const cacheKey = `instructor_courses_${instructorId}`;
    const cachedData = getCachedData(cacheKey);

    if (cachedData) {
      
      return cachedData;
    }

    
    const coursesRef = ref(database, 'elearning/courses');
    const snapshot = await get(coursesRef);

    if (!snapshot.exists()) {
      
      return [];
    }

    const allCourses = snapshot.val();
    const instructorCourses = [];

    // Préparer les promesses pour les requêtes d'inscriptions
    const enrollmentPromises = [];
    const courseEntries = [];

    // Parcourir tous les cours et filtrer ceux du formateur
    for (const courseId in allCourses) {
      const course = allCourses[courseId];
      if (course.formateur === instructorId || course.instructorId === instructorId) {
        courseEntries.push({ courseId, course });

        // Préparer la promesse pour récupérer les inscriptions
        const enrollmentsRef = ref(database, `elearning/enrollments/byCourse/${courseId}`);
        enrollmentPromises.push(get(enrollmentsRef));
      }
    }

    // Exécuter toutes les requêtes d'inscriptions en parallèle
    const enrollmentResults = await Promise.all(enrollmentPromises);

    // Traiter les résultats
    courseEntries.forEach(({ courseId, course }, index) => {
      let studentCount = 0;

      // Récupérer le nombre d'étudiants
      const enrollmentSnapshot = enrollmentResults[index];
      if (enrollmentSnapshot && enrollmentSnapshot.exists()) {
        const enrollments = enrollmentSnapshot.val();
        studentCount = Object.keys(enrollments).length;
      }

      // Ajouter le cours avec le nombre d'étudiants
      instructorCourses.push({
        id: courseId,
        ...course,
        students: studentCount
      });
    });

    // Mettre en cache les résultats
    setCachedData(cacheKey, instructorCourses);

    return instructorCourses;
  } catch (error) {
    
    return [];
  }
};

// Ajouter une ressource à un module
export const addResourceToModule = async (courseId, moduleId, resourceData) => {
  try {
    const auth = getAuth();
    if (!auth.currentUser) {
      throw new Error('Utilisateur non authentifié');
    }

    // Vérifier si l'utilisateur est le formateur du cours
    const courseRef = ref(database, `elearning/courses/${courseId}`);
    const courseSnapshot = await get(courseRef);

    if (!courseSnapshot.exists()) {
      throw new Error('Cours non trouvé');
    }

    const courseData = courseSnapshot.val();
    const instructorId = courseData.formateur || courseData.instructorId;

    if (instructorId !== auth.currentUser.uid) {
      throw new Error('Vous n\'êtes pas autorisé à modifier ce cours');
    }

    // Récupérer les modules existants
    let modules = [];
    if (courseData.modules) {
      if (Array.isArray(courseData.modules)) {
        modules = [...courseData.modules];
      } else {
        modules = Object.values(courseData.modules);
      }
    }

    // Trouver l'index du module
    const moduleIndex = modules.findIndex(module => module.id === moduleId);

    if (moduleIndex === -1) {
      throw new Error('Module non trouvé');
    }

    // Préparer les données de la ressource
    const newResource = {
      ...resourceData,
      id: Date.now().toString(), // Générer un ID unique
      createdAt: new Date().toISOString()
    };

    // Ajouter la ressource au module
    if (!modules[moduleIndex].resources) {
      modules[moduleIndex].resources = [];
    }

    modules[moduleIndex].resources.push(newResource);

    // Mettre à jour le cours avec le module modifié
    await update(courseRef, { modules });

    return newResource;
  } catch (error) {
    
    throw error;
  }
};

// Supprimer une ressource
export const deleteResource = async (courseId, moduleId, resourceId) => {
  try {
    const auth = getAuth();
    if (!auth.currentUser) {
      throw new Error('Utilisateur non authentifié');
    }

    // Vérifier si l'utilisateur est le formateur du cours
    const courseRef = ref(database, `elearning/courses/${courseId}`);
    const courseSnapshot = await get(courseRef);

    if (!courseSnapshot.exists()) {
      throw new Error('Cours non trouvé');
    }

    const courseData = courseSnapshot.val();
    const instructorId = courseData.formateur || courseData.instructorId;

    if (instructorId !== auth.currentUser.uid) {
      throw new Error('Vous n\'êtes pas autorisé à modifier ce cours');
    }

    // Récupérer les modules existants
    let modules = [];
    if (courseData.modules) {
      if (Array.isArray(courseData.modules)) {
        modules = [...courseData.modules];
      } else {
        modules = Object.values(courseData.modules);
      }
    }

    // Trouver l'index du module
    const moduleIndex = modules.findIndex(module => module.id === moduleId);

    if (moduleIndex === -1) {
      throw new Error('Module non trouvé');
    }

    // Vérifier si le module a des ressources
    if (!modules[moduleIndex].resources || !Array.isArray(modules[moduleIndex].resources)) {
      throw new Error('Aucune ressource trouvée dans ce module');
    }

    // Filtrer la ressource à supprimer
    const updatedResources = modules[moduleIndex].resources.filter(resource => resource.id !== resourceId);

    if (modules[moduleIndex].resources.length === updatedResources.length) {
      throw new Error('Ressource non trouvée');
    }

    // Mettre à jour le module avec les ressources filtrées
    modules[moduleIndex].resources = updatedResources;

    // Mettre à jour le cours avec le module modifié
    await update(courseRef, { modules });

    return true;
  } catch (error) {
    
    throw error;
  }
};
