import React from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';

const UserDetailsPage = () => {
  const { userId } = useParams();

  // TODO: Fetch user details based on userId

  return (
    <div className="container mx-auto px-4 py-8 min-h-[calc(100vh-200px)]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        <h1 className="text-3xl font-bold mb-8">Détails Utilisateur (Admin)</h1>
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-gray-600">
            Affichage des détails pour l'utilisateur avec l'ID : {userId}
          </p>
          <p className="text-gray-600 mt-4">
            (Page en cours de construction)
          </p>
          {/* TODO: Implement user details display and actions */}
        </div>
      </motion.div>
    </div>
  );
};

export default UserDetailsPage; 