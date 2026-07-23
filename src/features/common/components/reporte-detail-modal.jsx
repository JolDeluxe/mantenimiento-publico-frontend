import React, { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Modal, ModalHeader, ModalBody, ModalFooter } from '@/components/ui/modal';
import { Button, Icon, Spinner } from '@/components/ui/z_index';
import { ImageViewer } from '@/components/ui/image-viewer';
import { useReporteDetail } from '../hooks/use-reporte-detail';
import { changeReporteStatus } from '../api/reporte-api';
import {
  cleanFinalNote,
  getEstadoClienteCopy,
  getFinalEvent,
  getFinalImages,
  getInitialImages,
  getPersonalAsignado,
  resolveAssetUrl,
} from '../utils/reporte-display';
import { ReporteStatusBadge } from './reporte-status-badge';
import { ReporteReviewModal } from './reporte-review-modal';
import { formatFechaHora, formatFechaNumerica, formatRelativo } from '@/lib/date';

const getFechaEnvio = (createdAt) => {
  const relativa = formatRelativo(createdAt, 'sin fecha');
  if (relativa === 'ayer' || relativa === 'Ayer') return 'Enviado ayer';
  return `Enviado ${relativa}`;
};

const CANCELABLE_ESTADOS = ['PENDIENTE', 'ASIGNADA', 'EN_PROGRESO', 'EN_PAUSA', 'RECHAZADO'];

const getErrorCopy = (error) => {
  const status = error?.response?.status;
  if (status === 403) return 'No tienes permisos para ver este reporte.';
  if (status === 404) return 'El reporte solicitado no existe o ya no está disponible.';
  return 'No pudimos cargar el detalle. Revisa tu conexión e intenta de nuevo.';
};

const TechnicianBlock = ({ asignados, estado }) => {
  const asignado = asignados[0];
  const foto = resolveAssetUrl(asignado?.imagen);

  if (!asignado) {
    return (
      <p className="text-sm font-medium leading-relaxed text-slate-600">
        Estamos asignando un técnico a tu reporte.
      </p>
    );
  }

  return (
    <div className="flex min-w-0 items-center gap-3">
      {foto ? (
        <img src={foto} alt="" className="h-11 w-11 shrink-0 rounded-full border border-white object-cover shadow-sm" />
      ) : (
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600">
          <Icon name="engineering" size="20px" />
        </span>
      )}
      <div className="min-w-0">
        <p className="truncate text-sm font-extrabold text-slate-900">{asignado.nombre || asignado.username}</p>
        {asignado.cargo && <p className="truncate text-xs font-semibold text-slate-500">{asignado.cargo}</p>}
        <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-[11px] font-semibold text-slate-600">
          {asignado.telefono && (
            <a href={`tel:${asignado.telefono}`} className="inline-flex items-center gap-1 text-sky-700 hover:text-sky-800">
              <Icon name="call" size="13px" />
              {asignado.telefono}
            </a>
          )}
          {asignado.email && (
            <a href={`mailto:${asignado.email}`} className="inline-flex min-w-0 items-center gap-1 text-sky-700 hover:text-sky-800">
              <Icon name="mail" size="13px" />
              <span className="truncate">{asignado.email}</span>
            </a>
          )}
        </div>
        {asignados.length > 1 && (
          <p className="mt-0.5 text-[11px] font-semibold text-slate-500">
            También participa {asignados.length - 1} persona{asignados.length > 2 ? 's' : ''} más.
          </p>
        )}
        {estado === 'RESUELTO' && (
          <p className="mt-1 text-xs font-bold text-emerald-700">Terminó el trabajo y espera tu revisión.</p>
        )}
      </div>
    </div>
  );
};

const EvidenceGrid = ({ images, onOpen }) => {
  if (!images.length) {
    return <p className="text-xs font-medium text-slate-500">Sin evidencias adjuntas.</p>;
  }

  return (
    <div className="grid grid-cols-4 gap-2 sm:grid-cols-5">
      {images.map((url, index) => (
        <button
          key={`${url}-${index}`}
          type="button"
          onClick={() => onOpen(index)}
          className="aspect-square overflow-hidden rounded-lg bg-slate-100 outline-none ring-1 ring-slate-200 transition-all active:scale-95 md:hover:ring-emerald-400 focus-visible:ring-2 focus-visible:ring-emerald-500"
        >
          <img src={url} alt={`Imagen del reporte ${index + 1}`} className="h-full w-full object-cover" />
        </button>
      ))}
    </div>
  );
};

export const ReporteDetailModal = ({ isOpen, onClose, reporteId, onActionSuccess }) => {
  const queryClient = useQueryClient();
  const [reviewOpen, setReviewOpen] = useState(false);
  const [cancelSubmitting, setCancelSubmitting] = useState(false);
  const [cancelConfirmOpen, setCancelConfirmOpen] = useState(false);
  const [cancelError, setCancelError] = useState('');
  const [visor, setVisor] = useState({ images: [], index: null });
  const { data: reporte, isLoading, isError, error, refetch } = useReporteDetail(reporteId);

  useEffect(() => {
    if (!isOpen) {
      setReviewOpen(false);
      setCancelSubmitting(false);
      setCancelConfirmOpen(false);
      setCancelError('');
      setVisor({ images: [], index: null });
    }
  }, [isOpen]);

  const invalidateReportes = async (finalState) => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['reportes-activos'] }),
      queryClient.invalidateQueries({ queryKey: ['reportes-historico'] }),
      queryClient.invalidateQueries({ queryKey: ['reporte', reporteId] }),
      queryClient.invalidateQueries({ queryKey: ['notificaciones'] }),
    ]);
    onActionSuccess?.(finalState);
  };

  const handleCancel = async () => {
    if (!reporte?.id || cancelSubmitting) return;

    setCancelError('');
    setCancelSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('estado', 'CANCELADA');
      formData.append('nota', 'Reporte cancelado por el cliente');
      await changeReporteStatus(reporte.id, formData);
      await invalidateReportes('CANCELADA');
      onClose?.('CANCELADA');
    } catch (err) {
      const msg = err?.response?.data?.error || err?.response?.data?.message || 'No se pudo cancelar el reporte.';
      setCancelError(msg);
    } finally {
      setCancelSubmitting(false);
    }
  };

  const handleReviewSuccess = async (finalState) => {
    setReviewOpen(false);
    await invalidateReportes(finalState);
    onClose?.(finalState);
  };

  const asignados = getPersonalAsignado(reporte?.responsables || []);
  const estadoCopy = getEstadoClienteCopy(reporte?.estado);
  const finalEvent = getFinalEvent(reporte?.historial || []);
  const finalNote = cleanFinalNote(finalEvent?.nota);
  const initialImages = getInitialImages(reporte);
  const finalImages = getFinalImages(reporte);
  const locationLabel = reporte?.maquina
    ? [reporte.maquina.codigo, reporte.maquina.nombre].filter(Boolean).join(' - ')
    : [reporte?.planta, reporte?.area].filter(Boolean).join(' · ');
  const showResultado = ['RESUELTO', 'CERRADO'].includes(reporte?.estado);
  const puedeRevisar = reporte?.estado === 'RESUELTO';
  const puedeCancelar = CANCELABLE_ESTADOS.includes(reporte?.estado);

  return (
    <>
      <Modal isOpen={isOpen} onClose={() => !cancelSubmitting && onClose?.()} className="w-full max-w-[720px] max-h-[94dvh] sm:max-h-[90vh]">
        <ModalHeader onClose={() => !cancelSubmitting && onClose?.()} className="px-4 py-4 sm:px-5">
          <div className="min-w-0 pr-9">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-extrabold text-slate-600">Reporte #{reporte?.id || reporteId}</span>
              {reporte?.estado && <ReporteStatusBadge estado={reporte.estado} />}
            </div>
            <h2 className="mt-1 line-clamp-2 text-base font-extrabold leading-snug text-slate-900">
              {reporte?.titulo || (isLoading ? 'Cargando reporte...' : 'Detalle del reporte')}
            </h2>
          </div>
        </ModalHeader>

        <ModalBody className="max-h-[calc(94dvh-86px)] p-4 sm:max-h-[calc(90vh-86px)] sm:p-5">
          {isLoading && (
            <div className="flex min-h-[260px] flex-col items-center justify-center gap-3 text-slate-500">
              <Spinner size="lg" />
              <p className="text-xs font-bold">Cargando detalle</p>
            </div>
          )}

          {isError && !isLoading && (
            <div className="flex min-h-[260px] flex-col items-center justify-center gap-3 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600">
                <Icon name="error_outline" size="26px" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-slate-900">No se pudo abrir el reporte</h3>
                <p className="mt-1 max-w-sm text-xs font-medium text-slate-500">{getErrorCopy(error)}</p>
              </div>
              <Button variant="ghost" size="sm" icon="refresh" onClick={refetch}>Reintentar</Button>
            </div>
          )}

          {reporte && !isLoading && !isError && (
            <div className="space-y-5">
              <section>
                <h3 className="text-[11px] font-extrabold uppercase tracking-wide text-slate-500">Tu reporte</h3>
                <p className="mt-2 whitespace-pre-line text-sm font-medium leading-relaxed text-slate-700">
                  {reporte.descripcion || 'Sin descripción registrada.'}
                </p>
                <div className="mt-3 space-y-1.5 text-xs font-semibold text-slate-600">
                  {locationLabel && (
                    <p className="flex items-center gap-1.5">
                      <Icon name={reporte.maquina ? 'precision_manufacturing' : 'location_on'} size="14px" className="text-slate-400" />
                      <span>{locationLabel}</span>
                    </p>
                  )}
                  <p className="flex items-center gap-1.5">
                    <Icon name="schedule" size="14px" className="text-slate-400" />
                    <time dateTime={reporte.createdAt} title={formatFechaHora(reporte.createdAt, 'Fecha no disponible')}>
                      {formatFechaNumerica(reporte.createdAt, 'Fecha no disponible')}
                    </time>
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-500">
                      {getFechaEnvio(reporte.createdAt)}
                    </span>
                  </p>
                </div>
                {initialImages.length > 0 && (
                  <div className="mt-4">
                    <p className="mb-2 text-[11px] font-extrabold uppercase tracking-wide text-slate-500">
                      Imágenes que enviaste
                    </p>
                    <EvidenceGrid images={initialImages} onOpen={(index) => setVisor({ images: initialImages, index })} />
                  </div>
                )}
              </section>

              <section className="border-t border-slate-200 pt-4">
                <h3 className="text-[11px] font-extrabold uppercase tracking-wide text-slate-500">Estado de la atención</h3>
                <div className="mt-2">
                  <p className="text-sm font-extrabold text-slate-900">{estadoCopy.label}</p>
                  <p className="mt-1 text-sm font-medium leading-relaxed text-slate-600">{estadoCopy.message}</p>
                </div>
                <div className="mt-4">
                  <TechnicianBlock asignados={asignados} estado={reporte.estado} />
                </div>
              </section>

              {showResultado && (
                <section className="border-t border-slate-200 pt-4">
                  <h3 className="text-[11px] font-extrabold uppercase tracking-wide text-slate-500">Resultado del servicio</h3>
                  <p className="mt-2 whitespace-pre-line text-sm font-semibold leading-relaxed text-slate-800">
                    {finalNote || 'El técnico no adjuntó una descripción adicional.'}
                  </p>
                  <div className="mt-3">
                    <EvidenceGrid images={finalImages} onOpen={(index) => setVisor({ images: finalImages, index })} />
                  </div>
                </section>
              )}

              {puedeCancelar && (
                <section className="border-t border-slate-200 pt-4">
                  {cancelConfirmOpen ? (
                    <div className="rounded-xl border border-red-200 bg-red-50 p-3">
                      <p className="text-sm font-extrabold text-red-800">¿Cancelar este reporte?</p>
                      <p className="mt-1 text-xs font-semibold leading-relaxed text-red-700">
                        Esta acción detendrá su atención y no podrá revertirse desde el portal.
                      </p>
                      {cancelError && (
                        <p className="mt-2 rounded-lg border border-red-200 bg-white px-3 py-2 text-xs font-semibold text-red-700">
                          {cancelError}
                        </p>
                      )}
                      <div className="mt-3 flex flex-col-reverse gap-2 sm:flex-row sm:items-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={cancelSubmitting}
                          onClick={() => {
                            setCancelConfirmOpen(false);
                            setCancelError('');
                          }}
                        >
                          Volver
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          icon="block"
                          isLoading={cancelSubmitting}
                          onClick={handleCancel}
                          className="border-red-200 bg-white text-red-700 hover:border-red-300 hover:bg-red-50"
                        >
                          Confirmar cancelación
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      icon="block"
                      disabled={cancelSubmitting}
                      onClick={() => {
                        setCancelConfirmOpen(true);
                        setCancelError('');
                      }}
                      className="border-red-200 bg-white text-red-700 hover:border-red-300 hover:bg-red-50"
                    >
                      Cancelar reporte
                    </Button>
                  )}
                </section>
              )}
            </div>
          )}
        </ModalBody>

        {puedeRevisar && (
          <ModalFooter className="items-stretch sm:items-center">
            <Button variant="guardar" icon="fact_check" onClick={() => setReviewOpen(true)} disabled={cancelSubmitting} className="w-full sm:w-auto">
              Revisar resultado
            </Button>
          </ModalFooter>
        )}
      </Modal>

      <ReporteReviewModal
        isOpen={reviewOpen}
        onClose={() => setReviewOpen(false)}
        reporte={reporte}
        onActionSuccess={handleReviewSuccess}
      />

      <ImageViewer
        images={visor.images}
        index={visor.index}
        onClose={() => setVisor({ images: [], index: null })}
        onNavigate={(index) => setVisor((prev) => ({ ...prev, index }))}
      />
    </>
  );
};

export default ReporteDetailModal;
