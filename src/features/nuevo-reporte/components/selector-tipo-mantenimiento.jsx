import React from 'react';

export const SelectorTipoMantenimiento = ({
  maquina,
  tienePlantilla,
  onSelectCorrectivo,
}) => {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden transition-all duration-300 hover:shadow-2xl">
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-6 text-center space-y-2">
          <span className="material-symbols-outlined text-4xl text-slate-300">qr_code_scanner</span>
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
                <span className="material-symbols-outlined text-2xl">report</span>
              </div>
              <div className="space-y-1">
                <div className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                  Reportar una falla
                  <span className="material-symbols-outlined text-xs text-slate-400 group-hover:translate-x-1 transition-transform">arrow_forward</span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed font-sans">
                  Para reportar averías, paros de línea o desperfectos que requieran la intervención del equipo de mantenimiento.
                </p>
              </div>
            </button>

            {/* Opción 2: Mantenimiento Autónomo (Siempre deshabilitado en esta etapa) */}
            <div className="w-full flex items-start gap-4 p-4 rounded-xl border border-slate-100 bg-slate-50/50 opacity-60 cursor-not-allowed">
              <div className="p-3 bg-slate-100 text-slate-400 rounded-lg">
                <span className="material-symbols-outlined text-2xl">build</span>
              </div>
              <div className="space-y-1">
                <div className="font-bold text-slate-800 text-sm flex flex-col sm:flex-row sm:items-center gap-1.5">
                  Mantenimiento autónomo
                  <span className="bg-slate-200 text-slate-700 text-[10px] px-1.5 py-0.5 rounded font-medium w-max">
                    {tienePlantilla ? 'Disponible próximamente' : 'No disponible para este equipo'}
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed font-sans">
                  Realizar inspecciones diarias de limpieza, lubricación y ajuste básico de la máquina.
                </p>
              </div>
            </div>

          </div>

          <div className="text-center pt-2">
            <span className="text-[10px] text-slate-400 flex items-center justify-center gap-1 font-sans">
              <span className="material-symbols-outlined text-xs">lock</span>
              El reporte de fallas requiere inicio de sesión.
            </span>
          </div>

        </div>
      </div>
    </div>
  );
};
