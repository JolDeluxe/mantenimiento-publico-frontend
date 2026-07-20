// mantenimiento-publico-frontend/src/features/bienvenida/pages/welcome-page.jsx
import React from 'react';
import { useIsDesktop } from '@/hooks/useMediaQuery';
import WelcomeDesktop from '../views/welcome-desktop';
import WelcomeMobile from '../views/welcome-mobile';

export const WelcomePage = () => {
  const isDesktop = useIsDesktop();
  
  const stats = { 
    activos: 3, 
    porAprobar: 1 
  };

  return isDesktop ? (
    <WelcomeDesktop stats={stats} />
  ) : (
    <WelcomeMobile stats={stats} />
  );
};

export default WelcomePage;