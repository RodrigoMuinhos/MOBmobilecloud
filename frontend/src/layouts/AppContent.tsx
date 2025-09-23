// layouts/AppContent.tsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import AppShell from '../components/layout/AppShell';

export default function AppContent() {
  return (
    <AppShell>
      <Outlet />
    </AppShell>
  );
}
