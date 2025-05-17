import React from 'react';
import { Navigate } from 'react-router-dom';
import { pb, isAdmin } from '../lib/pocketbase';
import { AdminDashboard } from './admin/AdminDashboard';
import { UserDashboard } from './user/UserDashboard';

export const Dashboard: React.FC = () => {
  const user = pb.authStore.model;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return isAdmin() ? <AdminDashboard /> : <UserDashboard />;
};