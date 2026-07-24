import { useQuery } from '@tanstack/react-query';
import { getReportesHistorico } from '../api/historico-api';

const getSortDate = (reporte) => {
  const value = reporte?.updatedAt || reporte?.createdAt;
  const time = value ? new Date(value).getTime() : 0;
  return Number.isNaN(time) ? 0 : time;
};

const ordenarParaCliente = (reportes = []) =>
  [...reportes].sort((a, b) => {
    // 1. Mostrar siempre las cerradas (CERRADO) al último
    const aClosed = a.estado === 'CERRADO';
    const bClosed = b.estado === 'CERRADO';
    if (aClosed !== bClosed) return aClosed ? 1 : -1;

    // 2. Mostrar siempre las resueltas (RESUELTO) primero de entre las activas
    const aResuelto = a.estado === 'RESUELTO';
    const bResuelto = b.estado === 'RESUELTO';
    if (aResuelto !== bResuelto) return aResuelto ? -1 : 1;

    // 3. Ordenar por fecha de actualización/creación de forma descendente
    return getSortDate(b) - getSortDate(a);
  });

/**
 * Hook de React Query para reportes del historial (activos y cerrados).
 */
export const useHistorico = (params = {}) => {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['reportes-historico', params],
    queryFn: async () => {
      const response = await getReportesHistorico(params);
      return response.data;
    },
  });

  const rawList = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];

  // Excluimos las canceladas (según requerimiento, nunca se muestran)
  const filtrados = rawList.filter(
    (r) => r.estado !== 'CANCELADA'
  );

  return {
    data: ordenarParaCliente(filtrados),
    isLoading,
    isError,
    refetch,
  };
};
export default useHistorico;
