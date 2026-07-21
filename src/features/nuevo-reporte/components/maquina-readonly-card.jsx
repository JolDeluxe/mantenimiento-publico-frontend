import React from 'react';
import { Icon } from '@/components/ui/z_index';

/**
 * Ficha técnica informativa de la máquina detectada con diseño premium.
 * Totalmente adaptada a pantallas pequeñas con acción 'Cambiar' e icono micro en la esquina.
 */
export const MaquinaReadonlyCard = ({ maquinaData, onCambiarMaquina }) => {
  if (!maquinaData) return null;

  const { codigo, nombre, planta, area, tieneTicketsActivos, ticketsActivos } = maquinaData;

  return (
    <div className="flex flex-col gap-3.5 w-full animate-in fade-in duration-300">
      {/* Alerta de Tickets Activos */}
      {tieneTicketsActivos && (
        <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-amber-500/10 border border-amber-300/80 shadow-xs">
          <div className="p-1.5 rounded-xl bg-amber-500 text-white shrink-0 mt-0.5 shadow-xs">
            <Icon name="warning" size="14px" />
          </div>
          <div className="flex flex-col gap-1 flex-1 min-w-0">
            <h4 className="text-xs font-bold text-amber-900 leading-tight">
              Reportes activos en proceso ({ticketsActivos?.length || 1})
            </h4>
            <ul className="mt-1 flex flex-col gap-1 list-disc pl-3.5 text-[10.5px] text-amber-900/90 font-medium">
              {ticketsActivos?.slice(0, 3).map((t) => (
                <li key={t.id} className="leading-snug truncate">
                  <span className="font-bold">#{t.id} {t.titulo}</span> ({t.estado})
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Ficha técnica del equipo */}
      <div className="bg-white/85 backdrop-blur-xl border border-white/50 rounded-2xl p-4 shadow-[0_10px_35px_rgba(0,0,0,0.03)] flex flex-col gap-3 relative overflow-hidden w-full">
        
        {/* Encabezado Responsivo */}
        <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-3">
          
          {/* Lado Izquierdo: Icono + Título + Código */}
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 shadow-xs shrink-0">
              <Icon name="precision_manufacturing" size="16px" />
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[9px] font-extrabold text-emerald-700 tracking-wider uppercase">
                  Equipo Vinculado
                </span>
                <span className="px-2 py-0.5 rounded-md bg-slate-900 text-white text-[10px] font-mono font-bold tracking-wider shrink-0">
                  {codigo}
                </span>
              </div>
              <h4 className="text-xs font-extrabold text-slate-800 truncate mt-0.5">
                {nombre}
              </h4>
            </div>
          </div>

          {/* Lado Derecho: Acción Cambiar Ultra-Discreta */}
          {onCambiarMaquina && (
            <button
              type="button"
              onClick={onCambiarMaquina}
              className="text-[9px] font-semibold text-slate-400 hover:text-slate-600 transition-colors flex items-center gap-0.5 cursor-pointer active:scale-95 shrink-0 self-start mt-0.5"
            >
              <Icon name="sync_alt" size="9px" className="text-slate-400 opacity-70" />
              <span>Cambiar</span>
            </button>
          )}

        </div>

        {/* Detalles de Ubicación en Badges */}
        <div className="grid grid-cols-2 gap-2.5 pt-0.5">
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/60 flex items-center gap-2.5 min-w-0">
            <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-600 shrink-0">
              <Icon name="factory" size="14px" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[8.5px] text-slate-400 font-bold uppercase tracking-wider">Planta</span>
              <span className="text-xs font-bold text-slate-800 truncate">Planta {planta}</span>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/60 flex items-center gap-2.5 min-w-0">
            <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-600 shrink-0">
              <Icon name="location_on" size="14px" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[8.5px] text-slate-400 font-bold uppercase tracking-wider">Área</span>
              <span className="text-xs font-bold text-slate-800 truncate">{area || 'No asignada'}</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default MaquinaReadonlyCard;
