import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import useAuthStore from '../core/store/useAuthStore';
import usePermissions from '../shared/hooks/usePermissions';

export default function RoleGuard({ children, requiredPermissions = [], requireAll = false, fallbackPath = '/unauthorized' }) {
  const { isAuthenticated, role } = useAuthStore();
  const { hasAnyPermission, hasAllPermissions } = usePermissions();

  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  // Super Admins always pass
  if (role === 'SUPER_ADMIN') {
    return children ? children : <Outlet />;
  }

  // No specific permissions required, just authentication
  if (requiredPermissions.length === 0) {
    return children ? children : <Outlet />;
  }

  const hasAccess = requireAll 
    ? hasAllPermissions(requiredPermissions) 
    : hasAnyPermission(requiredPermissions);

  if (!hasAccess) {
    return <Navigate to={fallbackPath} replace />;
  }

  return children ? children : <Outlet />;
}
