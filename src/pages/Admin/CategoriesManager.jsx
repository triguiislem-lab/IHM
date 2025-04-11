import React, { useState, useEffect } from "react";
import { database } from "../../../firebaseConfig"; // Assuming firebaseConfig is in the root
import { ref, get, set, remove } from "firebase/database";
import { motion } from "framer-motion";
import { MdAdd, MdDelete, MdEdit, MdSave, MdCancel } from "react-icons/md";
import {
  fetchSpecialitesFromDatabase,
  fetchDisciplinesFromDatabase,
} from "../../utils/firebaseUtils"; // Assuming utils is one level up from pages

// Fonction pour générer un ID unique sans dépendre de la bibliothèque uuid
const generateUniqueId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

// Renamed component from SpecialitesManager to CategoriesManager
const CategoriesManager = () => {
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
        console.error("Erreur lors du chargement des données:", error);
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
      console.error("Erreur lors de l'ajout de la spécialité:", error);
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
      console.error("Erreur lors de la mise à jour de la spécialité:", error);
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
      console.error("Erreur lors de la suppression de la spécialité:", error);
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
      console.error("Erreur lors de l'ajout de la discipline:", error);
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
      console.error("Erreur lors de la mise à jour de la discipline:", error);
      setError(`Erreur: ${error.message}`);
    }
  };

  const handleDeleteDiscipline = async (disciplineId) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette discipline ?")) {
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
      console.error("Erreur lors de la suppression de la discipline:", error);
      setError(`Erreur: ${error.message}`);
    }
  };

  const startEditSpecialite = (specialite) => {
    setEditingSpecialite(specialite);
    setSpecialiteData({
      name: specialite.name,
      description: specialite.description || "",
    });
    setShowAddSpecialite(false); // Hide add form when editing
  };

  const startEditDiscipline = (discipline) => {
    setEditingDiscipline(discipline);
    setDisciplineData({
      name: discipline.name,
      description: discipline.description || "",
      specialiteId: discipline.specialiteId,
    });
    setShowAddDiscipline(false); // Hide add form when editing
  };

  const cancelEditSpecialite = () => {
    setEditingSpecialite(null);
    setSpecialiteData({ name: "", description: "" });
    setShowAddSpecialite(false);
    setError("");
    setSuccess("");
  };

  const cancelEditDiscipline = () => {
    setEditingDiscipline(null);
    setDisciplineData({ name: "", description: "", specialiteId: "" });
    setShowAddDiscipline(false);
    setError("");
    setSuccess("");
  };

  // --- Render --- //

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="loader ease-linear rounded-full border-4 border-t-4 border-gray-200 h-12 w-12 mb-4"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Gestion des Catégories (Spécialités & Disciplines)</h1> {/* Updated Title */}

      {/* Notifications */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6"
          role="alert"
        >
          <span className="block sm:inline">{error}</span>
          <span
            className="absolute top-0 bottom-0 right-0 px-4 py-3"
            onClick={() => setError("")}
          >
            <svg
              className="fill-current h-6 w-6 text-red-500"
              role="button"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
            >
              <title>Close</title>
              <path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.03a1.2 1.2 0 1 1-1.697-1.697l3.03-2.651-3.03-2.651a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.03a1.2 1.2 0 1 1 1.697 1.697l-3.03 2.651 3.03 2.651a1.2 1.2 0 0 1 0 1.697z" />
            </svg>
          </span>
        </motion.div>
      )}
      {success && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-6"
          role="alert"
        >
          <span className="block sm:inline">{success}</span>
           <span
            className="absolute top-0 bottom-0 right-0 px-4 py-3"
            onClick={() => setSuccess("")}
          >
             <svg
              className="fill-current h-6 w-6 text-green-500"
              role="button"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
            >
              <title>Close</title>
              <path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.03a1.2 1.2 0 1 1-1.697-1.697l3.03-2.651-3.03-2.651a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.03a1.2 1.2 0 1 1 1.697 1.697l-3.03 2.651 3.03 2.651a1.2 1.2 0 0 1 0 1.697z" />
            </svg>
          </span>
        </motion.div>
      )}

      {/* --- Section Spécialités --- */}
      <div className="bg-white shadow-lg rounded-lg p-6 mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold text-gray-700">Spécialités</h2>
          {!editingSpecialite && !showAddSpecialite && (
            <button
              onClick={() => {
                setShowAddSpecialite(true);
                setEditingSpecialite(null);
                setSpecialiteData({ name: "", description: "" });
              }}
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg flex items-center transition duration-150 ease-in-out"
            >
              <MdAdd className="mr-2" /> Ajouter Spécialité
            </button>
          )}
        </div>

        {/* Formulaire Ajout/Modification Spécialité */}
        {(showAddSpecialite || editingSpecialite) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50"
          >
            <h3 className="text-xl font-semibold text-gray-700 mb-4">
              {editingSpecialite ? "Modifier Spécialité" : "Ajouter Spécialité"}
            </h3>
            <form
              onSubmit={editingSpecialite ? handleUpdateSpecialite : handleAddSpecialite}
            >
              <div className="mb-4">
                <label
                  htmlFor="specialiteName"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Nom de la Spécialité
                </label>
                <input
                  type="text"
                  id="specialiteName"
                  value={specialiteData.name}
                  onChange={(e) =>
                    setSpecialiteData({ ...specialiteData, name: e.target.value })
                  }
                  className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  required
                />
              </div>
              <div className="mb-4">
                <label
                  htmlFor="specialiteDescription"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Description
                </label>
                <textarea
                  id="specialiteDescription"
                  rows="3"
                  value={specialiteData.description}
                  onChange={(e) =>
                    setSpecialiteData({
                      ...specialiteData,
                      description: e.target.value,
                    })
                  }
                  className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                ></textarea>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={editingSpecialite ? cancelEditSpecialite : () => setShowAddSpecialite(false)}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-lg flex items-center transition duration-150 ease-in-out"
                >
                  <MdCancel className="mr-2" /> Annuler
                </button>
                <button
                  type="submit"
                  className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg flex items-center transition duration-150 ease-in-out"
                >
                  <MdSave className="mr-2" /> {editingSpecialite ? "Enregistrer" : "Ajouter"}
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {/* Liste des Spécialités */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Nom
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Description
                </th>
                 <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Date Création
                </th>
                 <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Date Modification
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {specialites.length > 0 ? (
                specialites.map((specialite) => (
                  <tr key={specialite.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {specialite.name}
                    </td>
                    <td className="px-6 py-4 whitespace-normal text-sm text-gray-500">
                      {specialite.description || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {specialite.createdAt ? new Date(specialite.createdAt).toLocaleDateString() : '-'}
                    </td>
                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {specialite.updatedAt ? new Date(specialite.updatedAt).toLocaleDateString() : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                      <button
                        onClick={() => startEditSpecialite(specialite)}
                        className="text-blue-600 hover:text-blue-800 transition duration-150 ease-in-out p-1 rounded hover:bg-blue-100"
                        title="Modifier"
                      >
                        <MdEdit size={18} />
                      </button>
                      <button
                        onClick={() => handleDeleteSpecialite(specialite.id)}
                        className="text-red-600 hover:text-red-800 transition duration-150 ease-in-out p-1 rounded hover:bg-red-100"
                        title="Supprimer"
                      >
                        <MdDelete size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="5"
                    className="px-6 py-4 text-center text-sm text-gray-500"
                  >
                    Aucune spécialité trouvée.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- Section Disciplines --- */}
      <div className="bg-white shadow-lg rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold text-gray-700">Disciplines</h2>
          {!editingDiscipline && !showAddDiscipline && specialites.length > 0 && (
            <button
              onClick={() => {
                setShowAddDiscipline(true);
                setEditingDiscipline(null);
                setDisciplineData({ name: "", description: "", specialiteId: "" });
              }}
              className="bg-purple-500 hover:bg-purple-600 text-white font-bold py-2 px-4 rounded-lg flex items-center transition duration-150 ease-in-out"
            >
              <MdAdd className="mr-2" /> Ajouter Discipline
            </button>
          )}
           {!editingDiscipline && !showAddDiscipline && specialites.length === 0 && (
             <p className="text-sm text-gray-500">Ajouter d'abord une spécialité pour pouvoir ajouter des disciplines.</p>
          )}
        </div>

        {/* Formulaire Ajout/Modification Discipline */}
        {(showAddDiscipline || editingDiscipline) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50"
          >
            <h3 className="text-xl font-semibold text-gray-700 mb-4">
              {editingDiscipline ? "Modifier Discipline" : "Ajouter Discipline"}
            </h3>
            <form
              onSubmit={editingDiscipline ? handleUpdateDiscipline : handleAddDiscipline}
            >
              <div className="mb-4">
                <label
                  htmlFor="disciplineName"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Nom de la Discipline
                </label>
                <input
                  type="text"
                  id="disciplineName"
                  value={disciplineData.name}
                  onChange={(e) =>
                    setDisciplineData({ ...disciplineData, name: e.target.value })
                  }
                  className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                  required
                />
              </div>
               <div className="mb-4">
                 <label
                   htmlFor="disciplineSpecialite"
                   className="block text-sm font-medium text-gray-700 mb-1"
                 >
                   Spécialité Associée
                 </label>
                 <select
                   id="disciplineSpecialite"
                   value={disciplineData.specialiteId}
                   onChange={(e) =>
                     setDisciplineData({
                       ...disciplineData,
                       specialiteId: e.target.value,
                     })
                   }
                   className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                   required
                 >
                   <option value="">-- Sélectionner une Spécialité --</option>
                   {specialites.map((specialite) => (
                     <option key={specialite.id} value={specialite.id}>
                       {specialite.name}
                     </option>
                   ))}
                 </select>
               </div>
              <div className="mb-4">
                <label
                  htmlFor="disciplineDescription"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Description
                </label>
                <textarea
                  id="disciplineDescription"
                  rows="3"
                  value={disciplineData.description}
                  onChange={(e) =>
                    setDisciplineData({
                      ...disciplineData,
                      description: e.target.value,
                    })
                  }
                  className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                ></textarea>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={editingDiscipline ? cancelEditDiscipline : () => setShowAddDiscipline(false)}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-lg flex items-center transition duration-150 ease-in-out"
                >
                  <MdCancel className="mr-2" /> Annuler
                </button>
                <button
                  type="submit"
                  className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg flex items-center transition duration-150 ease-in-out"
                >
                  <MdSave className="mr-2" /> {editingDiscipline ? "Enregistrer" : "Ajouter"}
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {/* Liste des Disciplines */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Nom
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Spécialité
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Description
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Date Création
                </th>
                 <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Date Modification
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {disciplines.length > 0 ? (
                disciplines.map((discipline) => {
                  const associatedSpecialite = specialites.find(
                    (s) => s.id === discipline.specialiteId
                  );
                  return (
                    <tr key={discipline.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {discipline.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {associatedSpecialite ? associatedSpecialite.name : "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-normal text-sm text-gray-500">
                        {discipline.description || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {discipline.createdAt ? new Date(discipline.createdAt).toLocaleDateString() : '-'}
                      </td>
                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {discipline.updatedAt ? new Date(discipline.updatedAt).toLocaleDateString() : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                        <button
                          onClick={() => startEditDiscipline(discipline)}
                          className="text-purple-600 hover:text-purple-800 transition duration-150 ease-in-out p-1 rounded hover:bg-purple-100"
                          title="Modifier"
                          disabled={!specialites.length} // Disable if no specialites exist
                        >
                          <MdEdit size={18} />
                        </button>
                        <button
                          onClick={() => handleDeleteDiscipline(discipline.id)}
                          className="text-red-600 hover:text-red-800 transition duration-150 ease-in-out p-1 rounded hover:bg-red-100"
                          title="Supprimer"
                        >
                          <MdDelete size={18} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan="6" // Adjusted colspan
                    className="px-6 py-4 text-center text-sm text-gray-500"
                  >
                    Aucune discipline trouvée.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CategoriesManager; 