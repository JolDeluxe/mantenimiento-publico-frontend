import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ReporteCard } from '@/features/reporte-detalle/components/reporte-card';
import { Icon } from '@/components/ui/z_index';
import { cn } from '@/utils/cn';
import { HardReloadButton } from '@/components/ui/hard-reload-button';

/**
 * Vista de escritorio para el historial de reportes.
 */
export const HistoricoDesktop = ({ reportes, isLoading, isError, refetch }) => {
  const navigate = useNavigate();

  const handleCardClick = (id) => {
    navigate(`/reportes/${id}`);
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-transparent min-h-screen pb-16">
      
      {/* Encabezado */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-marca-primario flex items-center justify-center shadow-md">
            <Icon name="history" className="text-white text-xl" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-800">Historial de Reportes</h1>
            <p className="text-xs text-slate-400">Bandeja de incidencias resueltas y finalizadas</p>
          </div>
        </div>

        <HardReloadButton />
      </div>

      {/* Skeletons */}
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
            <Icon name="error_outline" className="text-red-500 text-2xl" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-800">Error al cargar historial</h4>
            <p className="text-xs text-slate-500 mt-1">Intenta refrescar la página de nuevo.</p>
          </div>
        </div>
      )}

      {/* Vacío */}
      {!isLoading && !isError && reportes.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
          <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200/40">
            <Icon name="history" className="text-slate-400 text-4xl" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-850">Historial vacío</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Aquí se mostrarán todos los reportes de mantenimiento que ya hayan sido resueltos y aprobados por ti.
            </p>
          </div>
        </div>
      )}

      {/* Grid */}
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

export default HistoricoDesktop;
