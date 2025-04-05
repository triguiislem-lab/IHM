import React, { useState, useEffect } from "react";
import { getAuth } from "firebase/auth";
import { getDatabase, ref, get, update } from "firebase/database";
import {
  MdInbox,
  MdOutbox,
  MdRefresh,
  MdMarkEmailRead,
  MdMarkEmailUnread,
  MdDelete,
} from "react-icons/md";

const MessagesPage = () => {
  const [messages, setMessages] = useState([]);
  const [sentMessages, setSentMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("inbox");
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [userRole, setUserRole] = useState(null);

  const auth = getAuth();
  const database = getDatabase();

  // Vérifier le rôle de l'utilisateur
  useEffect(() => {
    const checkUserRole = async () => {
      if (!auth.currentUser) return;

      try {
        // Vérifier si l'utilisateur est un administrateur
        const adminRef = ref(
          database,
          `Elearning/Administrateurs/${auth.currentUser.uid}`
        );
        const adminSnapshot = await get(adminRef);

        if (adminSnapshot.exists()) {
          setUserRole("admin");
          return;
        }

        // Vérifier si l'utilisateur est un formateur
        const instructorRef = ref(
          database,
          `Elearning/Formateurs/${auth.currentUser.uid}`
        );
        const instructorSnapshot = await get(instructorRef);

        if (instructorSnapshot.exists()) {
          setUserRole("instructor");
          return;
        }

        // Vérifier dans la table Utilisateurs
        const userRef = ref(
          database,
          `Elearning/Utilisateurs/${auth.currentUser.uid}`
        );
        const userSnapshot = await get(userRef);

        if (userSnapshot.exists() && userSnapshot.val().userType) {
          setUserRole(userSnapshot.val().userType);
        } else {
          setUserRole("student");
        }
      } catch (error) {
        console.error("Error checking user role:", error);
        setError("Erreur lors de la vérification du rôle de l'utilisateur");
      }
    };

    checkUserRole();
  }, [auth.currentUser, database]);

  // Récupérer les messages
  useEffect(() => {
    const fetchMessages = async () => {
      if (!auth.currentUser) return;

      setLoading(true);
      setError("");

      try {
        const messagesRef = ref(database, "Elearning/Messages");
        const snapshot = await get(messagesRef);

        if (snapshot.exists()) {
          const messagesData = snapshot.val();
          const messagesArray = Object.entries(messagesData).map(
            ([id, message]) => ({
              id,
              ...message,
              date: new Date(message.date),
            })
          );

          // Filtrer les messages selon le rôle de l'utilisateur
          let receivedMessages = [];
          let userSentMessages = [];

          if (userRole === "admin" || userRole === "administrateur") {
            // Les administrateurs voient tous les messages adressés aux administrateurs
            receivedMessages = messagesArray.filter(
              (message) =>
                message.recipientType === "admin" ||
                message.recipientId === auth.currentUser.uid
            );
            userSentMessages = messagesArray.filter(
              (message) => message.senderId === auth.currentUser.uid
            );
          } else if (userRole === "instructor" || userRole === "formateur") {
            // Les formateurs voient les messages concernant leurs cours
            receivedMessages = messagesArray.filter((message) => {
              // Messages adressés directement au formateur
              if (message.recipientId === auth.currentUser.uid) {
                return true;
              }

              // Vérifier si le message concerne un cours du formateur
              if (message.courseId) {
                // Vérifier si le formateur est responsable de ce cours
                const isCourseInstructor =
                  message.instructorId === auth.currentUser.uid;
                return isCourseInstructor;
              }

              return false;
            });

            userSentMessages = messagesArray.filter(
              (message) => message.senderId === auth.currentUser.uid
            );
          } else {
            // Les étudiants voient uniquement leurs conversations
            receivedMessages = messagesArray.filter(
              (message) => message.recipientId === auth.currentUser.uid
            );

            userSentMessages = messagesArray.filter(
              (message) => message.senderId === auth.currentUser.uid
            );
          }

          // Trier par date (plus récent d'abord)
          receivedMessages.sort((a, b) => b.date - a.date);
          userSentMessages.sort((a, b) => b.date - a.date);

          setMessages(receivedMessages);
          setSentMessages(userSentMessages);
        }
      } catch (error) {
        console.error("Error fetching messages:", error);
        setError("Erreur lors de la récupération des messages");
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [auth.currentUser, database, userRole]);

  // Marquer un message comme lu
  const markAsRead = async (messageId, isRead = true) => {
    try {
      const messageRef = ref(database, `Elearning/Messages/${messageId}`);
      await update(messageRef, { read: isRead });

      // Mettre à jour l'état local
      setMessages(
        messages.map((message) =>
          message.id === messageId ? { ...message, read: isRead } : message
        )
      );

      if (selectedMessage && selectedMessage.id === messageId) {
        setSelectedMessage({ ...selectedMessage, read: isRead });
      }
    } catch (error) {
      console.error("Error updating message status:", error);
      setError("Erreur lors de la mise à jour du statut du message");
    }
  };

  // Supprimer un message
  const deleteMessage = async (messageId) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce message ?")) {
      return;
    }

    try {
      const messageRef = ref(database, `Elearning/Messages/${messageId}`);
      await update(messageRef, { deleted: true });

      // Mettre à jour l'état local
      setMessages(messages.filter((message) => message.id !== messageId));
      setSentMessages(
        sentMessages.filter((message) => message.id !== messageId)
      );

      if (selectedMessage && selectedMessage.id === messageId) {
        setSelectedMessage(null);
      }
    } catch (error) {
      console.error("Error deleting message:", error);
      setError("Erreur lors de la suppression du message");
    }
  };

  // Formater la date
  const formatDate = (date) => {
    if (!date) return "";

    const now = new Date();
    const diff = now - date;
    const oneDay = 24 * 60 * 60 * 1000;

    if (diff < oneDay) {
      // Aujourd'hui, afficher l'heure
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else if (diff < 2 * oneDay) {
      // Hier
      return "Hier";
    } else {
      // Date complète
      return date.toLocaleDateString();
    }
  };

  // Personnaliser le titre et la description en fonction du rôle
  const getRoleSpecificContent = () => {
    if (userRole === "admin" || userRole === "administrateur") {
      return {
        title: "Centre de messages administrateur",
        description:
          "Gérez les messages de tous les utilisateurs de la plateforme.",
        inboxTitle: "Messages reçus",
        emptyInboxMessage: "Aucun message administratif reçu.",
      };
    } else if (userRole === "instructor" || userRole === "formateur") {
      return {
        title: "Messages de vos étudiants",
        description: "Consultez et répondez aux messages concernant vos cours.",
        inboxTitle: "Questions des étudiants",
        emptyInboxMessage: "Aucune question d'étudiant pour le moment.",
      };
    } else if (userRole === "student" || userRole === "apprenant") {
      return {
        title: "Vos conversations",
        description:
          "Consultez vos échanges avec les formateurs et administrateurs.",
        inboxTitle: "Réponses reçues",
        emptyInboxMessage:
          "Aucun message reçu. Vous pouvez contacter un formateur depuis la page d'un cours.",
      };
    } else {
      return {
        title: "Messagerie",
        description: "Consultez vos messages.",
        inboxTitle: "Messages reçus",
        emptyInboxMessage: "Aucun message reçu.",
      };
    }
  };

  const roleContent = getRoleSpecificContent();

  // Vérifier si l'utilisateur est autorisé à accéder à cette page
  if (
    userRole !== "admin" &&
    userRole !== "instructor" &&
    userRole !== "formateur" &&
    userRole !== "administrateur" &&
    userRole !== "student" &&
    userRole !== "apprenant"
  ) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
          <h2 className="text-xl font-semibold text-red-700 mb-2">
            Accès non autorisé
          </h2>
          <p className="text-red-600">
            Vous n'avez pas les autorisations nécessaires pour accéder à cette
            page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-2">{roleContent.title}</h1>
      <p className="text-gray-600 mb-6">{roleContent.description}</p>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="flex border-b">
          <button
            className={`flex-1 py-3 px-4 flex items-center justify-center gap-2 ${
              activeTab === "inbox"
                ? "bg-secondary text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
            onClick={() => setActiveTab("inbox")}
          >
            <MdInbox />
            Boîte de réception
            {messages.filter((m) => !m.read).length > 0 && (
              <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-2 py-1">
                {messages.filter((m) => !m.read).length}
              </span>
            )}
          </button>
          <button
            className={`flex-1 py-3 px-4 flex items-center justify-center gap-2 ${
              activeTab === "sent"
                ? "bg-secondary text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
            onClick={() => setActiveTab("sent")}
          >
            <MdOutbox />
            Messages envoyés
          </button>
        </div>

        <div className="flex h-[600px]">
          {/* Liste des messages */}
          <div className="w-1/3 border-r overflow-y-auto">
            <div className="p-3 border-b flex justify-between items-center bg-gray-50">
              <h2 className="font-semibold">
                {activeTab === "inbox"
                  ? roleContent.inboxTitle
                  : "Messages envoyés"}
              </h2>
              <button
                onClick={() => window.location.reload()}
                className="p-1 rounded-full hover:bg-gray-200 transition-colors duration-300"
                title="Actualiser"
              >
                <MdRefresh />
              </button>
            </div>

            {loading ? (
              <div className="flex justify-center items-center h-20">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-secondary"></div>
              </div>
            ) : error ? (
              <div className="p-4 text-red-600">{error}</div>
            ) : activeTab === "inbox" ? (
              messages.length > 0 ? (
                <div>
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`p-3 border-b cursor-pointer hover:bg-gray-50 ${
                        selectedMessage && selectedMessage.id === message.id
                          ? "bg-blue-50"
                          : message.read
                          ? ""
                          : "font-semibold bg-gray-100"
                      }`}
                      onClick={() => {
                        setSelectedMessage(message);
                        if (!message.read) {
                          markAsRead(message.id, true);
                        }
                      }}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="text-sm font-medium truncate">
                            {message.senderName || message.senderEmail}
                          </div>
                          <div className="text-xs text-gray-500">
                            {formatDate(message.date)}
                          </div>
                        </div>
                        {!message.read && (
                          <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                        )}
                      </div>
                      <div className="text-sm font-medium mt-1 truncate">
                        {message.subject}
                      </div>
                      <div className="text-xs text-gray-600 mt-1 truncate">
                        {message.message}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-gray-600">
                  {roleContent.emptyInboxMessage}
                </div>
              )
            ) : sentMessages.length > 0 ? (
              <div>
                {sentMessages.map((message) => (
                  <div
                    key={message.id}
                    className={`p-3 border-b cursor-pointer hover:bg-gray-50 ${
                      selectedMessage && selectedMessage.id === message.id
                        ? "bg-blue-50"
                        : ""
                    }`}
                    onClick={() => setSelectedMessage(message)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="text-sm font-medium truncate">
                          À: {message.recipientName}
                        </div>
                        <div className="text-xs text-gray-500">
                          {formatDate(message.date)}
                        </div>
                      </div>
                      {message.read && (
                        <div className="text-xs text-green-600">Lu</div>
                      )}
                    </div>
                    <div className="text-sm font-medium mt-1 truncate">
                      {message.subject}
                    </div>
                    <div className="text-xs text-gray-600 mt-1 truncate">
                      {message.message}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 text-gray-600">Aucun message envoyé.</div>
            )}
          </div>

          {/* Détail du message */}
          <div className="w-2/3 overflow-y-auto">
            {selectedMessage ? (
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-xl font-bold">
                      {selectedMessage.subject}
                    </h2>
                    <div className="text-sm text-gray-600 mt-1">
                      {activeTab === "inbox" ? (
                        <span>
                          De:{" "}
                          {selectedMessage.senderName ||
                            selectedMessage.senderEmail}
                        </span>
                      ) : (
                        <span>À: {selectedMessage.recipientName}</span>
                      )}
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      {selectedMessage.date.toLocaleString()}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    {activeTab === "inbox" && (
                      <>
                        <button
                          onClick={() =>
                            markAsRead(
                              selectedMessage.id,
                              !selectedMessage.read
                            )
                          }
                          className="p-2 rounded-full hover:bg-gray-200 transition-colors duration-300"
                          title={
                            selectedMessage.read
                              ? "Marquer comme non lu"
                              : "Marquer comme lu"
                          }
                        >
                          {selectedMessage.read ? (
                            <MdMarkEmailUnread />
                          ) : (
                            <MdMarkEmailRead />
                          )}
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => deleteMessage(selectedMessage.id)}
                      className="p-2 rounded-full hover:bg-gray-200 transition-colors duration-300"
                      title="Supprimer"
                    >
                      <MdDelete />
                    </button>
                  </div>
                </div>

                {selectedMessage.courseId && (
                  <div className="mb-4 p-3 bg-gray-50 rounded-md">
                    <div className="text-sm">
                      <span className="font-medium">Cours concerné: </span>
                      {selectedMessage.courseName || selectedMessage.courseId}
                    </div>
                  </div>
                )}

                <div className="mt-6 p-4 bg-white border rounded-md whitespace-pre-wrap">
                  {selectedMessage.message}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <MdInbox className="text-6xl mb-4" />
                <p>Sélectionnez un message pour l'afficher</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessagesPage;
