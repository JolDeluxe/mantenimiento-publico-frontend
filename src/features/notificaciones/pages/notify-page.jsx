import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useIsDesktop } from '@/hooks/useMediaQuery';
import { useAuthStore } from '@/stores/auth-store';
import { useNotifyStore } from '@/stores/notify-store';
import { useSyncStore } from '@/stores/sync-store';
import { useNotify } from '../hooks/use-notify';
import { NotifyDesktop } from '../views/notify-desktop';
import { NotifyMobile } from '../views/notify-mobile';
import { ReporteDetailModal } from '@/features/common/components/reporte-detail-modal';

const LIMIT = 20;

export default function NotifyPage() {
    const isDesktop = useIsDesktop();
    const [searchParams, setSearchParams] = useSearchParams();

    const { user } = useAuthStore();
    const currentUser = user?.data ?? user;
    const setNoLeidas = useNotifyStore((state) => state.setNoLeidas);
    const resetNotifyStore = useNotifyStore((state) => state.reset);
    const decrementNotifyStore = useNotifyStore((state) => state.decrement);

    const lastUpdate = useSyncStore((state) => state.lastUpdate);
    const prevUpdate = useRef(lastUpdate);

    const {
        notificaciones, loading, loadingMore, submitting, meta,
        fetchNotificaciones, markRead, markAllRead,
    } = useNotify();

    const [soloNoLeidas, setSoloNoLeidas] = useState(false);
    const [filtroTipo, setFiltroTipo] = useState('');
    const [page, setPage] = useState(1);

    const [activeTicketId, setActiveTicketId] = useState(null);
    const [detailOpen, setDetailOpen] = useState(false);

    // INTERCEPTOR DE REFRESH FORZADO
    useEffect(() => {
        if (searchParams.has('refresh')) {
            const params = { page: 1, limit: LIMIT };
            if (soloNoLeidas) params.soloNoLeidas = true;
            if (filtroTipo) params.tipo = filtroTipo;

            fetchNotificaciones(params, false, true);
            // eslint-disable-next-line react-hooks/set-state-in-effect -- Sincronización reactiva con parámetro de URL 'refresh'
            setPage(1);

            const newParams = new URLSearchParams(searchParams);
            newParams.delete('refresh');
            setSearchParams(newParams, { replace: true });
        }
    }, [searchParams, setSearchParams, soloNoLeidas, filtroTipo, fetchNotificaciones]);

    // INTERCEPTOR DE DEEP LINK (Push Notifications ?ticketId=:id)
    useEffect(() => {
        const ticketId = searchParams.get('ticketId');

        if (ticketId && !isNaN(Number(ticketId))) {
            const parsedId = Number(ticketId);
            // eslint-disable-next-line react-hooks/set-state-in-effect -- Sincronización de modal con parámetro de URL 'ticketId'
            setActiveTicketId(parsedId);
            setDetailOpen(true);

            const newParams = new URLSearchParams(searchParams);
            newParams.delete('ticketId');
            setSearchParams(newParams, { replace: true });
        }
    }, [searchParams, setSearchParams]);

    useEffect(() => {
        const params = { page: 1, limit: LIMIT };
        if (soloNoLeidas) params.soloNoLeidas = true;
        if (filtroTipo) params.tipo = filtroTipo;

        fetchNotificaciones(params, false, false);
        // eslint-disable-next-line react-hooks/set-state-in-effect -- Reinicio de página al cambiar filtros
        setPage(1);
    }, [soloNoLeidas, filtroTipo, fetchNotificaciones]);

    useEffect(() => {
        if (prevUpdate.current !== lastUpdate) {
            prevUpdate.current = lastUpdate;

            const params = { page: 1, limit: LIMIT * page };
            if (soloNoLeidas) params.soloNoLeidas = true;
            if (filtroTipo) params.tipo = filtroTipo;

            fetchNotificaciones(params, false, true);
        }
    }, [lastUpdate, page, soloNoLeidas, filtroTipo, fetchNotificaciones]);

    useEffect(() => {
        if (meta.noLeidas !== undefined) {
            setNoLeidas(meta.noLeidas);
        }
    }, [meta.noLeidas, setNoLeidas]);

    const handleLoadMore = useCallback(() => {
        if (page >= meta.totalPages || loadingMore) return;

        const nextPage = page + 1;
        const params = { page: nextPage, limit: LIMIT };
        if (soloNoLeidas) params.soloNoLeidas = true;
        if (filtroTipo) params.tipo = filtroTipo;

        fetchNotificaciones(params, true, false);
        setPage(nextPage);
    }, [page, meta.totalPages, loadingMore, soloNoLeidas, filtroTipo, fetchNotificaciones]);

    const handleToggleNoLeidas = useCallback(() => {
        setSoloNoLeidas((p) => !p);
    }, []);

    const handleTipoChange = useCallback((t) => {
        setFiltroTipo(t);
    }, []);

    const handleMarkAllRead = useCallback(async () => {
        await markAllRead();
        resetNotifyStore();
    }, [markAllRead, resetNotifyStore]);

    const handleAction = useCallback(async (notificacion) => {
        if (!notificacion.leida) {
            markRead(notificacion.id);
            decrementNotifyStore();
        }

        if (!notificacion.tareaId) return;

        setActiveTicketId(notificacion.tareaId);
        setDetailOpen(true);
    }, [markRead, decrementNotifyStore]);

    const handleCloseModals = useCallback(() => {
        setDetailOpen(false);
        setActiveTicketId(null);
    }, []);

    const sharedProps = {
        notificaciones,
        loading,
        loadingMore,
        submitting,
        currentUser,
        meta,
        soloNoLeidas,
        filtroTipo,
        hasMore: page < meta.totalPages,
        onToggleNoLeidas: handleToggleNoLeidas,
        onTipoChange: handleTipoChange,
        onLoadMore: handleLoadMore,
        onAction: handleAction,
        onMarkRead: markRead,
        onMarkAll: handleMarkAllRead,
    };

    return (
        <div className="w-full max-w-full md:max-w-3xl lg:max-w-4xl mx-auto p-1 lg:p-10 m-1">
            {isDesktop ? <NotifyDesktop {...sharedProps} /> : <NotifyMobile {...sharedProps} />}

            <ReporteDetailModal
                isOpen={detailOpen}
                onClose={handleCloseModals}
                reporteId={activeTicketId}
                onActionSuccess={() => {
                    fetchNotificaciones({ page: 1, limit: LIMIT }, false, true);
                    handleCloseModals();
                }}
            />
        </div>
    );
}