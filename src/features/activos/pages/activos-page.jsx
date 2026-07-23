import React, { useState } from 'react';
import { useIsDesktop } from '@/hooks/useMediaQuery';
import { useActivos } from '../hooks/use-activos';
import { ActivosDesktop } from '../views/activos-desktop';
import { ActivosMobile } from '../views/activos-mobile';
import { ReporteDetailModal } from '@/features/common/components/reporte-detail-modal';

/**
 * Controlador responsivo para la bandeja de reportes activos del cliente.
 * Elige entre la vista de Escritorio (Grid) y Móvil (Touch + FAB) según el dispositivo.
 */
export const ActivosPage = () => {
  const isDesktop = useIsDesktop();
  const { data: reportes, isLoading, isError, refetch } = useActivos();
  const [selectedId, setSelectedId] = useState(null);

  const handleSelectReporte = (id) => {
    setSelectedId(id);
  };

  const handleCloseModal = () => {
    setSelectedId(null);
  };

  const commonProps = {
    reportes,
    isLoading,
    isError,
    refetch,
    onSelectReporte: handleSelectReporte
  };

  return (
    <>
      {isDesktop ? (
        <ActivosDesktop {...commonProps} />
      ) : (
        <ActivosMobile {...commonProps} />
      )}

      <ReporteDetailModal
        isOpen={!!selectedId}
        onClose={handleCloseModal}
        reporteId={selectedId}
        onActionSuccess={() => {
          handleCloseModal();
          refetch();
        }}
      />
    </>
  );
};

export default ActivosPage;
