import React from 'react';
import { LoginForm } from '../components/login-form';
import { ForgotPasswordForm } from '../components/forgot-password-form';
import { RegisterForm } from '../components/register-form';
import { HardReloadButton } from '@/components/ui/hard-reload-button';

export const LoginDesktop = ({ view, bgImage, onBack, ...formProps }) => {
  return (
    <div
      className="min-h-screen overflow-y-auto flex items-start justify-center py-8 bg-cover bg-center bg-no-repeat transition-all duration-100"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm pointer-events-none" />

      <div className="relative bg-white rounded-lg shadow-2xl w-112.5 p-8 text-slate-800 my-auto">
        <HardReloadButton className="absolute right-4 top-4" />

        <div className="flex justify-center mb-8">
          <img src="/img/01_Cuadra_Mantnimento.webp" alt="Logo Cuadra" className="w-70 h-auto object-contain" />
        </div>

        {view === 'login' && <LoginForm {...formProps} />}
        {view === 'forgot' && <ForgotPasswordForm onBack={onBack} />}
        {view === 'register' && <RegisterForm {...formProps} onBack={onBack} />}
      </div>
    </div>
  );
};
