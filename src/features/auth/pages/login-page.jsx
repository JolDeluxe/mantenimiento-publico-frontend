import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { LoginDesktop } from '../views/login-desktop';
import { LoginMobile } from '../views/login-mobile';
import { useIsDesktop } from '@/hooks/useMediaQuery';
import { useAuth } from '../hooks/use-auth';
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

/**
 * Modal de cuenta creada exitosamente.
 * Muestra el username generado por el backend y permite copiarlo.
 * Al cerrar lleva al Login con el username ya rellenado.
 */
const CredentialsModal = ({ isOpen, onClose, username }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(username || '');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback silencioso si el navegador no soporta clipboard
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-7 text-center space-y-5">
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
            <Icon name="check_circle" size="32px" fill={true} />
          </div>

          <div className="space-y-1">
            <h3 className="fuente-titulos text-2xl font-bold text-gray-800 tracking-tight">Cuenta Creada</h3>
            <p className="text-sm text-gray-500 font-medium">Tu usuario de acceso es:</p>
          </div>

          {/* Username generado por backend */}
          <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-left border border-gray-100">
            <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest block mb-1.5 ml-1">
              Usuario
            </span>
            <div className="flex items-center gap-2">
              <div className="flex-1 font-mono text-gray-800 font-medium bg-white border border-gray-200 shadow-sm px-4 py-2.5 rounded-lg select-all">
                {username}
              </div>
              <button
                type="button"
                onClick={handleCopy}
                title={copied ? "¡Copiado!" : "Copiar usuario"}
                className={`shrink-0 p-2.5 rounded-lg border transition-colors duration-200 cursor-pointer ${
                  copied
                    ? "bg-green-100 border-green-300 text-green-600"
                    : "bg-white border-gray-200 text-gray-400 hover:border-gray-300 hover:text-gray-700"
                }`}
              >
                <Icon name={copied ? "check" : "content_copy"} size="18px" />
              </button>
            </div>
            {copied && (
              <p className="text-[11px] text-green-600 font-semibold text-right pr-1">¡Copiado!</p>
            )}
          </div>

          <p className="text-xs text-gray-400 leading-relaxed">
            Guarda este usuario — lo necesitarás para iniciar sesión cada vez que ingreses al sistema.
          </p>

          <button
            type="button"
            onClick={onClose}
            className="w-full mt-2 py-3.5 bg-marca-primario text-white font-bold rounded-xl hover:bg-opacity-90 transition-colors shadow-md active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
          >
            <Icon name="login" size="20px" />
            Ir a iniciar sesión
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
    const isCorporateEmail = isEmailProvided
      ? formData.email.trim().toLowerCase().endsWith('@cuadra.com.mx')
      : true;

    if (isLogin) {
      if (!formData.email.trim() || !formData.password.trim()) return;

      const success = await login(formData.email.trim(), formData.password);
      if (success) {
        const from = location.state?.from;
        const destination = isSafeRedirect(from)
          ? `${from.pathname}${from.search || ''}${from.hash || ''}`
          : '/bienvenida';
        navigate(destination, { replace: true });
      }

    } else {
      // Registro: la validación local ya ocurrió en RegisterForm.handleLocalSubmit
      // Esta guarda es adicional por si el componente llama onSubmit directamente
      if (
        !formData.nombre.trim() ||
        !formData.password.trim() ||
        formData.password !== formData.confirmPassword ||
        (isEmailProvided && !isCorporateEmail)
      ) return;

      const response = await register(formData);
      if (response && response.status === 'success') {
        // Guardar user del backend (contiene el username real generado)
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

  /**
   * Al confirmar credenciales en el modal:
   * 1. Cerrar modal
   * 2. Volver a la vista Login (NO navegar a /bienvenida — el usuario aún no está autenticado)
   * 3. Pre-rellenar el campo email con el username generado por el backend
   * 4. Pre-rellenar el campo password con lo que el usuario acaba de escribir (solo en memoria React)
   * 5. Limpiar el resto del formulario de registro
   */
  const handleCloseModal = () => {
    const username = registeredUser?.username || '';
    const passwordTemp = formData.password;

    setShowCredentialsModal(false);
    setRegisteredUser(null);

    // Restablecer formulario conservando username y contraseña para comodidad UX
    setFormData({
      email: username,
      telefono: '',
      password: passwordTemp,
      nombre: '',
      confirmPassword: ''
    });

    setSubmitted(false);
    setBackendError(null);
    setView('login');
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
      />
    </>
  );
};

export default LoginPage;
