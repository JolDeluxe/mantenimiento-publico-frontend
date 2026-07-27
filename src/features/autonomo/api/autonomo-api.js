import axios from '@/lib/axios';

/**
 * Consulta el gateway público de mantenimientos autónomos
 */
export const getAutonomosGateway = (codigo) => {
  return axios.get(`/api/public/autonomos/gateway`, {
    params: { codigo }
  }).then((res) => res.data);
};
