import React, { useState } from 'react';
import { Icon } from '@/components/ui/z_index';
import { ESTADOS_CONFIG } from '../constants/reporte-estados';
import { cn } from '@/utils/cn';

const statusCardStyles = {
  TODOS: {
    base: 'border-slate-200 bg-gradient-to-br from-white/80 via-slate-50/60 to-slate-100/40 shadow-slate-900/5 text-slate-700',
    active: 'border-slate-800 bg-slate-900 text-white shadow-md scale-[1.01]',
    bgCircle: 'bg-slate-900',
    countBase: 'bg-slate-200/70 text-slate-700',
    countActive: 'bg-white text-slate-900',
    iconColor: 'text-slate-500',
    iconActive: 'text-white',
    icon: 'rule',
  },
  PENDIENTE: {
    base: 'border-amber-200 bg-gradient-to-br from-white/90 via-amber-50/60 to-amber-100/40 shadow-amber-900/5 text-amber-800',
    active: 'border-amber-500 bg-amber-500 text-white shadow-md scale-[1.01]',
    bgCircle: 'bg-amber-500',
    countBase: 'bg-amber-100 text-amber-800',
    countActive: 'bg-white text-amber-600',
    iconColor: 'text-amber-600',
    iconActive: 'text-white',
    icon: 'pending',
  },
  ASIGNADA: {
    base: 'border-blue-200 bg-gradient-to-br from-white/90 via-blue-50/60 to-blue-100/40 shadow-blue-900/5 text-blue-800',
    active: 'border-blue-500 bg-blue-500 text-white shadow-md scale-[1.01]',
    bgCircle: 'bg-blue-500',
    countBase: 'bg-blue-100 text-blue-800',
    countActive: 'bg-white text-blue-600',
    iconColor: 'text-blue-600',
    iconActive: 'text-white',
    icon: 'engineering',
  },
  EN_PROGRESO: {
    base: 'border-orange-200 bg-gradient-to-br from-white/90 via-orange-50/60 to-orange-100/40 shadow-orange-900/5 text-orange-850',
    active: 'border-orange-500 bg-orange-500 text-white shadow-md scale-[1.01]',
    bgCircle: 'bg-orange-500',
    countBase: 'bg-orange-100 text-orange-850',
    countActive: 'bg-white text-orange-605',
    iconColor: 'text-orange-600',
    iconActive: 'text-white',
    icon: 'autorenew',
  },
  EN_PAUSA: {
    base: 'border-slate-200 bg-gradient-to-br from-white/90 via-slate-50/70 to-slate-100/40 shadow-slate-900/5 text-slate-700',
    active: 'border-slate-600 bg-slate-600 text-white shadow-md scale-[1.01]',
    bgCircle: 'bg-slate-500',
    countBase: 'bg-slate-200 text-slate-700',
    countActive: 'bg-white text-slate-700',
    iconColor: 'text-slate-500',
    iconActive: 'text-white',
    icon: 'pause_circle',
  },
  RESUELTO: {
    base: 'border-emerald-250 bg-gradient-to-br from-white/90 via-emerald-50/60 to-emerald-100/40 shadow-emerald-900/5 text-emerald-800',
    active: 'border-emerald-600 bg-emerald-600 text-white shadow-md scale-[1.01]',
    bgCircle: 'bg-emerald-600',
    countBase: 'bg-emerald-100 text-emerald-800',
    countActive: 'bg-white text-emerald-600',
    iconColor: 'text-emerald-600',
    iconActive: 'text-white',
    icon: 'task_alt',
  },
  RECHAZADO: {
    base: 'border-rose-200 bg-gradient-to-br from-white/90 via-rose-50/60 to-rose-100/40 shadow-rose-900/5 text-rose-800',
    active: 'border-rose-500 bg-rose-500 text-white shadow-md scale-[1.01]',
    bgCircle: 'bg-rose-500',
    countBase: 'bg-rose-100 text-rose-800',
    countActive: 'bg-white text-rose-600',
    iconColor: 'text-rose-600',
    iconActive: 'text-white',
    icon: 'cancel',
  },
  CERRADO: {
    base: 'border-slate-300 bg-gradient-to-br from-white/90 via-slate-100/50 to-slate-200/30 shadow-slate-900/5 text-slate-700',
    active: 'border-slate-700 bg-slate-700 text-white shadow-md scale-[1.01]',
    bgCircle: 'bg-slate-700',
    countBase: 'bg-slate-200 text-slate-700',
    countActive: 'bg-white text-slate-800',
    iconColor: 'text-slate-600',
    iconActive: 'text-white',
    icon: 'archive',
  },
};

/**
 * Componente Premium de Filtros exclusivo para Dispositivos Móviles (Mobile).
 * Soporta colapsar/expandir mostrando un ovalo para el total y círculos compactos de color en modo contraído.
 */
export const ReportesFilterBarMobile = ({
  reportes = [],
  selectedEstado = 'TODOS',
  onChangeEstado,
  estadosDisponibles = [],
  sortBy = 'RECIENTES',
  onChangeSort,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const conteoEstados = reportes.reduce((acc, r) => {
    acc[r.estado] = (acc[r.estado] || 0) + 1;
    return acc;
  }, {});
  const sortOptions = [
    { value: 'RECIENTES', label: 'Recientes', icon: 'schedule' },
    { value: 'ANTIGUOS', label: 'Antiguos', icon: 'history' },
    { value: 'PRIORIDAD', label: 'Prioridad', icon: 'priority_high' },
  ];

  const renderFilterItem = (est, label, count, iconName) => {
    const isSelected = selectedEstado === est;
    const style = statusCardStyles[est] || statusCardStyles.TODOS;

    return (
      <button
        key={est}
        type="button"
        onClick={() => onChangeEstado(est)}
        className={cn(
          'group relative flex items-center justify-between gap-3 border cursor-pointer select-none transition-all duration-200 outline-none w-full active:scale-[0.98]',
          'rounded-xl p-2.5 px-3 text-xs font-bold',
          isSelected ? style.active : style.base
        )}
      >
        <div className="flex items-center gap-2 min-w-0">
          <div className={cn('p-1 rounded-lg bg-slate-150/40 shrink-0 transition-colors duration-200', isSelected && 'bg-white/15')}>
            <Icon
              name={style.icon || iconName}
              size="13px"
              className={isSelected ? style.iconActive : style.iconColor}
            />
          </div>
          <span className="truncate pr-1 text-[11px] sm:text-xs">
            {label}
          </span>
        </div>
        <div className={cn(
          'h-5 min-w-5 px-1 rounded-full flex items-center justify-center font-black text-[10px] border border-white/20 shadow-3xs shrink-0',
          isSelected ? style.countActive : style.countBase
        )}>
          {count}
        </div>
      </button>
    );
  };

  const totalItems = [
    { id: 'TODOS', label: 'Todos', count: reportes.length, icon: 'rule' },
    ...estadosDisponibles.map((est) => {
      const conf = ESTADOS_CONFIG[est];
      return {
        id: est,
        label: conf?.label || est,
        count: conteoEstados[est] || 0,
        icon: 'info',
      };
    }),
  ];

return (
    <div className="w-full flex flex-col gap-3 mb-5 shrink-0 bg-white/50 backdrop-blur-md border border-white/30 p-2.5 rounded-xl shadow-2xs">
      {/* Cabecera */}
      <div className="flex items-center justify-between px-0.5 border-b border-slate-200/40 pb-2">
        <span className="text-[9.5px] font-extrabold text-slate-400 uppercase tracking-wider">
          Resumen de Reportes
        </span>
        <div className="flex items-center gap-2">
          {selectedEstado !== 'TODOS' && (
            <button
              type="button"
              onClick={() => onChangeEstado('TODOS')}
              className="text-[8.5px] font-extrabold text-emerald-600 uppercase tracking-wider hover:underline flex items-center gap-0.5 cursor-pointer bg-transparent border-none outline-none"
            >
              <Icon name="close" size="9.5px" />
              <span>Limpiar</span>
            </button>
          )}
          {onChangeSort && (
            <div className="relative h-5 w-[85px] shrink-0 rounded-md border border-slate-250/60 bg-white shadow-3xs flex items-center">
              <Icon
                name="sort"
                size="8px"
                className="pointer-events-none absolute left-1.5 text-slate-500"
              />
              <select
                value={sortBy}
                onChange={(e) => onChangeSort(e.target.value)}
                aria-label="Ordenar reportes"
                className="w-full h-full appearance-none bg-transparent pl-4 pr-4 text-[9px] font-semibold text-slate-700 outline-none cursor-pointer border-none m-0 leading-none"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <Icon
                name="expand_more"
                size="10px"
                className="pointer-events-none absolute right-1 text-slate-500"
              />
            </div>
          )}
          {/* Botón de Colapsar/Expandir */}
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center justify-center p-1 rounded bg-slate-100/60 border border-slate-250/50 text-slate-500 active:scale-95 cursor-pointer shadow-3xs"
          >
            <Icon name={isExpanded ? "expand_less" : "expand_more"} size="11px" />
          </button>
        </div>
      </div>

      {/* Contenido Dinámico: Expandido o Contraído */}
      {isExpanded ? (
        <div className="flex flex-col gap-2.5 w-full">
          {totalItems.length % 2 === 0 ? (
            <div className="grid grid-cols-2 gap-2.5 w-full">
              {totalItems.map((item) => renderFilterItem(item.id, item.label, item.count, item.icon))}
            </div>
          ) : (
            <>
              <div className="w-full">
                {renderFilterItem(totalItems[0].id, totalItems[0].label, totalItems[0].count, totalItems[0].icon)}
              </div>
              <div className="grid grid-cols-2 gap-2.5 w-full">
                {totalItems.slice(1).map((item) => renderFilterItem(item.id, item.label, item.count, item.icon))}
              </div>
            </>
          )}
        </div>
      ) : (
        /* CORRECCIÓN 2: Se agregó items-start para dar espacio al texto inferior */
        <div className="flex items-start justify-between w-full py-1 px-1 mt-1">
          {totalItems.map((item) => {
            const isSelected = selectedEstado === item.id;
            const style = statusCardStyles[item.id] || statusCardStyles.TODOS;

            if (item.id === 'TODOS') {
              return (
                <div key={item.id} className="flex flex-col items-center gap-1">
                  <button
                    type="button"
                    onClick={() => onChangeEstado(item.id)}
                    className={cn(
                      'h-6.5 px-2.5 rounded-full flex items-center justify-center text-[8.5px] font-black text-white transition-all duration-200 active:scale-90 border shadow-3xs shrink-0 cursor-pointer',
                      style.bgCircle,
                    isSelected
                      ? 'ring-2 ring-slate-800/40 ring-offset-1 scale-105 border-white z-10'
                        : 'opacity-60 scale-95 border-transparent hover:opacity-100'
                    )}
                    title={item.label}
                  >
                    TOTAL {item.count}
                  </button>
                  {/* Etiqueta invisible solo para mantener la alineación vertical con los demás */}
                  <span className="text-[7.5px] opacity-0 pointer-events-none">X</span>
                </div>
              );
            }

            // CORRECCIÓN 2: Se envuelve el botón en un div para poder colocar el texto abajo
            return (
              <div key={item.id} className="flex flex-col items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => onChangeEstado(item.id)}
                  className={cn(
                    'w-6.5 h-6.5 rounded-full flex items-center justify-center text-[9.5px] font-black text-white transition-all duration-200 active:scale-90 border shadow-3xs shrink-0 cursor-pointer',
                    style.bgCircle,
                  isSelected
                    ? 'ring-2 ring-slate-800/40 ring-offset-1 scale-110 border-white z-10'
                      : 'opacity-60 scale-90 border-transparent hover:opacity-100'
                  )}
                  title={item.label}
                >
                  {item.count}
                </button>
                {/* Nueva etiqueta de texto para identificar el círculo */}
                <span className="text-[7.5px] font-bold text-slate-400 uppercase tracking-tighter w-10 text-center truncate">
                  {item.label}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ReportesFilterBarMobile;
