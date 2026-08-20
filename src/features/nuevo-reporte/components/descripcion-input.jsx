import React, { useId } from 'react';
import { Label, Input } from '@/components/form/z_index';
import { MIN_CARACTERES_DESCRIPCION, MAX_CARACTERES_DESCRIPCION, MAX_CARACTERES_OTRO } from '../constants';
import { cn } from '@/utils/cn';

export const DescripcionInput = ({ value, onChange, error, className, submitted, incidente }) => {
  const inputId = useId();
  const descId = useId();
  
  const isOtro = incidente?.id === 'OTRO';
  const maxChars = isOtro ? MAX_CARACTERES_OTRO : MAX_CARACTERES_DESCRIPCION;
  
  const numChars = value ? value.length : 0;
  const trimmedChars = value ? value.trim().length : 0;
  
  const isTooShort = trimmedChars > 0 && trimmedChars < MIN_CARACTERES_DESCRIPCION;
  
  const showError = error || (submitted && (isTooShort || trimmedChars === 0));
  
  let helperMsg = null;

  if ((error || submitted) && trimmedChars === 0) {
    helperMsg = 'La descripción es obligatoria.';
  } else if (isTooShort) {
    helperMsg = `Escribe al menos ${MIN_CARACTERES_DESCRIPCION} letras.`;
  }

  let counterColor = "text-black";
  if (trimmedChars < MIN_CARACTERES_DESCRIPCION) {
    counterColor = "text-red-500 font-bold";
  }

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <div className="flex justify-between items-end px-0.5">
        <Label htmlFor={inputId} className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          Descripción detallada del problema *
        </Label>
        <span className={cn(
          "text-[10px] transition-colors",
          counterColor
        )}>
          {numChars}/{maxChars}
        </span>
      </div>
      
      <p className="text-[10px] text-slate-500 mb-0.5 px-0.5">
        Describe qué ocurrió, dónde se encuentra la falla y cómo afecta el uso del equipo o del área.
      </p>

      <Input
        id={inputId}
        name="descripcion"
        multiline={true}
        value={value}
        onChange={(e) => {
          if (e.target.value.length <= maxChars) {
            onChange(e.target.value);
          }
        }}
        maxLength={maxChars}
        placeholder="Ej. La lámpara ubicada sobre la mesa de corte parpadea y deja de iluminar..."
        error={showError}
        aria-describedby={descId}
        className="min-h-[100px] bg-white border-slate-200 focus:bg-white rounded-xl p-3 text-xs placeholder:text-slate-400"
      />
      
      {helperMsg && (
        <span id={descId} className="text-[10px] px-1 mt-0.5 text-red-500 font-bold">
          {helperMsg}
        </span>
      )}
    </div>
  );
};
