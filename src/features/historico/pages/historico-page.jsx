import React from 'react';
import { useIsDesktop } from '@/hooks/useMediaQuery';
import { useHistorico } from '../hooks/use-historico';
import { HistoricoDesktop } from '../views/historico-desktop';
import { HistoricoMobile } from '../views/historico-mobile';

/**
 * Controlador responsivo para el historial de reportes del cliente.
 * Elige entre la vista de Escritorio (Grid) y Móvil (Touch) según el dispositivo.
 */
export const HistoricoPage = () => {
  const isDesktop = useIsDesktop();
  const { data: reportes, isLoading, isError, refetch } = useHistorico();

  const commonProps = { reportes, isLoading, isError, refetch };

  return isDesktop ? (
    <HistoricoDesktop {...commonProps} />
  ) : (
    <HistoricoMobile {...commonProps} />
  );
};

export default HistoricoPage;
