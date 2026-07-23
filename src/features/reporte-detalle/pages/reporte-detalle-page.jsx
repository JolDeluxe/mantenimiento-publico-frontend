import React from 'react';
import { useIsDesktop } from '@/hooks/useMediaQuery';
import { ReporteDetalleDesktop } from '../views/reporte-detalle-desktop';
import { ReporteDetalleMobile } from '../views/reporte-detalle-mobile';

export const ReporteDetallePage = () => {
  const isDesktop = useIsDesktop();

  return (
    <div className="w-full h-full flex flex-col overflow-hidden bg-slate-50/50">
      {isDesktop ? <ReporteDetalleDesktop /> : <ReporteDetalleMobile />}
    </div>
  );
};

