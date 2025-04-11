import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { fetchCourseById, fetchCourseEnrollments, fetchUserById } from '../../utils/firebaseUtils';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import { getAvatarUrl } from '../../utils/avatarUtils';
import { format } from 'date-fns'; // For date formatting
import { MdPerson, MdEmail, MdCalendarToday, MdArrowBack } from 'react-icons/md';

const CourseEnrollmentsPage = () => {
  const { courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadEnrollmentData = async () => {
      if (!courseId) {
        setError("ID du cours manquant.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError('');
      try {
        // Fetch course details
        const courseData = await fetchCourseById(courseId);
        if (!courseData) {
          setError("Cours non trouvé.");
          setLoading(false);
          return;
        }
        setCourse(courseData);

        // Fetch enrollments for the course
        const enrollmentList = await fetchCourseEnrollments(courseId);
        
        // Fetch user details for each enrollment
        const enrollmentDetailsPromises = enrollmentList.map(async (enrollment) => {
          try {
            const studentData = await fetchUserById(enrollment.userId);
            return {
              ...enrollment,
              student: studentData || { id: enrollment.userId, firstName: 'Utilisateur', lastName: 'Inconnu' } // Fallback if user not found
            };
          } catch (userError) {
            console.error(`Error fetching user ${enrollment.userId}:`, userError);
            return {
               ...enrollment,
               student: { id: enrollment.userId, firstName: 'Utilisateur', lastName: 'Erreur' } // Mark as error
            };
          }
        });

        const detailedEnrollments = await Promise.all(enrollmentDetailsPromises);
        setEnrollments(detailedEnrollments);

      } catch (err) {
        setError("Erreur lors du chargement des inscriptions.");
        console.error(err);
        setCourse(null);
        setEnrollments([]);
      } finally {
        setLoading(false);
      }
    };

    loadEnrollmentData();
  }, [courseId]);

  // Helper to format date
  const formatDate = (dateString) => {
    try {
        const date = dateString?.toDate ? dateString.toDate() : new Date(dateString);
        return format(date, 'dd/MM/yyyy HH:mm');
    } catch {
        return 'Date inconnue';
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <div className="bg-red-100 p-4 rounded-lg text-red-700">
          <p>{error}</p>
        </div>
        <Link to="/admin/courses" className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
            <MdArrowBack className="-ml-1 mr-2 h-5 w-5" />
            Retour à la gestion des cours
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 min-h-[calc(100vh-200px)]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        <div className="mb-6">
             <Link to="/admin/courses" className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center mb-2">
                 <MdArrowBack className="mr-1 h-4 w-4" />
                 Retour à la gestion des cours
             </Link>
             <h1 className="text-3xl font-bold">Inscriptions pour: {course?.title || course?.titre || 'Cours'}</h1>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {enrollments.length > 0 ? (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Étudiant
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date d'inscription
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {enrollments.map(({ enrollmentId, student, enrollmentDate }) => (
                  <tr key={enrollmentId || student.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <img 
                             className="h-10 w-10 rounded-full object-cover"
                             src={getAvatarUrl(student)}
                             alt="" 
                             onError={(e) => { e.target.src = getAvatarUrl({}); }} // Fallback avatar
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                             {`${student.firstName || ''} ${student.lastName || ''}`.trim() || `Utilisateur ${student.id.substring(0,6)}...`}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{student.email || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-500">
                        {enrollmentDate ? formatDate(enrollmentDate) : 'Date inconnue'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Link to={`/admin/user/${student.id}`} className="text-indigo-600 hover:text-indigo-900 hover:underline">
                        Voir Détails
                      </Link>
                       {/* Placeholder for remove enrollment action */}
                       {/* <button className="ml-4 text-red-600 hover:text-red-900 hover:underline">Retirer</button> */}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center p-12">
              <h3 className="mt-2 text-sm font-medium text-gray-900">Aucune inscription</h3>
              <p className="mt-1 text-sm text-gray-500">Il n'y a pas encore d'étudiants inscrits à ce cours.</p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default CourseEnrollmentsPage; 