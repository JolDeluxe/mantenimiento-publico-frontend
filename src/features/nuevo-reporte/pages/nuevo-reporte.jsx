import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useIsDesktop } from '@/hooks/useMediaQuery';
import { Icon } from '@/components/ui/z_index';

// Vistas unificadas responsivas de la feature
import { NuevoReporteDesktop } from '../views/nuevo-reporte-desktop';
import { NuevoReporteMobile } from '../views/nuevo-reporte-mobile';

/**
 * Controlador responsivo para la creación de reportes.
 * En Móvil fija el Header y el Stepper arriba, dejando el área central como único bloque scrolleable.
 */
export const NuevoReportePage = () => {
  const navigate = useNavigate();
  const isDesktop = useIsDesktop();

  const handleBack = () => {
    navigate('/activos');
  };

  return (
    <div className="w-full h-full flex flex-col overflow-hidden bg-slate-50/50">
      
      {/* Header móvil de sección */}
      {!isDesktop && (
        <header className="shrink-0 w-full z-30 bg-white/70 backdrop-blur-md border-b border-white/20 px-4 py-3 flex items-center justify-between shadow-[0_2px_10px_rgba(0,0,0,0.01)]">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-marca-primario flex items-center justify-center shadow-md">
            <Icon name="home" className="text-white text-lg" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-slate-800">Inicio</h1>
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider leading-none mt-0.5">
              Nuevo Reporte
            </p>
          </div>
        </div>
      </header>      
      )}

      {/* Contenido Responsivo Unificado */}
      {isDesktop ? (
        <main className="w-full h-full flex-1 p-3.5 overflow-hidden flex flex-col justify-between">
          <NuevoReporteDesktop />
        </main>
      ) : (
        <div className="min-h-0 w-full flex-1 flex flex-col overflow-hidden">
          <NuevoReporteMobile />
        </div>
      )}

    </div>
  );
};

export default NuevoReportePage;
