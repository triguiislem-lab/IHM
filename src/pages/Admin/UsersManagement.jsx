import React from 'react';
import { motion } from 'framer-motion';

const UsersManagement = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        <h1 className="text-3xl font-bold mb-8">Gestion des Utilisateurs (Admin)</h1>
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-gray-600">
            Cette page est en cours de construction. Revenez bientôt pour gérer les utilisateurs.
          </p>
          {/* TODO: Implement user management table and actions */}
        </div>
      </motion.div>
    </div>
  );
};

export default UsersManagement; 