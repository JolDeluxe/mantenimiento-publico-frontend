// src/routes/AppRoutes.jsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { PublicRoute } from './PublicRoute';

import LoginPage from '@/features/auth/pages/login-page';
import HomeDashboard from '@/pages/home-dashboard';
import NotFound from '@/pages/not-found';

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Rutas Públicas (Solo accesibles sin sesión) */}
      <Route element={<PublicRoute />}>
        <Route path="/login" element={<LoginPage />} />
      </Route>

      {/* Rutas Privadas (Requieren sesión) */}
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<HomeDashboard />} />
        {/* Aquí se agregarán módulos futuros como /tickets, /usuarios */}
      </Route>

      {/* Rutas Globales de Error */}
      <Route path="/404" element={<NotFound />} />
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  );
};