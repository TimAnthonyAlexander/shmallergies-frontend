import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Box } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from './UI/LoadingSpinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isEmailVerified, isLoading, user } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '100vh' 
        }}
      >
        <LoadingSpinner size="large" />
      </Box>
    );
  }

  if (!isAuthenticated) {
    // Redirect them to the /login page, but save the attempted location
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!isEmailVerified && user) {
    // Redirect to email verification page if email is not verified
    return <Navigate to="/verify-email" state={{ email: user.email, fromSignup: false }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute; 