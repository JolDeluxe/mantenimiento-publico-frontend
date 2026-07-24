import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ReporteCard } from '@/features/common/components/reporte-card';
import { ReportesFilterBarMobile } from '@/features/common/components/reportes-filter-bar-mobile';
import { GlassFab, Icon } from '@/components/ui/z_index';
import { HardReloadButton } from '@/components/ui/hard-reload-button';

/**
 * Vista móvil para reportes activos.
 * Optimizada para dispositivos portátiles con FAB flotante de creación.
 */
export const ActivosMobile = ({
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
  const mainRef = useRef(null);
  const [showScrollUp, setShowScrollUp] = React.useState(false);
  const [showScrollDown, setShowScrollDown] = React.useState(false);

  // Evaluar scroll al cargar o filtrar
  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (mainRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = mainRef.current;
        setShowScrollUp(scrollTop > 300);
        setShowScrollDown(scrollHeight - clientHeight - scrollTop > 300);
      }
    }, 150);
    return () => clearTimeout(timer);
  }, [reportesFiltrados]);

  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    setShowScrollUp(scrollTop > 300);
    setShowScrollDown(scrollHeight - clientHeight - scrollTop > 300);
  };

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

  const estadosActivos = ['RESUELTO', 'EN_PAUSA', 'EN_PROGRESO', 'ASIGNADA', 'PENDIENTE', 'RECHAZADO'];

  return (
    <div className="relative flex h-full flex-col overflow-hidden bg-slate-50/50">
      {/* Header de sección */}
      <header className="shrink-0 w-full z-30 bg-white/80 backdrop-blur-xl border-b border-white/40 px-4 py-3 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-marca-primario flex items-center justify-center shadow-md shrink-0">
            <Icon name="assignment" size="18px" className="text-white shrink-0" />
          </div>
          <div>
            <h1 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">Mis Reportes Activos</h1>
            <p className="text-[9.5px] font-semibold text-marca-primario uppercase tracking-wider leading-none mt-0.5">
              En Proceso
            </p>
          </div>
        </div>

        {/* Botón Refrescar Moderno (Hard Reload) */}
        <HardReloadButton />
      </header>

      {/* Contenido Principal */}
      <main
        ref={mainRef}
        onScroll={handleScroll}
        className="min-h-0 flex-1 w-full px-3 py-4 flex flex-col overflow-y-auto overscroll-none"
      >
        
        {/* Barra de Filtros y KPI resumen común */}
        {!isLoading && !isError && (
          <ReportesFilterBarMobile
            reportes={reportes}
            selectedEstado={selectedEstado}
            onChangeEstado={onChangeEstado}
            estadosDisponibles={estadosActivos}
            sortBy={sortBy}
            onChangeSort={onChangeSort}
          />
        )}

        {/* Loading */}
        {isLoading && (
          <div className="flex flex-col gap-3.5 animate-pulse mt-2">
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
          <div className="flex flex-col items-center justify-center gap-3 py-16 text-center px-4 bg-white/85 backdrop-blur-xl border border-white/50 rounded-2xl p-6 mt-2">
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
        {!isLoading && !isError && reportesFiltrados.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-3.5 py-16 text-center px-6 bg-white/85 backdrop-blur-xl border border-white/50 rounded-2xl p-6 shadow-xs mt-2">
            <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center border border-emerald-100">
              <Icon name="assignment_turned_in" size="30px" className="text-emerald-600" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">No hay reportes</h3>
              <p className="text-[11px] text-slate-400 mt-1">
                {selectedEstado === 'TODOS'
                  ? 'Registra un reporte para que el departamento de mantenimiento pueda atenderlo.'
                  : 'No se encontraron reportes con el estado seleccionado.'}
              </p>
            </div>
            {selectedEstado === 'TODOS' && (
              <button
                onClick={handleCreateClick}
                className="mt-2 flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-md active:scale-95 cursor-pointer"
              >
                <Icon name="add" size="16px" />
                <span>Crear mi primer reporte</span>
              </button>
            )}
          </div>
        )}

        {/* Listado */}
        {!isLoading && !isError && reportesFiltrados.length > 0 && (
          <>
            <div className="flex flex-col gap-3.5 mt-2">
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
              <div className="mt-6 flex flex-col items-center gap-2">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
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
      </main>

      {/* Botones de Navegación Vertical (Liquid Flash Transparent) */}
      {(showScrollUp || showScrollDown) && (
        <div className="absolute bottom-[96px] left-[20px] z-50 flex flex-col gap-2.5">
          {showScrollUp && (
            <button
              onClick={() => mainRef.current?.scrollTo({ top: 0, behavior: 'smooth' })}
              className="w-10 h-10 rounded-full flex items-center justify-center bg-white/35 backdrop-blur-md border border-white/45 shadow-xs active:scale-90 text-slate-700 hover:bg-white/50 cursor-pointer"
              title="Ir al inicio"
            >
              <Icon name="keyboard_arrow_up" size="22px" />
            </button>
          )}
          {showScrollDown && (
            <button
              onClick={() => mainRef.current?.scrollTo({ top: mainRef.current.scrollHeight, behavior: 'smooth' })}
              className="w-10 h-10 rounded-full flex items-center justify-center bg-white/35 backdrop-blur-md border border-white/45 shadow-xs active:scale-90 text-slate-700 hover:bg-white/50 cursor-pointer"
              title="Ir al final"
            >
              <Icon name="keyboard_arrow_down" size="22px" />
            </button>
          )}
        </div>
      )}

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
