import api, { handleError } from '@/lib/axios';
import { useAuthStore } from '@/stores/auth-store';

export const authService = {
  /**
   * Iniciar sesión
   */
  login: async (identifier, password) => {
    try {
      const data = await api.post('/api/auth/login', {
        identifier,
        password,
      });

      // Leer exactamente las keys que envía el backend
      const { accessToken, refreshToken, user } = data;

      // Guardar en el store global (Zustand) mapeando al formato que espera setAuth
      useAuthStore.getState().setAuth(user, accessToken, refreshToken);

      return data;
    } catch (error) {
      handleError(error);
    }
  },

  /**
   * Registrar cliente interno.
   * NO inicia sesión automáticamente — solo devuelve la respuesta del backend.
   * El componente es responsable de leer response.user.username y mostrar el modal.
   */
  register: async (userData) => {
    try {
      const data = await api.post('/api/auth/register', userData);
      // Intencionalmente NO se llama a setAuth() aquí.
      // El usuario deberá iniciar sesión manualmente después del registro.
      return data;
    } catch (error) {
      handleError(error);
    }
  },

  /**
   * Cerrar sesión
   */
  logout: async () => {
    try {
      const refreshToken = useAuthStore.getState().refreshToken;

      await api.post('/api/auth/logout', { refreshToken });

      useAuthStore.getState().logout();
      window.location.href = '/login';
    } catch (error) {
      useAuthStore.getState().logout();
      window.location.href = '/login';
    }
  },

  /**
   * Obtener perfil actual
   */
  getProfile: async () => {
    try {
      const data = await api.get('/api/auth/me');
      return data;
    } catch (error) {
      handleError(error);
    }
  },
};