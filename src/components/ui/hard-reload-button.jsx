import React, { useState } from 'react';
import { Icon } from '@/components/ui/icon';
import { cn } from '@/utils/cn';
import { hardReload } from '@/utils/hard-reload';

export const HardReloadButton = ({ className }) => {
  const [isReloading, setIsReloading] = useState(false);

  const handleReload = async () => {
    setIsReloading(true);
    await hardReload();
    // No reseteamos a false porque la página se recargará
  };

  return (
    <button
      onClick={handleReload}
      disabled={isReloading}
      title="Forzar actualización"
      className={cn(
        "p-2 rounded-xl bg-gradient-to-tr from-slate-100 to-white border border-slate-200 shadow-sm",
        "hover:shadow-md hover:border-slate-300 active:scale-95 transition-all outline-none",
        "flex items-center justify-center disabled:opacity-70",
        className
      )}
    >
      <Icon 
        name="refresh" 
        size="20px" 
        className={cn(
          "text-marca-primario transition-transform", 
          isReloading && "animate-spin text-marca-secundario"
        )} 
      />
    </button>
  );
};
