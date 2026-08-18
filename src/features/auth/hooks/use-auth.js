import { useState } from 'react';
import { authService } from '../api/auth-api';

export const useAuth = () => {
  const [loading, setLoading] = useState(false);
  const [backendError, setBackendError] = useState(null);

  const login = async (identifier, password) => {
    setLoading(true);
    setBackendError(null);
    try {
      // Tu authService ya guarda en el useAuthStore internamente
      await authService.login(identifier, password);
      return true; // El login fue exitoso
    } catch (error) {
      // Captura el mensaje de error de tu handleError en axios.js
      setBackendError(error.message || 'Error al conectar con el servidor');
      return false; // El login falló
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    setLoading(true);
    setBackendError(null);
    try {
      const data = await authService.register(userData);
      return data;
    } catch (error) {
      setBackendError(error.message || 'Error al procesar el registro');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    login,
    register,
    loading,
    backendError,
    setBackendError
  };
};