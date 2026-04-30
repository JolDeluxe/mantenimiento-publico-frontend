/**
 * Configuración centralizada de módulos del Frontend Público (Clientes)
 * Navegación plana y directa para maximizar la velocidad de uso.
 */

export const MODULES_CONFIG = [
  {
    id: 'nuevo-reporte',
    name: 'Nuevo Reporte',
    icon: 'post_add',
    route: '/nuevo-reporte',
    allowedRoles: ['CLIENTE', 'CLIENTE_INTERNO'],
  },
  {
    id: 'tickets-activos',
    name: 'Activos',
    icon: 'assignment',
    route: '/activos',
    allowedRoles: ['CLIENTE', 'CLIENTE_INTERNO'],
  },
  {
    id: 'tickets-historico',
    name: 'Historial',
    icon: 'history',
    route: '/historico',
    allowedRoles: ['CLIENTE', 'CLIENTE_INTERNO'],
  },
  {
    id: 'notificaciones',
    name: 'Notificaciones',
    icon: 'notifications',
    route: '/notificaciones',
    allowedRoles: ['CLIENTE', 'CLIENTE_INTERNO'],
    hideInMenu: true,
  }
];

export const getModulesByRole = (userRole) => {
  if (!userRole) return [];

  return MODULES_CONFIG
    .filter(module => module.allowedRoles.includes(userRole) && !module.hideInMenu)
    .map(module => {
      if (module.children) {
        return {
          ...module,
          children: module.children.filter(child =>
            child.allowedRoles.includes(userRole) && !child.hideInMenu
          )
        };
      }
      return module;
    });
};

export const canAccessModule = (userRole, moduleId) => {
  const module = MODULES_CONFIG.find(m => m.id === moduleId);
  return module ? module.allowedRoles.includes(userRole) : false;
};