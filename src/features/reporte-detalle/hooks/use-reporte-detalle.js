import { useQuery } from '@tanstack/react-query';
import { getReporteById } from '../api/reporte-detalle-api';

/**
 * Hook React Query para obtener el detalle de un reporte individual por ID.
 */
export const useReporteDetalle = (id) => {
  return useQuery({
    queryKey: ['reporte', id],
    queryFn: async () => {
      const response = await getReporteById(id);
      return response;
    },
    enabled: !!id,
  });
};
