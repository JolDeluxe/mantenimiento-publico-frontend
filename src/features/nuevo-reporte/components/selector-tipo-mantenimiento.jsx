import React from 'react';
import { Icon } from '@/components/ui/z_index';

export const SelectorTipoMantenimiento = ({
  maquina,
  tienePlantilla,
  onSelectCorrectivo,
  onSelectAutonomo,
}) => {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden transition-all duration-300 hover:shadow-2xl">
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-6 text-center space-y-2">
          <Icon name="qr_code_scanner" size="xl" className="text-slate-300" />
          <h2 className="text-xl font-bold tracking-tight">¿Qué deseas hacer?</h2>
          <p className="text-xs text-slate-400">
            Equipo: <span className="font-mono text-slate-200 font-bold">{maquina?.codigo}</span> - {maquina?.nombre}
          </p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          <div className="space-y-4">
            
            {/* Opción 1: Reporte Correctivo */}
            <button
              onClick={onSelectCorrectivo}
              className="w-full flex items-start gap-4 p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-800 hover:bg-slate-50/50 transition-all duration-200 text-left group cursor-pointer"
            >
              <div className="p-3 bg-red-50 text-red-600 rounded-lg group-hover:bg-red-100 transition-colors">
                <Icon name="report" size="md" />
              </div>
              <div className="space-y-1">
                <div className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                  Reportar una falla
                  <Icon name="arrow_forward" size="xs" className="text-slate-400 group-hover:translate-x-1 transition-transform" />
                </div>
                <p className="text-xs text-slate-500 leading-relaxed font-sans">
                  Para reportar averías, paros de línea o desperfectos que requieran la intervención del equipo de mantenimiento.
                </p>
              </div>
            </button>

            {/* Opción 2: Mantenimiento Autónomo */}
            {tienePlantilla ? (
              <button
                onClick={onSelectAutonomo}
                className="w-full flex items-start gap-4 p-4 rounded-xl border border-slate-200 bg-white hover:border-emerald-600 hover:bg-emerald-50/10 transition-all duration-200 text-left group cursor-pointer"
              >
                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg group-hover:bg-emerald-100 transition-colors">
                  <Icon name="build" size="md" />
                </div>
                <div className="space-y-1">
                  <div className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                    Mantenimiento autónomo
                    <Icon name="arrow_forward" size="xs" className="text-slate-400 group-hover:translate-x-1 transition-transform" />
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed font-sans">
                    Realizar inspecciones diarias de limpieza, lubricación y ajuste básico de la máquina.
                  </p>
                </div>
              </button>
            ) : (
              <div className="w-full flex items-start gap-4 p-4 rounded-xl border border-slate-100 bg-slate-50/50 opacity-60 cursor-not-allowed">
                <div className="p-3 bg-slate-100 text-slate-400 rounded-lg">
                  <Icon name="build" size="md" />
                </div>
                <div className="space-y-1">
                  <div className="font-bold text-slate-800 text-sm flex flex-col sm:flex-row sm:items-center gap-1.5">
                    Mantenimiento autónomo
                    <span className="bg-slate-200 text-slate-700 text-[10px] px-1.5 py-0.5 rounded font-medium w-max font-sans">
                      No disponible para este equipo
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed font-sans">
                    Realizar inspecciones diarias de limpieza, lubricación y ajuste básico de la máquina.
                  </p>
                </div>
              </div>
            )}

          </div>

          <div className="text-center pt-2">
            <span className="text-[10px] text-slate-400 flex items-center justify-center gap-1 font-sans">
              <Icon name="lock" size="xs" />
              El reporte de fallas requiere inicio de sesión.
            </span>
          </div>

        </div>
      </div>
    </div>
  );
};
