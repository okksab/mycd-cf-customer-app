import React from 'react';
import { Outlet } from 'react-router-dom';
import { DashboardLayout } from '../components/DashboardLayout';

export const Dashboard: React.FC = () => {
  return (
    <DashboardLayout>
      <Outlet />
    </DashboardLayout>
  );
};