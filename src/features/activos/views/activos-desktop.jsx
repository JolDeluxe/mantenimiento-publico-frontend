import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ReporteCard } from '@/features/reporte-detalle/components/reporte-card';
import { Icon, Button } from '@/components/ui/z_index';
import { cn } from '@/utils/cn';

/**
 * Vista de escritorio para el listado de reportes activos.
 * Organiza las tarjetas en una cuadrícula responsiva (Grid).
 */
export const ActivosDesktop = ({ reportes = [], isLoading, isError, refetch }) => {
  const navigate = useNavigate();

  const handleCreateClick = () => {
    navigate('/nuevo-reporte');
  };

  const handleCardClick = (id) => {
    navigate(`/reportes/${id}`);
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-transparent min-h-screen pb-16">
      
      {/* Encabezado */}
      <div className="flex items-center justify-between border-b border-slate-200/80 pb-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center shadow-md shadow-emerald-600/20">
            <Icon name="verified" size="20px" className="text-white shrink-0" />
          </div>
          <div>
            <h1 className="text-base font-extrabold text-slate-800 uppercase tracking-wider">Mis Reportes Activos</h1>
            <p className="text-xs text-slate-400 font-medium">Bandeja de incidencias en atención técnica</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Botón Refrescar Moderno (Hard Reload) */}
        <HardReloadButton />

          {/* Botón Nuevo Reporte */}
          <Button
            onClick={handleCreateClick}
            variant="primario"
            icon="add"
            className="px-5 py-2.5 text-xs font-bold uppercase tracking-wider shadow-sm rounded-xl"
          >
            Crear Reporte
          </Button>
        </div>
      </div>

      {/* Skeletons de carga */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white/60 border border-slate-100 rounded-2xl p-5 flex flex-col gap-4">
              <div className="flex justify-between items-center">
                <div className="h-5 w-24 bg-slate-200 rounded" />
                <div className="h-5 w-16 bg-slate-200 rounded-full" />
              </div>
              <div className="h-4 w-3/4 bg-slate-200 rounded" />
              <div className="h-3 w-1/2 bg-slate-200 rounded" />
              <div className="h-8 w-full bg-slate-100 rounded-lg mt-2" />
            </div>
          ))}
        </div>
      )}

      {/* Error */}
      {isError && !isLoading && (
        <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
          <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center border border-red-200">
            <Icon name="error_outline" size="24px" className="text-red-500" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-800">Error al cargar reportes</h4>
            <p className="text-xs text-slate-500 mt-1">Intenta refrescar la página de nuevo.</p>
          </div>
          <Button onClick={refetch} variant="secundario" className="text-xs px-4 py-2 mt-2">
            Reintentar
          </Button>
        </div>
      )}

      {/* Bandeja vacía */}
      {!isLoading && !isError && reportes.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-4 py-24 text-center bg-white/70 backdrop-blur-xl border border-white/50 rounded-3xl p-8 shadow-xs">
          <div className="w-20 h-20 rounded-full bg-emerald-50 flex items-center justify-center border border-emerald-100">
            <Icon name="assignment_turned_in" size="36px" className="text-emerald-600" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800">No tienes reportes activos</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Todo marcha perfecto. Cuando ocurra una falla técnica o física, regístrala aquí para que sea atendida.
            </p>
          </div>
          <Button onClick={handleCreateClick} variant="primario" className="text-xs px-5 py-2.5 mt-2 rounded-xl">
            Crear reporte general
          </Button>
        </div>
      )}

      {/* Listado en Grid */}
      {!isLoading && !isError && reportes.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reportes.map((reporte) => (
            <ReporteCard
              key={reporte.id}
              reporte={reporte}
              onClick={() => handleCardClick(reporte.id)}
            />
          ))}
        </div>
      )}

    </div>
  );
};

export default ActivosDesktop;
