import { useQuery } from '@tanstack/react-query';
import { getReporteById } from '../api/reporte-api';

/**
 * Hook React Query para obtener el detalle de un reporte por ID.
 */
export const useReporteDetail = (id) => {
  return useQuery({
    queryKey: ['reporte', id],
    queryFn: () => getReporteById(id),
    enabled: !!id && !isNaN(Number(id)),
    staleTime: 1000 * 30, // 30 segundos
  });
};
