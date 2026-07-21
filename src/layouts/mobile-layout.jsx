import React from 'react';
import { Outlet } from 'react-router-dom';
import { MobileHeader } from './components/mobile-header.jsx';
import { MobileBottomNav } from './components/mobile-bottom-nav.jsx';

export const MobileLayout = () => {
  return (
    <div className="fixed inset-0 flex flex-col bg-cuadra-arena overflow-hidden overscroll-none">

      <div className="shrink-0 w-full z-50 bg-cuadra-arena/70 backdrop-blur-2xl saturate-[150%] border-b border-white/50 shadow-[0_4px_24px_rgba(0,0,0,0.04)]">
        <MobileHeader />
      </div>

      <main className="min-h-0 flex-1 overflow-hidden bg-transparent relative z-10">
        <Outlet />
      </main>

      <MobileBottomNav />

    </div>
  );
};
