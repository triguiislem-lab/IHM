import React from 'react';
import { motion } from 'framer-motion';

const ServicesPage = () => {
  return (
    <div className="container mx-auto px-4 py-8 min-h-[calc(100vh-200px)]"> {/* Adjust min-height as needed */} 
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        <h1 className="text-3xl font-bold mb-8">Nos Services</h1>
        <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
          <p className="text-gray-700">
            E-Tutor offre une large gamme de services pour répondre à vos besoins d'apprentissage :
          </p>
          <ul className="list-disc list-inside text-gray-700 space-y-2">
            <li>Cours en ligne interactifs dans diverses disciplines.</li>
            <li>Parcours d'apprentissage personnalisés.</li>
            <li>Certificats de réussite.</li>
            <li>Support formateur dédié.</li>
            <li>Communauté d'apprenants active.</li>
          </ul>
          <p className="text-gray-700">
            Cette section sera bientôt enrichie avec plus de détails sur chaque service.
          </p>
          {/* TODO: Add detailed descriptions of services */}
        </div>
      </motion.div>
    </div>
  );
};

export default ServicesPage; 