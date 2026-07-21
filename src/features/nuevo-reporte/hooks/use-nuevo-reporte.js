import { useMutation } from '@tanstack/react-query';
import { createReporte } from '../api/nuevo-reporte-api';

/**
 * Hook para mutar y crear un nuevo reporte.
 */
export const useCreateReporte = () => {
  return useMutation({
    mutationFn: (formData) => createReporte(formData),
  });
};
