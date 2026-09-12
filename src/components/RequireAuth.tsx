import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { canAccessAdminPanel } from '../config/adminAccess';
import { loadAuthSession } from '../lib/authStorage';

interface RequireAuthProps {
  children: React.ReactNode;
  roles?: readonly string[];
  requireAdminEmail?: boolean;
}

const RequireAuth: React.FC<RequireAuthProps> = ({ children, roles, requireAdminEmail }) => {
  const location = useLocation();
  const session = loadAuthSession();

  if (!session?.accessToken) {
    return (
      <Navigate
        to="/account/login"
        replace
        state={{ from: `${location.pathname}${location.search}` }}
      />
    );
  }

  if (roles && !roles.includes(session.user.role)) {
    return <Navigate to="/account" replace />;
  }

  if (requireAdminEmail && !canAccessAdminPanel(session.user)) {
    return <Navigate to="/account" replace />;
  }

  return <>{children}</>;
};

export default RequireAuth;
