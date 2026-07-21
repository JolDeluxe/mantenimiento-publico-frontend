import axios from '@/lib/axios';

/**
 * Consulta la lista de reportes finalizados del usuario actual.
 */
export const getReportesHistorico = (params = {}) => {
  return axios.get('/api/tickets', { 
    params: { 
      ...params, 
      estado: 'CERRADO' // Forzamos estado Cerrado para el historial
    } 
  });
};
