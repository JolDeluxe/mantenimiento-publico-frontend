import api, { handleResponse, handleError } from '@/lib/axios';
import { useAuthStore } from '@/stores/auth-store';

export const authService = {
  /**
   * Iniciar sesión
   */
  login: async (identifier, password) => {
    try {
      const response = await api.post('/api/auth/login', {
        identifier,
        password,
      });

      const { token, refreshToken, usuario } = response.data;

      // Guardar en el store
      useAuthStore.getState().setAuth(usuario, token, refreshToken);

      return handleResponse(response);
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

      // Limpiar store
      useAuthStore.getState().logout();

      // Redirigir
      window.location.href = '/login';
    } catch (error) {
      // Aunque falle, limpiar localmente
      useAuthStore.getState().logout();
      window.location.href = '/login';
    }
  },

  /**
   * Obtener perfil actual
   */
  getProfile: async () => {
    try {
      const response = await api.get('/api/auth/me');
      return handleResponse(response);
    } catch (error) {
      handleError(error);
    }
  },
};