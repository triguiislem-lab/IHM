import React from 'react';
import { motion } from 'framer-motion';

const ResourcesPage = () => {
  return (
    <div className="container mx-auto px-4 py-8 min-h-[calc(100vh-200px)]"> {/* Adjust min-height as needed */} 
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        <h1 className="text-3xl font-bold mb-8">Ressources</h1>
        <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
          <p className="text-gray-700">
            Explorez nos ressources pour enrichir votre expérience d'apprentissage :
          </p>
          <ul className="list-disc list-inside text-gray-700 space-y-2">
            <li>Blog avec des articles et tutoriels.</li>
            <li>FAQ pour répondre à vos questions fréquentes.</li>
            <li>Webinaires et événements en ligne.</li>
            {/* Add more resource types */}
          </ul>
          <p className="text-gray-700">
            Cette section est en cours de développement et sera bientôt disponible.
          </p>
          {/* TODO: Add links to actual resources */}
        </div>
      </motion.div>
    </div>
  );
};

export default ResourcesPage; 