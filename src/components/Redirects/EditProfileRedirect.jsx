import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const EditProfileRedirect = () => {
  const navigate = useNavigate();
  const { userRole, loading } = useAuth();

  useEffect(() => {
    // Only navigate when loading is done AND userRole is determined (not null)
    if (!loading && userRole) { 
      if (userRole === 'admin') {
        navigate('/admin/edit-profile', { replace: true });
      } else if (userRole === 'instructor') {
        navigate('/instructor/edit-profile', { replace: true });
      } else if (userRole === 'student') {
        navigate('/student/edit-profile', { replace: true });
      } else {
        // Role not recognized - Navigate to homepage
        navigate('/', { replace: true });
      }
    }
  }, [userRole, loading, navigate]);

  // Afficher un indicateur de chargement pendant la redirection
  return (
    <div className="flex justify-center items-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
  );
};

export default EditProfileRedirect;
