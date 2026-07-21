import React from 'react';
import { Icon } from '@/components/ui/z_index';
import { Input, Label } from '@/components/form/z_index';
import { GlassSheen } from '@/components/ui/liquid-glass-mobile';

export const ReporteForm = ({
  descripcion,
  onChangeDescripcion,
  submitted,
  isSubmitting,
  onSubmit,
  onPrevStep,
}) => {
  return (
    <form onSubmit={onSubmit} className="bg-white/85 backdrop-blur-xl border border-white/50 p-4 sm:p-5 rounded-2xl shadow-xs flex flex-col gap-4 relative w-full">
      <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5">
        <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 shrink-0">
          <Icon name="edit_note" size="16px" />
        </div>
        <div>
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Descripción Detallada del Problema
          </h3>
        </div>
      </div>

      {/* Descripción */}
      <div className="flex flex-col gap-1.5">
        <div className="flex justify-between items-center px-0.5">
          <Label htmlFor="descripcion" className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Detalles de la falla u observación *
          </Label>
          <span className="text-[9px] font-bold text-slate-400">
            {descripcion.length} caracteres
          </span>
        </div>
        <Input
          id="descripcion"
          name="descripcion"
          multiline={true}
          value={descripcion}
          onChange={(e) => onChangeDescripcion(e.target.value)}
          placeholder="Describe la falla observada, sintomas o contexto (mínimo 10 caracteres)..."
          error={submitted && (!descripcion.trim() || descripcion.trim().length < 10)}
          helperText={
            submitted && (!descripcion.trim() || descripcion.trim().length < 10)
              ? 'La descripción es obligatoria y debe tener al menos 10 caracteres.'
              : ''
          }
          className="min-h-24 bg-white/60 border-slate-200 focus:bg-white rounded-xl p-3 text-xs placeholder:text-[10.5px]"
        />
      </div>

      {/* Botones de Navegación del Wizard con Liquid Glass */}
      <div className="flex items-center justify-between gap-2.5 pt-1">
        <button
          type="button"
          onClick={onPrevStep}
          className="relative overflow-hidden h-11 px-4 text-[11px] font-extrabold uppercase tracking-wider rounded-xl bg-slate-800/80 hover:bg-slate-800 active:bg-slate-900 text-white backdrop-blur-xl border border-white/20 shadow-xs transition-all cursor-pointer flex items-center justify-center shrink-0"
        >
          <GlassSheen />
          <span className="relative z-10">← Anterior</span>
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="relative overflow-hidden flex-1 h-11 text-[11px] font-extrabold uppercase tracking-wider rounded-xl bg-emerald-600/90 hover:bg-emerald-600 active:bg-emerald-700 disabled:opacity-50 text-white backdrop-blur-xl border border-white/40 shadow-[0_10px_30px_rgba(16,185,129,0.35),inset_0_1px_0_rgba(255,255,255,0.5)] transition-all cursor-pointer flex items-center justify-center gap-1.5 min-w-0"
        >
          <GlassSheen />
          {isSubmitting ? (
            <span className="relative z-10 truncate">Enviando...</span>
          ) : (
            <>
              <Icon name="send" size="14px" className="relative z-10 shrink-0" />
              <span className="relative z-10 truncate">Enviar</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default ReporteForm;
