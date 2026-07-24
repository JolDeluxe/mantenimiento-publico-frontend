import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { LoginDesktop } from '../views/login-desktop';
import { LoginMobile } from '../views/login-mobile';
import { useIsDesktop } from '@/hooks/useMediaQuery';
import { useAuth } from '../hooks/use-auth';
import { notify } from '@/components/notification/adaptive-notify';

function getRandomLoginImagePath(folder, total) {
  const index = Math.floor(Math.random() * total) + 1;
  return `/${folder}/${index}.webp`;
}

function isSafeRedirect(from) {
  if (!from || typeof from !== 'object') return false;
  if (typeof from.pathname !== 'string') return false;

  const path = from.pathname;
  if (path === '/login') return false;
  if (!path.startsWith('/') || path.startsWith('//')) return false;
  if (/[\\]/.test(path)) return false;
  if ([...path].some((char) => {
    const code = char.charCodeAt(0);
    return code <= 31 || code === 127;
  })) return false;
  if (/^[a-zA-Z][a-zA-Z0-9+\-.]*:/.test(path)) return false;

  return true;
}

const LoginPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [view, setView] = useState('login');
  const [submitted, setSubmitted] = useState(false);
  const [bgImageDesktop] = useState(() => getRandomLoginImagePath('loginEscritorio', 3));
  const [bgImageMobile] = useState(() => getRandomLoginImagePath('loginMovil', 4));
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    nombre: '',
    confirmPassword: ''
  });

  const isDesktop = useIsDesktop();
  const { login, register, loading, backendError, setBackendError } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (backendError) setBackendError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitted(true);
    setBackendError(null);
    
    const isLogin = view === 'login';
    const isCorporateEmail = formData.email.trim().toLowerCase().endsWith('@cuadra.com.mx');
    
    if (isLogin) {
      if (!formData.email.trim() || !formData.password.trim()) return;
      
      const success = await login(formData.email.trim(), formData.password);
      if (success) {
        notify.success('¡Sesión iniciada correctamente!');
        const from = location.state?.from;
        const destination = isSafeRedirect(from)
          ? `${from.pathname}${from.search || ''}${from.hash || ''}`
          : '/bienvenida';
        navigate(destination, { replace: true });
      }
      
    } else {
      if (!isCorporateEmail || !formData.password.trim() || formData.password !== formData.confirmPassword || !formData.nombre.trim()) return;
      
      const success = await register(formData);
      if (success) {
        notify.success('Solicitud de registro enviada para validación.');
        setView('login');
        setSubmitted(false);
      }
    }
  };

  const handleNavigate = (targetView) => {
    setView(targetView);
    setSubmitted(false);
    setBackendError(null);
  };

  const formProps = {
    formData,
    loading,
    submitted,
    backendError,
    onChange: handleChange,
    onSubmit: handleSubmit,
    onForgot: () => handleNavigate('forgot'),
    onRegister: () => handleNavigate('register'),
    onBack: () => handleNavigate('login')
  };

  return isDesktop ? (
    <LoginDesktop view={view} bgImage={bgImageDesktop} {...formProps} />
  ) : (
    <LoginMobile view={view} bgImage={bgImageMobile} {...formProps} />
  );
};

export default LoginPage;
