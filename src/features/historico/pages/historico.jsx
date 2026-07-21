import React from 'react';
import MisReportesPage from '@/features/reportes/pages/mis-reportes-page';

/**
 * Página del módulo del historial de reportes finalizados del cliente.
 * Mapea a la ruta /historico.
 */
export const HistoricoPage = () => {
  return <MisReportesPage vista="historico" />;
};

export default HistoricoPage;
