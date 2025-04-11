import React from 'react';
import { motion } from 'framer-motion';

const SettingsPage = () => {
  return (
    <div className="container mx-auto px-4 py-8 min-h-[calc(100vh-200px)]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        <h1 className="text-3xl font-bold mb-8">Paramètres (Admin)</h1>
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-gray-600">
            Cette page est destinée aux paramètres généraux de l'application (en cours de construction).
          </p>
          {/* TODO: Implement application settings form */}
        </div>
      </motion.div>
    </div>
  );
};

export default SettingsPage; 