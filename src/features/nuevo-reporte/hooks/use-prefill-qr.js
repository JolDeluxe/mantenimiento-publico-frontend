import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getMaquinaPrefill } from '@/features/maquinaria/api/maquinaria-api';
import { extractMachineCode } from '../utils/qr-parser';

function getPrefillError(error, codigoPrefill, prefillParam) {
  if (prefillParam && !codigoPrefill) {
    return 'El código del QR no es válido. Puedes continuar con el flujo manual.';
  }

  if (!error) return '';

  const status = error.response?.status;
  if (status === 403) return 'No tienes permiso para consultar la máquina indicada en el QR.';
  if (status === 404) return 'La máquina indicada en el QR no fue encontrada.';
  if (!error.response) return 'No se pudo conectar con el servidor. Revisa tu conexión e intenta de nuevo.';

  return error.response?.data?.error ||
    error.response?.data?.message ||
    'No se pudo cargar la máquina indicada en el QR.';
}

export function usePrefillQr() {
  const location = useLocation();

  const prefillParam = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return params.get('prefill') || '';
  }, [location.search]);

  const codigoPrefill = useMemo(
    () => (prefillParam ? extractMachineCode(prefillParam) : null),
    [prefillParam]
  );

  const query = useQuery({
    queryKey: ['nuevo-reporte-prefill-qr', codigoPrefill],
    queryFn: async ({ signal }) => {
      const response = await getMaquinaPrefill(codigoPrefill, { signal });
      return response?.data?.data || response?.data || response;
    },
    enabled: Boolean(codigoPrefill),
    retry: false,
    staleTime: 1000 * 60 * 5,
  });

  return {
    prefillData: query.data?.maquinaId ? query.data : null,
    prefillError: getPrefillError(query.error, codigoPrefill, prefillParam),
    prefillLoading: query.isFetching,
    onPrefillRetry: query.refetch,
    hasPrefill: Boolean(prefillParam),
    codigoPrefill,
  };
}

export default usePrefillQr;
