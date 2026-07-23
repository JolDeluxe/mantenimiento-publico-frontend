/**
 * Configuración de estados, categorías y utilidades de reportes para el portal público (CLIENTE_INTERNO).
 */

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

export const CATEGORIAS_MAP = {
  MAQUINARIA: { nombre: 'Maquinaria', icon: 'precision_manufacturing' },
  INFRAESTRUCTURA: { nombre: 'Infraestructura', icon: 'domain' },
  MOBILIARIO: { nombre: 'Mobiliario', icon: 'chair' },
  ELECTRICO: { nombre: 'Eléctrico e Iluminación', icon: 'electric_bolt' },
  CLIMATIZACION: { nombre: 'Climas y Ventilación', icon: 'hvac' },
  PLOMERIA: { nombre: 'Plomería y Sanitarios', icon: 'water_drop' },
  SEGURIDAD: { nombre: 'Seguridad', icon: 'shield' },
  LIMPIEZA: { nombre: 'Limpieza', icon: 'cleaning_services' },
  SISTEMAS: { nombre: 'Sistemas', icon: 'computer' },
  OTRO: { nombre: 'Otro', icon: 'more_horiz' },
};

/**
 * Determina si un estado corresponde a la vista de Activos o Histórico
 */
export const esEstadoHistorico = (estado) => {
  return estado === 'CERRADO' || estado === 'CANCELADA';
};

export const esEstadoActivo = (estado) => {
  return !esEstadoHistorico(estado);
};
