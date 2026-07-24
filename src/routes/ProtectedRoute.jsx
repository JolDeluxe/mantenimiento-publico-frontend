import { useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth-store';

const ROLES_EQUIPO = ['TECNICO', 'COORDINADOR_MTTO', 'JEFE_MTTO', 'SUPER_ADMIN'];

export const ProtectedRoute = () => {
  const location = useLocation();
  const { isAuthenticated, user: userState, token, refreshToken } = useAuthStore();
  const user = userState?.data ?? userState;
  const userRol = user?.rol;
  let urlDestino = import.meta.env.VITE_URL_SISTEMA_INTERNO || 'http://localhost:5000';
  if (urlDestino.endsWith('/')) urlDestino = urlDestino.slice(0, -1);
  const loopDetected = urlDestino === window.location.origin
    ? `VITE_URL_SISTEMA_INTERNO es idéntica al origen (${urlDestino}). Revisa tu archivo .env.`
    : '';

  useEffect(() => {
    if (isAuthenticated && ROLES_EQUIPO.includes(userRol)) {
      if (loopDetected) return;

      const payload = encodeURIComponent(JSON.stringify({ user: userState, token, refreshToken }));

      // 🚀 ARREGLO 4: Destruir la sesión zombie en este portal antes de saltar
      useAuthStore.getState().logout();

      window.location.replace(`${urlDestino}/sso-receiver#payload=${payload}`);
    }
  }, [isAuthenticated, userRol, userState, token, refreshToken, loopDetected, urlDestino]);

  if (loopDetected) {
    return <div className="p-10 text-red-600 font-mono font-bold text-center">🛑 BUCLE INFINITO PREVENIDO: {loopDetected}</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (ROLES_EQUIPO.includes(userRol)) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 space-y-6">
          <img 
            src="/img/01_Cuadra.webp" 
            alt="Logo Cuadra" 
            className="w-48 h-auto object-contain animate-pulse drop-shadow-md" 
          />
          <p className="text-sm font-semibold text-gray-600 tracking-wide animate-pulse">
            Saltando a portal correspondiente...
          </p>
        </div>
      );
   }

  return <Outlet />;
};
