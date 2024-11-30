import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

export const AdminLayout: React.FC = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);

  if (!isAuthenticated || user?.role !== 'admin') {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Outlet />
    </div>
  );
};