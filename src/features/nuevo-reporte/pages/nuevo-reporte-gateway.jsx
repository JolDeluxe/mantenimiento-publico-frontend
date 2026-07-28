import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { extractMachineCode } from '../utils/qr-parser';
import { getAutonomosGateway } from '@/features/autonomo/api/autonomo-api';
import { SelectorTipoMantenimiento } from '../components/selector-tipo-mantenimiento';
import { Icon } from '@/components/ui/z_index';

export const NuevoReporteGateway = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Extraer el código del prefill
  const params = new URLSearchParams(location.search);
  const prefillParam = params.get('prefill') || '';
  const codigo = extractMachineCode(prefillParam);

  const query = useQuery({
    queryKey: ['autonomos-gateway-check', codigo],
    queryFn: async ({ signal }) => {
      return getAutonomosGateway(codigo, { signal });
    },
    enabled: Boolean(codigo),
    staleTime: 5000,
    gcTime: 60000,
    retry: false,
    refetchOnMount: true,
    refetchOnReconnect: true,
    refetchOnWindowFocus: false,
  });

  // Redirección si el código no es válido
  useEffect(() => {
    if (!prefillParam || !codigo) {
      navigate('/login', { state: { from: location }, replace: true });
    }
  }, [prefillParam, codigo, navigate, location]);

  // Redirección si el flag de autónomos está apagado
  useEffect(() => {
    if (query.isSuccess && query.data && !query.data.habilitado) {
      navigate('/login', { state: { from: location }, replace: true });
    }
  }, [query.isSuccess, query.data, navigate, location]);

  const handleSelectCorrectivo = () => {
    navigate('/login', { state: { from: location } });
  };

  const handleSelectAutonomo = () => {
    navigate(`/autonomo?codigo=${codigo}`);
  };

  if (!prefillParam || !codigo) {
    return null;
  }

  if (query.isFetching) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-4 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-semibold text-slate-600 animate-pulse tracking-wide font-sans">
          Cargando...
        </p>
      </div>
    );
  }

  if (query.isError) {
    const errorStatus = query.error?.response?.status;
    let errorMessage = 'No hay conexión en este momento. Intenta nuevamente cuando tengas internet.';
    if (errorStatus === 404) {
      errorMessage = 'Este código no corresponde a un equipo registrado.';
    }

    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-100 p-6 space-y-6 text-center">
          <Icon name="error" size="xl" className="text-red-500" />
          <div className="space-y-2">
            <h3 className="text-lg font-bold text-slate-800">Error</h3>
            <p className="text-xs text-slate-500 leading-relaxed font-sans">{errorMessage}</p>
          </div>
          <div className="flex flex-col gap-2.5 pt-2">
            <button
              onClick={() => query.refetch()}
              className="w-full bg-slate-900 text-white py-2 px-4 rounded-xl text-xs font-semibold hover:bg-slate-800 transition-colors font-sans"
            >
              Intentar nuevamente
            </button>
            <button
              onClick={handleSelectCorrectivo}
              className="w-full bg-white text-slate-700 border border-slate-200 py-2 px-4 rounded-xl text-xs font-semibold hover:bg-slate-50 transition-colors font-sans"
            >
              Iniciar sesión
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (query.isSuccess && query.data?.habilitado) {
    return (
      <SelectorTipoMantenimiento
        maquina={query.data.maquina}
        tienePlantilla={query.data.tienePlantilla}
        onSelectCorrectivo={handleSelectCorrectivo}
        onSelectAutonomo={handleSelectAutonomo}
      />
    );
  }

  return null;
};

export default NuevoReporteGateway;
