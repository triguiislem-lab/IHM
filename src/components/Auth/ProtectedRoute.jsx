import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import LoadingSpinner from "../Common/LoadingSpinner";

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, userRole, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  // console.log(`[ProtectedRoute] Location: ${location.pathname}, Loading: ${loading}, Authenticated: ${isAuthenticated}, Role: ${userRole}`);

  if (loading) {
    // console.log(`[ProtectedRoute] Location: ${location.pathname}, Status: Waiting for auth loading`);
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    // console.log(`[ProtectedRoute] Location: ${location.pathname}, Status: Not Authenticated, Redirecting to /login`);
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check roles only if allowedRoles are specified
  if (allowedRoles.length > 0) {
    const isAllowed = allowedRoles.includes(userRole);
    console.log(`[ProtectedRoute] Location: ${location.pathname}, Role Check: userRole='${userRole}', isAllowed=${isAllowed}`); // Log role check
    if (!isAllowed) {
        // console.log(`[ProtectedRoute] Location: ${location.pathname}, Status: Role Not Allowed, Redirecting to /${userRole}/dashboard`);
      // Redirect to the user's specific dashboard if their role is known but not allowed for this route
      return <Navigate to={`/${userRole || 'student'}/dashboard`} replace />;
    }
  }

  // console.log(`[ProtectedRoute] Location: ${location.pathname}, Status: Auth OK, Rendering children`);
  return children;
};

export default ProtectedRoute;
