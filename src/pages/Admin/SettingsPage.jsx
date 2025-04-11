import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { fetchSettingsFromDatabase, updateSettingsInDatabase } from '../../utils/firebaseUtils'; // Assuming update function will be added
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import { toast } from 'react-hot-toast'; // Assuming you use react-hot-toast for notifications

const SettingsPage = () => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadSettings = async () => {
      try {
        setLoading(true);
        const fetchedSettings = await fetchSettingsFromDatabase();
        // Initialize with defaults if no settings exist yet
        setSettings(fetchedSettings || { 
            siteTitle: 'E-Tutor', 
            contactEmail: '', 
            maintenanceMode: false 
        });
        setError('');
      } catch (err) {
        setError("Erreur lors du chargement des paramètres.");
        console.error(err);
        setSettings({ siteTitle: 'E-Tutor', contactEmail: '', maintenanceMode: false }); // Fallback defaults
      } finally {
        setLoading(false);
      }
    };
    loadSettings();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await updateSettingsInDatabase(settings); // Need to implement this function
      toast.success('Paramètres enregistrés avec succès !');
    } catch (err) {
      setError("Erreur lors de l'enregistrement des paramètres.");
      console.error(err);
      toast.error("Échec de l'enregistrement des paramètres.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="container mx-auto px-4 py-8 min-h-[calc(100vh-200px)]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        <h1 className="text-3xl font-bold mb-8">Paramètres Généraux (Admin)</h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        <form onSubmit={handleSave} className="bg-white rounded-lg shadow-md p-6 md:p-8 space-y-6">
          
          {/* Site Title */}
          <div>
            <label htmlFor="siteTitle" className="block text-sm font-medium text-gray-700 mb-1">
              Titre du site
            </label>
            <input
              type="text"
              id="siteTitle"
              name="siteTitle"
              value={settings?.siteTitle || ''}
              onChange={handleChange}
              disabled={saving}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm disabled:bg-gray-100"
            />
          </div>

          {/* Contact Email */}
          <div>
            <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700 mb-1">
              Email de contact
            </label>
            <input
              type="email"
              id="contactEmail"
              name="contactEmail"
              value={settings?.contactEmail || ''}
              onChange={handleChange}
              disabled={saving}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm disabled:bg-gray-100"
            />
          </div>

          {/* Maintenance Mode */}
          <div className="flex items-center">
            <input
              id="maintenanceMode"
              name="maintenanceMode"
              type="checkbox"
              checked={settings?.maintenanceMode || false}
              onChange={handleChange}
              disabled={saving}
              className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 disabled:bg-gray-100"
            />
            <label htmlFor="maintenanceMode" className="ml-3 block text-sm font-medium text-gray-700">
              Activer le mode maintenance
            </label>
          </div>

          {/* Save Button */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <LoadingSpinner size="small" color="text-white" />
                  <span className="ml-2">Enregistrement...</span>
                </>
              ) : (
                'Enregistrer les paramètres'
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default SettingsPage; 