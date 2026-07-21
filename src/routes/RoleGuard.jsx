import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth-store';

export const RoleGuard = ({ allowedRoles = [] }) => {
    const userState = useAuthStore((state) => state.user);
    const user = userState?.data ?? userState;
    const userRol = user?.rol;

    if (!userRol || !allowedRoles.includes(userRol)) {
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
};