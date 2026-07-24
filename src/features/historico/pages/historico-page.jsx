import React, { useState } from 'react';
import { useIsDesktop } from '@/hooks/useMediaQuery';
import { useHistorico } from '../hooks/use-historico';
import { HistoricoDesktop } from '../views/historico-desktop';
import { HistoricoMobile } from '../views/historico-mobile';
import { ReporteDetailModal } from '@/features/common/components/reporte-detail-modal';

/**
 * Controlador responsivo para el historial de reportes del cliente.
 * Administra el filtrado, ordenamiento y paginación local de los tickets del historial.
 */
export const HistoricoPage = () => {
  const isDesktop = useIsDesktop();
  const { data: reportes = [], isLoading, isError, refetch } = useHistorico();
  const [selectedId, setSelectedId] = useState(null);
  const [selectedEstado, setSelectedEstado] = useState('TODOS');
  const [sortBy, setSortBy] = useState('RECIENTES');
  const [currentPage, setCurrentPage] = useState(1);

  const handleSelectReporte = (id) => {
    setSelectedId(id);
  };

  const handleCloseModal = () => {
    setSelectedId(null);
  };

  const handleEstadoChange = (newEstado) => {
    setSelectedEstado(newEstado);
    setCurrentPage(1);
  };

  const handleSortChange = (newSort) => {
    setSortBy(newSort);
    setCurrentPage(1);
  };

  const getSortDate = (r) => {
    const val = r?.updatedAt || r?.createdAt;
    return val ? new Date(val).getTime() : 0;
  };

  const prioridadWeights = { CRITICA: 4, ALTA: 3, MEDIA: 2, BAJA: 1 };

  // 1. Filtrar reportes
  const filtrados = reportes.filter(
    (r) => selectedEstado === 'TODOS' || r.estado === selectedEstado
  );

  // 2. Ordenar reportes según criterio
  const ordenados = [...filtrados].sort((a, b) => {
    // Regla rígida 1: Mostrar siempre las cerradas (CERRADO) al último
    const aClosed = a.estado === 'CERRADO';
    const bClosed = b.estado === 'CERRADO';
    if (aClosed !== bClosed) return aClosed ? 1 : -1;

    // Regla rígida 2: Mostrar siempre las resueltas (RESUELTO) primero de entre las activas
    const aResuelto = a.estado === 'RESUELTO';
    const bResuelto = b.estado === 'RESUELTO';
    if (aResuelto !== bResuelto) return aResuelto ? -1 : 1;

    // Ordenamiento dinámico dentro de los subgrupos
    if (sortBy === 'ANTIGUOS') {
      return getSortDate(a) - getSortDate(b);
    }
    if (sortBy === 'PRIORIDAD') {
      const weightA = prioridadWeights[a.prioridad] || 0;
      const weightB = prioridadWeights[b.prioridad] || 0;
      if (weightA !== weightB) return weightB - weightA;
    }
    // RECIENTES por defecto
    return getSortDate(b) - getSortDate(a);
  });

  // 3. Paginación Local
  const itemsPerPage = 12;
  const totalPages = Math.max(1, Math.ceil(ordenados.length / itemsPerPage));

  // Ajustar página por si el número de elementos se redujo
  const activePage = Math.min(currentPage, totalPages);

  const reportesFiltrados = ordenados.slice(
    (activePage - 1) * itemsPerPage,
    activePage * itemsPerPage
  );

  const commonProps = {
    reportes, // para KPIs
    reportesFiltrados, // paginados para renderizar
    totalFiltered: ordenados.length,
    selectedEstado,
    onChangeEstado: handleEstadoChange,
    sortBy,
    onChangeSort: handleSortChange,
    currentPage: activePage,
    totalPages,
    onChangePage: setCurrentPage,
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
