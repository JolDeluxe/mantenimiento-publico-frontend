import React from 'react';
import { cn } from '@/utils/cn';

/**
 * Componente Core para Material Symbols Variable Fonts (Variante Rounded)
 */
export const Icon = ({ 
  name, 
  fill = false, 
  weight = 400, 
  grad = 0, 
  opsz = 24, 
  size = "24px",
  className = "" 
}) => {
  return (
    <span 
      className={cn("material-symbols-rounded", className)}
      style={{
        fontSize: size,
        // Inyectamos los ejes variables directamente al estilo para que el motor de la fuente los procese
        fontVariationSettings: `'FILL' ${fill ? 1 : 0}, 'wght' ${weight}, 'GRAD' ${grad}, 'opsz' ${opsz}`
      }}
    >
      {name}
    </span>
  );
};