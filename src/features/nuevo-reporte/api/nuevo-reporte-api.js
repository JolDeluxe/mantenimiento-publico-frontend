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
