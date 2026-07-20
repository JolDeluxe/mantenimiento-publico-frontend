import axios from '@/lib/axios';

/**
 * Consulta los detalles de un reporte específico por ID.
 */
export const getReporteById = (id) => {
  return axios.get(`/api/tickets/${id}`);
};

/**
 * Modifica el estado del reporte (aprobar, rechazar o cancelar).
 */
export const changeReporteStatus = (id, formData) => {
  return axios.patch(`/api/tickets/${id}/status`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};
