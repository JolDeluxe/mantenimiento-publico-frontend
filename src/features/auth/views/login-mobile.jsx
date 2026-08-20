import React from 'react';
import { LoginForm } from '../components/login-form';
import { ForgotPasswordForm } from '../components/forgot-password-form';
import { RegisterForm } from '../components/register-form';
import { HardReloadButton } from '@/components/ui/hard-reload-button';

/**
 * Vista móvil de Login / Registro / Recuperación.
 *
 * Usa h-[100dvh] + overflow-y-auto en el contenedor raíz para garantizar scroll real
 * cuando el contenido supera el viewport (formulario de registro en pantallas pequeñas,
 * teclado virtual abierto, PWA instalada, etc.).
 *
 * La tarjeta usa items-start + py-6 para que empiece desde arriba cuando no cabe
 * completa, pero sigue viéndose centrada cuando sí existe espacio de sobra (gracias
 * a min-h-full + justify-center en el flex interior).
 */
export const LoginMobile = ({ view, bgImage, onBack, ...formProps }) => {
  return (
    <div
      className="h-[100dvh] overflow-y-auto bg-cover bg-center bg-no-repeat transition-all duration-500 relative"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      {/* Overlay fijo detrás del contenido */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-xs pointer-events-none" />

      {/* Contenedor scrollable con centrado vertical cuando hay espacio */}
      <div className="relative min-h-full flex flex-col items-center justify-center p-4 py-6">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-100 p-6 sm:p-8 text-slate-800">
          <HardReloadButton className="absolute right-4 top-4" />

          <div className="flex justify-center mb-6">
            <img src="/img/01_Cuadra_Mantnimento.webp" alt="Logo Cuadra" className="w-60 h-auto object-contain" />
          </div>

          {view === 'login' && <LoginForm {...formProps} />}
          {view === 'forgot' && <ForgotPasswordForm onBack={onBack} />}
          {view === 'register' && <RegisterForm {...formProps} onBack={onBack} />}
        </div>
      </div>
    </div>
  );
};