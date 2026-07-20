import React, { useState } from 'react';
import { Icon } from '@/components/ui/z_index';
import { CATEGORIAS_REPORTE } from '../constants';
import { cn } from '@/utils/cn';

/**
 * Card visual por categoría alargada, con imágenes de fondo y espacio completo para que los textos nunca se corten.
 */
const CategoriaCard = ({ categoria, isSelected, onClick }) => {
  const [imageError, setImageError] = useState(false);

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={isSelected}
      className={cn(
        "group relative h-[135px] sm:h-[140px] w-full overflow-hidden rounded-2xl transition-all duration-200 text-left cursor-pointer outline-none select-none flex flex-col justify-between p-3.5",
        "focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-1",
        isSelected
          ? "border-2 border-emerald-500 ring-2 ring-emerald-500/30 shadow-md scale-[1.01]"
          : "border border-white/50 hover:border-slate-300 hover:shadow-xs opacity-90 hover:opacity-100"
      )}
    >
      {/* Fallback de imagen con fondo oscuro e icono de respaldo */}
      <div className="absolute inset-0 bg-slate-900 flex items-center justify-center text-white/20">
        <Icon name={categoria.icon} className="text-4xl opacity-20" />
      </div>

      {/* Imagen de fondo principal */}
      {!imageError && (
        <img
          src={categoria.imagen}
          alt=""
          aria-hidden="true"
          onError={() => setImageError(true)}
          className="absolute inset-0 h-full w-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
        />
      )}

      {/* Degradado oscuro para garantizar legibilidad del texto */}
      <div
        className={cn(
          "absolute inset-0 bg-gradient-to-t from-black/95 via-black/60 to-black/30 transition-opacity duration-300",
          isSelected ? "from-emerald-950/95 via-black/60 to-black/30" : ""
        )}
      />

      {/* Header por encima (relative z-10) */}
      <div className="relative z-10 flex items-start justify-between w-full">
        {/* Superficie Liquid Glass para el Icono */}
        <div
          className={cn(
            "p-2 rounded-xl flex items-center justify-center shrink-0 transition-all duration-200",
            isSelected
              ? "bg-emerald-500 text-white border border-emerald-400 shadow-xs"
              : "bg-black/35 backdrop-blur-xl border border-white/20 text-white"
          )}
        >
          <Icon name={categoria.icon} className="text-sm" />
        </div>

        {/* Checkmark badge de categoría seleccionada */}
        {isSelected && (
          <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-xs border border-white/80 shrink-0">
            <Icon name="check" className="text-xs font-black" />
          </div>
        )}
      </div>

      {/* Nombre y Descripción alargada sin cortes de texto */}
      <div className="relative z-10 flex flex-col gap-0.5 mt-auto">
        <h4 className="text-xs font-extrabold text-white leading-tight tracking-wide drop-shadow-md">
          {categoria.nombre}
        </h4>
        <p className="text-[10.5px] text-white/90 leading-relaxed font-medium line-clamp-3 opacity-95">
          {categoria.descripcion}
        </p>
      </div>
    </button>
  );
};

/**
 * Selector visual de categorías en cuadrícula de 2 en 2 en móvil si el ancho lo permite.
 */
export const CategoriaSelector = ({ value, onChange }) => {
  return (
    <div className="flex flex-col gap-2 w-full">
      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide px-0.5">
        Selecciona la categoría *
      </span>

      {/* Cuadrícula de tarjetas alargadas (2 en 2 en móvil) */}
      <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 w-full">
        {CATEGORIAS_REPORTE.map((cat) => {
          const isSelected = value === cat.id;

          return (
            <CategoriaCard
              key={cat.id}
              categoria={cat}
              isSelected={isSelected}
              onClick={() => onChange(cat.id)}
            />
          );
        })}
      </div>
    </div>
  );
};

export default CategoriaSelector;
