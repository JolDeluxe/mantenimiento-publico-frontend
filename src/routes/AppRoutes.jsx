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
import HomeDashboard from '@/pages/home-dashboard';
import NotFound from '@/pages/not-found';
import SsoReceiver from '@/pages/sso-receiver';

import TicketsPage from '@/features/tickets/pages/tickets-page';
import TicketsBandejaPage from '@/features/tickets/pages/tickets-bandeja';
import TicketsHoyPage from '@/features/tickets/pages/tickets-hoy';
import TicketsHistoricoPage from '@/features/tickets/pages/tickets-historico';
import NotifyPage from '@/features/notificaciones/pages/notify-page';

// Componentes de reportes del cliente (portal público modularizado)
import WelcomePage from '@/features/bienvenida/pages/welcome-page';
import ActivosPage from '@/features/activos/pages/activos-page';
import HistoricoPage from '@/features/historico/pages/historico-page';
import NuevoReportePage from '@/features/nuevo-reporte/pages/nuevo-reporte';
import ReporteDetallePage from '@/features/reporte-detalle/pages/reporte-detalle-page';

// Mapeo seguro con Optional Chaining
const ROLES = {
  dashboard: MODULES_CONFIG.find(m => m.id === 'dashboard')?.allowedRoles || [],
  tickets: MODULES_CONFIG.find(m => m.id === 'tickets')?.allowedRoles || [],
  ticketsHoy: MODULES_CONFIG.find(m => m.id === 'tickets')?.children?.find(c => c.id === 'tickets-hoy')?.allowedRoles || [],
  ticketsBandeja: MODULES_CONFIG.find(m => m.id === 'tickets')?.children?.find(c => c.id === 'tickets-bandeja')?.allowedRoles || [],
  ticketsHistorico: MODULES_CONFIG.find(m => m.id === 'tickets')?.children?.find(c => c.id === 'tickets-historico')?.allowedRoles || [],
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

          {/* Módulos de Administración / Equipo (Redirigidos por ProtectedRoute al interno) */}
          <Route element={<RoleGuard allowedRoles={ROLES.dashboard} />}>
            <Route path="/dashboard" element={<HomeDashboard />} />
          </Route>

          <Route element={<RoleGuard allowedRoles={ROLES.tickets} />}>
            <Route path="/tickets" element={<TicketsPage />}>
              <Route index element={<Navigate to="hoy" replace />} />
              <Route element={<RoleGuard allowedRoles={ROLES.ticketsHoy} />}>
                <Route path="hoy" element={<TicketsHoyPage />} />
              </Route>
              <Route element={<RoleGuard allowedRoles={ROLES.ticketsBandeja} />}>
                <Route path="bandeja" element={<TicketsBandejaPage />} />
              </Route>
              <Route element={<RoleGuard allowedRoles={ROLES.ticketsHistorico} />}>
                <Route path="historico" element={<TicketsHistoricoPage />} />
              </Route>
            </Route>
          </Route>
        </Route>
      </Route>

      {/* 404 */}
      <Route path="/404" element={<NotFound />} />
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  );
};

export default AppRoutes;