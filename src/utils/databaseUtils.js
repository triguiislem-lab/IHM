import { database } from '../../firebaseConfig';
import { ref, get, set, update, push, remove } from 'firebase/database';
import {
  validateUser,
  validateCourse,
  validateModule,
  validateEvaluation,
  validateEnrollment,
  validateProgress,
  validateFeedback,
  standardizeUser,
  standardizeCourse,
  standardizeModule,
  standardizeEvaluation,
  standardizeEnrollment,
  standardizeProgress,
  standardizeFeedback
} from './schemaValidation';

/**
 * Standardized database access utilities for the E-Learning platform
 * This follows the schema defined in /docs/DATABASE_SCHEMA.md
 */

// Base path for all database operations
const BASE_PATH = '/elearning';

/**
 * Generic function to fetch data from a path
 * @param {string} path - Path relative to BASE_PATH
 * @returns {Promise<Array>} - Array of data objects
 */
export const fetchData = async (path) => {
  try {
    console.log(`Fetching data from ${BASE_PATH}/${path}`);
    const dataRef = ref(database, `${BASE_PATH}/${path}`);
    const snapshot = await get(dataRef);

    if (snapshot.exists()) {
      const data = snapshot.val();
      // Convert object to array if it's not already an array
      return Array.isArray(data) ? data : Object.entries(data).map(([id, value]) => ({
        id,
        ...value
      }));
    }
    
    console.log(`No data found at ${BASE_PATH}/${path}`);
    return [];
  } catch (error) {
    console.error(`Error fetching data from ${BASE_PATH}/${path}:`, error);
    throw error;
  }
};

/**
 * Generic function to fetch a single item by ID
 * @param {string} path - Path relative to BASE_PATH
 * @param {string} id - Item ID
 * @returns {Promise<Object|null>} - Item data or null if not found
 */
export const fetchById = async (path, id) => {
  try {
    console.log(`Fetching item with ID ${id} from ${BASE_PATH}/${path}`);
    const itemRef = ref(database, `${BASE_PATH}/${path}/${id}`);
    const snapshot = await get(itemRef);

    if (snapshot.exists()) {
      const data = snapshot.val();
      return {
        id,
        ...data
      };
    }
    
    console.log(`No item found with ID ${id} at ${BASE_PATH}/${path}`);
    return null;
  } catch (error) {
    console.error(`Error fetching item with ID ${id} from ${BASE_PATH}/${path}:`, error);
    throw error;
  }
};

/**
 * Generic function to create a new item
 * @param {string} path - Path relative to BASE_PATH
 * @param {Object} data - Item data
 * @param {Function} validateFn - Validation function
 * @param {Function} standardizeFn - Standardization function
 * @returns {Promise<string>} - New item ID
 */
export const createItem = async (path, data, validateFn, standardizeFn) => {
  try {
    // Standardize data
    const standardizedData = standardizeFn(data);
    
    // Validate data
    const validation = validateFn(standardizedData);
    if (!validation.isValid) {
      throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
    }
    
    // Create new item with push ID
    const newItemRef = push(ref(database, `${BASE_PATH}/${path}`));
    const newId = newItemRef.key;
    
    // Add ID to data
    standardizedData.id = newId;
    
    // Save to database
    await set(newItemRef, standardizedData);
    
    console.log(`Created new item with ID ${newId} at ${BASE_PATH}/${path}`);
    return newId;
  } catch (error) {
    console.error(`Error creating item at ${BASE_PATH}/${path}:`, error);
    throw error;
  }
};

/**
 * Generic function to update an existing item
 * @param {string} path - Path relative to BASE_PATH
 * @param {string} id - Item ID
 * @param {Object} data - Updated item data
 * @param {Function} validateFn - Validation function
 * @param {Function} standardizeFn - Standardization function
 * @returns {Promise<boolean>} - Success status
 */
export const updateItem = async (path, id, data, validateFn, standardizeFn) => {
  try {
    // Check if item exists
    const itemRef = ref(database, `${BASE_PATH}/${path}/${id}`);
    const snapshot = await get(itemRef);
    
    if (!snapshot.exists()) {
      throw new Error(`Item with ID ${id} not found at ${BASE_PATH}/${path}`);
    }
    
    // Get existing data
    const existingData = snapshot.val();
    
    // Merge with new data
    const mergedData = {
      ...existingData,
      ...data,
      id // Ensure ID is preserved
    };
    
    // Standardize data
    const standardizedData = standardizeFn(mergedData);
    
    // Validate data
    const validation = validateFn(standardizedData);
    if (!validation.isValid) {
      throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
    }
    
    // Update in database
    await update(itemRef, standardizedData);
    
    console.log(`Updated item with ID ${id} at ${BASE_PATH}/${path}`);
    return true;
  } catch (error) {
    console.error(`Error updating item with ID ${id} at ${BASE_PATH}/${path}:`, error);
    throw error;
  }
};

/**
 * Generic function to delete an item
 * @param {string} path - Path relative to BASE_PATH
 * @param {string} id - Item ID
 * @returns {Promise<boolean>} - Success status
 */
export const deleteItem = async (path, id) => {
  try {
    // Check if item exists
    const itemRef = ref(database, `${BASE_PATH}/${path}/${id}`);
    const snapshot = await get(itemRef);
    
    if (!snapshot.exists()) {
      throw new Error(`Item with ID ${id} not found at ${BASE_PATH}/${path}`);
    }
    
    // Delete from database
    await remove(itemRef);
    
    console.log(`Deleted item with ID ${id} from ${BASE_PATH}/${path}`);
    return true;
  } catch (error) {
    console.error(`Error deleting item with ID ${id} from ${BASE_PATH}/${path}:`, error);
    throw error;
  }
};

// User-specific functions

/**
 * Fetch all users
 * @returns {Promise<Array>} - Array of user objects
 */
export const fetchUsers = async () => {
  return fetchData('users');
};

/**
 * Fetch a user by ID
 * @param {string} userId - User ID
 * @returns {Promise<Object|null>} - User data or null if not found
 */
export const fetchUser = async (userId) => {
  return fetchById('users', userId);
};

/**
 * Create a new user
 * @param {Object} userData - User data
 * @returns {Promise<string>} - New user ID
 */
export const createUser = async (userData) => {
  return createItem('users', userData, validateUser, standardizeUser);
};

/**
 * Update an existing user
 * @param {string} userId - User ID
 * @param {Object} userData - Updated user data
 * @returns {Promise<boolean>} - Success status
 */
export const updateUser = async (userId, userData) => {
  return updateItem('users', userId, userData, validateUser, standardizeUser);
};

/**
 * Delete a user
 * @param {string} userId - User ID
 * @returns {Promise<boolean>} - Success status
 */
export const deleteUser = async (userId) => {
  return deleteItem('users', userId);
};

// Course-specific functions

/**
 * Fetch all courses
 * @returns {Promise<Array>} - Array of course objects
 */
export const fetchCourses = async () => {
  return fetchData('courses');
};

/**
 * Fetch a course by ID
 * @param {string} courseId - Course ID
 * @returns {Promise<Object|null>} - Course data or null if not found
 */
export const fetchCourse = async (courseId) => {
  return fetchById('courses', courseId);
};

/**
 * Create a new course
 * @param {Object} courseData - Course data
 * @returns {Promise<string>} - New course ID
 */
export const createCourse = async (courseData) => {
  return createItem('courses', courseData, validateCourse, standardizeCourse);
};

/**
 * Update an existing course
 * @param {string} courseId - Course ID
 * @param {Object} courseData - Updated course data
 * @returns {Promise<boolean>} - Success status
 */
export const updateCourse = async (courseId, courseData) => {
  return updateItem('courses', courseId, courseData, validateCourse, standardizeCourse);
};

/**
 * Delete a course
 * @param {string} courseId - Course ID
 * @returns {Promise<boolean>} - Success status
 */
export const deleteCourse = async (courseId) => {
  return deleteItem('courses', courseId);
};

// Module-specific functions

/**
 * Fetch all modules
 * @returns {Promise<Array>} - Array of module objects
 */
export const fetchModules = async () => {
  return fetchData('modules');
};

/**
 * Fetch modules for a specific course
 * @param {string} courseId - Course ID
 * @returns {Promise<Array>} - Array of module objects
 */
export const fetchModulesByCourse = async (courseId) => {
  try {
    const allModules = await fetchModules();
    return allModules.filter(module => module.courseId === courseId);
  } catch (error) {
    console.error(`Error fetching modules for course ${courseId}:`, error);
    throw error;
  }
};

/**
 * Fetch a module by ID
 * @param {string} moduleId - Module ID
 * @returns {Promise<Object|null>} - Module data or null if not found
 */
export const fetchModule = async (moduleId) => {
  return fetchById('modules', moduleId);
};

/**
 * Create a new module
 * @param {Object} moduleData - Module data
 * @returns {Promise<string>} - New module ID
 */
export const createModule = async (moduleData) => {
  const moduleId = await createItem('modules', moduleData, validateModule, standardizeModule);
  
  // Add module reference to course
  if (moduleData.courseId) {
    const courseRef = ref(database, `${BASE_PATH}/courses/${moduleData.courseId}/modules/${moduleId}`);
    await set(courseRef, true);
  }
  
  return moduleId;
};

/**
 * Update an existing module
 * @param {string} moduleId - Module ID
 * @param {Object} moduleData - Updated module data
 * @returns {Promise<boolean>} - Success status
 */
export const updateModule = async (moduleId, moduleData) => {
  return updateItem('modules', moduleId, moduleData, validateModule, standardizeModule);
};

/**
 * Delete a module
 * @param {string} moduleId - Module ID
 * @returns {Promise<boolean>} - Success status
 */
export const deleteModule = async (moduleId) => {
  // Get module data to find course ID
  const module = await fetchModule(moduleId);
  
  if (module && module.courseId) {
    // Remove module reference from course
    const courseModuleRef = ref(database, `${BASE_PATH}/courses/${module.courseId}/modules/${moduleId}`);
    await remove(courseModuleRef);
  }
  
  return deleteItem('modules', moduleId);
};

// Evaluation-specific functions

/**
 * Fetch all evaluations
 * @returns {Promise<Array>} - Array of evaluation objects
 */
export const fetchEvaluations = async () => {
  return fetchData('evaluations');
};

/**
 * Fetch evaluations for a specific module
 * @param {string} moduleId - Module ID
 * @returns {Promise<Array>} - Array of evaluation objects
 */
export const fetchEvaluationsByModule = async (moduleId) => {
  try {
    const allEvaluations = await fetchEvaluations();
    return allEvaluations.filter(evaluation => evaluation.moduleId === moduleId);
  } catch (error) {
    console.error(`Error fetching evaluations for module ${moduleId}:`, error);
    throw error;
  }
};

/**
 * Fetch an evaluation by ID
 * @param {string} evaluationId - Evaluation ID
 * @returns {Promise<Object|null>} - Evaluation data or null if not found
 */
export const fetchEvaluation = async (evaluationId) => {
  return fetchById('evaluations', evaluationId);
};

/**
 * Create a new evaluation
 * @param {Object} evaluationData - Evaluation data
 * @returns {Promise<string>} - New evaluation ID
 */
export const createEvaluation = async (evaluationData) => {
  return createItem('evaluations', evaluationData, validateEvaluation, standardizeEvaluation);
};

/**
 * Update an existing evaluation
 * @param {string} evaluationId - Evaluation ID
 * @param {Object} evaluationData - Updated evaluation data
 * @returns {Promise<boolean>} - Success status
 */
export const updateEvaluation = async (evaluationId, evaluationData) => {
  return updateItem('evaluations', evaluationId, evaluationData, validateEvaluation, standardizeEvaluation);
};

/**
 * Delete an evaluation
 * @param {string} evaluationId - Evaluation ID
 * @returns {Promise<boolean>} - Success status
 */
export const deleteEvaluation = async (evaluationId) => {
  return deleteItem('evaluations', evaluationId);
};

// Enrollment-specific functions

/**
 * Fetch all enrollments
 * @returns {Promise<Array>} - Array of enrollment objects
 */
export const fetchEnrollments = async () => {
  try {
    const enrollmentsByCourse = await fetchData('enrollments/byCourse');
    const flatEnrollments = [];
    
    // Flatten the nested structure
    enrollmentsByCourse.forEach(courseEnrollments => {
      if (typeof courseEnrollments === 'object' && courseEnrollments !== null) {
        Object.values(courseEnrollments).forEach(enrollment => {
          flatEnrollments.push(enrollment);
        });
      }
    });
    
    return flatEnrollments;
  } catch (error) {
    console.error('Error fetching enrollments:', error);
    throw error;
  }
};

/**
 * Fetch enrollments for a specific user
 * @param {string} userId - User ID
 * @returns {Promise<Array>} - Array of enrollment objects
 */
export const fetchEnrollmentsByUser = async (userId) => {
  try {
    const userEnrollmentsRef = ref(database, `${BASE_PATH}/enrollments/byUser/${userId}`);
    const snapshot = await get(userEnrollmentsRef);
    
    if (snapshot.exists()) {
      const enrollments = snapshot.val();
      return Object.entries(enrollments).map(([courseId, data]) => ({
        userId,
        courseId,
        ...data
      }));
    }
    
    return [];
  } catch (error) {
    console.error(`Error fetching enrollments for user ${userId}:`, error);
    throw error;
  }
};

/**
 * Fetch enrollments for a specific course
 * @param {string} courseId - Course ID
 * @returns {Promise<Array>} - Array of enrollment objects
 */
export const fetchEnrollmentsByCourse = async (courseId) => {
  try {
    const courseEnrollmentsRef = ref(database, `${BASE_PATH}/enrollments/byCourse/${courseId}`);
    const snapshot = await get(courseEnrollmentsRef);
    
    if (snapshot.exists()) {
      const enrollments = snapshot.val();
      return Object.entries(enrollments).map(([userId, data]) => ({
        courseId,
        userId,
        ...data
      }));
    }
    
    return [];
  } catch (error) {
    console.error(`Error fetching enrollments for course ${courseId}:`, error);
    throw error;
  }
};

/**
 * Enroll a user in a course
 * @param {string} userId - User ID
 * @param {string} courseId - Course ID
 * @returns {Promise<boolean>} - Success status
 */
export const enrollUserInCourse = async (userId, courseId) => {
  try {
    // Validate user and course exist
    const user = await fetchUser(userId);
    const course = await fetchCourse(courseId);
    
    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }
    
    if (!course) {
      throw new Error(`Course with ID ${courseId} not found`);
    }
    
    // Create enrollment data
    const enrollmentData = {
      userId,
      courseId,
      enrolledAt: new Date().toISOString(),
      status: 'active'
    };
    
    // Validate enrollment data
    const validation = validateEnrollment(enrollmentData);
    if (!validation.isValid) {
      throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
    }
    
    // Save to byCourse path
    const byCourseRef = ref(database, `${BASE_PATH}/enrollments/byCourse/${courseId}/${userId}`);
    await set(byCourseRef, enrollmentData);
    
    // Save to byUser path
    const byUserRef = ref(database, `${BASE_PATH}/enrollments/byUser/${userId}/${courseId}`);
    await set(byUserRef, {
      courseId,
      enrolledAt: enrollmentData.enrolledAt,
      status: enrollmentData.status
    });
    
    // Update student's enrollments list
    const studentRef = ref(database, `${BASE_PATH}/students/${userId}`);
    const studentSnapshot = await get(studentRef);
    
    if (studentSnapshot.exists()) {
      const studentData = studentSnapshot.val();
      const enrollments = studentData.enrollments || [];
      
      if (!enrollments.includes(courseId)) {
        enrollments.push(courseId);
        await update(studentRef, { enrollments });
      }
    }
    
    console.log(`Enrolled user ${userId} in course ${courseId}`);
    return true;
  } catch (error) {
    console.error(`Error enrolling user ${userId} in course ${courseId}:`, error);
    throw error;
  }
};

/**
 * Update enrollment status
 * @param {string} userId - User ID
 * @param {string} courseId - Course ID
 * @param {string} status - New status
 * @returns {Promise<boolean>} - Success status
 */
export const updateEnrollmentStatus = async (userId, courseId, status) => {
  try {
    // Validate status
    if (!['active', 'completed', 'paused'].includes(status)) {
      throw new Error('Status must be one of: active, completed, paused');
    }
    
    // Update in byCourse path
    const byCourseRef = ref(database, `${BASE_PATH}/enrollments/byCourse/${courseId}/${userId}`);
    await update(byCourseRef, { status });
    
    // Update in byUser path
    const byUserRef = ref(database, `${BASE_PATH}/enrollments/byUser/${userId}/${courseId}`);
    await update(byUserRef, { status });
    
    console.log(`Updated enrollment status for user ${userId} in course ${courseId} to ${status}`);
    return true;
  } catch (error) {
    console.error(`Error updating enrollment status for user ${userId} in course ${courseId}:`, error);
    throw error;
  }
};

// Progress-specific functions

/**
 * Fetch progress for a specific user and course
 * @param {string} userId - User ID
 * @param {string} courseId - Course ID
 * @returns {Promise<Object|null>} - Progress data or null if not found
 */
export const fetchUserCourseProgress = async (userId, courseId) => {
  try {
    const progressRef = ref(database, `${BASE_PATH}/progress/${userId}/${courseId}`);
    const snapshot = await get(progressRef);
    
    if (snapshot.exists()) {
      const progressData = snapshot.val();
      
      // Extract module progress
      const moduleProgress = {};
      for (const [key, value] of Object.entries(progressData)) {
        if (!['courseId', 'userId', 'startDate', 'progress', 'completed', 'lastUpdated'].includes(key)) {
          moduleProgress[key] = value;
        }
      }
      
      return {
        courseId: progressData.courseId,
        userId: progressData.userId,
        startDate: progressData.startDate,
        progress: progressData.progress,
        completed: progressData.completed,
        lastUpdated: progressData.lastUpdated,
        modules: moduleProgress
      };
    }
    
    return null;
  } catch (error) {
    console.error(`Error fetching progress for user ${userId} and course ${courseId}:`, error);
    throw error;
  }
};

/**
 * Initialize progress tracking for a user in a course
 * @param {string} userId - User ID
 * @param {string} courseId - Course ID
 * @param {Array} modules - Array of module objects
 * @returns {Promise<boolean>} - Success status
 */
export const initializeCourseProgress = async (userId, courseId, modules = []) => {
  try {
    // Create progress data
    const progressData = {
      courseId,
      userId,
      startDate: new Date().toISOString(),
      progress: 0,
      completed: false,
      lastUpdated: new Date().toISOString()
    };
    
    // Validate progress data
    const validation = validateProgress(progressData);
    if (!validation.isValid) {
      throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
    }
    
    // Save to database
    const progressRef = ref(database, `${BASE_PATH}/progress/${userId}/${courseId}`);
    await set(progressRef, progressData);
    
    // Initialize module progress if modules are provided
    if (modules.length > 0) {
      for (const module of modules) {
        const moduleProgressRef = ref(database, `${BASE_PATH}/progress/${userId}/${courseId}/${module.id}`);
        await set(moduleProgressRef, {
          moduleId: module.id,
          completed: false,
          score: 0,
          lastUpdated: new Date().toISOString()
        });
      }
    }
    
    console.log(`Initialized progress for user ${userId} in course ${courseId}`);
    return true;
  } catch (error) {
    console.error(`Error initializing progress for user ${userId} in course ${courseId}:`, error);
    throw error;
  }
};

/**
 * Update module progress
 * @param {string} userId - User ID
 * @param {string} courseId - Course ID
 * @param {string} moduleId - Module ID
 * @param {Object} data - Progress data
 * @returns {Promise<boolean>} - Success status
 */
export const updateModuleProgress = async (userId, courseId, moduleId, data) => {
  try {
    // Update module progress
    const moduleProgressRef = ref(database, `${BASE_PATH}/progress/${userId}/${courseId}/${moduleId}`);
    await update(moduleProgressRef, {
      ...data,
      lastUpdated: new Date().toISOString()
    });
    
    // Recalculate course progress
    await recalculateCourseProgress(userId, courseId);
    
    console.log(`Updated progress for module ${moduleId} for user ${userId} in course ${courseId}`);
    return true;
  } catch (error) {
    console.error(`Error updating module progress:`, error);
    throw error;
  }
};

/**
 * Recalculate overall course progress
 * @param {string} userId - User ID
 * @param {string} courseId - Course ID
 * @returns {Promise<boolean>} - Success status
 */
export const recalculateCourseProgress = async (userId, courseId) => {
  try {
    const progressRef = ref(database, `${BASE_PATH}/progress/${userId}/${courseId}`);
    const snapshot = await get(progressRef);
    
    if (snapshot.exists()) {
      const progressData = snapshot.val();
      const moduleKeys = Object.keys(progressData).filter(key => 
        !['courseId', 'userId', 'startDate', 'progress', 'completed', 'lastUpdated'].includes(key)
      );
      
      if (moduleKeys.length > 0) {
        // Count completed modules
        const completedModules = moduleKeys.filter(key => progressData[key].completed).length;
        
        // Calculate progress percentage
        const progressPercentage = Math.round((completedModules / moduleKeys.length) * 100);
        
        // Determine if course is completed
        const isCompleted = progressPercentage === 100;
        
        // Update course progress
        await update(progressRef, {
          progress: progressPercentage,
          completed: isCompleted,
          lastUpdated: new Date().toISOString()
        });
      }
    }
    
    return true;
  } catch (error) {
    console.error(`Error recalculating course progress:`, error);
    throw error;
  }
};

// Feedback-specific functions

/**
 * Fetch all feedback
 * @returns {Promise<Array>} - Array of feedback objects
 */
export const fetchFeedback = async () => {
  return fetchData('feedback');
};

/**
 * Fetch feedback for a specific course
 * @param {string} courseId - Course ID
 * @returns {Promise<Array>} - Array of feedback objects
 */
export const fetchFeedbackByCourse = async (courseId) => {
  try {
    const allFeedback = await fetchFeedback();
    return allFeedback.filter(feedback => feedback.courseId === courseId);
  } catch (error) {
    console.error(`Error fetching feedback for course ${courseId}:`, error);
    throw error;
  }
};

/**
 * Create new feedback
 * @param {Object} feedbackData - Feedback data
 * @returns {Promise<string>} - New feedback ID
 */
export const createFeedback = async (feedbackData) => {
  return createItem('feedback', feedbackData, validateFeedback, standardizeFeedback);
};

/**
 * Update existing feedback
 * @param {string} feedbackId - Feedback ID
 * @param {Object} feedbackData - Updated feedback data
 * @returns {Promise<boolean>} - Success status
 */
export const updateFeedback = async (feedbackId, feedbackData) => {
  return updateItem('feedback', feedbackId, feedbackData, validateFeedback, standardizeFeedback);
};

/**
 * Delete feedback
 * @param {string} feedbackId - Feedback ID
 * @returns {Promise<boolean>} - Success status
 */
export const deleteFeedback = async (feedbackId) => {
  return deleteItem('feedback', feedbackId);
};
