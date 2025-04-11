import React from 'react';
import { motion } from 'framer-motion';

// Example: If you want specific icons for specific titles
// import { MdPeople, MdSchool, MdAssignment } from 'react-icons/md';

const StatCard = ({ icon: IconComponent, title, value, color = 'blue' }) => {
  const colorVariants = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    orange: 'bg-orange-100 text-orange-600',
    red: 'bg-red-100 text-red-600',
    purple: 'bg-purple-100 text-purple-600',
    indigo: 'bg-indigo-100 text-indigo-600',
    teal: 'bg-teal-100 text-teal-600',
    gray: 'bg-gray-100 text-gray-600',
    // Add more colors as needed
  };

  const bgColorClass = colorVariants[color] || colorVariants.blue; // Default to blue

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-lg shadow-md p-5 hover:shadow-lg transition-shadow duration-300"
    >
      <div className="flex items-center gap-4">
        {IconComponent && (
          <div className={`p-3 rounded-full ${bgColorClass}`}>
            <IconComponent className="text-2xl" />
          </div>
        )}
        <div>
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">
            {title}
          </h3>
          <p className="text-3xl font-bold text-gray-900">
            {value}
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default StatCard; 