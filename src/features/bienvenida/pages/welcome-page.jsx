import React from 'react';
import { useIsDesktop } from '@/hooks/useMediaQuery';
import WelcomeDesktop from '../views/welcome-desktop';
import WelcomeMobile from '../views/welcome-mobile';

export const WelcomePage = () => {
  const isDesktop = useIsDesktop();
  
  return isDesktop ? (
    <WelcomeDesktop />
  ) : (
    <WelcomeMobile />
  );
};

export default WelcomePage;