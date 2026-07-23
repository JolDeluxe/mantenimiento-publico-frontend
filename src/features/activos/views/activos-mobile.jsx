import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ReporteCard } from '@/features/common/components/reporte-card';
import { GlassFab, Icon } from '@/components/ui/z_index';
import { HardReloadButton } from '@/components/ui/hard-reload-button';

/**
 * Vista móvil para reportes activos.
 * Optimizada para dispositivos portátiles con FAB flotante de creación.
 */
export const ActivosMobile = ({ reportes = [], isLoading, isError, refetch, onSelectReporte }) => {
  const navigate = useNavigate();

  const handleCreateClick = () => {
    navigate('/nuevo-reporte');
  };

  const handleCardClick = (id) => {
    if (onSelectReporte) {
      onSelectReporte(id);
    } else {
      navigate(`/reportes/${id}`);
    }
  };

  return (
    <div className="relative flex h-full flex-col overflow-hidden bg-slate-50/50">
      {/* Header de sección */}
      <header className="shrink-0 w-full z-30 bg-white/80 backdrop-blur-xl border-b border-white/40 px-4 py-3 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center shadow-md shadow-emerald-600/20 shrink-0">
            <Icon name="verified" size="18px" className="text-white shrink-0" />
          </div>
          <div>
            <h1 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">Mis Reportes Activos</h1>
            <p className="text-[9.5px] font-semibold text-slate-400 uppercase tracking-wider leading-none mt-0.5">
              Portal de Clientes
            </p>
          </div>
        </div>

        {/* Botón Refrescar Moderno (Hard Reload) */}
        <HardReloadButton />
      </header>

      {/* Contenido Principal */}
      <main className="min-h-0 flex-1 w-full max-w-md md:max-w-3xl lg:max-w-4xl mx-auto px-3.5 py-4 flex flex-col gap-3.5 overflow-y-auto overscroll-none">
        
        {/* Loading */}
        {isLoading && (
          <div className="flex flex-col gap-3.5 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white/60 border border-white/40 rounded-2xl p-4 flex flex-col gap-3">
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
          <div className="flex flex-col items-center justify-center gap-3 py-16 text-center px-4 bg-white/85 backdrop-blur-xl border border-white/50 rounded-2xl p-6">
            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center border border-red-200">
              <Icon name="error_outline" size="24px" className="text-red-500" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Error al cargar reportes</h4>
              <p className="text-[11px] text-slate-500 mt-1 max-w-xs mx-auto">
                No pudimos conectar con el servidor. Revisa tu conexión.
              </p>
            </div>
            <button
              onClick={refetch}
              className="mt-2 px-4 py-2 bg-slate-800 text-white rounded-xl text-xs font-bold shadow-xs active:scale-95 cursor-pointer uppercase tracking-wider"
            >
              Reintentar
            </button>
          </div>
        )}

        {/* Vacío */}
        {!isLoading && !isError && reportes.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-3.5 py-16 text-center px-6 bg-white/85 backdrop-blur-xl border border-white/50 rounded-2xl p-6 shadow-xs">
            <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center border border-emerald-100">
              <Icon name="assignment_turned_in" size="30px" className="text-emerald-600" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">No tienes reportes activos</h3>
              <p className="text-[11px] text-slate-400 mt-1">
                Registra un reporte para que el departamento de mantenimiento pueda atenderlo.
              </p>
            </div>
            <button
              onClick={handleCreateClick}
              className="mt-2 flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-md active:scale-95 cursor-pointer"
            >
              <Icon name="add" size="16px" />
              <span>Crear mi primer reporte</span>
            </button>
          </div>
        )}

        {/* Listado */}
        {!isLoading && !isError && reportes.length > 0 && (
          <div className="flex flex-col gap-3.5">
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

      {/* FAB Flotante */}
      <GlassFab
        icon="add"
        onClick={handleCreateClick}
        variant="primary"
        size={52}
        bottom="96px"
        right="20px"
      />
    </div>
  );
};

export default ActivosMobile;
