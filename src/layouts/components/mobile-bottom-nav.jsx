import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth-store';
import { getModulesByRole } from '@/config/modules-config';
import { GlassBottomNav, GlassBottomNavItem } from '@/components/ui/liquid-glass-mobile';

export const MobileBottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthStore();
  
  const currentUser = user?.data || user;
  const userModules = currentUser?.rol ? getModulesByRole(currentUser.rol) : [];

  if (userModules.length === 0) return null;

  return (
    <GlassBottomNav>
      {userModules.map((module) => {
        // Determinamos si la ruta actual coincide con la del módulo
        const isActive = location.pathname.startsWith(module.route);

        return (
          <GlassBottomNavItem
            key={module.id}
            icon={module.icon}
            label={module.name}
            isActive={isActive}
            onClick={() => navigate(module.route)}
          />
        );
      })}
    </GlassBottomNav>
  );
};