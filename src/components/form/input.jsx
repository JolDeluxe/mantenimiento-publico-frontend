import React from 'react';
import { Icon } from '@/components/ui/icon';
import { cn } from '@/utils/cn';

export const Input = ({ 
  label, 
  iconName, 
  error, 
  submitted, 
  className, 
  ...props 
}) => {
  // El error solo se muestra visualmente si el usuario ya intentó enviar el formulario
  const showError = submitted && error;

  return (
    <div className="flex flex-col w-full">
      {label && (
        <label className="flex text-sm font-bold text-slate-700 mb-1 items-center gap-2">
          {iconName && <Icon name={iconName} size="18px" weight={600} />}
          {label}
        </label>
      )}
      
      <input
        {...props}
        className={cn(
          "w-full px-4 py-2.5 border rounded-md outline-none transition-all duration-200",
          showError 
            ? "border-red-500 bg-red-50 focus:ring-2 focus:ring-red-200" 
            : "border-slate-300 focus:ring-2 focus:ring-marca-primario/20 focus:border-marca-primario",
          className
        )}
      />

      {showError && (
        <p className="text-red-600 text-xs mt-1.5 font-medium flex items-center gap-1 animate-in fade-in slide-in-from-top-1 duration-200">
          <Icon name="error" size="14px" fill={true} />
          {error}
        </p>
      )}
    </div>
  );
};