import React from 'react';
import { Icon } from '@/components/ui/z_index';
import { ReporteStatusBadge } from './reporte-status-badge';
import { CATEGORIAS_MAP } from '../constants/reporte-estados';
import { getPersonalAsignado, resolveAssetUrl } from '../utils/reporte-display';
import { formatFechaHora, formatRelativo } from '@/lib/date';
import { cn } from '@/utils/cn';

const getFechaEnvio = (createdAt) => {
  const relativa = formatRelativo(createdAt, 'sin fecha');
  if (relativa === 'ayer') return 'Enviado ayer';
  if (relativa === 'Ayer') return 'Enviado ayer';
  return `Enviado ${relativa}`;
};

const cardToneByEstado = {
  PENDIENTE: 'border-amber-200/80 bg-gradient-to-br from-white/90 via-amber-50/70 to-sky-50/70 shadow-amber-900/5',
  ASIGNADA: 'border-blue-200/80 bg-gradient-to-br from-white/90 via-blue-50/70 to-cyan-50/70 shadow-blue-900/5',
  EN_PROGRESO: 'border-orange-200/80 bg-gradient-to-br from-white/90 via-orange-50/70 to-amber-50/70 shadow-orange-900/5',
  EN_PAUSA: 'border-slate-200/85 bg-gradient-to-br from-white/90 via-slate-50/80 to-amber-50/50 shadow-slate-900/5',
  RESUELTO: 'border-emerald-300/85 bg-gradient-to-br from-white/90 via-emerald-50/80 to-teal-50/70 shadow-emerald-900/5',
  RECHAZADO: 'border-rose-200/85 bg-gradient-to-br from-white/90 via-rose-50/70 to-amber-50/60 shadow-rose-900/5',
  CERRADO: 'border-slate-200/85 bg-gradient-to-br from-white/90 via-emerald-50/45 to-slate-50/80 shadow-slate-900/5',
  CANCELADA: 'border-slate-200/85 bg-gradient-to-br from-white/90 via-slate-100/75 to-slate-50/80 shadow-slate-900/5',
};

export const ReporteCard = ({ reporte, onClick }) => {
  if (!reporte) return null;

  const {
    id,
    titulo,
    descripcion,
    categoria,
    estado,
    createdAt,
    maquina,
    planta,
    area,
    responsables,
  } = reporte;

  const catInfo = CATEGORIAS_MAP[categoria] || { nombre: categoria || 'Solicitud', icon: 'category' };
  const asignados = getPersonalAsignado(responsables);
  const asignado = asignados[0];
  const asignadoFoto = resolveAssetUrl(asignado?.imagen);
  const esResuelto = estado === 'RESUELTO';
  const locationLabel = maquina
    ? [maquina.codigo, maquina.nombre].filter(Boolean).join(' - ')
    : [planta, area].filter(Boolean).join(' · ');
  const fechaRelativa = getFechaEnvio(createdAt);
  const fechaExacta = formatFechaHora(createdAt, 'Fecha no disponible');

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onClick?.();
    }
  };

  return (
    <article
      onClick={onClick}
      tabIndex={0}
      role="button"
      aria-label={`Abrir reporte ${id}: ${titulo || 'sin título'}`}
      onKeyDown={handleKeyDown}
      className={cn(
        'group relative flex min-h-[168px] cursor-pointer select-none flex-col overflow-hidden rounded-2xl border p-4 shadow-[0_12px_30px_rgba(15,23,42,0.08)] outline-none backdrop-blur-xl transition-all duration-200',
        'active:scale-[0.985] md:hover:-translate-y-0.5 md:hover:border-white md:hover:bg-white/92 md:hover:shadow-[0_18px_38px_rgba(15,23,42,0.12)]',
        'focus-visible:ring-2 focus-visible:ring-emerald-500/55 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-50',
        cardToneByEstado[estado] || 'border-slate-200/80 bg-white/88',
        esResuelto && 'ring-2 ring-emerald-300/45 ring-offset-1 ring-offset-emerald-50/40'
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-extrabold text-slate-600">Reporte #{id}</p>
          <p className="mt-0.5 truncate text-[11px] font-semibold text-slate-500">{catInfo.nombre}</p>
        </div>
        <ReporteStatusBadge estado={estado} />
      </div>

      {esResuelto && (
        <p className="mt-3 rounded-lg bg-emerald-100/75 px-3 py-1.5 text-[11px] font-extrabold text-emerald-800">
          Listo para que lo revises
        </p>
      )}

      <div className="mt-3 min-w-0 flex-1">
        <h3 className="line-clamp-2 text-sm font-extrabold leading-snug text-slate-900">
          {titulo || 'Reporte sin título'}
        </h3>
        <p className="mt-1.5 line-clamp-2 text-xs font-medium leading-relaxed text-slate-600">
          {descripcion || 'Sin descripción registrada.'}
        </p>
      </div>

      {locationLabel && (
        <p className="mt-3 flex min-w-0 items-center gap-1.5 text-xs font-semibold text-slate-500">
          <Icon name={maquina ? 'precision_manufacturing' : 'location_on'} size="14px" className="shrink-0 text-slate-400" />
          <span className="truncate">{locationLabel}</span>
        </p>
      )}

      <div className="mt-3 flex items-center justify-between gap-3 border-t border-slate-200/65 pt-3">
        <div className="flex min-w-0 items-center gap-2">
          {asignado ? (
            <>
              {asignadoFoto ? (
                <img
                  src={asignadoFoto}
                  alt=""
                  className="h-6 w-6 shrink-0 rounded-full border border-white object-cover shadow-xs"
                />
              ) : (
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sky-50 text-sky-600">
                  <Icon name="engineering" size="14px" />
                </span>
              )}
              <span className="truncate text-xs font-bold text-slate-700">
                {asignado.nombre || asignado.username}
              </span>
              {asignados.length > 1 && (
                <span className="shrink-0 text-[11px] font-bold text-slate-500">+{asignados.length - 1}</span>
              )}
            </>
          ) : (
            <span className="truncate text-xs font-semibold text-slate-500">
              Asignación pendiente
            </span>
          )}
        </div>
        <time
          dateTime={createdAt || undefined}
          title={fechaExacta}
          className="shrink-0 text-right text-[11px] font-extrabold text-slate-700"
        >
          {fechaRelativa}
        </time>
      </div>
    </article>
  );
};

export default ReporteCard;
