import { getDatabase } from 'firebase/database';
import { ref, push, get, update, query, orderByChild, equalTo, serverTimestamp, set } from 'firebase/database';
import { fetchCompleteUserInfo } from './fetchCompleteUserInfo';

/**
 * Envoie un message à un destinataire
 * @param {string} senderId - ID de l'expéditeur
 * @param {string} recipientId - ID du destinataire
 * @param {string} recipientRole - Rôle du destinataire (peut être utilisé pour la logique future)
 * @param {string} subject - Sujet du message
 * @param {string} message - Contenu du message
 * @param {string} courseId - ID du cours (optionnel)
 * @param {string} courseName - Nom du cours (optionnel)
 * @returns {Promise<string>} - ID du message créé
 */
export const sendMessage = async (
    senderId,
    recipientId,
    recipientRole,
    subject,
    message,
    courseId = null,
    courseName = null
) => {
  try {
    const database = getDatabase();
    if (!senderId) {
      throw new Error('ID de l\'expéditeur manquant');
    }

    const senderData = await fetchCompleteUserInfo(senderId);
    if (!senderData) {
        throw new Error('Informations expéditeur non trouvées');
    }
    const senderName = `${senderData.firstName || ''} ${senderData.lastName || ''}`.trim() || senderData.email || 'Utilisateur';
    const senderRole = senderData.role || 'student';
    const senderEmail = senderData.email || '';

    const recipientData = await fetchCompleteUserInfo(recipientId);
    let recipientName = 'Destinataire Inconnu';
    if (recipientData) {
      recipientName = `${recipientData.firstName || ''} ${recipientData.lastName || ''}`.trim() || recipientData.email;
    }

    const messageData = {
      senderId: senderId,
      senderName,
      senderEmail,
      senderRole,
      recipientId,
      recipientRole,
      recipientName,
      subject,
      content: message,
      courseId,
      courseName,
      timestamp: serverTimestamp(),
      read: false,
      deletedBySender: false,
      deletedByRecipient: false,
    };

    const messagesRef = ref(database, 'elearning/messages');
    const newMessageRef = push(messagesRef);
    await set(newMessageRef, messageData);

    return newMessageRef.key;
  } catch (error) {
    
    throw error;
  }
};

/**
 * Récupère les messages reçus par l'utilisateur spécifié
 * @param {string} userId - ID de l'utilisateur
 * @returns {Promise<Array>} - Liste des messages reçus
 */
export const getReceivedMessages = async (userId) => {
  try {
    const database = getDatabase();
    if (!userId) {
      throw new Error('ID utilisateur manquant');
    }

    const messagesRef = ref(database, 'elearning/messages');
    // Remove query - Fetch all messages
    // const receivedMessagesQuery = query(
    //     messagesRef,
    //     orderByChild('recipientId'),
    //     equalTo(userId)
    // );

    // Fetch all messages
    const snapshot = await get(messagesRef); 

    if (!snapshot.exists()) {
      return [];
    }

    const messagesData = snapshot.val();
    const messagesArray = Object.entries(messagesData).map(([id, message]) => ({
      id,
      ...message,
      timestamp: message.timestamp, // Ensure timestamp exists
    }));

    // Filter client-side
    const filteredMessages = messagesArray.filter(message => 
        message.recipientId === userId && 
        !message.deletedByRecipient
    );

    // Sort by timestamp descending
    filteredMessages.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

    return filteredMessages;
  } catch (error) {
    console.error("Error fetching received messages:", error);
    throw error;
  }
};

/**
 * Récupère les messages envoyés par l'utilisateur spécifié
 * @param {string} userId - ID de l'utilisateur
 * @returns {Promise<Array>} - Liste des messages envoyés
 */
export const getSentMessages = async (userId) => {
  try {
    const database = getDatabase();
    if (!userId) {
      throw new Error('ID utilisateur manquant');
    }

    const messagesRef = ref(database, 'elearning/messages');
    // Remove query - Fetch all messages
    //  const sentMessagesQuery = query(
    //     messagesRef,
    //     orderByChild('senderId'),
    //     equalTo(userId)
    // );

    // Fetch all messages
    const snapshot = await get(messagesRef);

    if (!snapshot.exists()) {
      return [];
    }

    const messagesData = snapshot.val();
    const messagesArray = Object.entries(messagesData).map(([id, message]) => ({
      id,
      ...message,
      timestamp: message.timestamp, // Ensure timestamp exists
    }));

    // Filter client-side
    const filteredMessages = messagesArray.filter(message => 
        message.senderId === userId && 
        !message.deletedBySender
    );

    // Sort by timestamp descending
    filteredMessages.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

    return filteredMessages;
  } catch (error) {
    console.error("Error fetching sent messages:", error);
    throw error;
  }
};

/**
 * Marque un message comme lu ou non lu par le destinataire
 * @param {string} userId - ID de l'utilisateur (destinataire)
 * @param {string} messageId - ID du message
 * @param {boolean} isRead - État de lecture du message
 * @returns {Promise<void>}
 */
export const markMessageAsRead = async (userId, messageId, isRead = true) => {
  try {
    const database = getDatabase();
    if (!userId) {
      throw new Error('ID utilisateur manquant');
    }

    const messageRef = ref(database, `elearning/messages/${messageId}`);

    const snapshot = await get(messageRef);
    if (!snapshot.exists()) {
        throw new Error("Message non trouvé.");
    }
    const messageData = snapshot.val();
    if (messageData.recipientId !== userId) {
        throw new Error("Permission refusée: Vous n'êtes pas le destinataire de ce message.");
    }

    await update(messageRef, { read: isRead });
  } catch (error) {
    
    throw error;
  }
};

/**
 * Supprime un message pour l'utilisateur actuel (marque comme supprimé pour cet utilisateur)
 * @param {string} userId - ID de l'utilisateur actuel
 * @param {string} messageId - ID du message
 * @param {'received' | 'sent'} messageType - Indique si le message est dans la boîte de réception ou envoyés
 * @returns {Promise<void>}
 */
export const deleteMessage = async (userId, messageId, messageType) => {
  try {
    const database = getDatabase();
    if (!userId) {
      throw new Error('ID utilisateur manquant');
    }
    if (!messageType || (messageType !== 'received' && messageType !== 'sent')) {
        throw new Error('Type de message invalide pour la suppression.');
    }

    const messageRef = ref(database, `elearning/messages/${messageId}`);

    const snapshot = await get(messageRef);
    if (!snapshot.exists()) {
        
        return;
    }
    const messageData = snapshot.val();

    let updateData = {};
    if (messageType === 'received' && messageData.recipientId === userId) {
        updateData = { deletedByRecipient: true };
    } else if (messageType === 'sent' && messageData.senderId === userId) {
        updateData = { deletedBySender: true };
    } else {
         throw new Error("Permission refusée: Vous ne pouvez pas supprimer ce message.");
    }
    
    if (Object.keys(updateData).length > 0) {
        await update(messageRef, updateData);
    } else {
        
    }

  } catch (error) {
    
    throw error;
  }
};

/**
 * Récupère les utilisateurs disponibles pour l'envoi de messages selon le rôle de l'utilisateur actuel
 * @param {string} userId - ID de l'utilisateur actuel
 * @param {string} userRole - Rôle de l'utilisateur actuel
 * @returns {Promise<Object>} - Listes d'utilisateurs par rôle { admins: [], instructors: [], students: [] }
 */
export const getAvailableRecipients = async (userId, userRole) => {
  console.log(`[getAvailableRecipients] Called for user: ${userId}, role: ${userRole}`); // Log entry
  try {
    const database = getDatabase();
    if (!userId || !userRole) { // Check passed arguments
      console.error("[getAvailableRecipients] User ID or Role missing");
      throw new Error('User ID ou Role manquant pour récupérer les destinataires');
    }

    // 1. Fetch all users
    const usersRef = ref(database, 'elearning/users');
    const snapshot = await get(usersRef);

    if (!snapshot.exists()) {
      console.log("[getAvailableRecipients] No users found at elearning/users");
      return { admins: [], instructors: [], students: [] };
    }

    const usersData = snapshot.val();
    console.log("[getAvailableRecipients] Raw usersData:", usersData); // Log raw data

    // 2. Filter out the current user and format
    const allOtherUsers = Object.entries(usersData)
        .filter(([id]) => id !== userId)
        .map(([id, user]) => ({
            id,
            ...user,
            displayName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email || 'Utilisateur'
        }));
    console.log("[getAvailableRecipients] Filtered allOtherUsers:", allOtherUsers); // Log filtered users

    // 3. Separate users by role
    const admins = allOtherUsers.filter(user => user.role === 'admin');
    const instructors = allOtherUsers.filter(user => user.role === 'instructor');
    const students = allOtherUsers.filter(user => user.role === 'student');

    // 4. Determine final lists based on userRole
    let finalRecipients = { admins: [], instructors: [], students: [] };

    // 4a. Admin can message everyone else
    if (userRole === 'admin') {
      finalRecipients = { admins, instructors, students };
    }

    // 4b. Instructor can message Admins and their enrolled Students
    if (userRole === 'instructor') {
      let enrolledStudentIds = new Set();
      console.log(`[getAvailableRecipients] Fetching courses for instructor: ${userId}`);
      
      const coursesRef = ref(database, 'elearning/courses');
      const coursesSnapshot = await get(query(coursesRef, orderByChild('instructorId'), equalTo(userId)));
      
      if (coursesSnapshot.exists()) {
          const instructorCoursesData = coursesSnapshot.val();
          console.log("[getAvailableRecipients] Instructor's courses data:", instructorCoursesData);
          const courseIds = Object.keys(instructorCoursesData);
          console.log("[getAvailableRecipients] Instructor's course IDs:", courseIds);

          // For each course, get enrollments (can be parallelized)
          const enrollmentPromises = courseIds.map(courseId => 
              get(ref(database, `elearning/enrollments/byCourse/${courseId}`))
          );
          const enrollmentSnapshots = await Promise.all(enrollmentPromises);

          enrollmentSnapshots.forEach((snapshot, index) => {
              if (snapshot.exists()) {
                  const courseEnrollments = snapshot.val();
                   console.log(`[getAvailableRecipients] Enrollments for course ${courseIds[index]}:`, courseEnrollments);
                  Object.keys(courseEnrollments).forEach(studentId => enrolledStudentIds.add(studentId));
              } else {
                 console.log(`[getAvailableRecipients] No enrollments found for course ${courseIds[index]}`);
              }
          });
      } else {
         console.log("[getAvailableRecipients] No courses found for this instructor.");
      }

      const enrolledStudents = students.filter(student => enrolledStudentIds.has(student.id));
      console.log("[getAvailableRecipients] Final enrolled students for instructor:", enrolledStudents);
      finalRecipients = { admins, instructors: [], students: enrolledStudents }; // Instructors don't message other instructors usually
    }

    // 4c. Student can message Admins and Instructors of their courses
    if (userRole === 'student') {
       let courseInstructorIds = new Set();
        console.log(`[getAvailableRecipients] Fetching enrollments for student: ${userId}`);
       
       const studentEnrollmentsRef = ref(database, `elearning/enrollments/byUser/${userId}`);
       const enrollmentsSnapshot = await get(studentEnrollmentsRef);

       if (enrollmentsSnapshot.exists()) {
           const enrollmentsData = enrollmentsSnapshot.val();
            console.log("[getAvailableRecipients] Student's enrollments data:", enrollmentsData);
           const enrolledCourseIds = Object.keys(enrollmentsData);
            console.log("[getAvailableRecipients] Student's enrolled course IDs:", enrolledCourseIds);

           // Get instructor IDs for these courses (can be parallelized)
           const coursePromises = enrolledCourseIds.map(courseId => 
               get(ref(database, `elearning/courses/${courseId}/instructorId`))
           );
           const courseSnapshots = await Promise.all(coursePromises);

           courseSnapshots.forEach((snapshot, index) => {
               if (snapshot.exists()) {
                   const instructorId = snapshot.val();
                    console.log(`[getAvailableRecipients] Instructor for course ${enrolledCourseIds[index]}:`, instructorId);
                   courseInstructorIds.add(instructorId);
               } else {
                  console.log(`[getAvailableRecipients] No instructor found for course ${enrolledCourseIds[index]}`);
               }
           });
       } else {
          console.log("[getAvailableRecipients] No enrollments found for this student.");
       }

       const courseInstructors = instructors.filter(instructor => courseInstructorIds.has(instructor.id));
        console.log("[getAvailableRecipients] Final instructors for student:", courseInstructors);
       finalRecipients = { admins, instructors: courseInstructors, students: [] };
    }

    console.log("[getAvailableRecipients] Returning final recipients:", finalRecipients); // Log final result
    return finalRecipients;

  } catch (error) {
    console.error("[getAvailableRecipients] Error:", error); // Log any error
    throw error; // Rethrow error to be handled by the calling component
  }
};
