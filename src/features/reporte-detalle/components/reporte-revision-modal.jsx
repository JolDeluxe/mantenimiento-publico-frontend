import React, { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { changeReporteStatus } from '../api/reporte-detalle-api';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Icon } from '@/components/ui/z_index';
import { Input, Label } from '@/components/form/z_index';
import { notify } from '@/components/notification/adaptive-notify';

/**
 * Modal de revisión para que el cliente pueda Aprobar (Cerrar) o Rechazar un reporte resuelto.
 */
export const ReporteRevisionModal = ({ isOpen, onClose, reporteId, accion }) => {
  const queryClient = useQueryClient();
  const [comentario, setComentario] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const esRechazo = accion === 'RECHAZAR';
  const nuevoEstado = esRechazo ? 'RECHAZADO' : 'CERRADO';

  const handleConfirm = async (e) => {
    e.preventDefault();
    setSubmitted(true);

    if (esRechazo && !comentario.trim()) {
      notify.error('Debes ingresar un comentario detallando el motivo del rechazo.');
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('estado', nuevoEstado);
      formData.append('nota', comentario.trim() || (esRechazo ? 'Falla rechazada por cliente' : 'Falla aprobada y cerrada por cliente'));

      const response = await changeReporteStatus(reporteId, formData);
      if (response.data) {
        notify.success(esRechazo ? 'Reporte rechazado correctamente.' : 'Reporte cerrado correctamente.');
        
        // Invalidar queries
        await queryClient.invalidateQueries({ queryKey: ['reportes-activos'] });
        await queryClient.invalidateQueries({ queryKey: ['reportes-historico'] });
        await queryClient.invalidateQueries({ queryKey: ['reporte', reporteId] });

        setComentario('');
        setSubmitted(false);
        onClose();
      }
    } catch (err) {
      console.error('[Revisión] Error al cambiar estado:', err);
      notify.error(err.response?.data?.error || 'Error al procesar la revisión.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-md w-full rounded-2xl">
      <ModalHeader className="border-b border-slate-100/80 pb-3 flex items-center gap-2">
        <div className={`p-1.5 rounded-lg shrink-0 ${esRechazo ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>
          <Icon name={esRechazo ? 'cancel' : 'check_circle'} className="text-base" fill={true} />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-800">
            {esRechazo ? 'Rechazar Trabajo Realizado' : 'Confirmar Aprobación'}
          </h3>
          <p className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase leading-none mt-0.5">
            Paso de Validación
          </p>
        </div>
      </ModalHeader>

      <form onSubmit={handleConfirm} noValidate>
        <ModalBody className="py-4 flex flex-col gap-4 text-slate-700">
          <p className="text-xs leading-relaxed text-slate-500">
            {esRechazo
              ? 'Indica detalladamente al técnico por qué no estás satisfecho con el trabajo. Esto ayudará a resolver la falla de forma definitiva.'
              : 'Al aprobar, confirmas que el desperfecto ha quedado solucionado y el reporte se cerrará de forma permanente.'}
          </p>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="comentario" className="text-xs font-bold text-slate-500 uppercase tracking-wide">
              {esRechazo ? 'Comentarios del rechazo *' : 'Notas opcionales'}
            </Label>
            <Input
              id="comentario"
              name="comentario"
              multiline={true}
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
              placeholder={esRechazo ? 'Explica qué falta o qué sigue fallando...' : 'Escribe algún comentario o agradecimiento (opcional)...'}
              error={submitted && esRechazo && !comentario.trim()}
              helperText={submitted && esRechazo && !comentario.trim() ? 'El comentario es requerido para rechazar.' : ''}
              className="min-h-24"
            />
          </div>
        </ModalBody>

        <ModalFooter className="border-t border-slate-100/80 pt-3 flex items-center justify-end gap-3">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={isSubmitting}
            className="text-xs border-none hover:bg-slate-100"
          >
            Cancelar
          </Button>

          <Button
            type="submit"
            variant={esRechazo ? 'secundario' : 'primario'}
            isLoading={isSubmitting}
            className={`px-4 py-2 text-xs font-bold text-white rounded-xl shadow-sm ${esRechazo ? 'bg-red-500 hover:bg-red-600' : 'bg-emerald-500 hover:bg-emerald-600'}`}
          >
            {esRechazo ? 'Confirmar Rechazo' : 'Aprobar y Cerrar'}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
};

export default ReporteRevisionModal;
