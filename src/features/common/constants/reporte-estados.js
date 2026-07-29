/**
 * Configuración de estados, categorías y utilidades de reportes para el portal público (CLIENTE_INTERNO).
 */
import { CATEGORIAS_REPORTE } from '../../nuevo-reporte/constants';

export const ESTADOS_CONFIG = {
  PENDIENTE: { status: 'pendiente', label: 'Pendiente' },
  ASIGNADA: { status: 'asignada', label: 'Asignada' },
  EN_PROGRESO: { status: 'en-progreso', label: 'En Progreso' },
  EN_PAUSA: { status: 'en-pausa', label: 'En Pausa' },
  RESUELTO: { status: 'resuelto', label: 'Resuelto' },
  CERRADO: { status: 'cerrado', label: 'Cerrado' },
  RECHAZADO: { status: 'rechazado', label: 'Rechazado' },
  CANCELADA: { status: 'cancelada', label: 'Cancelada' },
};

export const ROL_LABEL = {
  SUPER_ADMIN: 'Super Admin',
  JEFE_MTTO: 'Jefe Mtto',
  COORDINADOR_MTTO: 'Coordinador',
  TECNICO: 'Técnico',
  CLIENTE_INTERNO: 'Cliente',
};

export const PRIORIDAD_COLORS = {
  BAJA: 'bg-blue-50 text-blue-700 border-blue-200',
  MEDIA: 'bg-slate-50 text-slate-700 border-slate-200',
  ALTA: 'bg-orange-50 text-orange-700 border-orange-200',
  CRITICA: 'bg-red-50 text-red-700 border-red-200',
};

export const getCategoriaReporteInfo = (categoria) => {
  const exactMatch = CATEGORIAS_REPORTE.find((item) => item.id === categoria);
  const canonicalMatch = CATEGORIAS_REPORTE.find((item) => item.categoria === categoria);
  const match = exactMatch || canonicalMatch;

  return {
    nombre: match?.nombre || categoria || 'Solicitud',
    icon: match?.icon || 'category',
    categoria: match?.categoria || categoria || null,
  };
};

export const CATEGORIAS_MAP = CATEGORIAS_REPORTE.reduce((acc, item) => {
  acc[item.id] = { nombre: item.nombre, icon: item.icon, categoria: item.categoria };
  if (!acc[item.categoria]) {
    acc[item.categoria] = { nombre: item.nombre, icon: item.icon, categoria: item.categoria };
  }
  return acc;
}, {});

/**
 * Determina si un estado corresponde a la vista de Activos o Histórico
 */
export const esEstadoHistorico = (estado) => {
  return estado === 'CERRADO' || estado === 'CANCELADA';
};

export const esEstadoActivo = (estado) => {
  return !esEstadoHistorico(estado);
};
