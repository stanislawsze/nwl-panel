import { Navigate, Outlet, useLocation } from 'react-router-dom';

import { useAuth } from '../modules/auth/AuthProvider';

export function RequireAuth() {
  const { token, isBooting } = useAuth();
  const location = useLocation();

  if (isBooting) {
    return <div className="screen-message">Preparing your workspace...</div>;
  }

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}
