import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRole?: 'STUDENT' | 'ADMIN';
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRole }) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-bg">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-brand-teal animate-spin" />
          <p className="text-sm font-medium text-brand-muted">Loading MLT Learning Zone...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRole && user.role !== allowedRole) {
    if (user.role === 'ADMIN') {
      return <Navigate to="/admin" replace />;
    } else {
      return <Navigate to="/student/dashboard" replace />;
    }
  }

  return <>{children}</>;
};
