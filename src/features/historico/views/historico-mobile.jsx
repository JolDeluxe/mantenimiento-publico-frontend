import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ReporteCard } from '@/features/reporte-detalle/components/reporte-card';
import { Icon } from '@/components/ui/z_index';
import { cn } from '@/utils/cn';

/**
 * Vista móvil para historial de reportes.
 */
export const HistoricoMobile = ({ reportes, isLoading, isError, refetch }) => {
  const navigate = useNavigate();

  const handleCardClick = (id) => {
    navigate(`/reportes/${id}`);
  };

  return (
    <div className="relative flex flex-col min-h-full bg-slate-50/50 pb-28">
      {/* Header Sticky Liquid Glass */}
      <header className="sticky top-0 left-0 w-full z-40 bg-white/70 backdrop-blur-md border-b border-white/20 px-4 py-3 flex items-center justify-between shadow-[0_2px_10px_rgba(0,0,0,0.01)]">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-marca-primario flex items-center justify-center shadow-md">
            <Icon name="history" className="text-white text-lg" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-slate-800">Historial de Reportes</h1>
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider leading-none mt-0.5">
              Cerrados y finalizados
            </p>
          </div>
        </div>

        {/* Botón Refrescar */}
        <button
          onClick={refetch}
          disabled={isLoading}
          className="p-2 rounded-xl bg-white/80 border border-white/30 shadow-sm active:scale-95 disabled:opacity-50 transition-all cursor-pointer"
        >
          <Icon 
            name="refresh" 
            className={cn("text-slate-600 text-lg", isLoading && "animate-spin")} 
          />
        </button>
      </header>

      {/* Contenido Principal */}
      <main className="flex-1 w-full max-w-md md:max-w-3xl lg:max-w-4xl mx-auto px-4 py-5 flex flex-col gap-4 overflow-y-auto">
        
        {/* Loading */}
        {isLoading && (
          <div className="flex flex-col gap-4 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white/60 border border-white/20 rounded-xl p-4 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="h-5 w-24 bg-slate-200 rounded" />
                  <div className="h-5 w-16 bg-slate-200 rounded-full" />
                </div>
                <div className="h-4 w-3/4 bg-slate-200 rounded" />
                <div className="h-3 w-1/2 bg-slate-200 rounded mt-1" />
                <div className="h-8 w-full bg-slate-100 rounded-lg mt-2" />
              </div>
            ))}
          </div>
        )}

        {/* Error */}
        {isError && !isLoading && (
          <div className="flex flex-col items-center justify-center gap-3 py-16 text-center px-4">
            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center">
              <Icon name="error_outline" className="text-red-500 text-2xl" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-800">Error al cargar historial</h4>
              <p className="text-xs text-slate-500 mt-1">
                No pudimos conectar con el servidor. Revisa tu conexión.
              </p>
            </div>
            <button
              onClick={refetch}
              className="mt-2 px-4 py-2 bg-slate-800 text-white rounded-xl text-xs font-bold shadow active:scale-95"
            >
              Reintentar
            </button>
          </div>
        )}

        {/* Vacío */}
        {!isLoading && !isError && reportes.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-4 py-20 text-center px-6">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center">
              <Icon name="history" className="text-slate-400 text-3xl" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">Historial vacío</h3>
              <p className="text-xs text-slate-400 mt-1">
                Aquí aparecerán los reportes que hayan sido resueltos y aprobados por ti.
              </p>
            </div>
          </div>
        )}

        {/* Listado */}
        {!isLoading && !isError && reportes.length > 0 && (
          <div className="flex flex-col gap-4">
            {reportes.map((reporte) => (
              <ReporteCard
                key={reporte.id}
                reporte={reporte}
                onClick={() => handleCardClick(reporte.id)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default HistoricoMobile;
