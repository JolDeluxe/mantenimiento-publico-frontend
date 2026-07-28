// src/routes/AppRoutes.jsx

import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth-store';
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
import NuevoReporteGateway from '@/features/nuevo-reporte/pages/nuevo-reporte-gateway';
import AutonomoPage from '@/features/autonomo/pages/autonomo-page';
import ReporteDetallePage from '@/features/common/pages/reporte-detalle-page';

const ROLES = {
  notificaciones: MODULES_CONFIG.find(m => m.id === 'notificaciones')?.allowedRoles || [],
};

export const AppRoutes = () => {
  const [isHydrated, setIsHydrated] = useState(() => useAuthStore.persist.hasHydrated());
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  // Esperar a que Zustand complete la hidratación de localStorage
  useEffect(() => {
    if (useAuthStore.persist.hasHydrated()) {
      const timer = setTimeout(() => {
        setIsHydrated(true);
      }, 0);
      return () => clearTimeout(timer);
    }

    const unsubFinishHydrate = useAuthStore.persist.onFinishHydrate(() => {
      setIsHydrated(true);
    });

    return () => {
      unsubFinishHydrate();
    };
  }, []);

  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-4 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-semibold text-slate-600 tracking-wide animate-pulse font-sans">
          Cargando sesión...
        </p>
      </div>
    );
  }

  return (
    <Routes>
      {/* Recibidor SSO */}
      <Route path="/sso-receiver" element={<SsoReceiver />} />

      {/* Rutas Públicas */}
      <Route element={<PublicRoute />}>
        <Route path="/login" element={<LoginPage />} />
      </Route>

      {/* Enrutamiento dinámico condicional para /nuevo-reporte */}
      {isAuthenticated ? (
        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="/nuevo-reporte" element={<NuevoReportePage />} />
          </Route>
        </Route>
      ) : (
        <Route path="/nuevo-reporte" element={<NuevoReporteGateway />} />
      )}

      {/* Formulario autónomo público */}
      <Route path="/autonomo" element={<AutonomoPage />} />

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