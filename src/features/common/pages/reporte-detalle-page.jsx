import React from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ReporteDetailModal } from '../components/reporte-detail-modal';
import { esEstadoHistorico } from '../constants/reporte-estados';

/**
 * Página puente ligera para la ruta /reportes/:id.
 * Reutiliza ReporteDetailModal de features/common sin incluir timeline.
 * Soporta entrada directa, recarga del navegador, enlaces guardados y navegación limpia.
 */
export const ReporteDetallePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const handleClose = (finalState) => {
    if (location.state?.from) {
      navigate(-1);
    } else if (finalState && esEstadoHistorico(finalState)) {
      navigate('/historico', { replace: true });
    } else {
      navigate('/activos', { replace: true });
    }
  };

  return (
    <div className="w-full min-h-screen bg-slate-50/50 flex flex-col items-center justify-center p-4">
      <ReporteDetailModal
        isOpen={true}
        onClose={() => handleClose()}
        reporteId={id}
        onActionSuccess={(finalState) => handleClose(finalState)}
      />
    </div>
  );
};

export default ReporteDetallePage;
