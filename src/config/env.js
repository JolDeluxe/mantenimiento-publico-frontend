/**
 * Validador y Centralizador de Variables de Entorno
 * 
 * Vite procesa automáticamente el archivo .env en la raíz del proyecto.
 * NO necesitas importar .env manualmente - Vite lo hace por ti.
 * 
 * Variables con prefijo VITE_ son inyectadas en import.meta.env automáticamente.
 * 
 * Uso:
 * import { ENV } from '@/config/env';
 * const apiUrl = ENV.API_URL;
 */

const requiredVars = [
  'VITE_API_URL',
];

const optionalVars = {
  VITE_VAPID_PUBLIC_KEY: '',
  VITE_ENV: 'development',
  VITE_APP_NAME: 'Cuadra',
};

function validateEnv() {
  const missing = [];
  
  requiredVars.forEach(varName => {
    if (!import.meta.env[varName]) {
      missing.push(varName);
    }
  });

  if (missing.length > 0) {
    const errorMsg = `
╔════════════════════════════════════════════════════════════╗
║  ⚠️  ERROR CRÍTICO: Variables de Entorno Faltantes         ║
╠════════════════════════════════════════════════════════════╣
║  Las siguientes variables son REQUERIDAS:                  ║
║  ${missing.map(v => `  - ${v}`).join('\n║ ')}
║                                                            ║
║  📁 Archivo: .env (en la raíz del proyecto)                ║
║  Contenido requerido:                                      ║
║  ${missing.map(v => `  ${v}=valor`).join('\n║ ')}
║                                                            ║
║  💡 Recuerda: Reinicia el servidor después de editar .env  ║
╚════════════════════════════════════════════════════════════╝
    `.trim();
    
    throw new Error(errorMsg);
  }
}

// Ejecuta validación al cargar el módulo
validateEnv();

// Exporta objeto centralizado y tipado
export const ENV = {
  // Backend
  API_URL: import.meta.env.VITE_API_URL,
  
  // Push Notifications
  VAPID_PUBLIC_KEY: import.meta.env.VITE_VAPID_PUBLIC_KEY || optionalVars.VITE_VAPID_PUBLIC_KEY,
  
  // Ambiente
  ENV_MODE: import.meta.env.VITE_ENV || optionalVars.VITE_ENV,
  APP_NAME: import.meta.env.VITE_APP_NAME || optionalVars.VITE_APP_NAME,
  
  // Banderas de Vite (siempre disponibles)
  IS_DEV: import.meta.env.DEV,
  IS_PROD: import.meta.env.PROD,
  MODE: import.meta.env.MODE,
};

// Log de confirmación en desarrollo
// if (ENV.IS_DEV) {
//   console.log('🔧 Configuración de Entorno Cargada:', {
//     API_URL: ENV.API_URL,
//     VAPID_ACTIVO: !!ENV.VAPID_PUBLIC_KEY,
//     ENV_MODE: ENV.ENV_MODE,
//     APP_NAME: ENV.APP_NAME,
//   });
// }

export default ENV;