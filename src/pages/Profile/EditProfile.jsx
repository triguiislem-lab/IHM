import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { getAuth } from "firebase/auth";
import { fetchCompleteUserInfo } from "../../utils/firebaseUtils";
import { Link, useNavigate } from "react-router-dom";
import { MdArrowBack, MdSave, MdCancel } from "react-icons/md";
import { getDatabase, ref, update } from "firebase/database";
import { getAvatarUrl } from "../../utils/avatarUtils";

const EditProfile = () => {
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    prenom: "",
    nom: "",
    email: "",
    avatar: "",
    // Champs supplémentaires qui pourraient être présents dans Firebase
    telephone: "",
    adresse: "",
    ville: "",
    codePostal: "",
    pays: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const auth = getAuth();
  const navigate = useNavigate();
  const database = getDatabase();

  useEffect(() => {
    const loadUserInfo = async () => {
      try {
        const user = auth.currentUser;
        console.log("Current user:", user);

        if (user) {
          // Récupérer les informations utilisateur depuis Firebase
          const info = await fetchCompleteUserInfo(user.uid);
          console.log("User info loaded:", info);

          // S'assurer que info n'est pas null avant de continuer
          if (info) {
            setUserInfo(info);
            // Initialiser tous les champs du formulaire avec les valeurs existantes
            setFormData({
              prenom: info.prenom || "",
              nom: info.nom || "",
              email: info.email || user.email || "",
              avatar: info.roleInfo?.avatar || "",
              telephone: info.telephone || "",
              adresse: info.adresse || "",
              ville: info.ville || "",
              codePostal: info.codePostal || "",
              pays: info.pays || "",
            });
          } else {
            console.error("User info is null");
            setUserInfo({
              prenom: "",
              nom: "",
              email: user.email || "",
              userType: "apprenant",
              roleInfo: {
                progression: 0,
                avatar:
                  "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
              },
              enrollments: [],
              createdAt: new Date().toISOString(),
            });
            setFormData({
              prenom: "",
              nom: "",
              email: user.email || "",
              avatar:
                "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
              telephone: "",
              adresse: "",
              ville: "",
              codePostal: "",
              pays: "",
            });
          }
        } else {
          console.error("No current user found");
          setUserInfo(null);
        }
      } catch (error) {
        console.error("Error loading user info:", error);
        setError("Erreur lors du chargement des informations utilisateur");
      } finally {
        setLoading(false);
      }
    };

    // Ajouter un écouteur d'événement pour les changements d'authentification
    const unsubscribe = auth.onAuthStateChanged((user) => {
      console.log("Auth state changed:", user);
      if (user) {
        loadUserInfo();
      } else {
        setUserInfo(null);
        setLoading(false);
        navigate("/login");
      }
    });

    // Nettoyer l'écouteur lors du démontage du composant
    return () => unsubscribe();
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!auth.currentUser) {
      setError("Vous devez être connecté pour modifier votre profil");
      return;
    }

    try {
      setSaving(true);
      setError("");

      // Mettre à jour les informations de base de l'utilisateur
      const userRef = ref(
        database,
        `Elearning/Utilisateurs/${auth.currentUser.uid}`
      );

      // Préparer les données à mettre à jour
      const userData = {
        prenom: formData.prenom,
        nom: formData.nom,
        email: formData.email,
      };

      // Ajouter les champs supplémentaires s'ils sont remplis
      if (formData.telephone) userData.telephone = formData.telephone;
      if (formData.adresse) userData.adresse = formData.adresse;
      if (formData.ville) userData.ville = formData.ville;
      if (formData.codePostal) userData.codePostal = formData.codePostal;
      if (formData.pays) userData.pays = formData.pays;

      // Mettre à jour les données utilisateur
      await update(userRef, userData);

      // Mettre à jour l'avatar dans les informations spécifiques au rôle
      // Ne mettre à jour l'avatar que s'il est défini
      if (formData.avatar) {
        if (userInfo.userType === "apprenant") {
          const apprenantRef = ref(
            database,
            `Elearning/Apprenants/${auth.currentUser.uid}`
          );
          await update(apprenantRef, {
            avatar: formData.avatar,
          });
        } else if (userInfo.userType === "formateur") {
          const formateurRef = ref(
            database,
            `Elearning/Formateurs/${auth.currentUser.uid}`
          );
          await update(formateurRef, {
            avatar: formData.avatar,
          });
        } else if (userInfo.userType === "administrateur") {
          const adminRef = ref(
            database,
            `Elearning/Administrateurs/${auth.currentUser.uid}`
          );
          await update(adminRef, {
            avatar: formData.avatar,
          });
        }
      } else {
        console.log("Avatar field is empty, using generated avatar instead");
      }

      setSuccess("Profil mis à jour avec succès");

      // Rediriger vers la page de profil après 2 secondes
      setTimeout(() => {
        navigate("/profile");
      }, 2000);
    } catch (error) {
      console.error("Error updating profile:", error);
      setError("Erreur lors de la mise à jour du profil");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary"></div>
      </div>
    );
  }

  if (!userInfo) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold mb-4">Utilisateur non connecté</h1>
        <p className="text-gray-600 mb-8">
          Veuillez vous connecter pour accéder à votre profil.
        </p>
        <Link
          to="/login"
          className="bg-secondary text-white px-6 py-2 rounded-full hover:bg-secondary/90 transition-colors duration-300"
        >
          Connexion
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-12 px-4">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl mx-auto"
        >
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-secondary to-primary p-6">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-white">
                  Modifier le profil
                </h1>
                <Link
                  to="/profile"
                  className="bg-white text-secondary p-2 rounded-full hover:bg-gray-100"
                >
                  <MdArrowBack size={24} />
                </Link>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                  {error}
                </div>
              )}

              {success && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
                  {success}
                </div>
              )}

              <div className="flex flex-col items-center mb-6">
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-secondary mb-4">
                  <img
                    src={
                      formData.avatar ||
                      (userInfo
                        ? getAvatarUrl(userInfo)
                        : "https://ui-avatars.com/api/?name=U&background=0D8ABC&color=fff&size=256")
                    }
                    alt={
                      userInfo
                        ? `${userInfo.prenom || ""} ${userInfo.nom || ""}`
                        : "User avatar"
                    }
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src =
                        "https://ui-avatars.com/api/?name=U&background=0D8ABC&color=fff&size=256";
                    }}
                  />
                </div>
                <div className="w-full">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    URL de l'avatar (optionnel)
                  </label>
                  <input
                    type="text"
                    name="avatar"
                    value={formData.avatar}
                    onChange={handleChange}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    placeholder="URL de l'image (laissez vide pour un avatar généré automatiquement)"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Entrez l'URL d'une image pour votre avatar ou laissez vide
                    pour utiliser un avatar généré à partir de vos initiales
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Prénom
                  </label>
                  <input
                    type="text"
                    name="prenom"
                    value={formData.prenom}
                    onChange={handleChange}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    placeholder="Prénom"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Nom
                  </label>
                  <input
                    type="text"
                    name="nom"
                    value={formData.nom}
                    onChange={handleChange}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    placeholder="Nom"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Téléphone
                  </label>
                  <input
                    type="tel"
                    name="telephone"
                    value={formData.telephone}
                    onChange={handleChange}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    placeholder="Téléphone"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Pays
                  </label>
                  <input
                    type="text"
                    name="pays"
                    value={formData.pays}
                    onChange={handleChange}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    placeholder="Pays"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Téléphone
                  </label>
                  <input
                    type="tel"
                    name="telephone"
                    value={formData.telephone}
                    onChange={handleChange}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    placeholder="Téléphone"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Pays
                  </label>
                  <input
                    type="text"
                    name="pays"
                    value={formData.pays}
                    onChange={handleChange}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    placeholder="Pays"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Adresse
                </label>
                <input
                  type="text"
                  name="adresse"
                  value={formData.adresse}
                  onChange={handleChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  placeholder="Adresse"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Ville
                  </label>
                  <input
                    type="text"
                    name="ville"
                    value={formData.ville}
                    onChange={handleChange}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    placeholder="Ville"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Code Postal
                  </label>
                  <input
                    type="text"
                    name="codePostal"
                    value={formData.codePostal}
                    onChange={handleChange}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    placeholder="Code Postal"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  placeholder="Email"
                  disabled={
                    auth.currentUser?.providerData[0]?.providerId !== "password"
                  }
                />
                {auth.currentUser?.providerData[0]?.providerId !==
                  "password" && (
                  <p className="text-xs text-gray-500 mt-1">
                    L'email ne peut pas être modifié car vous vous êtes connecté
                    avec un fournisseur externe
                  </p>
                )}
              </div>

              <div className="flex justify-end space-x-4">
                <Link
                  to="/profile"
                  className="bg-gray-300 text-gray-800 px-4 py-2 rounded-md flex items-center gap-2 hover:bg-gray-400 transition-colors duration-300"
                >
                  <MdCancel />
                  Annuler
                </Link>
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-secondary text-white px-4 py-2 rounded-md flex items-center gap-2 hover:bg-secondary/90 transition-colors duration-300 disabled:opacity-50"
                >
                  {saving ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <MdSave />
                  )}
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default EditProfile;
