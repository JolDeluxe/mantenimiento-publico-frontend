// src/routes/AppRoutes.jsx

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { PublicRoute } from './PublicRoute';
import { RoleGuard } from './RoleGuard';
import { MODULES_CONFIG } from '@/config/modules-config';

// Componentes del portal
import ProfilePage from '@/features/auth/pages/profile-page';
import { DashboardLayout } from '@/layouts/dashboard-layout';
import LoginPage from '@/features/auth/pages/login-page';
import NotFound from '@/pages/not-found';
import SsoReceiver from '@/pages/sso-receiver';
import NotifyPage from '@/features/notificaciones/pages/notify-page';

// Componentes del cliente (portal público modularizado)
import WelcomePage from '@/features/bienvenida/pages/welcome-page';
import ActivosPage from '@/features/activos/pages/activos-page';
import HistoricoPage from '@/features/historico/pages/historico-page';
import NuevoReportePage from '@/features/nuevo-reporte/pages/nuevo-reporte';
import ReporteDetallePage from '@/features/common/pages/reporte-detalle-page';

const ROLES = {
  notificaciones: MODULES_CONFIG.find(m => m.id === 'notificaciones')?.allowedRoles || [],
};

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Recibidor SSO */}
      <Route path="/sso-receiver" element={<SsoReceiver />} />

      {/* Rutas Públicas */}
      <Route element={<PublicRoute />}>
        <Route path="/login" element={<LoginPage />} />
      </Route>

      {/* Rutas Protegidas */}
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>

          {/* REDIRECCIÓN RAÍZ: Redirige a la página de bienvenida */}
          <Route index element={<Navigate to="/bienvenida" replace />} />

          {/* Perfil del Usuario */}
          <Route path="/perfil" element={<ProfilePage />} />

          {/* Notificaciones */}
          <Route element={<RoleGuard allowedRoles={ROLES.notificaciones} />}>
            <Route path="/notificaciones" element={<NotifyPage />} />
          </Route>

          {/* Módulo: Reportes del Cliente (Mapeado 1:1 con MODULES_CONFIG del portal público) */}
          <Route element={<RoleGuard allowedRoles={['CLIENTE_INTERNO']} />}>
            <Route path="/bienvenida" element={<WelcomePage />} />
            <Route path="/activos" element={<ActivosPage />} />
            <Route path="/historico" element={<HistoricoPage />} />
            <Route path="/reportes/:id" element={<ReporteDetallePage />} />
            <Route path="/nuevo-reporte" element={<NuevoReportePage />} />
          </Route>

        </Route>
      </Route>

      {/* Redirecciones de seguridad de rutas obsoletas */}
      <Route path="/dashboard/*" element={<Navigate to="/bienvenida" replace />} />
      <Route path="/tickets/*" element={<Navigate to="/activos" replace />} />

      {/* 404 */}
      <Route path="/404" element={<NotFound />} />
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  );
};

export default AppRoutes;