import React from 'react';
import { Icon } from '@/components/ui/z_index';

export const IncidenteSelector = ({ incidentes = [], incidenteSeleccionadoId, onSelectIncidente }) => {
  const [subCategoria, setSubCategoria] = React.useState('maquinaria'); // 'maquinaria' | 'clima'

  if (!incidentes || incidentes.length === 0) return null;

  const isMaquinariaMixta = incidentes.some(i => i.id === 'MAQ_NO_ENCIENDE') && incidentes.some(i => i.id === 'AC_NO_ENFRIA');

  let incidentesMostrar = incidentes;
  
  if (isMaquinariaMixta) {
    if (subCategoria === 'maquinaria') {
      incidentesMostrar = incidentes.filter(i => i.id.startsWith('MAQ_') || i.id === 'OTRO');
    } else {
      incidentesMostrar = incidentes.filter(i => 
        ['AC_NO_ENFRIA', 'AC_NO_ENCIENDE', 'EXTRACTOR_FALLA', 'FUGA_REFRIGERANTE', 'OTRO'].includes(i.id)
      );
    }
  }

  return (
    <div className="flex flex-col gap-3 h-full">
      <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-0.5 shrink-0">
        Tipo de Incidencia *
      </h3>

      {isMaquinariaMixta && (
        <div className="flex bg-slate-100/80 p-1 rounded-xl mb-1 border border-slate-200/60 shrink-0">
          <button
            type="button"
            onClick={() => setSubCategoria('maquinaria')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
              subCategoria === 'maquinaria'
                ? 'bg-white text-emerald-700 shadow-sm border border-emerald-200/50'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Maquinaria 
          </button>
          <button
            type="button"
            onClick={() => setSubCategoria('clima')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
              subCategoria === 'clima'
                ? 'bg-white text-emerald-700 shadow-sm border border-emerald-200/50'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Ventilación y Clima
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 flex-1 overflow-y-auto pr-1 min-h-0 pb-2">
        {incidentesMostrar.map((incidente) => {
          const isSelected = incidenteSeleccionadoId === incidente.id;
          return (
            <button
              key={incidente.id}
              type="button"
              onClick={() => onSelectIncidente(incidente)}
              className={`flex items-start gap-3 p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                isSelected
                  ? 'border-emerald-500 bg-emerald-500/5 shadow-sm ring-2 ring-emerald-500/20'
                  : 'border-slate-200/80 bg-white/70 hover:border-slate-300 hover:bg-white'
              }`}
            >
              <div
                className={`p-2 rounded-xl shrink-0 ${
                  isSelected
                    ? 'bg-emerald-500 text-white'
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
