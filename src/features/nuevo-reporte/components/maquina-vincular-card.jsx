import React from 'react';
import { Icon } from '@/components/ui/z_index';
import { Input, Label } from '@/components/form/z_index';

/**
 * Componente visual de tarjeta premium para la búsqueda y vinculación de máquinas por código.
 * Muestra mensaje de error in-component cuando una máquina no es encontrada.
 */
export const MaquinaVincularCard = ({ codigo, onCodigoChange, onBuscar, loading, error }) => {
  return (
    <div className="bg-white/85 backdrop-blur-xl border border-white/50 p-6 rounded-3xl shadow-[0_10px_35px_rgba(0,0,0,0.03)] flex flex-col gap-5 transition-all">
      
      {/* Encabezado */}
      <div className="flex items-center gap-3 border-b border-slate-100 pb-3.5">
        <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-600 shadow-xs">
          <Icon name="precision_manufacturing" className="text-xl" />
        </div>
        <div>
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Vinculación de Equipo Técnico
          </h3>
          <p className="text-[11px] font-medium text-slate-400 mt-0.5">
            Ingresa el código impreso en la placa metálica de la máquina
          </p>
        </div>
      </div>

      {/* Formulario de Búsqueda */}
      <form onSubmit={onBuscar} className="flex flex-col gap-2">
        <div className="flex items-end gap-3">
          <div className="flex-1 flex flex-col gap-1.5">
            <Label htmlFor="codigoMaquina" className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-0.5">
              Código de la Máquina *
            </Label>
            <div className="relative flex items-center">
              <Icon name="tag" className="absolute left-3.5 text-slate-400 text-base" />
              <Input
                id="codigoMaquina"
                type="text"
                value={codigo}
                onChange={(e) => onCodigoChange(e.target.value)}
                placeholder="Ej. MBC0001"
                error={Boolean(error)}
                className={`font-mono text-xs uppercase pl-10 h-11 bg-white/60 rounded-xl tracking-widest transition-all ${
                  error
                    ? 'border-red-400 focus:border-red-500 focus:ring-red-400/20 text-red-950 font-bold'
                    : 'border-slate-200 focus:bg-white focus:ring-2 focus:ring-emerald-500/20'
                }`}
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={loading || !codigo.trim()}
            className="h-11 px-6 text-xs font-bold uppercase tracking-wider rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 disabled:opacity-50 text-white shadow-md shadow-emerald-600/20 transition-all cursor-pointer flex items-center gap-2 shrink-0"
          >
            {loading ? (
              <span>Buscando...</span>
            ) : (
              <>
                <Icon name="search" className="text-sm" />
                <span>Vincular Equipo</span>
              </>
            )}
          </button>
        </div>

        {/* Mensaje de Error In-Component */}
        {error && (
          <div className="flex items-center gap-2 text-xs font-bold text-red-600 bg-red-50/80 border border-red-200/80 p-2.5 rounded-xl animate-in fade-in slide-in-from-top-1 duration-200 mt-1">
            <Icon name="error" className="text-base shrink-0 text-red-500" />
            <span>{error}</span>
          </div>
        )}
      </form>

      {/* Caja Informativa de Ayuda */}
      <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 text-slate-600">
        <div className="p-1.5 rounded-lg bg-slate-200/70 text-slate-500 shrink-0">
          <Icon name="info" className="text-sm" />
        </div>
        <p className="text-[11px] leading-relaxed font-medium">
          Al identificar el equipo, el sistema cargará su nombre técnico, la planta operativa y el área asignada en automático.
        </p>
      </div>

    </div>
  );
};

export default MaquinaVincularCard;
