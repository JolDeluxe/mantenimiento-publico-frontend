import React, { useState } from 'react';
import { useIsDesktop } from '@/hooks/useMediaQuery';
import { useActivos } from '../hooks/use-activos';
import { ActivosDesktop } from '../views/activos-desktop';
import { ActivosMobile } from '../views/activos-mobile';
import { ReporteDetailModal } from '@/features/common/components/reporte-detail-modal';

/**
 * Controlador responsivo para la bandeja de reportes activos del cliente.
 * Administra el filtrado, ordenamiento y paginación local de los tickets.
 */
export const ActivosPage = () => {
  const isDesktop = useIsDesktop();
  const { data: reportes = [], isLoading, isError, refetch } = useActivos();
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
    // Regla rígida: RESUELTO primero de entre las activas
    const aResuelto = a.estado === 'RESUELTO';
    const bResuelto = b.estado === 'RESUELTO';
    if (aResuelto !== bResuelto) return aResuelto ? -1 : 1;

    // Ordenamiento dinámico
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
