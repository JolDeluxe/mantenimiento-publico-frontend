import api, { handleError, isDefinitiveAuthError, isSessionInvalidError, isTemporaryAuthError } from '@/lib/axios';
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

      const { user } = data;

      if (!user) {
        throw new Error('El backend no devolvió las credenciales correctamente');
      }

      const verifiedPayload = await api.get('/api/auth/me', { _skipAuthRedirect: true });
      const verifiedUser = verifiedPayload?.user || verifiedPayload?.data || verifiedPayload;

      if (!verifiedUser) {
        throw new Error('No se pudo verificar la sesión iniciada.');
      }

      useAuthStore.getState().setAuth(verifiedUser);

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
      await api.post('/api/auth/logout', {});

      useAuthStore.getState().logout();
      window.location.href = '/login';
    } catch (error) {
      if (isSessionInvalidError(error) || isDefinitiveAuthError(error) || error?.response?.status === 400) {
        useAuthStore.getState().logout();
        window.location.href = '/login';
        return;
      }

      if (isTemporaryAuthError(error)) {
        throw new Error('No fue posible cerrar sesión porque el servidor no está disponible. Intenta nuevamente.');
      }

      throw new Error('No fue posible cerrar sesión. Intenta nuevamente.');
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
