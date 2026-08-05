import React from 'react';
import { Icon } from '@/components/ui/z_index';
import { Label, Input } from '@/components/form/z_index';
import {
  getMexicoNowDateTimeLocal,
  getParoDateTimeError,
  normalizeParoDateTimeInput,
} from '../utils/paro-produccion-date';

export const ParoProduccionPanel = ({
  paroProduccion,
  onChangeParoProduccion,
  fechaParoProduccion,
  onChangeFechaParoProduccion,
  impactoTemporal,
  onChangeImpactoTemporal,
  submitted,
}) => {
  const maxFechaParoProduccion = getMexicoNowDateTimeLocal();
  const fechaParoFutureError = getParoDateTimeError(fechaParoProduccion);
  const fechaParoError = submitted && !fechaParoProduccion
    ? 'Selecciona la fecha y hora aproximada.'
    : fechaParoFutureError;

  return (
    <div className="flex flex-col gap-3 p-4 rounded-2xl border border-red-200/80 bg-red-50/40">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded-lg ${paroProduccion ? 'bg-red-600 text-white' : 'bg-slate-200 text-slate-500'}`}>
            <Icon name="warning" className="text-base" />
          </div>
          <span className="text-xs font-bold text-slate-800">
            ¿La producción parece detenida?
          </span>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={paroProduccion}
            onChange={(e) => {
              const val = e.target.checked;
              onChangeParoProduccion(val);
              if (!val) {
                onChangeImpactoTemporal('');
                onChangeFechaParoProduccion('');
              }
            }}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
        </label>
      </div>

      {paroProduccion && (
        <div className="flex flex-col gap-3 pt-2 border-t border-red-200/50 mt-1">
          {/* Fecha y hora del paro */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="fechaParoProduccion" className="text-[10px] font-bold text-red-700 uppercase tracking-wider">
              Fecha y hora aproximada *
            </Label>
            <Input
              id="fechaParoProduccion"
              type="datetime-local"
              name="fechaParoProduccion"
              value={fechaParoProduccion}
              max={maxFechaParoProduccion}
              onChange={(e) => onChangeFechaParoProduccion(normalizeParoDateTimeInput(e.target.value))}
              error={Boolean(fechaParoError)}
              helperText={fechaParoError || ''}
              className="h-11 bg-white border-red-200 focus:border-red-400 rounded-xl"
            />
          </div>

          {/* Impacto provisional (estado local) */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <Label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                Observacion operativa visible (Opcional)
              </Label>
              <span className="text-[9px] font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                Nota temporal
              </span>
            </div>
            <Input
              type="text"
              value={impactoTemporal}
              onChange={(e) => onChangeImpactoTemporal(e.target.value)}
              placeholder="Ej. Línea 2 detenida, 3 operarios en espera..."
              className="h-10 bg-white/70 border-slate-200 text-xs rounded-xl"
            />
            <p className="text-[9px] text-slate-400 italic">
              Esta informacion sera confirmada por el tecnico de mantenimiento.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ParoProduccionPanel;
