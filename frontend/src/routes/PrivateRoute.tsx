// src/routes/PrivateRoute.tsx
import React, { ReactNode } from 'react';
// import { Navigate } from 'react-router-dom';
// import { useAuth } from '../context/AuthContext';

const PrivateRoute = ({ children }: { children: ReactNode }) => {
  // 🔒 Auth desativado temporariamente:
  // const { loginAtivo } = useAuth();
  // if (!loginAtivo) return <Navigate to="/login" replace />;

  return <>{children}</>;
};

export default PrivateRoute;
