import React from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';

const CourseEnrollmentsPage = () => {
  const { courseId } = useParams();

  // TODO: Fetch course details and enrollment list based on courseId

  return (
    <div className="container mx-auto px-4 py-8 min-h-[calc(100vh-200px)]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        <h1 className="text-3xl font-bold mb-8">Inscriptions au Cours (Admin)</h1>
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-gray-600">
            Liste des étudiants inscrits au cours avec l'ID : {courseId}
          </p>
          <p className="text-gray-600 mt-4">
            (Page en cours de construction)
          </p>
          {/* TODO: Implement enrollment list display */}
        </div>
      </motion.div>
    </div>
  );
};

export default CourseEnrollmentsPage; 