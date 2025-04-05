import React, { useState, useEffect } from 'react';
import { getAuth } from 'firebase/auth';
import { getDatabase, ref, push, get } from 'firebase/database';
import { MdSend, MdPerson, MdEmail, MdSubject, MdMessage, MdCheck, MdSchool } from 'react-icons/md';

const StudentContactForm = ({ courseId, courseName }) => {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [instructor, setInstructor] = useState(null);
  const [isEnrolled, setIsEnrolled] = useState(false);

  const auth = getAuth();
  const database = getDatabase();

  // Vérifier si l'étudiant est inscrit au cours et récupérer les informations du formateur
  useEffect(() => {
    const fetchData = async () => {
      if (!auth.currentUser || !courseId) return;

      try {
        // Vérifier si l'étudiant est inscrit au cours
        const enrollmentRef = ref(database, `Elearning/Enrollments/${courseId}/${auth.currentUser.uid}`);
        const enrollmentSnapshot = await get(enrollmentRef);
        
        setIsEnrolled(enrollmentSnapshot.exists());
        
        if (!enrollmentSnapshot.exists()) {
          setError('Vous devez être inscrit à ce cours pour contacter le formateur.');
          return;
        }
        
        // Récupérer les informations du cours pour trouver le formateur
        const courseRef = ref(database, `Elearning/Cours/${courseId}`);
        const courseSnapshot = await get(courseRef);
        
        if (courseSnapshot.exists()) {
          const courseData = courseSnapshot.val();
          const instructorId = courseData.formateur || courseData.instructorId;
          
          if (instructorId) {
            // Récupérer les informations du formateur
            const instructorRef = ref(database, `Elearning/Formateurs/${instructorId}`);
            const instructorSnapshot = await get(instructorRef);
            
            if (instructorSnapshot.exists()) {
              const instructorData = instructorSnapshot.val();
              
              // Récupérer les informations utilisateur supplémentaires si nécessaire
              const userRef = ref(database, `Elearning/Utilisateurs/${instructorId}`);
              const userSnapshot = await get(userRef);
              
              let userData = {};
              if (userSnapshot.exists()) {
                userData = userSnapshot.val();
              }
              
              // Fusionner les données
              const mergedData = {
                ...instructorData,
                id: instructorId,
                prenom: userData.prenom || instructorData.prenom || '',
                nom: userData.nom || instructorData.nom || '',
                email: userData.email || instructorData.email || ''
              };
              
              setInstructor(mergedData);
              
              // Préremplir le sujet avec le nom du cours
              setSubject(`Question sur le cours: ${courseName}`);
            } else {
              setError('Informations du formateur non disponibles.');
            }
          } else {
            setError('Ce cours n\'a pas de formateur assigné.');
          }
        } else {
          setError('Informations du cours non disponibles.');
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Erreur lors de la récupération des données.');
      }
    };

    fetchData();
  }, [auth.currentUser, courseId, courseName, database]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!auth.currentUser) {
      setError('Vous devez être connecté pour envoyer un message');
      return;
    }

    if (!isEnrolled) {
      setError('Vous devez être inscrit à ce cours pour contacter le formateur');
      return;
    }

    if (!instructor) {
      setError('Informations du formateur non disponibles');
      return;
    }

    if (!subject.trim()) {
      setError('Veuillez saisir un sujet');
      return;
    }

    if (!message.trim()) {
      setError('Veuillez saisir un message');
      return;
    }

    setSubmitting(true);
    setError('');
    
    try {
      const messageData = {
        senderId: auth.currentUser.uid,
        senderName: auth.currentUser.displayName || 'Étudiant',
        senderEmail: auth.currentUser.email,
        recipientId: instructor.id,
        recipientType: 'instructor',
        recipientName: `${instructor.prenom} ${instructor.nom}`.trim() || 'Formateur',
        instructorId: instructor.id,
        subject,
        message,
        courseId,
        courseName,
        date: new Date().toISOString(),
        read: false
      };

      // Enregistrer le message dans Firebase
      const messagesRef = ref(database, 'Elearning/Messages');
      await push(messagesRef, messageData);

      setSuccess(true);
      setSubject('');
      setMessage('');
      
      setTimeout(() => {
        setSuccess(false);
      }, 5000);
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Erreur lors de l\'envoi du message');
    } finally {
      setSubmitting(false);
    }
  };

  if (!auth.currentUser) {
    return (
      <div className="bg-blue-50 p-4 rounded-md text-blue-700">
        Connectez-vous pour contacter le formateur de ce cours.
      </div>
    );
  }

  if (!isEnrolled) {
    return (
      <div className="bg-yellow-50 p-4 rounded-md text-yellow-700">
        Vous devez être inscrit à ce cours pour contacter le formateur.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold mb-4 flex items-center">
        <MdSchool className="mr-2 text-secondary" />
        Contacter le formateur
      </h2>
      
      {instructor && (
        <div className="mb-4 p-4 bg-gray-50 rounded-md">
          <div className="flex items-center">
            <img
              src={instructor.avatar || 'https://via.placeholder.com/40'}
              alt={`${instructor.prenom} ${instructor.nom}`}
              className="w-10 h-10 rounded-full mr-3"
            />
            <div>
              <p className="font-medium">{`${instructor.prenom} ${instructor.nom}`.trim() || 'Formateur'}</p>
              <p className="text-sm text-gray-600">{instructor.specialite || 'Formateur du cours'}</p>
            </div>
          </div>
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="subject" className="flex items-center text-gray-700 mb-2">
            <MdSubject className="mr-2" />
            Sujet
          </label>
          <input
            type="text"
            id="subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary"
            placeholder="Sujet de votre message"
            required
          />
        </div>
        
        <div className="mb-4">
          <label htmlFor="message" className="flex items-center text-gray-700 mb-2">
            <MdMessage className="mr-2" />
            Message
          </label>
          <textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary"
            rows="5"
            placeholder="Votre question ou commentaire sur le cours..."
            required
          ></textarea>
        </div>
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md">
            {error}
          </div>
        )}
        
        {success && (
          <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-md flex items-center">
            <MdCheck className="mr-2" />
            Votre message a été envoyé avec succès ! Le formateur vous répondra prochainement.
          </div>
        )}
        
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            <div className="flex items-center mb-1">
              <MdPerson className="mr-1" />
              <span>De: {auth.currentUser.displayName || auth.currentUser.email}</span>
            </div>
            <div className="flex items-center">
              <MdEmail className="mr-1" />
              <span>Cours: {courseName}</span>
            </div>
          </div>
          
          <button
            type="submit"
            disabled={submitting || !instructor}
            className="flex items-center justify-center px-4 py-2 bg-secondary text-white rounded-md hover:bg-secondary/90 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Envoi en cours...
              </>
            ) : (
              <>
                <MdSend className="mr-2" />
                Envoyer au formateur
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default StudentContactForm;
