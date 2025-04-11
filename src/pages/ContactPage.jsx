import React from 'react';
import { motion } from 'framer-motion';

const ContactPage = () => {
  return (
    <div className="container mx-auto px-4 py-8 min-h-[calc(100vh-200px)]"> {/* Adjust min-height as needed */} 
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        <h1 className="text-3xl font-bold mb-8">Contactez-Nous</h1>
        <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
          <p className="text-gray-700">
            Vous avez une question, une suggestion ou besoin d'aide ? N'hésitez pas à nous contacter.
          </p>
          <p className="text-gray-700">
            Formulaire de contact et informations de contact directes (email, téléphone) seront bientôt disponibles ici.
          </p>
          {/* TODO: Implement contact form and display contact info */}
        </div>
      </motion.div>
    </div>
  );
};

export default ContactPage; 