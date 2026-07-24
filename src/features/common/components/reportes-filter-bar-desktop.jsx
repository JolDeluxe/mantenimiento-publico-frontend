import React from 'react';
import { Icon } from '@/components/ui/z_index';
import { ESTADOS_CONFIG } from '../constants/reporte-estados';
import { cn } from '@/utils/cn';

const statusCardStyles = {
  TODOS: {
    base: 'border-slate-200 bg-gradient-to-br from-white/80 via-slate-50/60 to-slate-100/40 shadow-slate-900/5 text-slate-700',
    active: 'border-slate-800 bg-slate-900 text-white shadow-md shadow-slate-900/10 scale-[1.01]',
    countBase: 'bg-slate-200/70 text-slate-700',
    countActive: 'bg-white text-slate-900',
    iconColor: 'text-slate-500',
    iconActive: 'text-white',
    icon: 'rule',
  },
  PENDIENTE: {
    base: 'border-amber-200 bg-gradient-to-br from-white/90 via-amber-50/60 to-amber-100/40 shadow-amber-900/5 text-amber-800',
    active: 'border-amber-500 bg-amber-500 text-white shadow-md shadow-amber-500/10 scale-[1.01]',
    countBase: 'bg-amber-100 text-amber-800',
    countActive: 'bg-white text-amber-600',
    iconColor: 'text-amber-600',
    iconActive: 'text-white',
    icon: 'pending',
  },
  ASIGNADA: {
    base: 'border-blue-200 bg-gradient-to-br from-white/90 via-blue-50/60 to-blue-100/40 shadow-blue-900/5 text-blue-800',
    active: 'border-blue-500 bg-blue-500 text-white shadow-md shadow-blue-500/10 scale-[1.01]',
    countBase: 'bg-blue-100 text-blue-800',
    countActive: 'bg-white text-blue-600',
    iconColor: 'text-blue-600',
    iconActive: 'text-white',
    icon: 'engineering',
  },
  EN_PROGRESO: {
    base: 'border-orange-200 bg-gradient-to-br from-white/90 via-orange-50/60 to-orange-100/40 shadow-orange-900/5 text-orange-850',
    active: 'border-orange-500 bg-orange-500 text-white shadow-md shadow-orange-500/10 scale-[1.01]',
    countBase: 'bg-orange-100 text-orange-850',
    countActive: 'bg-white text-orange-650',
    iconColor: 'text-orange-600',
    iconActive: 'text-white',
    icon: 'autorenew',
  },
  EN_PAUSA: {
    base: 'border-slate-200 bg-gradient-to-br from-white/90 via-slate-50/70 to-slate-100/40 shadow-slate-900/5 text-slate-700',
    active: 'border-slate-600 bg-slate-600 text-white shadow-md shadow-slate-600/10 scale-[1.01]',
    countBase: 'bg-slate-200 text-slate-700',
    countActive: 'bg-white text-slate-700',
    iconColor: 'text-slate-500',
    iconActive: 'text-white',
    icon: 'pause_circle',
  },
  RESUELTO: {
    base: 'border-emerald-250 bg-gradient-to-br from-white/90 via-emerald-50/60 to-emerald-100/40 shadow-emerald-900/5 text-emerald-800',
    active: 'border-emerald-600 bg-emerald-600 text-white shadow-md shadow-emerald-500/10 scale-[1.01]',
    countBase: 'bg-emerald-100 text-emerald-800',
    countActive: 'bg-white text-emerald-600',
    iconColor: 'text-emerald-600',
    iconActive: 'text-white',
    icon: 'task_alt',
  },
  RECHAZADO: {
    base: 'border-rose-200 bg-gradient-to-br from-white/90 via-rose-50/60 to-rose-100/40 shadow-rose-900/5 text-rose-800',
    active: 'border-rose-500 bg-rose-500 text-white shadow-md shadow-rose-500/10 scale-[1.01]',
    countBase: 'bg-rose-100 text-rose-800',
    countActive: 'bg-white text-rose-600',
    iconColor: 'text-rose-600',
    iconActive: 'text-white',
    icon: 'cancel',
  },
  CERRADO: {
    base: 'border-slate-300 bg-gradient-to-br from-white/90 via-slate-100/50 to-slate-200/30 shadow-slate-900/5 text-slate-700',
    active: 'border-slate-700 bg-slate-700 text-white shadow-md shadow-slate-700/10 scale-[1.01]',
    countBase: 'bg-slate-200 text-slate-700',
    countActive: 'bg-white text-slate-800',
    iconColor: 'text-slate-600',
    iconActive: 'text-white',
    icon: 'archive',
  },
};

/**
 * Componente Premium de Filtros exclusivo para Escritorio (Desktop).
 * Presenta todas las opciones alineadas en una cuadrícula responsiva, evitando que los elementos que bajan se ensanchen anormalmente.
 */
export const ReportesFilterBarDesktop = ({
  reportes = [],
  selectedEstado = 'TODOS',
  onChangeEstado,
  estadosDisponibles = [],
  sortBy = 'RECIENTES',
  onChangeSort,
}) => {
  const conteoEstados = reportes.reduce((acc, r) => {
    acc[r.estado] = (acc[r.estado] || 0) + 1;
    return acc;
  }, {});

  const renderFilterItem = (est, label, count, iconName) => {
    const isSelected = selectedEstado === est;
    const style = statusCardStyles[est] || statusCardStyles.TODOS;

    return (
      <button
        key={est}
        type="button"
        onClick={() => onChangeEstado(est)}
        className={cn(
          'group relative flex items-center justify-between gap-3 border cursor-pointer select-none transition-all duration-200 outline-none active:scale-[0.98]',
          'rounded-xl p-2 px-3 text-xs font-bold hover:-translate-y-0.5 w-full',
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
          <span className="truncate pr-1 text-xs">
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

  // Determinar número de columnas en XL basado en el total de elementos (7 u 8)
  const xlColsClass = totalItems.length >= 8 ? 'xl:grid-cols-8' : 'xl:grid-cols-7';

  return (
    <div className="w-full flex flex-col gap-3.5 mb-6 shrink-0 bg-white/50 backdrop-blur-md border border-white/30 p-4 rounded-2xl shadow-2xs">
      <div className="flex items-center justify-between px-1 border-b border-slate-200/40 pb-2.5">
        <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
          Resumen de Reportes
        </span>
        <div className="flex items-center gap-3">
          {selectedEstado !== 'TODOS' && (
            <button
              onClick={() => onChangeEstado('TODOS')}
              className="text-[9.5px] font-extrabold text-emerald-600 uppercase tracking-wider hover:underline flex items-center gap-1 cursor-pointer bg-transparent border-none outline-none"
            >
              <Icon name="close" size="11px" />
              <span>Limpiar filtro</span>
            </button>
          )}
          {onChangeSort && (
            <div className="flex items-center gap-1.5 bg-slate-100/60 border border-slate-200/50 rounded-lg px-2.5 py-1 shadow-3xs">
              <Icon name="sort" size="12px" className="text-slate-500" />
              <select
                value={sortBy}
                onChange={(e) => onChangeSort(e.target.value)}
                className="bg-transparent text-[10.5px] font-bold text-slate-700 outline-none cursor-pointer border-none p-0 pr-1"
              >
                <option value="RECIENTES">Recientes</option>
                <option value="ANTIGUOS">Antiguos</option>
                <option value="PRIORIDAD">Prioridad</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Grid responsivo en desktop para evitar que los elementos que bajan de fila cambien su ancho normal */}
      <div className={cn("grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2.5 w-full", xlColsClass)}>
        {totalItems.map((item) => renderFilterItem(item.id, item.label, item.count, item.icon))}
      </div>
    </div>
  );
};

export default ReportesFilterBarDesktop;
