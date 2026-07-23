import { ENV } from '@/config/env';

export const resolveAssetUrl = (asset) => {
  let url = typeof asset === 'string' ? asset : asset?.url || asset?.imagen || '';
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;

  const cleanUrl = url.replace(/\\/g, '/');
  let prefix = ENV.API_URL || '';
  if (prefix.endsWith('/api')) prefix = prefix.slice(0, -4);
  const sep = cleanUrl.startsWith('/') ? '' : '/';
  return `${prefix}${sep}${cleanUrl}`;
};

export const getTecnicosAsignados = (responsables = []) =>
  responsables
    .map((responsable) => responsable?.usuario || responsable)
    .filter((usuario) => usuario?.rol === 'TECNICO');

export const getPersonalAsignado = (responsables = []) => {
  const visibles = responsables
    .map((responsable) => responsable?.usuario || responsable)
    .filter((usuario) => usuario?.id && usuario?.rol !== 'CLIENTE_INTERNO');
  const tecnicos = visibles.filter((usuario) => usuario?.rol === 'TECNICO');
  return tecnicos.length > 0 ? tecnicos : visibles;
};

export const ESTADO_CLIENTE_COPY = {
  PENDIENTE: {
    label: 'Recibido',
    message: 'Recibimos tu reporte y estamos buscando al técnico adecuado.',
  },
  ASIGNADA: {
    label: 'Técnico asignado',
    message: 'Tu reporte ya fue asignado y será atendido.',
  },
  EN_PROGRESO: {
    label: 'En reparación',
    message: 'El técnico está trabajando en tu reporte.',
  },
  EN_PAUSA: {
    label: 'Atención pausada',
    message: 'La atención se encuentra pausada temporalmente.',
  },
  RESUELTO: {
    label: 'Listo para revisar',
    message: 'El técnico terminó el trabajo. Revisa el resultado para aprobarlo o solicitar una corrección.',
  },
  RECHAZADO: {
    label: 'Corrección solicitada',
    message: 'Solicitaste una nueva revisión del trabajo.',
  },
  CERRADO: {
    label: 'Finalizado',
    message: 'El reporte fue aprobado y está cerrado.',
  },
  CANCELADA: {
    label: 'Cancelado',
    message: 'Este reporte fue cancelado.',
  },
};

export const getEstadoClienteCopy = (estado) =>
  ESTADO_CLIENTE_COPY[estado] || {
    label: estado || 'En seguimiento',
    message: 'Estamos dando seguimiento a tu reporte.',
  };

export const cleanFinalNote = (note = '') =>
  String(note || '')
    .replace(/\|\|\[META:[^\]]+\]\|\|/g, '')
    .replace(/\[TIEMPO_MANUAL:(.+?)\]/g, '')
    .replace(/\[ENTREGA_ATRASADA_MANUAL\]/g, '')
    .replace(/\[RUTINA\]/g, '')
    .replace(/\(Cierre automático por Inspección\)/gi, '')
    .replace(/^Cambio de estado:\s*[A-Z_]+\s*→\s*[A-Z_]+:?\s*/i, '')
    .trim();

export const getFinalEvent = (historial = []) => {
  const eventosFinales = historial.filter((evento) =>
    evento?.tipo === 'CAMBIO_ESTADO' &&
    ['RESUELTO', 'CERRADO'].includes(evento.estadoNuevo)
  );

  return eventosFinales.find((evento) => evento.estadoNuevo === 'RESUELTO') ||
    eventosFinales.find((evento) => evento.estadoNuevo === 'CERRADO') ||
    null;
};

export const getFinalNote = (reporte) => cleanFinalNote(getFinalEvent(reporte?.historial)?.nota);

export const getFinalImages = (reporte) => {
  const finalEvent = getFinalEvent(reporte?.historial || []);
  const eventImages = finalEvent?.imagenes || [];

  const rawImages = eventImages.length > 0
    ? eventImages
    : (reporte?.imagenes || []).filter((img) =>
        ['EVIDENCIA_SOLUCION', 'EVIDENCIA_CIERRE'].includes(img?.tipo)
      );

  return rawImages.map(resolveAssetUrl).filter(Boolean);
};

export const getInitialImages = (reporte) => {
  const rawImages = (reporte?.imagenes || []).filter((img) =>
    ['EVIDENCIA_INICIAL', 'EVIDENCIA_ACTUALIZACION'].includes(img?.tipo) || !img?.tipo
  );

  return rawImages.map(resolveAssetUrl).filter(Boolean);
};
