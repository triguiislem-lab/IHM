import { getDatabase } from 'firebase/database';
import { ref, push, get, update, query, orderByChild, equalTo } from 'firebase/database';
import { getAuth } from 'firebase/auth';

/**
 * Envoie un message à un destinataire
 * @param {string} recipientId - ID du destinataire
 * @param {string} recipientType - Type du destinataire (admin, instructor, student)
 * @param {string} subject - Sujet du message
 * @param {string} message - Contenu du message
 * @param {string} courseId - ID du cours (optionnel)
 * @param {string} courseName - Nom du cours (optionnel)
 * @returns {Promise<string>} - ID du message créé
 */
export const sendMessage = async (recipientId, recipientType, subject, message, courseId = null, courseName = null) => {
  try {
    const auth = getAuth();
    const database = getDatabase();
    if (!auth.currentUser) {
      throw new Error('Utilisateur non authentifié');
    }

    // Récupérer les informations de l'utilisateur actuel
    const userRef = ref(database, `elearning/users/${auth.currentUser.uid}`);
    const userSnapshot = await get(userRef);

    if (!userSnapshot.exists()) {
      throw new Error('Informations utilisateur non trouvées');
    }

    const userData = userSnapshot.val();
    const senderName = `${userData.firstName || ''} ${userData.lastName || ''}`.trim() || auth.currentUser.displayName || 'Utilisateur';

    // Récupérer les informations du destinataire
    const recipientRef = ref(database, `elearning/users/${recipientId}`);
    const recipientSnapshot = await get(recipientRef);

    let recipientName = '';
    if (recipientSnapshot.exists()) {
      const recipientData = recipientSnapshot.val();
      recipientName = `${recipientData.firstName || ''} ${recipientData.lastName || ''}`.trim() || 'Destinataire';
    }

    // Créer le message
    const messageData = {
      senderId: auth.currentUser.uid,
      senderName,
      senderEmail: auth.currentUser.email,
      senderType: userData.role || 'student',
      recipientId,
      recipientType,
      recipientName,
      subject,
      message,
      courseId,
      courseName,
      date: new Date().toISOString(),
      read: false,
      deleted: false
    };

    // Enregistrer le message dans Firebase
    const messagesRef = ref(database, 'elearning/messages');
    const newMessageRef = await push(messagesRef, messageData);

    return newMessageRef.key;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

/**
 * Récupère les messages reçus par l'utilisateur actuel
 * @returns {Promise<Array>} - Liste des messages reçus
 */
export const getReceivedMessages = async () => {
  try {
    const auth = getAuth();
    const database = getDatabase();
    if (!auth.currentUser) {
      throw new Error('Utilisateur non authentifié');
    }

    // Récupérer le rôle de l'utilisateur
    const userRef = ref(database, `elearning/users/${auth.currentUser.uid}`);
    const userSnapshot = await get(userRef);

    if (!userSnapshot.exists()) {
      throw new Error('Informations utilisateur non trouvées');
    }

    const userData = userSnapshot.val();
    const userRole = userData.role || 'student';

    // Récupérer tous les messages
    const messagesRef = ref(database, 'elearning/messages');
    const snapshot = await get(messagesRef);

    if (!snapshot.exists()) {
      return [];
    }

    const messagesData = snapshot.val();
    const messagesArray = Object.entries(messagesData).map(([id, message]) => ({
      id,
      ...message,
      date: new Date(message.date)
    }));

    // Filtrer les messages selon le rôle de l'utilisateur
    let receivedMessages = [];

    if (userRole === 'admin') {
      // Les administrateurs voient tous les messages qui leur sont adressés
      receivedMessages = messagesArray.filter(
        message => message.recipientType === 'admin' || message.recipientId === auth.currentUser.uid
      );
    } else if (userRole === 'instructor') {
      // Les instructeurs voient les messages des étudiants inscrits à leurs cours et des administrateurs
      receivedMessages = messagesArray.filter(
        message => message.recipientId === auth.currentUser.uid
      );
    } else {
      // Les étudiants voient uniquement les messages qui leur sont adressés
      receivedMessages = messagesArray.filter(
        message => message.recipientId === auth.currentUser.uid
      );
    }

    // Filtrer les messages supprimés
    receivedMessages = receivedMessages.filter(message => !message.deleted);

    // Trier par date (plus récent d'abord)
    receivedMessages.sort((a, b) => b.date - a.date);

    return receivedMessages;
  } catch (error) {
    console.error('Error fetching received messages:', error);
    throw error;
  }
};

/**
 * Récupère les messages envoyés par l'utilisateur actuel
 * @returns {Promise<Array>} - Liste des messages envoyés
 */
export const getSentMessages = async () => {
  try {
    const auth = getAuth();
    const database = getDatabase();
    if (!auth.currentUser) {
      throw new Error('Utilisateur non authentifié');
    }

    // Récupérer tous les messages
    const messagesRef = ref(database, 'elearning/messages');
    const snapshot = await get(messagesRef);

    if (!snapshot.exists()) {
      return [];
    }

    const messagesData = snapshot.val();
    const messagesArray = Object.entries(messagesData).map(([id, message]) => ({
      id,
      ...message,
      date: new Date(message.date)
    }));

    // Filtrer les messages envoyés par l'utilisateur
    let sentMessages = messagesArray.filter(
      message => message.senderId === auth.currentUser.uid && !message.deleted
    );

    // Trier par date (plus récent d'abord)
    sentMessages.sort((a, b) => b.date - a.date);

    return sentMessages;
  } catch (error) {
    console.error('Error fetching sent messages:', error);
    throw error;
  }
};

/**
 * Marque un message comme lu ou non lu
 * @param {string} messageId - ID du message
 * @param {boolean} isRead - État de lecture du message
 * @returns {Promise<void>}
 */
export const markMessageAsRead = async (messageId, isRead = true) => {
  try {
    const auth = getAuth();
    const database = getDatabase();
    if (!auth.currentUser) {
      throw new Error('Utilisateur non authentifié');
    }

    const messageRef = ref(database, `elearning/messages/${messageId}`);
    await update(messageRef, { read: isRead });
  } catch (error) {
    console.error('Error updating message status:', error);
    throw error;
  }
};

/**
 * Supprime un message (marque comme supprimé)
 * @param {string} messageId - ID du message
 * @returns {Promise<void>}
 */
export const deleteMessage = async (messageId) => {
  try {
    const auth = getAuth();
    const database = getDatabase();
    if (!auth.currentUser) {
      throw new Error('Utilisateur non authentifié');
    }

    const messageRef = ref(database, `elearning/messages/${messageId}`);
    await update(messageRef, { deleted: true });
  } catch (error) {
    console.error('Error deleting message:', error);
    throw error;
  }
};

/**
 * Récupère les utilisateurs disponibles pour l'envoi de messages selon le rôle de l'utilisateur actuel
 * @returns {Promise<Object>} - Listes d'utilisateurs par rôle
 */
export const getAvailableRecipients = async () => {
  try {
    const auth = getAuth();
    const database = getDatabase();
    if (!auth.currentUser) {
      throw new Error('Utilisateur non authentifié');
    }

    // Récupérer le rôle de l'utilisateur
    const userRef = ref(database, `elearning/users/${auth.currentUser.uid}`);
    const userSnapshot = await get(userRef);

    if (!userSnapshot.exists()) {
      throw new Error('Informations utilisateur non trouvées');
    }

    const userData = userSnapshot.val();
    const userRole = userData.role || 'student';

    // Récupérer tous les utilisateurs
    const usersRef = ref(database, 'elearning/users');
    const snapshot = await get(usersRef);

    if (!snapshot.exists()) {
      return { admins: [], instructors: [], students: [] };
    }

    const usersData = snapshot.val();
    const usersArray = Object.entries(usersData).map(([id, user]) => ({
      id,
      ...user,
      displayName: `${user.firstName || ''} ${user.lastName || ''}`.trim()
    }));

    // Filtrer les utilisateurs selon le rôle de l'utilisateur actuel
    const admins = usersArray.filter(user => user.role === 'admin' && user.id !== auth.currentUser.uid);
    const instructors = usersArray.filter(user => user.role === 'instructor' && user.id !== auth.currentUser.uid);
    const students = usersArray.filter(user => user.role === 'student' && user.id !== auth.currentUser.uid);

    if (userRole === 'admin') {
      // Les administrateurs peuvent contacter tous les utilisateurs
      return { admins, instructors, students };
    } else if (userRole === 'instructor') {
      // Les instructeurs peuvent contacter les administrateurs et les étudiants inscrits à leurs cours

      // Récupérer les cours de l'instructeur
      const coursesRef = ref(database, 'elearning/courses');
      const coursesSnapshot = await get(coursesRef);

      let instructorCourses = [];
      if (coursesSnapshot.exists()) {
        const coursesData = coursesSnapshot.val();
        instructorCourses = Object.values(coursesData).filter(
          course => course.instructorId === auth.currentUser.uid
        );
      }

      // Récupérer les inscriptions aux cours de l'instructeur
      const enrollmentsRef = ref(database, 'elearning/enrollments');
      const enrollmentsSnapshot = await get(enrollmentsRef);

      let enrolledStudentIds = new Set();
      if (enrollmentsSnapshot.exists()) {
        const enrollmentsData = enrollmentsSnapshot.val();

        // Pour chaque utilisateur
        Object.entries(enrollmentsData).forEach(([userId, userEnrollments]) => {
          // Pour chaque inscription de l'utilisateur
          Object.entries(userEnrollments).forEach(([courseId, enrollment]) => {
            // Si le cours appartient à l'instructeur
            if (instructorCourses.some(course => course.id === courseId)) {
              enrolledStudentIds.add(userId);
            }
          });
        });
      }

      // Filtrer les étudiants inscrits aux cours de l'instructeur
      const enrolledStudents = students.filter(student => enrolledStudentIds.has(student.id));

      return { admins, instructors: [], students: enrolledStudents };
    } else {
      // Les étudiants peuvent contacter les administrateurs et les instructeurs de leurs cours

      // Récupérer les inscriptions de l'étudiant
      const studentEnrollmentsRef = ref(database, `elearning/enrollments/${auth.currentUser.uid}`);
      const enrollmentsSnapshot = await get(studentEnrollmentsRef);

      let enrolledCourseIds = new Set();
      if (enrollmentsSnapshot.exists()) {
        const enrollmentsData = enrollmentsSnapshot.val();
        enrolledCourseIds = new Set(Object.keys(enrollmentsData));
      }

      // Récupérer les cours auxquels l'étudiant est inscrit
      const coursesRef = ref(database, 'elearning/courses');
      const coursesSnapshot = await get(coursesRef);

      let courseInstructorIds = new Set();
      if (coursesSnapshot.exists() && enrolledCourseIds.size > 0) {
        const coursesData = coursesSnapshot.val();

        // Pour chaque cours
        Object.entries(coursesData).forEach(([courseId, course]) => {
          // Si l'étudiant est inscrit à ce cours
          if (enrolledCourseIds.has(courseId) && course.instructorId) {
            courseInstructorIds.add(course.instructorId);
          }
        });
      }

      // Filtrer les instructeurs des cours de l'étudiant
      const courseInstructors = instructors.filter(instructor => courseInstructorIds.has(instructor.id));

      return { admins, instructors: courseInstructors, students: [] };
    }
  } catch (error) {
    console.error('Error fetching available recipients:', error);
    throw error;
  }
};
