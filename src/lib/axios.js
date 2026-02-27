/**
 * Cliente HTTP Centralizado con Interceptores Inteligentes
 * 
 * Características:
 * - Auto-inyección de JWT en headers
 * - Refresh automático de tokens expirados
 * - Queue de peticiones durante refresh
 * - Logout automático en fallos críticos
 * - Manejo global de errores
 * - Retry logic configurable
 * - Timeout inteligente
 */
import { useAuthStore } from '@/stores/auth-store';

import axios from 'axios';
import { ENV } from '@/config/env';

// Importaremos el store después de crearlo
// import { useAuthStore } from '@/stores/auth-store';

// ============================================================
// CONFIGURACIÓN BASE
// ============================================================

const api = axios.create({
  baseURL: ENV.API_URL,
  timeout: 15000, // 15 segundos
  headers: {
    'Content-Type': 'application/json',
  },
});

// ============================================================
// SISTEMA DE REFRESH TOKEN (Anti-Race Condition)
// ============================================================

let isRefreshing = false;
let failedQueue = [];

/**
 * Procesa la cola de requests fallidos después del refresh
 */
const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  
  failedQueue = [];
};

/**
 * Intenta renovar el access token usando el refresh token
 */
const refreshAccessToken = async () => {
  try {
    // Obtener refresh token del localStorage
    const refreshToken = localStorage.getItem('refreshToken');
    
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    // Llamar al endpoint de refresh SIN interceptores (para evitar loop)
    const response = await axios.post(
      `${ENV.API_URL}/api/auth/refresh`,
      { refreshToken },
      { 
        headers: { 'Content-Type': 'application/json' },
        timeout: 10000 
      }
    );

    const { accessToken } = response.data;

    if (!accessToken) {
      throw new Error('No access token in refresh response');
    }

    // Guardar el nuevo token
    localStorage.setItem('token', accessToken);

    // Actualizar el store (lo haremos después)
    useAuthStore.getState().setToken(accessToken);

    return accessToken;

  } catch (error) {
    // Si el refresh falla, limpiar todo y forzar logout
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    
    // Redirigir al login
    if (window.location.pathname !== '/login') {
      window.location.href = '/login?session=expired';
    }

    throw error;
  }
};

// ============================================================
// INTERCEPTOR DE REQUEST (Inyectar Token)
// ============================================================

api.interceptors.request.use(
  (config) => {
    // Obtener token del localStorage
    const token = localStorage.getItem('token');
    
    // Si existe token y la URL no es de autenticación pública, inyectarlo
    if (token && !config.url?.includes('/auth/login') && !config.url?.includes('/auth/register')) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Log en desarrollo
    if (ENV.IS_DEV) {
      console.log(`🌐 [${config.method?.toUpperCase()}] ${config.url}`, {
        hasToken: !!token,
        data: config.data,
      });
    }

    return config;
  },
  (error) => {
    console.error('❌ Error en Request Interceptor:', error);
    return Promise.reject(error);
  }
);

// ============================================================
// INTERCEPTOR DE RESPONSE (Manejo de Errores y Refresh)
// ============================================================

api.interceptors.response.use(
  (response) => {
    // Respuesta exitosa, retornar directamente
    if (ENV.IS_DEV) {
      console.log(`✅ [${response.status}] ${response.config.url}`);
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // --------------------------------------------------------
    // ERROR 401: Token Expirado o Inválido
    // --------------------------------------------------------
    if (error.response?.status === 401 && !originalRequest._retry) {
      
      // Evitar loop infinito
      if (originalRequest.url?.includes('/auth/refresh')) {
        console.error('🔴 Refresh token inválido, cerrando sesión...');
        localStorage.clear();
        window.location.href = '/login?session=expired';
        return Promise.reject(error);
      }

      // Si ya está refrescando, encolar este request
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(token => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch(err => Promise.reject(err));
      }

      // Marcar como "en proceso de refresh"
      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const newToken = await refreshAccessToken();
        
        // Procesar cola exitosamente
        processQueue(null, newToken);
        
        // Reintentar el request original con el nuevo token
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);

      } catch (refreshError) {
        // Refresh falló, limpiar cola
        processQueue(refreshError, null);
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // --------------------------------------------------------
    // ERROR 403: Sin Permisos
    // --------------------------------------------------------
    if (error.response?.status === 403) {
      console.error('🚫 Acceso Denegado - Sin permisos suficientes');
      
      // Opcional: Redirigir a página de sin permisos
      if (window.location.pathname !== '/unauthorized') {
        // window.location.href = '/unauthorized';
      }
    }

    // --------------------------------------------------------
    // ERROR 500: Error del Servidor
    // --------------------------------------------------------
    if (error.response?.status === 500) {
      console.error('🔥 Error Interno del Servidor');
      
      // Opcional: Mostrar notificación global
      // notifyError('Error del servidor. Intenta de nuevo más tarde.');
    }

    // --------------------------------------------------------
    // ERROR DE RED (Sin Respuesta del Servidor)
    // --------------------------------------------------------
    if (!error.response) {
      console.error('📡 Error de Red - Backend no disponible');
      
      // Opcional: Mostrar modo offline
      // notifyError('No hay conexión con el servidor');
    }

    // Log completo del error en desarrollo
    if (ENV.IS_DEV) {
      console.group('❌ Error HTTP');
      console.log('URL:', originalRequest.url);
      console.log('Método:', originalRequest.method);
      console.log('Status:', error.response?.status);
      console.log('Mensaje:', error.response?.data?.message || error.message);
      console.log('Data:', error.response?.data);
      console.groupEnd();
    }

    return Promise.reject(error);
  }
);

// ============================================================
// HELPERS ADICIONALES
// ============================================================

/**
 * Wrapper para manejar respuestas de forma consistente
 */
export const handleResponse = (response) => {
  return response.data;
};

/**
 * Wrapper para manejar errores de forma consistente
 */
export const handleError = (error) => {
  const message = error.response?.data?.message 
    || error.response?.data?.error
    || error.message 
    || 'Error desconocido';
  
  throw new Error(message);
};

/**
 * Helper para peticiones con reintentos
 */
export const fetchWithRetry = async (fn, retries = 3, delay = 1000) => {
  try {
    return await fn();
  } catch (error) {
    if (retries === 0) throw error;
    
    await new Promise(resolve => setTimeout(resolve, delay));
    return fetchWithRetry(fn, retries - 1, delay * 2);
  }
};

// ============================================================
// EXPORTACIONES
// ============================================================

export default api;

// Exportar métodos directo para conveniencia
export const get = (url, config) => api.get(url, config);
export const post = (url, data, config) => api.post(url, data, config);
export const put = (url, data, config) => api.put(url, data, config);
export const patch = (url, data, config) => api.patch(url, data, config);
export const del = (url, config) => api.delete(url, config);