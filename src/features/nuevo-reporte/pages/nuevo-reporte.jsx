import React from 'react';
import { useIsDesktop } from '@/hooks/useMediaQuery';

// Vistas unificadas responsivas de la feature
import { NuevoReporteDesktop } from '../views/nuevo-reporte-desktop';
import { NuevoReporteMobile } from '../views/nuevo-reporte-mobile';

/**
 * Controlador responsivo para la creación de reportes.
 */
export const NuevoReportePage = () => {
  const isDesktop = useIsDesktop();

  return (
    <div className="w-full h-full flex flex-col overflow-hidden bg-slate-50/50">
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
