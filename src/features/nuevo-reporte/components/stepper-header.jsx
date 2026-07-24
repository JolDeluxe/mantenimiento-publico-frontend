import React from 'react';
import { Icon } from '@/components/ui/z_index';
import { GlassSheen } from '@/components/ui/liquid-glass-mobile';
import { cn } from '@/utils/cn';

/**
 * Indicador de Pasos del Wizard (Stepper Header).
 * Flotante y persistente con acabado estético Liquid Glass.
 */
export const StepperHeader = ({ currentStep, onStepClick, stepValidations, esMaquina }) => {
  const steps = [
    { number: 1, label: 'Categoría', icon: 'category' },
    { number: 2, label: 'Tipo de Incidencia', icon: 'grid_view' },
    { number: 3, label: esMaquina ? 'Equipo' : 'Ubicación', icon: esMaquina ? 'precision_manufacturing' : 'location_on' },
    { number: 4, label: 'Detalles', icon: 'send' },
  ];

  const activeStepObj = steps.find((s) => s.number === currentStep) || steps[0];
  const activeStepValid = stepValidations && stepValidations[currentStep];

  return (
    <div className="w-full bg-white/70 backdrop-blur-xl saturate-[160%] border border-white/50 p-2.5 sm:p-3 rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.06),inset_0_1px_0_rgba(255,255,255,0.6)] relative overflow-hidden">
      <GlassSheen />
      
      {/* VISTA MÓVIL (< sm): Título del Paso Activo + Círculos Compactos Clicables */}
      <div className="sm:hidden flex items-center justify-between gap-2 relative z-10">
        <div className="flex items-center gap-2 min-w-0">
          <div className={cn(
            "w-6 h-6 rounded-lg text-white flex items-center justify-center text-xs font-black shrink-0 shadow-xs transition-colors",
            activeStepValid ? "bg-emerald-600" : "bg-slate-800"
          )}>
            {currentStep}
          </div>
          <div className="flex flex-col min-w-0">
            <span className={cn(
              "text-[8.5px] font-extrabold uppercase tracking-wider leading-none transition-colors",
              activeStepValid ? "text-emerald-700" : "text-slate-500"
            )}>
              Paso {currentStep} de 4
            </span>
            <span className="text-xs font-bold text-slate-800 truncate leading-tight mt-0.5">
              {activeStepObj.label}
            </span>
          </div>
        </div>

        {/* Círculos compactos de pasos */}
        <div className="flex items-center gap-1 shrink-0">
          {steps.map((step) => {
            const isActive = currentStep === step.number;
            const isValid = stepValidations && stepValidations[step.number];
            const isCompleted = currentStep > step.number || isValid;
            const canClick = step.number < currentStep || isCompleted;

            return (
              <button
                key={step.number}
                type="button"
                disabled={!canClick && !isActive}
                onClick={() => canClick && onStepClick(step.number)}
                className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all border ${
                  isActive
                    ? isValid
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs ring-2 ring-emerald-600/20'
                      : 'bg-slate-800 text-white border-slate-800 shadow-xs ring-2 ring-slate-800/20'
                    : isCompleted
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300 cursor-pointer'
                    : canClick
                    ? 'bg-white/80 text-slate-700 border-white/60 cursor-pointer backdrop-blur-md'
                    : 'bg-slate-100/60 text-slate-400 border-slate-200/50 opacity-60 cursor-not-allowed'
                }`}
                title={step.label}
              >
                {isCompleted && !isActive ? (
                  <Icon name="check" className="text-[10px] font-bold" />
                ) : (
                  <span>{step.number}</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* VISTA ESCRITORIO (>= sm): Rejilla Completa de Pastillas */}
      <div className="hidden sm:grid sm:grid-cols-4 gap-2 relative z-10">
        {steps.map((step) => {
          const isActive = currentStep === step.number;
          const isValid = stepValidations && stepValidations[step.number];
          const isCompleted = currentStep > step.number || isValid;
          const canClick = step.number < currentStep || isCompleted;

          return (
            <button
              key={step.number}
              type="button"
              disabled={!canClick && !isActive}
              onClick={() => canClick && onStepClick(step.number)}
              className={cn(
                'flex items-center gap-2.5 p-2 rounded-xl transition-all text-left border',
                isActive
                  ? isValid
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/20 ring-2 ring-emerald-600/15 scale-[1.01]'
                    : 'bg-slate-800 text-white border-slate-800 shadow-md shadow-slate-800/20 ring-2 ring-slate-800/15 scale-[1.01]'
                  : isCompleted
                  ? 'bg-emerald-50/10 border-emerald-200 text-emerald-800 hover:bg-emerald-50/20 cursor-pointer'
                  : canClick
                  ? 'bg-white/60 border-slate-200 text-slate-700 hover:bg-white cursor-pointer'
                  : 'bg-slate-50/50 border-slate-100 text-slate-400 opacity-60 cursor-not-allowed'
              )}
            >
              <div
                className={cn(
                  'w-6 h-6 rounded-lg flex items-center justify-center font-extrabold text-xs shrink-0 transition-colors',
                  isActive
                    ? 'bg-white/20 text-white'
                    : isCompleted
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-200/70 text-slate-500'
                )}
              >
                {isCompleted && !isActive ? (
                  <Icon name="check" className="text-xs font-bold" />
                ) : (
                  <span>{step.number}</span>
                )}
              </div>

              <div className="flex flex-col min-w-0">
                <span
                  className={cn(
                    'text-[8.5px] font-extrabold uppercase tracking-wider line-clamp-1 transition-colors',
                    isActive ? 'text-white/80' : isCompleted ? 'text-emerald-700' : 'text-slate-400'
                  )}
                >
                  Paso {step.number}
                </span>
                <span
                  className={cn(
                    'text-[11px] font-bold truncate transition-colors',
                    isActive ? 'text-white' : isCompleted ? 'text-emerald-900' : 'text-slate-700'
                  )}
                >
                  {step.label}
                </span>
              </div>
            </button>
          );
        })}
      </div>

    </div>
  );
};

export default StepperHeader;
