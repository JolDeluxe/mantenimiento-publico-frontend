import axios from '@/lib/axios';

/**
 * Consulta la lista de reportes asociados al usuario cliente actual.
 */
export const getReportesActivos = (params = {}) => {
  return axios.get('/api/tickets', {
    params: {
      limit: 1000,
      ...params,
    },
  });
};
