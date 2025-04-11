import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import LoadingSpinner from '../../components/Common/LoadingSpinner';

const EditProfileRedirect = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      const role = user?.normalizedRole;
      if (!role) {
        navigate("/login");
      } else if (role === "admin") {
        navigate("/admin/edit-profile");
      } else if (role === "instructor") {
        navigate("/instructor/edit-profile");
      } else {
        navigate("/student/edit-profile");
      }
    }
  }, [loading, user, navigate]);

  return <LoadingSpinner />;
};

export default EditProfileRedirect;
