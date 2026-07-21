import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useReporteDetalle } from '../hooks/use-reporte-detalle';
import { ReporteStatusBadge } from '../components/reporte-status-badge';
import { ReporteRevisionModal } from '../components/reporte-revision-modal';
import { Icon, Button, Spinner } from '@/components/ui/z_index';
import { ESTADOS_CONFIG } from '../constants';
import { formatFechaHora } from '@/lib/date';
import { cn } from '@/utils/cn';
import { changeReporteStatus } from '../api/reporte-detalle-api';
import { notify } from '@/components/notification/adaptive-notify';
import { useQueryClient } from '@tanstack/react-query';

// Traductores lógicos
const ROL_LABEL = {
  SUPER_ADMIN: 'Super Admin',
  JEFE_MTTO: 'Jefe Mtto',
  COORDINADOR_MTTO: 'Coordinador',
  TECNICO: 'Técnico',
  CLIENTE_INTERNO: 'Cliente',
};

const PRIORIDAD_COLORS = {
  BAJA: 'bg-blue-50 text-blue-700 border-blue-200',
  MEDIA: 'bg-slate-50 text-slate-700 border-slate-200',
  ALTA: 'bg-orange-50 text-orange-700 border-orange-200',
  CRITICA: 'bg-red-50 text-red-700 border-red-200',
};

// Categorías del sistema para iconos
const CATEGORIAS_MAP = {
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

export const ReporteDetallePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: reporte, isLoading, isError } = useReporteDetalle(id);

  // Modales de revisión
  const [modalRevision, setModalRevision] = useState({ isOpen: false, accion: 'APROBAR' });
  const [canceling, setCanceling] = useState(false);

  const handleBack = () => {
    if (window.history.state && window.history.state.idx > 0) {
      navigate(-1);
    } else {
      navigate('/activos');
    }
  };

  const handleCancelReporte = async () => {
    if (!window.confirm('¿Estás seguro de que deseas cancelar este reporte?')) return;
    setCanceling(true);

    try {
      const formData = new FormData();
      formData.append('estado', 'CANCELADA');
      formData.append('nota', 'Reporte cancelado por el cliente.');

      const response = await changeReporteStatus(id, formData);
      if (response.data) {
        notify.success('Reporte cancelado correctamente.');
        await queryClient.invalidateQueries({ queryKey: ['reportes-activos'] });
        await queryClient.invalidateQueries({ queryKey: ['reportes-historico'] });
        await queryClient.invalidateQueries({ queryKey: ['reporte', id] });
      }
    } catch (err) {
      console.error('[Detalle] Error al cancelar:', err);
      notify.error(err.response?.data?.error || 'Error al cancelar el reporte.');
    } finally {
      setCanceling(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50/50 gap-3">
        <Spinner className="w-10 h-10 text-marca-primario" />
        <p className="text-xs text-slate-500 font-medium">Cargando detalles del reporte...</p>
      </div>
    );
  }

  if (isError || !reporte) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50/50 gap-4 text-center px-6">
        <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center">
          <Icon name="error_outline" className="text-red-500 text-2xl" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-800">No se pudo cargar el reporte</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-xs">
            El reporte puede no existir o no tienes los permisos suficientes.
          </p>
        </div>
        <Button onClick={handleBack} variant="primario" className="px-5 py-2.5 text-xs font-bold shadow">
          Volver a Mis Reportes
        </Button>
      </div>
    );
  }

  const { titulo, descripcion, categoria, estado, prioridad, createdAt, maquina, historial } = reporte;
  const catInfo = CATEGORIAS_MAP[categoria] || {
    nombre: categoria || 'General',
    icon: 'help_outline'
  };

  const esResuelto = estado === 'RESUELTO';
  const esPendiente = estado === 'PENDIENTE';

  return (
    <div className="relative flex h-full flex-col overflow-hidden bg-slate-50/50">
      {/* Header de sección */}
      <header className="shrink-0 w-full z-30 bg-white/70 backdrop-blur-md border-b border-white/20 px-4 py-3 flex items-center gap-4 shadow-[0_2px_10px_rgba(0,0,0,0.01)]">
        <button
          onClick={handleBack}
          className="p-2 rounded-xl bg-white/80 border border-white/30 shadow-sm active:scale-90 transition-all cursor-pointer flex items-center justify-center hover:bg-white"
          aria-label="Regresar"
        >
          <Icon name="arrow_back" className="text-slate-700 text-lg" />
        </button>
        <div className="min-w-0 flex-1">
          <h1 className="text-sm font-bold text-slate-800 truncate">{titulo}</h1>
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider leading-none mt-0.5">
            Reporte #{id}
          </p>
        </div>
        <HardReloadButton />
      </header>

      {/* Cuerpo Detalle */}
      <main className="min-h-0 flex-1 w-full max-w-md md:max-w-3xl lg:max-w-4xl mx-auto px-4 py-5 flex flex-col gap-6 overflow-y-auto overscroll-none">
        
        {/* Alerta de Acción Requerida */}
        {esResuelto && (
          <div className="flex items-start gap-3 p-4 rounded-2xl bg-emerald-50 border border-emerald-200/60 shadow-sm animate-pulse-slow">
            <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800 shrink-0">
              <Icon name="verified" className="text-base" fill={true} />
            </div>
            <div>
              <h4 className="text-xs font-bold text-emerald-900 leading-tight">
                Validación Requerida
              </h4>
              <p className="text-[11px] text-emerald-800/90 leading-relaxed mt-0.5">
                El técnico ha marcado tu reporte como solucionado. Por favor aprueba o rechaza el trabajo.
              </p>
            </div>
          </div>
        )}

        {/* Ficha Principal */}
        <div className="bg-white/70 backdrop-blur-md border border-white/30 rounded-2xl p-5 shadow-[0_8px_30px_rgba(0,0,0,0.02)] flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-slate-100/50 pb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-slate-100 text-slate-600">
                <Icon name={catInfo.icon} className="text-base" />
              </div>
              <span className="text-[10px] font-extrabold text-slate-400 tracking-wider uppercase">
                {catInfo.nombre}
              </span>
            </div>
            <ReporteStatusBadge estado={estado} />
          </div>

          <div className="flex flex-col gap-3">
            <div>
              <span className="text-[10px] text-slate-400 font-semibold tracking-wide uppercase">Título</span>
              <p className="text-sm font-bold text-slate-800 leading-tight mt-0.5">{titulo}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 border-t border-slate-50 pt-3">
              <div>
                <span className="text-[10px] text-slate-400 font-semibold tracking-wide uppercase">Prioridad</span>
                <div className={cn("inline-flex px-2 py-0.5 rounded text-[10px] font-bold border mt-0.5", PRIORIDAD_COLORS[prioridad] || PRIORIDAD_COLORS.MEDIA)}>
                  {prioridad}
                </div>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-semibold tracking-wide uppercase">Reportado</span>
                <p className="text-[11px] font-bold text-slate-600 mt-0.5">{formatFechaHora(createdAt)}</p>
              </div>
            </div>

            {maquina && (
              <div className="border-t border-slate-50 pt-3 flex flex-col gap-1.5">
                <span className="text-[10px] text-slate-400 font-semibold tracking-wide uppercase">Ubicación / Equipo</span>
                <div className="flex items-center gap-2 bg-slate-50 border border-slate-100 p-2.5 rounded-xl text-xs">
                  <Icon name="precision_manufacturing" className="text-slate-600 text-base shrink-0" />
                  <div className="min-w-0">
                    <p className="font-bold text-slate-700 font-mono text-[11px] leading-none">{maquina.codigo}</p>
                    <p className="text-slate-500 font-semibold text-[10px] truncate mt-1">{maquina.nombre}</p>
                    <p className="text-[9px] text-slate-400 font-medium mt-0.5">{maquina.planta} • {maquina.area}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="border-t border-slate-50 pt-3">
              <span className="text-[10px] text-slate-400 font-semibold tracking-wide uppercase">Descripción</span>
              <p className="text-xs text-slate-600 leading-relaxed mt-1 whitespace-pre-line bg-slate-50/50 p-3 rounded-xl border border-slate-100/30">
                {descripcion || 'Sin descripción detallada.'}
              </p>
            </div>
          </div>
        </div>

        {/* Timeline Visual Simple */}
        {historial && historial.length > 0 && (
          <div className="bg-white/70 backdrop-blur-md border border-white/30 rounded-2xl p-5 shadow-[0_8px_30px_rgba(0,0,0,0.02)] flex flex-col gap-4">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100/50 pb-2 flex items-center gap-2">
              <Icon name="history" className="text-slate-500 text-base" />
              Línea de tiempo del reporte
            </h4>
            
            <div className="relative pl-6 flex flex-col gap-5 border-l-2 border-slate-200/60 ml-3.5 my-2">
              {historial.map((event, index) => {
                const config = ESTADOS_CONFIG[event.estadoNuevo] || { status: 'pendiente', label: event.estadoNuevo };
                
                return (
                  <div key={event.id} className="relative flex flex-col gap-1 text-xs">
                    <span className={cn(
                      "absolute -left-[32px] top-1.5 flex h-3.5 w-3.5 rounded-full border-2 border-white shadow-sm justify-center items-center",
                      index === 0 ? "bg-marca-primario scale-110" : "bg-slate-300"
                    )}>
                      {index === 0 && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-marca-primario/30 opacity-75"></span>}
                    </span>

                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] font-bold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200/50 uppercase tracking-tight">
                        {event.tipo === 'CREACION' ? 'Creación' : 'Estado'}
                      </span>
                      {event.estadoNuevo && (
                        <span className="text-[10px] font-bold text-slate-500">
                          {config.label}
                        </span>
                      )}
                    </div>

                    {event.nota && (
                      <p className="text-[11px] text-slate-500 italic bg-slate-50/50 px-2.5 py-1.5 rounded-lg border border-slate-100/50 leading-relaxed">
                        "{event.nota}"
                      </p>
                    )}

                    <div className="flex items-center gap-1 text-[9px] text-slate-400 font-semibold uppercase tracking-wider">
                      <span>{event.usuario?.nombre || 'Sistema'}</span>
                      {event.usuario?.rol && (
                        <>
                          <span>•</span>
                          <span>{ROL_LABEL[event.usuario.rol] || event.usuario.rol}</span>
                        </>
                      )}
                      <span>•</span>
                      <span>{formatFechaHora(event.createdAt)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Botones de Acción de Validación */}
        {esResuelto && (
          <div className="grid grid-cols-2 gap-3 mt-4">
            <button
              onClick={() => setModalRevision({ isOpen: true, accion: 'RECHAZAR' })}
              className="py-3.5 text-xs font-bold text-red-600 bg-white border border-red-200 hover:bg-red-50 active:scale-95 rounded-xl shadow-sm cursor-pointer transition-all uppercase tracking-wider flex items-center justify-center gap-1.5"
            >
              <Icon name="close" className="text-sm" />
              <span>Rechazar</span>
            </button>
            
            <button
              onClick={() => setModalRevision({ isOpen: true, accion: 'APROBAR' })}
              className="py-3.5 text-xs font-bold text-white bg-emerald-500 hover:bg-emerald-600 active:scale-95 rounded-xl shadow-sm cursor-pointer transition-all uppercase tracking-wider flex items-center justify-center gap-1.5"
            >
              <Icon name="check" className="text-sm" />
              <span>Aprobar</span>
            </button>
          </div>
        )}

        {/* Botón de Cancelación */}
        {esPendiente && (
          <div className="mt-4">
            <button
              onClick={handleCancelReporte}
              disabled={canceling}
              className="w-full py-3.5 text-xs font-bold text-slate-500 bg-white border border-slate-200/80 hover:bg-slate-50 active:scale-95 rounded-xl shadow-sm cursor-pointer transition-all uppercase tracking-wider flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              <Icon name="delete_forever" className="text-sm" />
              <span>Cancelar Reporte</span>
            </button>
          </div>
        )}

      </main>

      {/* Modal de Revisión */}
      <ReporteRevisionModal
        isOpen={modalRevision.isOpen}
        onClose={() => setModalRevision({ isOpen: false, accion: 'APROBAR' })}
        reporteId={id}
        accion={modalRevision.accion}
      />
    </div>
  );
};

export default ReporteDetallePage;
