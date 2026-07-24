import axios from '@/lib/axios';

/**
 * Consulta la lista de reportes asociados al usuario cliente actual.
 */
export const getReportesHistorico = (params = {}) => {
  return axios.get('/api/tickets', {
    params: {
      limit: 1000,
      ...params,
    },
  });
};
