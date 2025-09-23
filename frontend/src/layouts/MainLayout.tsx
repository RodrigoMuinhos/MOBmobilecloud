// layouts/MainLayout.tsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import AppShell from '../components/layout/AppShell';

export default function MainLayout() {
  return (
    <AppShell>
      <Outlet />
    </AppShell>
  );
}
