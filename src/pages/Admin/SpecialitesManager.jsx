import React, { useState, useEffect } from "react";
import { database } from "../../../firebaseConfig";
import { ref, get, set, remove } from "firebase/database";
import { motion } from "framer-motion";
import { MdAdd, MdDelete, MdEdit, MdSave, MdCancel } from "react-icons/md";
import {
  fetchSpecialitesFromDatabase,
  fetchDisciplinesFromDatabase,
} from "../../utils/firebaseUtils";

// Fonction pour générer un ID unique sans dépendre de la bibliothèque uuid
const generateUniqueId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

const SpecialitesManager = () => {
  const [specialites, setSpecialites] = useState([]);
  const [disciplines, setDisciplines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showAddSpecialite, setShowAddSpecialite] = useState(false);
  const [showAddDiscipline, setShowAddDiscipline] = useState(false);
  const [editingSpecialite, setEditingSpecialite] = useState(null);
  const [editingDiscipline, setEditingDiscipline] = useState(null);

  const [specialiteData, setSpecialiteData] = useState({
    name: "",
    description: "",
  });

  const [disciplineData, setDisciplineData] = useState({
    name: "",
    description: "",
    specialiteId: "",
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        // Charger les spécialités
        const specialitesData = await fetchSpecialitesFromDatabase();
        setSpecialites(specialitesData);

        // Charger les disciplines
        const disciplinesData = await fetchDisciplinesFromDatabase();
        setDisciplines(disciplinesData);
      } catch (error) {
        
        setError("Erreur lors du chargement des données");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleAddSpecialite = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      if (!specialiteData.name) {
        throw new Error("Le nom de la spécialité est obligatoire");
      }

      const specialiteId = generateUniqueId();
      const timestamp = new Date().toISOString();

      const specialiteToSave = {
        ...specialiteData,
        id: specialiteId,
        createdAt: timestamp,
        updatedAt: timestamp,
      };

      // Sauvegarder la spécialité dans la base de données
      const specialiteRef = ref(
        database,
        `elearning/specialites/${specialiteId}`
      );
      await set(specialiteRef, specialiteToSave);

      // Mettre à jour l'état local
      setSpecialites([...specialites, specialiteToSave]);

      // Réinitialiser le formulaire
      setSpecialiteData({
        name: "",
        description: "",
      });

      setShowAddSpecialite(false);
      setSuccess("Spécialité ajoutée avec succès");
    } catch (error) {
      
      setError(`Erreur: ${error.message}`);
    }
  };

  const handleUpdateSpecialite = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      if (!specialiteData.name) {
        throw new Error("Le nom de la spécialité est obligatoire");
      }

      const timestamp = new Date().toISOString();

      const specialiteToUpdate = {
        ...editingSpecialite,
        ...specialiteData,
        updatedAt: timestamp,
      };

      // Mettre à jour la spécialité dans la base de données
      const specialiteRef = ref(
        database,
        `elearning/specialites/${editingSpecialite.id}`
      );
      await set(specialiteRef, specialiteToUpdate);

      // Mettre à jour l'état local
      setSpecialites(
        specialites.map((s) =>
          s.id === editingSpecialite.id ? specialiteToUpdate : s
        )
      );

      // Réinitialiser le formulaire
      setSpecialiteData({
        name: "",
        description: "",
      });

      setEditingSpecialite(null);
      setSuccess("Spécialité mise à jour avec succès");
    } catch (error) {
      
      setError(`Erreur: ${error.message}`);
    }
  };

  const handleDeleteSpecialite = async (specialiteId) => {
    if (
      !window.confirm(
        "Êtes-vous sûr de vouloir supprimer cette spécialité ? Toutes les disciplines associées seront également supprimées."
      )
    ) {
      return;
    }

    setError("");
    setSuccess("");

    try {
      // Supprimer la spécialité de la base de données
      const specialiteRef = ref(
        database,
        `elearning/specialites/${specialiteId}`
      );
      await remove(specialiteRef);

      // Supprimer toutes les disciplines associées
      const disciplinesToDelete = disciplines.filter(
        (d) => d.specialiteId === specialiteId
      );

      for (const discipline of disciplinesToDelete) {
        const disciplineRef = ref(
          database,
          `elearning/disciplines/${discipline.id}`
        );
        await remove(disciplineRef);
      }

      // Mettre à jour l'état local
      setSpecialites(specialites.filter((s) => s.id !== specialiteId));
      setDisciplines(
        disciplines.filter((d) => d.specialiteId !== specialiteId)
      );

      setSuccess("Spécialité et disciplines associées supprimées avec succès");
    } catch (error) {
      
      setError(`Erreur: ${error.message}`);
    }
  };

  const handleAddDiscipline = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      if (!disciplineData.name) {
        throw new Error("Le nom de la discipline est obligatoire");
      }

      if (!disciplineData.specialiteId) {
        throw new Error("La spécialité est obligatoire");
      }

      const disciplineId = generateUniqueId();
      const timestamp = new Date().toISOString();

      const disciplineToSave = {
        ...disciplineData,
        id: disciplineId,
        createdAt: timestamp,
        updatedAt: timestamp,
      };

      // Sauvegarder la discipline dans la base de données
      const disciplineRef = ref(
        database,
        `elearning/disciplines/${disciplineId}`
      );
      await set(disciplineRef, disciplineToSave);

      // Mettre à jour l'état local
      setDisciplines([...disciplines, disciplineToSave]);

      // Réinitialiser le formulaire
      setDisciplineData({
        name: "",
        description: "",
        specialiteId: "",
      });

      setShowAddDiscipline(false);
      setSuccess("Discipline ajoutée avec succès");
    } catch (error) {
      
      setError(`Erreur: ${error.message}`);
    }
  };

  const handleUpdateDiscipline = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      if (!disciplineData.name) {
        throw new Error("Le nom de la discipline est obligatoire");
      }

      if (!disciplineData.specialiteId) {
        throw new Error("La spécialité est obligatoire");
      }

      const timestamp = new Date().toISOString();

      const disciplineToUpdate = {
        ...editingDiscipline,
        ...disciplineData,
        updatedAt: timestamp,
      };

      // Mettre à jour la discipline dans la base de données
      const disciplineRef = ref(
        database,
        `elearning/disciplines/${editingDiscipline.id}`
      );
      await set(disciplineRef, disciplineToUpdate);

      // Mettre à jour l'état local
      setDisciplines(
        disciplines.map((d) =>
          d.id === editingDiscipline.id ? disciplineToUpdate : d
        )
      );

      // Réinitialiser le formulaire
      setDisciplineData({
        name: "",
        description: "",
        specialiteId: "",
      });

      setEditingDiscipline(null);
      setSuccess("Discipline mise à jour avec succès");
    } catch (error) {
      
      setError(`Erreur: ${error.message}`);
    }
  };

  const handleDeleteDiscipline = async (disciplineId) => {
    if (
      !window.confirm("Êtes-vous sûr de vouloir supprimer cette discipline ?")
    ) {
      return;
    }

    setError("");
    setSuccess("");

    try {
      // Supprimer la discipline de la base de données
      const disciplineRef = ref(
        database,
        `elearning/disciplines/${disciplineId}`
      );
      await remove(disciplineRef);

      // Mettre à jour l'état local
      setDisciplines(disciplines.filter((d) => d.id !== disciplineId));

      setSuccess("Discipline supprimée avec succès");
    } catch (error) {
      
      setError(`Erreur: ${error.message}`);
    }
  };

  const startEditSpecialite = (specialite) => {
    setEditingSpecialite(specialite);
    setSpecialiteData({
      name: specialite.name,
      description: specialite.description || "",
    });
  };

  const startEditDiscipline = (discipline) => {
    setEditingDiscipline(discipline);
    setDisciplineData({
      name: discipline.name,
      description: discipline.description || "",
      specialiteId: discipline.specialiteId,
    });
  };

  const cancelEditSpecialite = () => {
    setEditingSpecialite(null);
    setSpecialiteData({
      name: "",
      description: "",
    });
  };

  const cancelEditDiscipline = () => {
    setEditingDiscipline(null);
    setDisciplineData({
      name: "",
      description: "",
      specialiteId: "",
    });
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
      <h1 className="text-3xl font-bold mb-6">
        Gestion des spécialités et disciplines
      </h1>

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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Section Spécialités */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Spécialités</h2>
            <button
              onClick={() => setShowAddSpecialite(true)}
              className="bg-secondary text-white px-3 py-1 rounded-md flex items-center gap-1 hover:bg-secondary/90 transition-colors duration-300"
            >
              <MdAdd />
              Ajouter
            </button>
          </div>

          {specialites.length === 0 ? (
            <p className="text-gray-500">Aucune spécialité trouvée</p>
          ) : (
            <ul className="space-y-3">
              {specialites.map((specialite) => (
                <li
                  key={specialite.id}
                  className="border rounded-lg p-3 hover:bg-gray-50 transition-colors duration-300"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">{specialite.name}</h3>
                      {specialite.description && (
                        <p className="text-sm text-gray-600 mt-1">
                          {specialite.description}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => startEditSpecialite(specialite)}
                        className="text-blue-600 hover:text-blue-800"
                        title="Modifier"
                      >
                        <MdEdit />
                      </button>
                      <button
                        onClick={() => handleDeleteSpecialite(specialite.id)}
                        className="text-red-600 hover:text-red-800"
                        title="Supprimer"
                      >
                        <MdDelete />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {/* Modal pour ajouter une spécialité */}
          {showAddSpecialite && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-lg p-6 w-full max-w-md"
              >
                <h3 className="text-xl font-bold mb-4">
                  Ajouter une spécialité
                </h3>
                <form onSubmit={handleAddSpecialite}>
                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                      Nom*
                    </label>
                    <input
                      type="text"
                      value={specialiteData.name}
                      onChange={(e) =>
                        setSpecialiteData({
                          ...specialiteData,
                          name: e.target.value,
                        })
                      }
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      placeholder="Nom de la spécialité"
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                      Description
                    </label>
                    <textarea
                      value={specialiteData.description}
                      onChange={(e) =>
                        setSpecialiteData({
                          ...specialiteData,
                          description: e.target.value,
                        })
                      }
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      placeholder="Description de la spécialité"
                      rows="3"
                    />
                  </div>
                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => setShowAddSpecialite(false)}
                      className="bg-gray-300 text-gray-800 px-4 py-2 rounded-md flex items-center gap-2 hover:bg-gray-400 transition-colors duration-300"
                    >
                      <MdCancel />
                      Annuler
                    </button>
                    <button
                      type="submit"
                      className="bg-secondary text-white px-4 py-2 rounded-md flex items-center gap-2 hover:bg-secondary/90 transition-colors duration-300"
                    >
                      <MdSave />
                      Enregistrer
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}

          {/* Modal pour modifier une spécialité */}
          {editingSpecialite && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-lg p-6 w-full max-w-md"
              >
                <h3 className="text-xl font-bold mb-4">
                  Modifier la spécialité
                </h3>
                <form onSubmit={handleUpdateSpecialite}>
                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                      Nom*
                    </label>
                    <input
                      type="text"
                      value={specialiteData.name}
                      onChange={(e) =>
                        setSpecialiteData({
                          ...specialiteData,
                          name: e.target.value,
                        })
                      }
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      placeholder="Nom de la spécialité"
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                      Description
                    </label>
                    <textarea
                      value={specialiteData.description}
                      onChange={(e) =>
                        setSpecialiteData({
                          ...specialiteData,
                          description: e.target.value,
                        })
                      }
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      placeholder="Description de la spécialité"
                      rows="3"
                    />
                  </div>
                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={cancelEditSpecialite}
                      className="bg-gray-300 text-gray-800 px-4 py-2 rounded-md flex items-center gap-2 hover:bg-gray-400 transition-colors duration-300"
                    >
                      <MdCancel />
                      Annuler
                    </button>
                    <button
                      type="submit"
                      className="bg-secondary text-white px-4 py-2 rounded-md flex items-center gap-2 hover:bg-secondary/90 transition-colors duration-300"
                    >
                      <MdSave />
                      Enregistrer
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </div>

        {/* Section Disciplines */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Disciplines</h2>
            <button
              onClick={() => setShowAddDiscipline(true)}
              className="bg-secondary text-white px-3 py-1 rounded-md flex items-center gap-1 hover:bg-secondary/90 transition-colors duration-300"
              disabled={specialites.length === 0}
            >
              <MdAdd />
              Ajouter
            </button>
          </div>

          {disciplines.length === 0 ? (
            <p className="text-gray-500">Aucune discipline trouvée</p>
          ) : (
            <ul className="space-y-3">
              {disciplines.map((discipline) => {
                const specialite = specialites.find(
                  (s) => s.id === discipline.specialiteId
                );
                return (
                  <li
                    key={discipline.id}
                    className="border rounded-lg p-3 hover:bg-gray-50 transition-colors duration-300"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">{discipline.name}</h3>
                        {specialite && (
                          <p className="text-xs text-gray-500 mt-1">
                            Spécialité: {specialite.name}
                          </p>
                        )}
                        {discipline.description && (
                          <p className="text-sm text-gray-600 mt-1">
                            {discipline.description}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => startEditDiscipline(discipline)}
                          className="text-blue-600 hover:text-blue-800"
                          title="Modifier"
                        >
                          <MdEdit />
                        </button>
                        <button
                          onClick={() => handleDeleteDiscipline(discipline.id)}
                          className="text-red-600 hover:text-red-800"
                          title="Supprimer"
                        >
                          <MdDelete />
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}

          {/* Modal pour ajouter une discipline */}
          {showAddDiscipline && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-lg p-6 w-full max-w-md"
              >
                <h3 className="text-xl font-bold mb-4">
                  Ajouter une discipline
                </h3>
                <form onSubmit={handleAddDiscipline}>
                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                      Spécialité*
                    </label>
                    <select
                      value={disciplineData.specialiteId}
                      onChange={(e) =>
                        setDisciplineData({
                          ...disciplineData,
                          specialiteId: e.target.value,
                        })
                      }
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
                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                      Nom*
                    </label>
                    <input
                      type="text"
                      value={disciplineData.name}
                      onChange={(e) =>
                        setDisciplineData({
                          ...disciplineData,
                          name: e.target.value,
                        })
                      }
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      placeholder="Nom de la discipline"
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                      Description
                    </label>
                    <textarea
                      value={disciplineData.description}
                      onChange={(e) =>
                        setDisciplineData({
                          ...disciplineData,
                          description: e.target.value,
                        })
                      }
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      placeholder="Description de la discipline"
                      rows="3"
                    />
                  </div>
                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => setShowAddDiscipline(false)}
                      className="bg-gray-300 text-gray-800 px-4 py-2 rounded-md flex items-center gap-2 hover:bg-gray-400 transition-colors duration-300"
                    >
                      <MdCancel />
                      Annuler
                    </button>
                    <button
                      type="submit"
                      className="bg-secondary text-white px-4 py-2 rounded-md flex items-center gap-2 hover:bg-secondary/90 transition-colors duration-300"
                    >
                      <MdSave />
                      Enregistrer
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}

          {/* Modal pour modifier une discipline */}
          {editingDiscipline && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-lg p-6 w-full max-w-md"
              >
                <h3 className="text-xl font-bold mb-4">
                  Modifier la discipline
                </h3>
                <form onSubmit={handleUpdateDiscipline}>
                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                      Spécialité*
                    </label>
                    <select
                      value={disciplineData.specialiteId}
                      onChange={(e) =>
                        setDisciplineData({
                          ...disciplineData,
                          specialiteId: e.target.value,
                        })
                      }
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
                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                      Nom*
                    </label>
                    <input
                      type="text"
                      value={disciplineData.name}
                      onChange={(e) =>
                        setDisciplineData({
                          ...disciplineData,
                          name: e.target.value,
                        })
                      }
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      placeholder="Nom de la discipline"
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                      Description
                    </label>
                    <textarea
                      value={disciplineData.description}
                      onChange={(e) =>
                        setDisciplineData({
                          ...disciplineData,
                          description: e.target.value,
                        })
                      }
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      placeholder="Description de la discipline"
                      rows="3"
                    />
                  </div>
                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={cancelEditDiscipline}
                      className="bg-gray-300 text-gray-800 px-4 py-2 rounded-md flex items-center gap-2 hover:bg-gray-400 transition-colors duration-300"
                    >
                      <MdCancel />
                      Annuler
                    </button>
                    <button
                      type="submit"
                      className="bg-secondary text-white px-4 py-2 rounded-md flex items-center gap-2 hover:bg-secondary/90 transition-colors duration-300"
                    >
                      <MdSave />
                      Enregistrer
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SpecialitesManager;
