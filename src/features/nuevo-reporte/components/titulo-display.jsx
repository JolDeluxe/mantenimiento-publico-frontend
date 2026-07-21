import React from 'react';
import { Input, Label } from '@/components/form/z_index';
import { Icon } from '@/components/ui/z_index';

export const TituloDisplay = ({
  incidente,
  tituloPersonalizado,
  onTituloPersonalizadoChange,
  maquinaData,
  submitted,
}) => {
  if (!incidente) return null;

  const esOtro = incidente.permiteTituloPersonalizado === true;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between px-0.5">
        <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          {esOtro ? 'Título personalizado *' : 'Título asignado al reporte'}
        </Label>
      </div>

      {esOtro ? (
        <Input
          id="tituloPersonalizado"
          name="tituloPersonalizado"
          type="text"
          value={tituloPersonalizado}
          onChange={(e) => onTituloPersonalizadoChange(e.target.value)}
          placeholder="Ej. Tubería fracturada en pasillo norte..."
          error={submitted && (!tituloPersonalizado || tituloPersonalizado.trim().length < 10)}
          helperText={
            submitted && (!tituloPersonalizado || tituloPersonalizado.trim().length < 10)
              ? 'El título personalizado debe tener al menos 10 caracteres.'
              : ''
          }
          className="h-11 bg-white/50 border-slate-200 focus:bg-white rounded-xl"
        />
      ) : (
        <div className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-200/80 bg-slate-50/70 text-slate-700 text-xs font-semibold">
          <Icon name="bookmark" className="text-slate-400 shrink-0 text-sm" />
          <span className="truncate">
            {incidente.titulo}
            {maquinaData ? ` — ${maquinaData.nombre} [${maquinaData.codigo}]` : ''}
          </span>
        </div>
      )}
    </div>
  );
};

export default TituloDisplay;
