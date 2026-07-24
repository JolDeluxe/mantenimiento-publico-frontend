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
  const steps = [
    {
      number: 1,
      label: 'Categoría',
      icon: categoriaSeleccionada?.icon || 'category',
      done: Boolean(categoriaSeleccionada),
      value: categoriaSeleccionada?.nombre || 'Por seleccionar...',
    },
    {
      number: 2,
      label: esMaquina ? 'Equipo' : 'Incidencia',
      icon: esMaquina ? 'precision_manufacturing' : incidente?.icon || 'grid_view',
      done: esMaquina ? tieneUbicacionValida : Boolean(incidente),
      value: esMaquina
        ? maquinaData
          ? `${maquinaData.nombre} [${maquinaData.codigo}]`
          : 'Sin vincular equipo...'
        : incidente?.nombre || 'Por seleccionar...',
    },
    {
      number: 3,
      label: esMaquina ? 'Incidencia' : 'Ubicación',
      icon: esMaquina ? incidente?.icon || 'grid_view' : 'location_on',
      done: esMaquina ? Boolean(incidente) : tieneUbicacionValida,
      value: esMaquina
        ? incidente?.nombre || 'Por seleccionar...'
        : area
          ? `Planta ${planta} - ${area}`
          : 'Sin definir...',
    },
    {
      number: 4,
      label: 'Detalles',
      icon: 'edit_note',
      done: currentStep >= 4,
      value: currentStep >= 4 ? 'Redactando descripción' : 'Pendiente',
    },
  ];

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

      {/* Ruta acumulada conectada */}
      <div className="flex-1 overflow-y-auto pr-0.5 py-1">
        <div className="relative flex flex-col gap-3">
          <div className="absolute left-[18px] top-5 bottom-5 w-px bg-emerald-100" />
          {steps.map((item, index) => {
            const isActive = currentStep === item.number;
            const isPast = currentStep > item.number;
            const isReady = item.done || isPast;
            return (
              <div key={item.number} className="relative flex gap-3">
                <div
                  className={`relative z-10 w-9 h-9 rounded-xl flex items-center justify-center border shadow-xs shrink-0 transition-all ${
                    isReady
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : isActive
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-white text-slate-400 border-slate-200'
                  }`}
                >
                  <Icon name={isReady && !isActive ? 'check' : item.icon} size="16px" />
                </div>

                <div
                  className={`min-w-0 flex-1 rounded-xl border p-3 transition-all ${
                    isActive
                      ? 'bg-emerald-50/70 border-emerald-200 shadow-xs'
                      : isReady
                        ? 'bg-white border-emerald-100'
                        : 'bg-slate-50/80 border-slate-200/70'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className={`text-[8.5px] font-black uppercase tracking-wider ${isActive ? 'text-emerald-700' : 'text-slate-400'}`}>
                      Paso {item.number}
                    </span>
                    <span className={`text-[8.5px] font-black px-1.5 py-0.5 rounded-md border ${
                      isReady
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-amber-50 text-amber-600 border-amber-200'
                    }`}>
                      {isReady ? 'Listo' : 'Pendiente'}
                    </span>
                  </div>
                  <div className="mt-1 flex flex-col min-w-0">
                    <span className="text-xs font-black text-slate-800 truncate">
                      {item.label}
                    </span>
                    <span className={`text-[11px] font-semibold truncate ${item.done ? 'text-slate-600' : 'text-slate-400 italic'}`}>
                      {item.value}
                    </span>
                  </div>
                  {index === 1 && esMaquina && maquinaData && paroProduccion && (
                    <div className="mt-2 flex items-center justify-between gap-2 text-[9.5px] font-bold text-red-600 bg-red-50 border border-red-200 px-2 py-1 rounded-lg">
                      <span>Paro de Producción</span>
                      <span className="font-mono text-[9px]">
                        {fechaParoProduccion ? new Date(fechaParoProduccion).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Hora requerida'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
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
