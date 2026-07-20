import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { loadAuthSession } from '../lib/authStorage';

interface RequireAuthProps {
  children: React.ReactNode;
  roles?: readonly string[];
}

const RequireAuth: React.FC<RequireAuthProps> = ({ children, roles }) => {
  const location = useLocation();
  const session = loadAuthSession();

  if (!session?.accessToken) {
    return <Navigate to="/account/login" replace state={{ from: location.pathname }} />;
  }

  if (roles && !roles.includes(session.user.role)) {
    return <Navigate to="/account" replace />;
  }

  return <>{children}</>;
};

export default RequireAuth;
