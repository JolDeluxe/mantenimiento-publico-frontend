import React from 'react';
import { Icon } from '@/components/ui/z_index';
import { CATEGORIAS_REPORTE } from '../constants';

/**
 * Cápsula de orientación contextual compacta para la categoría seleccionada.
 * Aporta claridad sobre qué información proporcionar sin repetir la fotografía de fondo.
 */
export const CategoriaInfoCard = ({ categoria }) => {
  // Resolver el objeto de datos de la categoría si se recibe su id o el objeto completo
  const catObj =
    typeof categoria === 'string'
      ? CATEGORIAS_REPORTE.find((c) => c.id === categoria) || CATEGORIAS_REPORTE[0]
      : categoria || CATEGORIAS_REPORTE[0];

  return (
    <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-100/80 border border-slate-200/70 backdrop-blur-md transition-all duration-300 animate-in fade-in duration-300">
      <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 shrink-0 shadow-xs flex items-center justify-center">
        <Icon name={catObj.icon} className="text-base" />
      </div>
      <div className="flex flex-col gap-0.5 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-800 tracking-tight">
            {catObj.nombre}
          </span>
          <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 font-extrabold text-[8px] uppercase tracking-widest border border-emerald-500/20">
            Categoría Activa
          </span>
        </div>
        <p className="text-[11px] text-slate-600 leading-normal font-medium">
          {catObj.ayuda}
        </p>
      </div>
    </div>
  );
};

export default CategoriaInfoCard;
