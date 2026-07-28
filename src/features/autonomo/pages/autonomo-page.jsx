import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getAutonomosFormulario } from '../api/autonomo-api';
import { AutonomoForm } from '../components/autonomo-form';
import { Icon } from '@/components/ui/z_index';

export const AutonomoPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Obtener el código de los search params
  const params = new URLSearchParams(location.search);
  const codigo = params.get('codigo') || '';

  const query = useQuery({
    queryKey: ['autonomos-formulario-check', codigo],
    queryFn: async ({ signal }) => {
      return getAutonomosFormulario(codigo, { signal });
    },
    enabled: Boolean(codigo),
    staleTime: 5000,
    gcTime: 60000,
    retry: false,
    refetchOnMount: true,
    refetchOnReconnect: true,
    refetchOnWindowFocus: false,
  });

  const handleBackToGateway = () => {
    if (codigo) {
      navigate(`/nuevo-reporte?prefill=${codigo}`);
    } else {
      navigate('/login');
    }
  };

  if (!codigo) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-100 p-6 space-y-6 text-center">
          <Icon name="error" size="xl" className="text-red-500" />
          <div className="space-y-2">
            <h3 className="text-lg font-bold text-slate-800">Acceso no válido</h3>
            <p className="text-xs text-slate-500 leading-relaxed font-sans">
              No se ha especificado un código de equipo válido.
            </p>
          </div>
          <button
            onClick={() => navigate('/login')}
            className="w-full bg-slate-900 text-white py-2 px-4 rounded-xl text-xs font-semibold hover:bg-slate-800 transition-colors font-sans"
          >
            Ir al Inicio
          </button>
        </div>
      </div>
    );
  }

  if (query.isFetching) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-4 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-semibold text-slate-600 animate-pulse tracking-wide font-sans">
          Cargando formulario...
        </p>
      </div>
    );
  }

  if (query.isError) {
    const errorStatus = query.error?.response?.status;
    let errorMessage = 'No hay conexión en este momento. Intenta nuevamente cuando tengas internet.';
    
    if (errorStatus === 403) {
      errorMessage = 'El servicio de mantenimiento autónomo no está habilitado.';
    } else if (errorStatus === 404) {
      errorMessage = query.error?.response?.data?.error || 'Este código no corresponde a un equipo registrado.';
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
            {errorStatus !== 403 && (
              <button
                onClick={() => query.refetch()}
                className="w-full bg-slate-900 text-white py-2 px-4 rounded-xl text-xs font-semibold hover:bg-slate-800 transition-colors font-sans"
              >
                Intentar nuevamente
              </button>
            )}
            <button
              onClick={handleBackToGateway}
              className="w-full bg-white text-slate-700 border border-slate-200 py-2 px-4 rounded-xl text-xs font-semibold hover:bg-slate-50 transition-colors font-sans"
            >
              Volver
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (query.isSuccess && query.data) {
    const formKey = [
      query.data.maquina.codigo,
      ...query.data.formulario.secciones.map((sec) =>
        `${sec.id}:${sec.preguntas.map((preg) => `${preg.id}:${preg.tipoRespuesta}`).join(',')}`
      )
    ].join('|');

    return (
      <AutonomoForm
        key={formKey}
        maquina={query.data.maquina}
        secciones={query.data.formulario.secciones}
        onBack={handleBackToGateway}
      />
    );
  }

  return null;
};

export default AutonomoPage;
