import React from 'react';
import { Icon } from '@/components/ui/z_index';

/**
 * Panel lateral de visualización del progreso en tiempo real para Desktop.
 * Muestra el estado del reporte sin amontonar botones ni formularios.
 */
export const ReporteResumenSidebar = ({
  categoriaSeleccionada,
  incidente,
  maquinaData,
  paroProduccion,
  fechaParoProduccion,
  planta,
  area,
  esMaquina,
  currentStep = 1,
}) => {
  const tieneUbicacionValida = esMaquina
    ? Boolean(maquinaData && (!paroProduccion || fechaParoProduccion))
    : Boolean(planta && area.trim());

  return (
    <div className="bg-white/85 backdrop-blur-xl border border-white/50 p-4 rounded-2xl shadow-xs flex flex-col justify-between gap-3 h-full overflow-hidden">
      
      {/* Encabezado Ficha del Reporte */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 shrink-0">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600">
            <Icon name="assignment" size="16px" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Vista Previa del Reporte
            </h3>
            <span className="text-[9.5px] text-slate-400 font-medium">
              Resumen acumulado en tiempo real
            </span>
          </div>
        </div>
        <span className="text-[8.5px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
          PASO {currentStep} DE 4
        </span>
      </div>

      {/* Resumen Acumulado Espacioso */}
      <div className="flex flex-col gap-2.5 flex-1 overflow-y-auto pr-0.5">
        
        {/* 1. Categoría */}
        <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200/60 text-xs">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-1.5 rounded-lg bg-slate-900 text-white shrink-0">
              <Icon name={categoriaSeleccionada.icon} size="14px" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[8.5px] font-bold text-slate-400 uppercase tracking-wider">Categoría</span>
              <span className="font-extrabold text-slate-800 truncate text-xs">
                {categoriaSeleccionada.nombre}
              </span>
            </div>
          </div>
          <Icon name="check_circle" size="16px" className="text-emerald-600 shrink-0" />
        </div>

        {/* 2. Incidencia */}
        <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200/60 text-xs">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className={`p-1.5 rounded-lg shrink-0 ${incidente ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-400'}`}>
              <Icon name={incidente?.icon || 'help_outline'} size="14px" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[8.5px] font-bold text-slate-400 uppercase tracking-wider">Tipo de Incidencia</span>
              <span className={`font-extrabold truncate text-xs ${incidente ? 'text-slate-800' : 'text-slate-400 italic'}`}>
                {incidente ? incidente.nombre : 'Por seleccionar...'}
              </span>
            </div>
          </div>
          {incidente ? (
            <Icon name="check_circle" size="16px" className="text-emerald-600 shrink-0" />
          ) : (
            <span className="text-[8.5px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-md border border-amber-200">
              Pendiente
            </span>
          )}
        </div>

        {/* 3. Ubicación o Equipo */}
        <div className="flex flex-col gap-1 p-2.5 rounded-xl bg-slate-50 border border-slate-200/60 text-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className={`p-1.5 rounded-lg shrink-0 ${tieneUbicacionValida ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-400'}`}>
                <Icon name={esMaquina ? 'precision_manufacturing' : 'location_on'} size="14px" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[8.5px] font-bold text-slate-400 uppercase tracking-wider">
                  {esMaquina ? 'Equipo Asignado' : 'Ubicación'}
                </span>
                {esMaquina ? (
                  maquinaData ? (
                    <span className="font-extrabold text-slate-800 truncate text-xs">
                      {maquinaData.nombre} [{maquinaData.codigo}]
                    </span>
                  ) : (
                    <span className="font-extrabold text-slate-400 italic text-xs">
                      Sin vincular equipo...
                    </span>
                  )
                ) : (
                  <span className={`font-extrabold truncate text-xs ${area ? 'text-slate-800' : 'text-slate-400 italic'}`}>
                    {area ? `Planta ${planta} — ${area}` : 'Sin definir...'}
                  </span>
                )}
              </div>
            </div>
            {tieneUbicacionValida ? (
              <Icon name="check_circle" size="16px" className="text-emerald-600 shrink-0" />
            ) : (
              <span className="text-[8.5px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-md border border-amber-200">
                Pendiente
              </span>
            )}
          </div>

          {esMaquina && maquinaData && paroProduccion && (
            <div className="mt-1.5 pt-1.5 border-t border-slate-200/60 flex items-center justify-between text-[9.5px]">
              <span className="font-extrabold text-red-600 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded-md">
                Paro de Producción
              </span>
              <span className="text-slate-500 font-mono text-[9px]">
                {fechaParoProduccion ? new Date(fechaParoProduccion).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Hora requerida'}
              </span>
            </div>
          )}
        </div>

      </div>

      {/* Pie Informativo de ayuda */}
      <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200/80 text-emerald-800 flex items-center gap-2 shrink-0">
        <Icon name="info" size="16px" className="text-emerald-600 shrink-0" />
        <p className="text-[10.5px] font-semibold leading-snug">
          Completa los pasos para revisar la ficha resumen final y confirmar el envío de tu reporte.
        </p>
      </div>

    </div>
  );
};

export default ReporteResumenSidebar;
