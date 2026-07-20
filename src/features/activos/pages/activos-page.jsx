import React from 'react';
import { useIsDesktop } from '@/hooks/useMediaQuery';
import { useActivos } from '../hooks/use-activos';
import { ActivosDesktop } from '../views/activos-desktop';
import { ActivosMobile } from '../views/activos-mobile';

/**
 * Controlador responsivo para la bandeja de reportes activos del cliente.
 * Elige entre la vista de Escritorio (Grid) y Móvil (Touch + FAB) según el dispositivo.
 */
export const ActivosPage = () => {
  const isDesktop = useIsDesktop();
  const { data: reportes, isLoading, isError, refetch } = useActivos();

  const commonProps = { reportes, isLoading, isError, refetch };

  return isDesktop ? (
    <ActivosDesktop {...commonProps} />
  ) : (
    <ActivosMobile {...commonProps} />
  );
};

export default ActivosPage;
