import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ReporteCard } from '@/features/common/components/reporte-card';
import { ReportesFilterBarDesktop } from '@/features/common/components/reportes-filter-bar-desktop';
import { Icon, Button } from '@/components/ui/z_index';

/**
 * Vista de escritorio para el historial de reportes con paginación.
 */
export const HistoricoDesktop = ({
  reportes = [],
  reportesFiltrados = [],
  totalFiltered = 0,
  selectedEstado = 'TODOS',
  onChangeEstado,
  sortBy = 'RECIENTES',
  onChangeSort,
  currentPage = 1,
  totalPages = 1,
  onChangePage,
  isLoading,
  isError,
  refetch,
  onSelectReporte,
}) => {
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

  const estadosHistorico = ['RESUELTO', 'EN_PAUSA', 'EN_PROGRESO', 'ASIGNADA', 'PENDIENTE', 'RECHAZADO', 'CERRADO'];

  return (
    <div className="max-w-full mx-auto p-6 bg-transparent min-h-screen pb-16">
      {/* Encabezado limpio con texto y subtexto */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-marca-primario/10 text-marca-primario flex items-center justify-center border border-marca-primario/10 shadow-xs shrink-0">
            <Icon name="history" size="22px" />
          </div>
          <div>
            <h1 className="text-lg font-black text-slate-800 tracking-tight">Historial de Reportes</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Consulta el historial completo de tus reportes de mantenimiento, incluyendo tareas resueltas, activas y cerradas.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
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

      {/* Barra de Filtros y KPI resumen común con Ordenamiento */}
      {!isLoading && !isError && (
        <ReportesFilterBarDesktop
          reportes={reportes}
          selectedEstado={selectedEstado}
          onChangeEstado={onChangeEstado}
          estadosDisponibles={estadosHistorico}
          sortBy={sortBy}
          onChangeSort={onChangeSort}
        />
      )}

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
          <Button onClick={refetch} variant="secundario" className="text-xs px-4 py-2 mt-2">
            Reintentar
          </Button>
        </div>
      )}

      {/* Vacío */}
      {!isLoading && !isError && reportesFiltrados.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
          <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200/40">
            <Icon name="history" className="text-slate-400 text-4xl" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-850">Historial vacío</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              {selectedEstado === 'TODOS'
                ? 'Aquí se mostrarán todos los reportes de mantenimiento que ya hayan sido resueltos y aprobados por ti.'
                : 'No se encontraron reportes con el estado seleccionado.'}
            </p>
          </div>
          {selectedEstado === 'TODOS' && (
            <Button onClick={handleCreateClick} variant="primario" className="text-xs px-5 py-2.5 mt-2 rounded-xl">
              Crear reporte general
            </Button>
          )}
        </div>
      )}

      {/* Grid */}
      {!isLoading && !isError && reportesFiltrados.length > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reportesFiltrados.map((reporte) => (
              <ReporteCard
                key={reporte.id}
                reporte={reporte}
                onClick={() => handleCardClick(reporte.id)}
              />
            ))}
          </div>

          {/* Paginación */}
          {totalPages > 1 && (
            <div className="mt-8 flex flex-col items-center gap-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Mostrando {Math.max(1, (currentPage - 1) * 12 + 1)} - {Math.min(currentPage * 12, totalFiltered)} de {totalFiltered} reportes
              </span>
              <div className="flex items-center justify-center gap-4 bg-white/70 backdrop-blur-md border border-white/45 p-2 rounded-2xl max-w-xs mx-auto shadow-2xs">
                <button
                  type="button"
                  disabled={currentPage === 1}
                  onClick={() => onChangePage(currentPage - 1)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center bg-slate-100 hover:bg-slate-200 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed text-slate-700 transition-all border border-slate-200/60 cursor-pointer"
                >
                  <Icon name="chevron_left" size="18px" />
                </button>
                <span className="text-xs font-bold text-slate-700">
                  Pág. {currentPage} de {totalPages}
                </span>
                <button
                  type="button"
                  disabled={currentPage === totalPages}
                  onClick={() => onChangePage(currentPage + 1)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center bg-slate-100 hover:bg-slate-200 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed text-slate-700 transition-all border border-slate-200/60 cursor-pointer"
                >
                  <Icon name="chevron_right" size="18px" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default HistoricoDesktop;
