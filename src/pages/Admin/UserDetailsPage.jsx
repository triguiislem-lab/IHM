import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { fetchUserById, fetchEnrollmentsByUser, fetchCoursesFromDatabase } from '../../utils/firebaseUtils';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import { getAvatarUrl } from '../../utils/avatarUtils';
import { format } from 'date-fns'; // For date formatting
import { MdPerson, MdEmail, MdWork, MdCalendarToday, MdSchool, MdBook, MdEdit, MdBlock, MdAdminPanelSettings } from 'react-icons/md';

const UserDetailsPage = () => {
  const { userId } = useParams();
  const [user, setUser] = useState(null);
  const [relatedData, setRelatedData] = useState([]); // Enrollments or Courses
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadUserDetails = async () => {
      if (!userId) {
        setError("ID utilisateur manquant.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError('');
      try {
        const userData = await fetchUserById(userId);
        if (!userData) {
          setError("Utilisateur non trouvé.");
          setUser(null);
          setRelatedData([]);
          setLoading(false);
          return;
        }
        
        // Ensure role exists, default to student if necessary
        const role = userData.role || userData.userType || 'student';
        const fullUserData = { ...userData, id: userId, role }; // Ensure ID and role are set
        setUser(fullUserData);

        // Fetch related data based on role
        if (role === 'student') {
          const enrollments = await fetchEnrollmentsByUser(userId);
          // Fetch course details for enrolled courses for better display
          const coursePromises = enrollments.map(enroll => fetchCoursesFromDatabase().then(courses => courses.find(c => c.id === enroll.courseId)));
          const coursesDetails = await Promise.all(coursePromises);
          setRelatedData(coursesDetails.filter(Boolean)); // Filter out any nulls if a course wasn't found
        } else if (role === 'instructor') {
          const allCourses = await fetchCoursesFromDatabase();
          const instructorCourses = allCourses.filter(course => course.instructorId === userId);
          setRelatedData(instructorCourses);
        } else {
          setRelatedData([]); // No specific related data for admin or other roles shown here
        }

      } catch (err) {
        setError("Erreur lors du chargement des détails de l'utilisateur.");
        console.error(err);
        setUser(null);
        setRelatedData([]);
      } finally {
        setLoading(false);
      }
    };

    loadUserDetails();
  }, [userId]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <div className="bg-red-100 p-4 rounded-lg text-red-700">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!user) {
     return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p>Utilisateur non trouvé.</p>
      </div>
    );
  }

  // Helper to format date
  const formatDate = (dateString) => {
    try {
        // Handle potential Firebase Timestamp object or ISO string
        const date = dateString?.toDate ? dateString.toDate() : new Date(dateString);
        return format(date, 'dd/MM/yyyy HH:mm');
    } catch {
        return 'Date inconnue';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 min-h-[calc(100vh-200px)]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        <div className="flex flex-col md:flex-row items-center md:items-start mb-8 gap-6">
          <img 
            src={getAvatarUrl(user)}
            alt={`${user.firstName || ''} ${user.lastName || ''}`}
            className="w-24 h-24 md:w-32 md:h-32 rounded-full object-cover border-4 border-secondary shadow-md"
            onError={(e) => { e.target.src = getAvatarUrl({}); }} // Fallback avatar
          />
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-3xl font-bold mb-1">{`${user.firstName || ''} ${user.lastName || ''}`.trim() || `Utilisateur ${userId.substring(0, 6)}...`}</h1>
            <span className={`capitalize inline-block px-3 py-1 text-sm font-semibold rounded-full ${user.role === 'admin' ? 'bg-red-100 text-red-800' : user.role === 'instructor' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
              {user.role}
            </span>
            <p className="text-gray-600 mt-2 flex items-center justify-center md:justify-start gap-2"><MdEmail /> {user.email || 'Email non fourni'}</p>
             {user.createdAt && (
                <p className="text-sm text-gray-500 mt-1 flex items-center justify-center md:justify-start gap-2">
                    <MdCalendarToday /> Inscrit le: {formatDate(user.createdAt)}
                 </p>
             )}
          </div>
           {/* Admin Actions Placeholder */}
            <div className="flex flex-col sm:flex-row md:flex-col gap-2 mt-4 md:mt-0">
                 <button className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 flex items-center gap-1 disabled:opacity-50" disabled title="Fonctionnalité à venir">
                     <MdAdminPanelSettings /> Changer Rôle
                 </button>
                 <button className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 flex items-center gap-1 disabled:opacity-50" disabled title="Fonctionnalité à venir">
                     <MdBlock /> Désactiver
                 </button>
             </div>
        </div>

        {/* User Details Section */} 
        <div className="bg-white rounded-lg shadow-md p-6 md:p-8 mb-8">
            <h2 className="text-xl font-semibold mb-4 border-b pb-2">Informations du Profil</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 {user.bio && (
                     <div className="text-gray-700">
                         <strong className="block text-sm font-medium text-gray-500">Bio:</strong>
                         <p>{user.bio}</p>
                     </div>
                 )}
                 {user.role === 'instructor' && user.expertise && (
                     <div className="text-gray-700">
                         <strong className="block text-sm font-medium text-gray-500">Expertise:</strong>
                         <p>{user.expertise}</p>
                     </div>
                 )}
                 {/* Add more profile fields as needed */} 
             </div>
             {(!user.bio && (!user.expertise || user.role !== 'instructor')) && (
                <p className="text-gray-500 italic">Aucune information de profil supplémentaire fournie.</p>
             )}
        </div>

        {/* Related Data Section (Courses) */} 
        {relatedData.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-6 md:p-8">
                 <h2 className="text-xl font-semibold mb-4 border-b pb-2">
                     {user.role === 'student' ? 'Cours Inscrits' : 'Cours Créés'}
                 </h2>
                 <div className="space-y-4">
                    {relatedData.map(item => (
                        <div key={item.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center border p-4 rounded-md hover:bg-gray-50">
                            <div>
                                <Link to={`/course/${item.id}`} className="font-medium text-indigo-600 hover:text-indigo-800">
                                     {item.title || item.titre || `Cours ${item.id}`}
                                 </Link>
                                 {item.category && (
                                     <p className="text-sm text-gray-500">Catégorie: {item.category}</p>
                                 )}
                             </div>
                             <Link 
                                 to={user.role === 'student' ? `/course/${item.id}` : `/admin/course-form/${item.id}`}
                                 className="mt-2 sm:mt-0 px-3 py-1 text-sm font-medium text-white bg-secondary rounded-md hover:bg-secondary/90 flex items-center gap-1"
                             >
                                 {user.role === 'student' ? <MdBook /> : <MdEdit />}
                                 {user.role === 'student' ? 'Voir Cours' : 'Éditer Cours'}
                             </Link>
                        </div>
                    ))}
                 </div>
            </div>
        )}

      </motion.div>
    </div>
  );
};

export default UserDetailsPage; 