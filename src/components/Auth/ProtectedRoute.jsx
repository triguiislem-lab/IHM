import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import LoadingSpinner from "../Common/LoadingSpinner";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  if (loading) {
    console.log("[ProtectedRoute] Loading auth state...");
    return <LoadingSpinner />;
  }

  const userRole = user?.normalizedRole;
  console.log(
    `[ProtectedRoute] Location: ${location.pathname}, Role Check: userRole='${userRole}', isAllowed=${isAuthenticated && allowedRoles.includes(userRole)}`
  );

  if (!isAuthenticated || (allowedRoles && !allowedRoles.includes(userRole))) {
    console.log(
      `[ProtectedRoute] Redirecting: isAuthenticated=${isAuthenticated}, allowedRoles=${allowedRoles}, userRole=${userRole}`
    );
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
