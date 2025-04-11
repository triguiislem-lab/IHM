import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const ProfileRedirect = () => {
  const navigate = useNavigate();
  const { userRole, loading } = useAuth();

  useEffect(() => {
    // Only navigate when loading is done AND userRole is determined (not null)
    if (!loading && userRole) { 
        // *** ADDED LOG: Log the role value right before navigation decision ***
        console.log(`[ProfileRedirect] Decision time! loading=${loading}, userRole='${userRole}'`); 

      if (userRole === 'admin') {
        console.log(`[ProfileRedirect] Role matches 'admin', navigating to /admin/profile`);
        navigate('/admin/profile', { replace: true }); 
      } else if (userRole === 'instructor') {
        console.log(`[ProfileRedirect] Role matches 'instructor', navigating to /instructor/profile`);
        navigate('/instructor/profile', { replace: true }); 
      } else if (userRole === 'student') {
        console.log(`[ProfileRedirect] Role matches 'student', navigating to /student/profile`);
        navigate('/student/profile', { replace: true }); 
      } else {
        // This case should ideally not be reached if userRole is checked for null
        console.log(`[ProfileRedirect] Role ('${userRole}') NOT recognized, navigating to /`);
        navigate('/', { replace: true }); 
      }
    } else if (!loading && !userRole) {
        // *** ADDED LOG: Log if loading is done but userRole is still null/falsy ***
        console.log(`[ProfileRedirect] Loading done, but userRole is still falsy ('${userRole}'). Waiting.`);
    }
  }, [userRole, loading, navigate]);

  // Afficher un indicateur de chargement pendant la redirection
  return (
    <div className="flex justify-center items-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
  );
};

export default ProfileRedirect;
