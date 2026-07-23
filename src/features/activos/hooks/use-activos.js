import { useQuery } from '@tanstack/react-query';
import { getReportesActivos } from '../api/activos-api';

const getSortDate = (reporte) => {
  const value = reporte?.updatedAt || reporte?.createdAt;
  const time = value ? new Date(value).getTime() : 0;
  return Number.isNaN(time) ? 0 : time;
};

const ordenarParaCliente = (reportes = []) =>
  [...reportes].sort((a, b) => {
    const aResuelto = a.estado === 'RESUELTO';
    const bResuelto = b.estado === 'RESUELTO';
    if (aResuelto !== bResuelto) return aResuelto ? -1 : 1;
    return getSortDate(b) - getSortDate(a);
  });

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
    data: ordenarParaCliente(activos),
    isLoading,
    isError,
    refetch,
  };
};
