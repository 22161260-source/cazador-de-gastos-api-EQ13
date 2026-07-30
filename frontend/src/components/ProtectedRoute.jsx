import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// Ruta que requiere autenticación
export function ProtectedRoute({ requiredRole }) {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;

  if (requiredRole) {
    const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    if (!roles.includes(user.role?.name)) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return <Outlet />;
}

// Ruta solo para usuarios NO autenticados (login, register)
export function GuestRoute() {
  const { user } = useAuth();
  if (user) return <Navigate to="/dashboard" replace />;
  return <Outlet />;
}
