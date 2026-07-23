import React, { useState } from 'react';
import { useIsDesktop } from '@/hooks/useMediaQuery';
import { useHistorico } from '../hooks/use-historico';
import { HistoricoDesktop } from '../views/historico-desktop';
import { HistoricoMobile } from '../views/historico-mobile';
import { ReporteDetailModal } from '@/features/common/components/reporte-detail-modal';

/**
 * Controlador responsivo para el historial de reportes del cliente.
 * Elige entre la vista de Escritorio (Grid) y Móvil (Touch) según el dispositivo.
 */
export const HistoricoPage = () => {
  const isDesktop = useIsDesktop();
  const { data: reportes, isLoading, isError, refetch } = useHistorico();
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
        <HistoricoDesktop {...commonProps} />
      ) : (
        <HistoricoMobile {...commonProps} />
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

export default HistoricoPage;
