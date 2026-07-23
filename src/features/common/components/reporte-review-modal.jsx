import React, { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { changeReporteStatus } from '../api/reporte-api';
import { Modal, ModalHeader, ModalBody, ModalFooter } from '@/components/ui/modal';
import { Button, Icon } from '@/components/ui/z_index';
import { Input, Label } from '@/components/form/z_index';
import { ImageViewer } from '@/components/ui/image-viewer';
import {
  cleanFinalNote,
  getFinalEvent,
  getFinalImages,
  getPersonalAsignado,
  resolveAssetUrl,
} from '../utils/reporte-display';

const TechnicianLine = ({ asignados }) => {
  const asignado = asignados[0];
  const foto = resolveAssetUrl(asignado?.imagen);

  if (!asignado) {
    return <p className="text-sm font-medium text-slate-600">El reporte no tiene técnico asignado registrado.</p>;
  }

  return (
    <div className="flex min-w-0 items-center gap-3">
      {foto ? (
        <img src={foto} alt="" className="h-10 w-10 shrink-0 rounded-full border border-white object-cover shadow-sm" />
      ) : (
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600">
          <Icon name="engineering" size="19px" />
        </span>
      )}
      <div className="min-w-0">
        <p className="truncate text-sm font-extrabold text-slate-900">{asignado.nombre || asignado.username}</p>
        {asignado.cargo && <p className="truncate text-xs font-semibold text-slate-500">{asignado.cargo}</p>}
      </div>
    </div>
  );
};

const EvidenceGrid = ({ images, onOpen }) => {
  if (!images.length) {
    return <p className="text-sm font-semibold text-slate-500">Sin evidencias adjuntas.</p>;
  }

  return (
    <div className="flex flex-wrap gap-3">
      {images.map((url, index) => (
        <button
          key={`${url}-${index}`}
          type="button"
          onClick={() => onOpen(index)}
          className="h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-slate-100 outline-none ring-1 ring-slate-200 transition-all active:scale-95 sm:h-28 sm:w-28 md:hover:ring-emerald-400 focus-visible:ring-2 focus-visible:ring-emerald-500"
        >
          <img src={url} alt={`Evidencia final ${index + 1}`} className="h-full w-full object-cover" />
        </button>
      ))}
    </div>
  );
};

export const ReporteReviewModal = ({ isOpen, onClose, reporte, onActionSuccess }) => {
  const queryClient = useQueryClient();
  const [showCorrection, setShowCorrection] = useState(false);
  const [motivo, setMotivo] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [visor, setVisor] = useState({ images: [], index: null });

  useEffect(() => {
    if (isOpen) {
      setShowCorrection(false);
      setMotivo('');
      setSubmitted(false);
      setFormError('');
      setIsSubmitting(false);
      setVisor({ images: [], index: null });
    }
  }, [isOpen]);

  if (!isOpen || !reporte) return null;

  const asignados = getPersonalAsignado(reporte.responsables || []);
  const finalEvent = getFinalEvent(reporte.historial || []);
  const finalNote = cleanFinalNote(finalEvent?.nota);
  const finalImages = getFinalImages(reporte);
  const motivoError = submitted && showCorrection && !motivo.trim();

  const invalidateQueries = async (finalState) => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['reportes-activos'] }),
      queryClient.invalidateQueries({ queryKey: ['reportes-historico'] }),
      queryClient.invalidateQueries({ queryKey: ['reporte', reporte.id] }),
      queryClient.invalidateQueries({ queryKey: ['notificaciones'] }),
    ]);
    onActionSuccess?.(finalState);
  };

  const submitDecision = async (estado) => {
    setSubmitted(true);
    setFormError('');

    if (estado === 'RECHAZADO' && !motivo.trim()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('estado', estado);
      formData.append(
        'nota',
        estado === 'RECHAZADO'
          ? motivo.trim()
          : 'Trabajo aprobado y cerrado por el cliente'
      );

      await changeReporteStatus(reporte.id, formData);
      await invalidateQueries(estado);
      onClose?.();
    } catch (err) {
      const msg = err?.response?.data?.error || err?.response?.data?.message || 'No se pudo enviar tu revisión.';
      setFormError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={() => !isSubmitting && onClose?.()} className="w-full max-w-[640px] max-h-[94dvh] sm:max-h-[90vh]">
        <ModalHeader onClose={() => !isSubmitting && onClose?.()} className="px-4 py-4 sm:px-5">
          <div className="min-w-0 pr-9">
            <p className="text-xs font-extrabold text-slate-600">Revisar resultado</p>
            <h2 className="mt-1 line-clamp-2 text-base font-extrabold leading-snug text-slate-900">
              {reporte.titulo || 'Reporte resuelto'}
            </h2>
          </div>
        </ModalHeader>

        <ModalBody className="max-h-[calc(94dvh-152px)] space-y-4 p-4 sm:max-h-[calc(90vh-152px)] sm:p-5">
          <section className="border-b border-slate-200 pb-4">
            <h3 className="text-[11px] font-extrabold uppercase tracking-wide text-slate-500">Trabajo realizado por</h3>
            <div className="mt-2">
              <TechnicianLine asignados={asignados} />
            </div>
          </section>

          <section className="border-b border-slate-200 pb-4">
            <h3 className="text-[11px] font-extrabold uppercase tracking-wide text-slate-500">Solución indicada</h3>
            <p className="mt-2 whitespace-pre-line text-sm font-semibold leading-relaxed text-slate-800">
              {finalNote || 'Sin observaciones'}
            </p>
          </section>

          <section className="border-b border-slate-200 pb-4">
            <h3 className="text-[11px] font-extrabold uppercase tracking-wide text-slate-500">Evidencias finales</h3>
            <div className="mt-2">
              <EvidenceGrid images={finalImages} onOpen={(index) => setVisor({ images: finalImages, index })} />
            </div>
          </section>

          <section>
            <h3 className="text-base font-extrabold text-slate-900">¿El problema quedó solucionado?</h3>
            <p className="mt-1 text-sm font-medium leading-relaxed text-slate-600">
              Puedes aprobar el trabajo para cerrar el reporte o solicitar una corrección.
            </p>

            {showCorrection && (
              <div className="mt-3">
                <Label htmlFor="motivo-correccion" className="text-xs font-extrabold text-slate-800">
                  Motivo de la corrección *
                </Label>
                <Input
                  id="motivo-correccion"
                  multiline
                  value={motivo}
                  onChange={(event) => {
                    setMotivo(event.target.value);
                    setFormError('');
                  }}
                  disabled={isSubmitting}
                  error={motivoError}
                  helperText={motivoError ? 'El motivo es obligatorio para solicitar una corrección.' : ''}
                  placeholder="Describe qué falta o qué debe corregirse..."
                  className="mt-1 min-h-28 bg-white text-sm"
                />
              </div>
            )}

            {formError && (
              <p className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
                {formError}
              </p>
            )}
          </section>
        </ModalBody>

        <ModalFooter className="flex-col-reverse items-stretch gap-2 sm:flex-row sm:items-center sm:justify-between">
          {showCorrection ? (
            <>
              <Button
                type="button"
                variant="ghost"
                disabled={isSubmitting}
                onClick={() => {
                  setShowCorrection(false);
                  setMotivo('');
                  setSubmitted(false);
                  setFormError('');
                }}
                className="min-h-11"
              >
                Volver
              </Button>
              <Button
                type="button"
                variant="ghost"
                icon="report"
                isLoading={isSubmitting}
                onClick={() => submitDecision('RECHAZADO')}
                className="min-h-11 border-red-200 text-red-700 hover:border-red-300 hover:bg-red-50"
              >
                Enviar corrección
              </Button>
            </>
          ) : (
            <>
              <Button
                type="button"
                variant="ghost"
                icon="report"
                disabled={isSubmitting}
                onClick={() => {
                  setShowCorrection(true);
                  setSubmitted(false);
                  setFormError('');
                }}
                className="min-h-11 border-red-200 text-red-700 hover:border-red-300 hover:bg-red-50"
              >
                Solicitar corrección
              </Button>
              <Button
                type="button"
                variant="guardar"
                icon="check_circle"
                isLoading={isSubmitting}
                onClick={() => submitDecision('CERRADO')}
                className="min-h-11"
              >
                Aprobar y cerrar
              </Button>
            </>
          )}
        </ModalFooter>
      </Modal>

      <ImageViewer
        images={visor.images}
        index={visor.index}
        onClose={() => setVisor({ images: [], index: null })}
        onNavigate={(index) => setVisor((prev) => ({ ...prev, index }))}
      />
    </>
  );
};

export default ReporteReviewModal;
