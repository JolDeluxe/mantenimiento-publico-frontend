import api, { handleError } from '@/lib/axios';
import { useAuthStore } from '@/stores/auth-store';

export const authService = {
  /**
   * Iniciar sesión
   */
  login: async (identifier, password) => {
    try {
      // 🚀 CORRECCIÓN: api.post ya devuelve la 'data' limpia gracias al interceptor
      const data = await api.post('/api/auth/login', {
        identifier,
        password,
      });

      const { token, refreshToken, usuario } = data;

      // Guardar en el store global (Zustand)
      useAuthStore.getState().setAuth(usuario, token, refreshToken);

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