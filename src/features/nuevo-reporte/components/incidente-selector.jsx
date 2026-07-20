import React from 'react';
import { Icon } from '@/components/ui/z_index';

export const IncidenteSelector = ({ incidentes = [], incidenteSeleccionadoId, onSelectIncidente }) => {
  if (!incidentes || incidentes.length === 0) return null;

  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-0.5">
        Tipo de Incidencia *
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {incidentes.map((incidente) => {
          const isSelected = incidenteSeleccionadoId === incidente.id;
          return (
            <button
              key={incidente.id}
              type="button"
              onClick={() => onSelectIncidente(incidente)}
              className={`flex items-start gap-3 p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                isSelected
                  ? 'border-marca-primario bg-marca-primario/5 shadow-sm ring-2 ring-marca-primario/20'
                  : 'border-slate-200/80 bg-white/70 hover:border-slate-300 hover:bg-white'
              }`}
            >
              <div
                className={`p-2 rounded-xl shrink-0 ${
                  isSelected
                    ? 'bg-marca-primario text-white'
                    : 'bg-slate-100 text-slate-500'
                }`}
              >
                <Icon name={incidente.icon || 'help'} className="text-base" />
              </div>
              <div className="flex flex-col gap-0.5 min-w-0">
                <span className="text-xs font-bold text-slate-800 truncate">
                  {incidente.nombre}
                </span>
                <p className="text-[11px] text-slate-500 line-clamp-2 leading-tight">
                  {incidente.descripcion}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default IncidenteSelector;
