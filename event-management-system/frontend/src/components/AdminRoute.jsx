import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../context/authStore';
import LoadingSpinner from './LoadingSpinner';

const AdminRoute = ({ children }) => {
  const { user, isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading..." />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default AdminRoute;
