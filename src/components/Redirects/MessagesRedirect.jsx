import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import LoadingSpinner from '../../components/Common/LoadingSpinner';

const MessagesRedirect = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      const role = user?.normalizedRole;
      if (!role) {
        navigate("/login");
      } else if (role === "admin") {
        navigate("/admin/messages");
      } else if (role === "instructor") {
        navigate("/instructor/messages");
      } else {
        navigate("/student/messages");
      }
    }
  }, [loading, user, navigate]);

  return <LoadingSpinner />;
};

export default MessagesRedirect;
