import React from 'react';
import { Outlet } from 'react-router-dom';
import { MobileHeader } from './components/mobile-header.jsx';
import { MobileBottomNav } from './components/mobile-bottom-nav.jsx';

export const MobileLayout = () => {
  return (
    <div className="h-dvh w-full flex flex-col bg-cuadra-arena overflow-hidden relative overscroll-none">

      {/* LIQUID GLASS HEADER */}
      <div className="fixed top-0 left-0 right-0 w-full z-50 bg-cuadra-arena/70 backdrop-blur-2xl saturate-[150%] border-b border-white/50 shadow-[0_4px_24px_rgba(0,0,0,0.04)]">
        <MobileHeader />
      </div>

      {/* MAIN CONTENT 
        Agregamos pt-16 (padding-top) para compensar el header fijo,
        y pb-24 (padding-bottom) para que el contenido final de la vista 
        nunca quede oculto debajo de la barra de navegación inferior.
      */}
      <main className="flex-1 overflow-y-auto pt-16 pb-24 bg-transparent custom-scrollbar relative z-10">
        <Outlet />
      </main>

      {/* LIQUID GLASS BOTTOM NAV */}
      <MobileBottomNav />

    </div>
  );
};