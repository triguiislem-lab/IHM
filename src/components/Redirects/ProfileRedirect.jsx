import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const ProfileRedirect = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      const role = user?.normalizedRole;
      if (!role) {
        navigate("/login");
      } else if (role === "admin") {
        navigate("/admin/profile");
      } else if (role === "instructor") {
        navigate("/instructor/profile");
      } else {
        navigate("/student/profile");
      }
    }
  }, [loading, user, navigate]);

  return (
    <div className="flex justify-center items-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
  );
};

export default ProfileRedirect;
