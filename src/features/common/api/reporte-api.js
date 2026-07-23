import axios from '@/lib/axios';

/**
 * Consulta los detalles de un reporte específico por ID.
 */
export const getReporteById = async (id) => {
  const response = await axios.get(`/api/tickets/${id}`);
  return response.data || response;
};

/**
 * Modifica el estado del reporte (aprobar, rechazar o cancelar).
 * Utilizado por el modal ReporteDetailModal.
 */
export const changeReporteStatus = async (id, data) => {
  const isFormData = data instanceof FormData;
  const config = isFormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : {};
  const response = await axios.patch(`/api/tickets/${id}/status`, data, config);
  return response.data || response;
};

/**
 * Funciones de la API offline para sync-store.js
 * Mantienen la firma, rutas, métodos HTTP y headers exactos del módulo tickets-api original.
 */
export const createTicket = (data) =>
  axios.post('/api/tickets', data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

export const updateTicket = (id, data) =>
  axios.put(`/api/tickets/${id}`, data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

export const changeTicketStatus = (id, data) =>
  axios.patch(`/api/tickets/${id}/status`, data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
