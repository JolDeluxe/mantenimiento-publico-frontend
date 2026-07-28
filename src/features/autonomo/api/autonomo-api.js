import axios from '@/lib/axios';

/**
 * Consulta el gateway público de mantenimientos autónomos
 */
export const getAutonomosGateway = (codigo, config = {}) => {
  return axios.get(`/api/public/autonomos/gateway`, {
    params: { codigo },
    ...config
  });
};

/**
 * Consulta el formulario público dinámico de mantenimiento autónomo
 */
export const getAutonomosFormulario = (codigo, config = {}) => {
  return axios.get(`/api/public/autonomos/formulario`, {
    params: { codigo },
    ...config
  });
};
