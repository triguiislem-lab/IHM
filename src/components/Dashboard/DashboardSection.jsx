import React from 'react';
import { motion } from 'framer-motion';

const DashboardSection = ({ title, children, actionButton, isLoading }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="bg-white rounded-lg shadow-md p-6 mb-8"
    >
      <div className="flex justify-between items-center mb-5 border-b pb-3 border-gray-200">
        <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
        {actionButton && <div className="flex-shrink-0">{actionButton}</div>}
      </div>
      <div>
        {isLoading ? (
          <div className="text-center p-4 text-gray-500">Chargement...</div>
        ) : (
          children
        )}
      </div>
    </motion.div>
  );
};

export default DashboardSection; 