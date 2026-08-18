import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { LoginDesktop } from '../views/login-desktop';
import { LoginMobile } from '../views/login-mobile';
import { useIsDesktop } from '@/hooks/useMediaQuery';
import { useAuth } from '../hooks/use-auth';
import { notify } from '@/components/notification/adaptive-notify';
import { Icon } from '@/components/ui/icon';

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

const CredentialsModal = ({ isOpen, onClose, username, password }) => {
  const [showPassword, setShowPassword] = useState(false);
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-7 text-center space-y-5">
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
            <Icon name="check_circle" size="32px" fill={true} />
          </div>
          <div className="space-y-1">
            <h3 className="fuente-titulos text-2xl font-bold text-gray-800 tracking-tight">Cuenta Creada</h3>
            <p className="text-sm text-gray-500 font-medium">Guarda estos datos para volver a ingresar.</p>
          </div>

          <div className="bg-gray-50 rounded-xl p-5 space-y-4 text-left border border-gray-100">
            <div>
              <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest block mb-1.5 ml-1">Usuario</span>
              <div className="font-mono text-gray-800 font-medium bg-white border border-gray-200 shadow-sm px-4 py-2.5 rounded-lg select-all">
                {username}
              </div>
            </div>
            <div>
              <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest block mb-1.5 ml-1">Contraseña</span>
              <div className="relative">
                <div className="font-mono text-gray-800 font-medium bg-white border border-gray-200 shadow-sm px-4 py-2.5 rounded-lg pr-12 overflow-hidden select-all">
                  {showPassword ? password : '•'.repeat(10)}
                </div>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 focus:outline-none p-1.5 rounded-md hover:bg-gray-100 transition-colors cursor-pointer"
                  title={showPassword ? "Ocultar" : "Mostrar"}
                >
                  <Icon name={showPassword ? "visibility_off" : "visibility"} size="20px" />
                </button>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-full mt-2 py-3.5 bg-marca-primario text-white font-bold rounded-xl hover:bg-opacity-90 transition-colors shadow-md active:scale-[0.98] cursor-pointer"
          >
            Continuar
          </button>
        </div>
      </div>
    </div>
  );
};

const LoginPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [view, setView] = useState('login');
  const [submitted, setSubmitted] = useState(false);
  const [bgImageDesktop] = useState(() => getRandomLoginImagePath('loginEscritorio', 3));
  const [bgImageMobile] = useState(() => getRandomLoginImagePath('loginMovil', 4));

  const [formData, setFormData] = useState({
    email: '',
    telefono: '',
    password: '',
    nombre: '',
    confirmPassword: ''
  });

  const [showCredentialsModal, setShowCredentialsModal] = useState(false);
  const [registeredUser, setRegisteredUser] = useState(null);

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
    const isEmailProvided = formData.email?.trim() !== '';
    const isCorporateEmail = isEmailProvided ? formData.email.trim().toLowerCase().endsWith('@cuadra.com.mx') : true;

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

      const response = await register(formData);
      if (response && response.status === 'success') {
        notify.success('Registro exitoso.');
        setRegisteredUser(response.user);
        setShowCredentialsModal(true);
      }
    }
  };

  const handleNavigate = (targetView) => {
    setView(targetView);
    setSubmitted(false);
    setBackendError(null);
  };

  const handleCloseModal = () => {
    setShowCredentialsModal(false);
    const passTemp = formData.password;
    setRegisteredUser(null);
    setFormData(prev => ({ ...prev, password: '', confirmPassword: '' }));

    const from = location.state?.from;
    const destination = isSafeRedirect(from)
      ? `${from.pathname}${from.search || ''}${from.hash || ''}`
      : '/bienvenida';
    navigate(destination, { replace: true });
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

  return (
    <>
      {isDesktop ? (
        <LoginDesktop view={view} bgImage={bgImageDesktop} {...formProps} />
      ) : (
        <LoginMobile view={view} bgImage={bgImageMobile} {...formProps} />
      )}

      <CredentialsModal
        isOpen={showCredentialsModal}
        onClose={handleCloseModal}
        username={registeredUser?.username}
        password={formData.password}
      />
    </>
  );
};

export default LoginPage;
