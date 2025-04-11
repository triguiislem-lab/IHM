import React from 'react';
import { motion } from 'framer-motion';

const ForStudentsPage = () => {
  return (
    <div className="container mx-auto px-4 py-8 min-h-[calc(100vh-200px)]"> {/* Adjust min-height as needed */} 
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        <h1 className="text-3xl font-bold mb-8">Pour les Étudiants</h1>
        <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
          <p className="text-gray-700">
            Découvrez comment E-Tutor peut vous aider à atteindre vos objectifs académiques et professionnels.
          </p>
          <ul className="list-disc list-inside text-gray-700 space-y-2">
            <li>Flexibilité d'apprentissage à votre rythme.</li>
            <li>Accès à des formateurs experts.</li>
            <li>Contenu pédagogique de haute qualité.</li>
            <li>Opportunités de networking avec d'autres étudiants.</li>
          </ul>
          <p className="text-gray-700">
            Plus d'informations spécifiques aux avantages pour les étudiants seront ajoutées prochainement.
          </p>
          {/* TODO: Add student testimonials, specific benefits, how-it-works section */}
        </div>
      </motion.div>
    </div>
  );
};

export default ForStudentsPage; 