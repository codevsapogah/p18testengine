import React, { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import AuthContext from '../../contexts/AuthContext';

/**
 * Component to protect routes that require authentication
 * 
 * @param {Object} props
 * @param {string} props.role - The required role ('admin' or 'coach')
 * @param {React.ReactNode} props.children - Child components to render if authenticated
 */
const RequireAuth = ({ role, children }) => {
  const { isAuthenticated, isAdmin, isCoach, loading } = useContext(AuthContext);
  const location = useLocation();
  
  // While checking authentication, show nothing
  if (loading) {
    return null;
  }
  
  // Check if user is authenticated
  if (!isAuthenticated()) {
    // Redirect to the appropriate login page
    if (role === 'admin') {
      return <Navigate to="/admin/login" state={{ from: location }} replace />;
    } else {
      return <Navigate to="/coach/login" state={{ from: location }} replace />;
    }
  }
  
  // Check if user has the required role
  if (role === 'admin' && !isAdmin()) {
    return <Navigate to="/unauthorized" state={{ from: location }} replace />;
  }
  
  if (role === 'coach' && !isCoach() && !isAdmin()) {
    return <Navigate to="/unauthorized" state={{ from: location }} replace />;
  }
  
  // If authenticated and has the required role, render children
  return children;
};

export default RequireAuth;