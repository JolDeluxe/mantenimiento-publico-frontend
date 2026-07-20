import { useQuery } from '@tanstack/react-query';
import { getReportesActivos } from '../api/activos-api';

/**
 * Hook de React Query para reportes activos del cliente.
 */
export const useActivos = (params = {}) => {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['reportes-activos', params],
    queryFn: async () => {
      const response = await getReportesActivos(params);
      return response.data;
    },
  });

  const rawList = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
  
  // Filtramos para obtener únicamente reportes que no estén CERRADOS o CANCELADOS
  const activos = rawList.filter(
    (r) => r.estado !== 'CERRADO' && r.estado !== 'CANCELADA'
  );

  return {
    data: activos,
    isLoading,
    isError,
    refetch,
  };
};
