import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { StatusMessage } from '../../../components/ui';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  children: ReactNode;
  requireAdmin?: boolean;
}

export function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
  const { isAuthenticated, isAdmin, isInitializing } = useAuth();
  const location = useLocation();

  if (isInitializing) {
    return <StatusMessage busy>読み込み中...</StatusMessage>;
  }
  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  if (requireAdmin && !isAdmin) {
    return <Navigate to="/articles" replace />;
  }
  return <>{children}</>;
}
