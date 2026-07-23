import React from 'react';
import { Badge } from '@/components/ui/z_index';
import { ESTADOS_CONFIG } from '../constants/reporte-estados';

/**
 * Badge estilizado para los estados de reportes del cliente.
 */
export const ReporteStatusBadge = ({ estado }) => {
  const config = ESTADOS_CONFIG[estado] || { status: 'pendiente', label: estado || 'Pendiente' };

  return (
    <Badge 
      status={config.status} 
      className="capitalize font-bold tracking-wide text-[10px] px-2 py-0.5 rounded-full border border-white/20 shadow-xs"
    >
      {config.label}
    </Badge>
  );
};

export default ReporteStatusBadge;
