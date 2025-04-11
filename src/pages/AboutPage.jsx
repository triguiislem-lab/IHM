import React from 'react';
import { motion } from 'framer-motion';

const AboutPage = () => {
  return (
    <div className="container mx-auto px-4 py-8 min-h-[calc(100vh-200px)]"> {/* Adjust min-height as needed */} 
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        <h1 className="text-3xl font-bold mb-8">À Propos de E-Tutor</h1>
        <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
          <p className="text-gray-700">
            Bienvenue sur E-Tutor, votre plateforme d'apprentissage en ligne dédiée à l'excellence éducative.
          </p>
          <p className="text-gray-700">
            Notre mission est de fournir des cours de haute qualité, accessibles à tous, partout dans le monde.
            Nous croyons en la puissance de l'éducation pour transformer les vies et ouvrir de nouvelles opportunités.
          </p>
          <p className="text-gray-700">
            Cette page est en cours de construction. Plus d'informations sur notre équipe, notre vision et nos valeurs seront bientôt disponibles.
          </p>
          {/* TODO: Add more content about the platform, team, mission, etc. */}
        </div>
      </motion.div>
    </div>
  );
};

export default AboutPage; // Ensure default export exists 