import axios from '@/lib/axios';

/**
 * Registra un nuevo reporte (incidencia) en el backend (multipart/form-data).
 */
export const createReporte = (formData) => {
  return axios.post('/api/tickets', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

/**
 * Obtiene la lista de plantas operativas disponibles.
 */
export const getPlantas = () => {
  return axios.get('/api/tickets/plantas');
};
