import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '@/components/ui/z_index';
import { HardReloadButton } from '@/components/ui/hard-reload-button';

/**
 * Vista móvil para la página de bienvenida y guía del cliente.
 * Optimizado para gestos táctiles y consolidado con el Banner Principal de accesos rápidos.
 */
export const WelcomeMobile = () => {
  const navigate = useNavigate();

  const handleStartReport = () => {
    navigate('/nuevo-reporte');
  };

  const handleGoToActive = () => {
    navigate('/activos');
  };

  const handleGoToHistory = () => {
    navigate('/historico');
  };

  return (
    <div className="relative flex h-full flex-col overflow-hidden bg-transparent animate-in fade-in duration-300">
      
      {/* Header de sección */}
      <header className="shrink-0 w-full z-30 bg-white/70 backdrop-blur-md border-b border-white/20 px-4 py-3 flex items-center justify-between shadow-[0_2px_10px_rgba(0,0,0,0.01)]">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-marca-primario flex items-center justify-center shadow-md">
            <Icon name="home" className="text-white text-lg" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-slate-800">Inicio</h1>
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider leading-none mt-0.5">
              Portal del Cliente
            </p>
          </div>
        </div>
        <HardReloadButton />
      </header>

      {/* Contenido Táctil - Ancho Completo */}
      <main
        className="
          flex-1
          w-full
          max-w-none
          mx-0
          px-3
          sm:px-4
          md:px-6
          py-[clamp(12px,2.2dvh,20px)]
          flex
          flex-col
          gap-[clamp(12px,2.2dvh,20px)]
          overflow-y-auto
          overscroll-none
          custom-scrollbar
        "
      >
        
        {/* Banner de Bienvenida Mobile (Estructura Aprobada con Foto) */}
        <div className="overflow-hidden bg-white border border-slate-200/70 rounded-3xl shadow-[0_10px_30px_rgba(15,23,42,0.10)] relative shrink-0">

          {/* Área visual con imagen */}
          <div className="relative h-[clamp(170px,30dvh,220px)] sm:h-[clamp(190px,30dvh,240px)] overflow-hidden">

            {/* Imagen completa */}
            <img
              src="/img/escaneo-qr.webp"
              alt="Escaneo de código QR en maquinaria"
              className="absolute inset-0 h-full w-full object-cover object-[58%_center]"
            />

            {/* Degradado solamente detrás del texto */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/35 to-transparent pointer-events-none" />

            {/* Oscurecimiento inferior muy ligero */}
            <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/25 to-transparent pointer-events-none" />

            {/* Contenido */}
            <div className="relative z-10 flex flex-col gap-1.5 p-[clamp(14px,2.5dvh,20px)] max-w-[92%] sm:max-w-[72%]">
              <span className="px-2.5 py-1 rounded-full bg-black/25 text-white font-extrabold text-[8px] uppercase tracking-widest w-fit max-w-full border border-white/20 shadow-sm flex items-center gap-1">
                <Icon name="qr_code_scanner" className="text-[10px]" />
                <span className="truncate">CUADRA Mantenimientos</span>
              </span>

              <h2 className="text-lg sm:text-xl font-black tracking-tight leading-[1.08] text-white drop-shadow-md max-w-[14rem] sm:max-w-none">
                ¿Cómo podemos ayudarte hoy?
              </h2>

              <p className="text-[10.5px] sm:text-[11px] text-white/95 leading-snug font-medium drop-shadow-sm max-w-[18rem]">
                Reporta una falla, sigue su atención y valida la solución directamente desde el portal.
              </p>
            </div>
          </div>

          {/* Panel de acciones (Liquid Glass con colores corporativos CUADRA) */}
          <div className="relative z-10 bg-[#66494a]/75 backdrop-blur-xl p-[clamp(10px,1.9dvh,14px)] border-t border-white/10 rounded-b-3xl shadow-[inset_0_1px_0_rgba(255,255,255,0.15)]">

            {/* Acción principal (Compactado a 48px, Cristal Claro con Texto en Acento) */}
            <button
              onClick={handleStartReport}
              className="w-full h-[clamp(42px,6dvh,48px)] px-4 py-2 bg-white/80 backdrop-blur-xl border border-white/60 text-[#66494a] hover:bg-white/90 font-bold text-[10.5px] uppercase tracking-wider rounded-2xl shadow-[0_8px_24px_rgba(102,73,74,0.3),inset_0_1px_0_rgba(255,255,255,0.85)] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-[#66494a]/50 relative overflow-hidden"
            >
              <div className="absolute inset-x-0 top-0 h-[1px] bg-white/85 pointer-events-none" />
              <Icon name="post_add" className="text-base shrink-0" />
              <span className="truncate">Crear Nuevo Reporte</span>
            </button>

            {/* Acciones secundarias (Compactadas a 46px, Cristal del Secundario sobre Acento) */}
            <div className="grid grid-cols-2 gap-2 mt-[clamp(6px,1.3dvh,8px)]">
              <button
                onClick={handleGoToActive}
                aria-label="Ver reportes activos"
                className="h-[clamp(40px,5.8dvh,46px)] min-w-0 px-2.5 py-2 bg-[#846768]/25 backdrop-blur-xl border border-white/20 text-[#F0EBE9] hover:bg-[#846768]/35 font-bold text-[10.5px] transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer rounded-2xl shadow-[0_8px_20px_rgba(102,73,74,0.15),inset_0_1px_0_rgba(255,255,255,0.12)] outline-none relative overflow-hidden"
              >
                <div className="absolute inset-x-0 top-0 h-[1px] bg-white/15 pointer-events-none" />
                <Icon name="assignment" className="text-base text-[#F0EBE9] shrink-0" />
                <span className="truncate">Activos</span>
              </button>

              <button
                onClick={handleGoToHistory}
                aria-label="Ver historial de reportes"
                className="h-[clamp(40px,5.8dvh,46px)] min-w-0 px-2.5 py-2 bg-[#846768]/25 backdrop-blur-xl border border-white/20 text-[#F0EBE9] hover:bg-[#846768]/35 font-bold text-[10.5px] transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer rounded-2xl shadow-[0_8px_20px_rgba(102,73,74,0.15),inset_0_1px_0_rgba(255,255,255,0.12)] outline-none relative overflow-hidden"
              >
                <div className="absolute inset-x-0 top-0 h-[1px] bg-white/15 pointer-events-none" />
                <Icon name="history" className="text-base text-[#F0EBE9] shrink-0" />
                <span className="truncate">Historial</span>
              </button>
            </div>
          </div>
        </div> 

        {/* Flujo de Uso Rápido Compacto (Proceso de Atención Horizontal de Tres Columnas) */}
        <div className="flex flex-col gap-2.5 shrink-0">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest px-1">
            Proceso de atención
          </span>

          <div className="grid grid-cols-3 gap-2.5 w-full">
            
            {/* Paso 1 - Reporta */}
            <div className="flex flex-col items-center text-center bg-white/45 backdrop-blur-xl border border-white/45 rounded-2xl p-[clamp(10px,1.8dvh,12px)] shadow-[0_8px_30px_rgba(0,0,0,0.015)] h-full justify-start min-h-[clamp(96px,16dvh,110px)] min-w-0">
              <div className="w-8 h-8 rounded-xl bg-marca-primario/10 text-marca-primario flex items-center justify-center border border-marca-primario/5 shrink-0 mb-2">
                <Icon name="qr_code_scanner" className="text-sm" />
              </div>
              <h4 className="text-[11px] font-bold text-slate-800 uppercase tracking-wide leading-none">
                Reporta
              </h4>
              <p className="text-[9.5px] leading-snug text-slate-500 mt-1.5 font-semibold">
                Escanea el QR o describe la falla.
              </p>
            </div>

            {/* Paso 2 - Seguimiento */}
            <div className="flex flex-col items-center text-center bg-white/45 backdrop-blur-xl border border-white/45 rounded-2xl p-[clamp(10px,1.8dvh,12px)] shadow-[0_8px_30px_rgba(0,0,0,0.015)] h-full justify-start min-h-[clamp(96px,16dvh,110px)] min-w-0">
              <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-700 flex items-center justify-center border border-indigo-500/5 shrink-0 mb-2">
                <Icon name="engineering" className="text-sm" />
              </div>
              <h4 className="text-[11px] font-bold text-slate-800 uppercase tracking-wide leading-none">
                Seguimiento
              </h4>
              <p className="text-[9.5px] leading-snug text-slate-500 mt-1.5 font-semibold">
                Consulta el avance del equipo técnico.
              </p>
            </div>

            {/* Paso 3 - Valida */}
            <div className="flex flex-col items-center text-center bg-white/45 backdrop-blur-xl border border-white/45 rounded-2xl p-[clamp(10px,1.8dvh,12px)] shadow-[0_8px_30px_rgba(0,0,0,0.015)] h-full justify-start min-h-[clamp(96px,16dvh,110px)] min-w-0">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-700 flex items-center justify-center border border-emerald-500/5 shrink-0 mb-2">
                <Icon name="fact_check" className="text-sm" />
              </div>
              <h4 className="text-[11px] font-bold text-slate-800 uppercase tracking-wide leading-none">
                Valida
              </h4>
              <p className="text-[9.5px] leading-snug text-slate-500 mt-1.5 font-semibold">
                Aprueba la solución o solicita revisión.
              </p>
            </div>

          </div>
        </div>

      </main>
    </div>
  );
};

export default WelcomeMobile;
