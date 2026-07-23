import React from 'react';
import { Icon } from '@/components/ui/z_index';
import { ReporteStatusBadge } from './reporte-status-badge';
import { formatRelativo } from '@/lib/date';
import { cn } from '@/utils/cn';

const CATEGORIAS_MAP = {
  MAQUINARIA: { nombre: 'Maquinaria', icon: 'precision_manufacturing' },
  INFRAESTRUCTURA: { nombre: 'Infraestructura', icon: 'domain' },
  MOBILIARIO: { nombre: 'Mobiliario', icon: 'chair' },
  ELECTRICO: { nombre: 'Eléctrico e Iluminación', icon: 'electric_bolt' },
  CLIMATIZACION: { nombre: 'Climas y Ventilación', icon: 'hvac' },
  PLOMERIA: { nombre: 'Plomería y Sanitarios', icon: 'water_drop' },
  SEGURIDAD: { nombre: 'Seguridad', icon: 'shield' },
  LIMPIEZA: { nombre: 'Limpieza', icon: 'cleaning_services' },
  SISTEMAS: { nombre: 'Sistemas', icon: 'computer' },
  OTRO: { nombre: 'Otro', icon: 'more_horiz' },
};

/**
 * Tarjeta Liquid Glass para la bandeja de reportes de cliente.
 * Destaca visualmente reportes resueltos listos para revisión.
 */
export const ReporteCard = ({ reporte, onClick }) => {
  const { id, titulo, descripcion, categoria, estado, prioridad, createdAt, maquina } = reporte;

  const catInfo = CATEGORIAS_MAP[categoria] || { nombre: categoria || 'General', icon: 'help_outline' };
  const esResuelto = estado === 'RESUELTO';

  return (
    <div
      onClick={onClick}
      className={cn(
        "relative flex flex-col gap-3 p-4 rounded-2xl cursor-pointer transition-all duration-350 select-none",
        "bg-white/60 backdrop-blur-md border shadow-[0_4px_24px_rgba(0,0,0,0.02)]",
        "hover:scale-[1.01] hover:bg-white/80 active:scale-[0.98]",
        esResuelto
          ? "border-emerald-300 bg-emerald-50/20 ring-2 ring-emerald-500/10 shadow-[0_8px_30px_rgba(16,185,129,0.06)]"
          : "border-white/40"
      )}
    >
      {/* Banner de Acción si es RESUELTO */}
      {esResuelto && (
        <div className="absolute top-0 right-12 -translate-y-1/2 bg-emerald-500 text-white font-extrabold text-[8px] uppercase tracking-widest px-2.5 py-0.5 rounded-full shadow-sm animate-pulse">
          Acción Requerida
        </div>
      )}

      {/* Encabezado */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <div className={cn(
            "p-1.5 rounded-lg shrink-0",
            esResuelto ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-600"
          )}>
            <Icon name={catInfo.icon} className="text-sm" />
          </div>
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider truncate">
            {catInfo.nombre}
          </span>
        </div>
        <ReporteStatusBadge estado={estado} />
      </div>

      {/* Título y Descripción */}
      <div className="flex flex-col gap-0.5">
        <h3 className={cn("text-xs font-bold leading-tight truncate", esResuelto ? "text-emerald-950" : "text-slate-800")}>
          {titulo}
        </h3>
        <p className="text-[11px] text-slate-500 truncate mt-0.5">
          {descripcion || 'Sin descripción adicional.'}
        </p>
      </div>

      {/* Ficha de Equipo Relacionado */}
      {maquina && (
        <div className="flex items-center gap-1 bg-slate-50 border border-slate-100 px-2 py-1 rounded-lg text-[9px] font-mono font-bold text-slate-600 w-fit">
          <Icon name="precision_manufacturing" className="text-[10px]" />
          <span>{maquina.codigo}</span>
        </div>
      )}

      {/* Pie de tarjeta */}
      <div className="flex items-center justify-between border-t border-slate-100/50 pt-2 mt-1 text-[9px] text-slate-400 font-semibold uppercase tracking-wider">
        <span>Reporte #{id}</span>
        <div className="flex items-center gap-1">
          <Icon name="schedule" className="text-[10px]" />
          <span>{formatRelativo(createdAt)}</span>
        </div>
      </div>
    </div>
  );
};

export default ReporteCard;
