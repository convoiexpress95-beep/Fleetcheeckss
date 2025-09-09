import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Instrumentation pour diagnostiquer les 404 /fleetmarket ou redirections inattendues
  if (import.meta.env.DEV) {
    console.debug('[ProtectedRoute] render', { path: location.pathname, loading, hasUser: !!user });
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
  if (import.meta.env.DEV) console.debug('[ProtectedRoute] no user -> redirect login', { from: location.pathname });
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};