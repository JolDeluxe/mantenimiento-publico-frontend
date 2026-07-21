/**
 * Configuración de estados de reportes para el portal de clientes.
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

export default {
  ESTADOS_CONFIG,
};
