import { useQuery } from '@tanstack/react-query';
import { getReportesHistorico } from '../api/historico-api';

/**
 * Hook de React Query para reportes del historial finalizados.
 */
export const useHistorico = (params = {}) => {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['reportes-historico', params],
    queryFn: async () => {
      const response = await getReportesHistorico(params);
      return response.data;
    },
  });

  return {
    data: data?.data || [],
    isLoading,
    isError,
    refetch,
  };
};
