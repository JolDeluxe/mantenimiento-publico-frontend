import React, { useState } from 'react';
import { Icon } from '@/components/ui/icon';
import { Input, Label } from '@/components/form/z_index';

export const RegisterForm = ({
  formData,
  loading,
  submitted,
  onChange,
  onSubmit,
  onBack
}) => {
  const [localSubmitted, setLocalSubmitted] = useState(false);

  const showErrors = localSubmitted || submitted;

  // Validación de correo: solo se exige @cuadra.com.mx si se ingresó algo
  const isEmailProvided = formData.email?.trim() !== '';
  const isCorporateEmail = isEmailProvided
    ? formData.email.trim().toLowerCase().endsWith('@cuadra.com.mx')
    : true;

  const emailError = isEmailProvided && !isCorporateEmail
    ? "Solo se permiten correos @cuadra.com.mx"
    : null;

  const passMismatch = formData.password !== formData.confirmPassword;
  const nameError = showErrors && !formData.nombre?.trim() ? "El nombre es obligatorio" : null;
  const passwordError = showErrors && !formData.password?.trim() ? "La contraseña es obligatoria" : null;
  const mismatchError = showErrors && formData.password?.trim() && passMismatch
    ? "Las contraseñas no coinciden"
    : null;

  const handleLocalSubmit = (e) => {
    e.preventDefault();
    setLocalSubmitted(true);

    // Bloquear si hay errores — todos los campos con error ya son visibles
    if (
      !formData.nombre?.trim() ||
      !formData.password?.trim() ||
      passMismatch ||
      (isEmailProvided && !isCorporateEmail)
    ) {
      return;
    }

    if (onSubmit) onSubmit(e);
  };

  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-300">
      <h2 className="fuente-titulos text-2xl font-bold mb-1 text-center text-marca-primario uppercase">
        Solicitar Cuenta
      </h2>
      <p className="text-slate-500 text-xs text-center mb-2 leading-tight">
        Llena tus datos para darte de alta en el sistema de mantenimiento.
      </p>
      <p className="text-slate-400 text-[11px] text-center mb-5 leading-tight italic">
        Tu usuario de acceso se generará automáticamente.
      </p>

      <form className="flex flex-col gap-4" onSubmit={handleLocalSubmit} noValidate>

        {/* 1. NOMBRE */}
        <div className="flex flex-col gap-1.5">
          <Label
            htmlFor="nombre"
            error={!!nameError}
            className="flex items-center gap-2 font-bold text-[11px] tracking-widest text-slate-500"
          >
            NOMBRE
          </Label>
          <Input
            id="nombre"
            type="text"
            name="nombre"
            placeholder="Juan Pérez"
            value={formData.nombre}
            onChange={onChange}
            error={!!nameError}
            helperText={nameError}
            autoComplete="name"
          />
        </div>

        {/* 2. CORREO INSTITUCIONAL (OPCIONAL) */}
        <div className="flex flex-col gap-1.5">
          <Label
            htmlFor="email"
            error={!!emailError}
            className="flex items-center justify-between font-bold text-[11px] tracking-widest text-slate-500"
          >
            <span>CORREO INSTITUCIONAL (OPCIONAL)</span>
          </Label>
          <Input
            id="email"
            type="email"
            name="email"
            placeholder="usuario@cuadra.com.mx"
            value={formData.email}
            onChange={onChange}
            error={!!emailError}
            helperText={emailError || "¿No tienes correo institucional? Déjalo vacío."}
            autoComplete="email"
          />
        </div>

        {/* 3. TELÉFONO (OPCIONAL) */}
        <div className="flex flex-col gap-1.5">
          <Label
            htmlFor="telefono"
            className="flex items-center font-bold text-[11px] tracking-widest text-slate-500"
          >
            TELÉFONO (OPCIONAL)
          </Label>
          <Input
            id="telefono"
            type="tel"
            name="telefono"
            placeholder="10 dígitos"
            value={formData.telefono || ''}
            onChange={onChange}
            autoComplete="tel"
          />
        </div>

        {/* 4. CONTRASEÑA */}
        <div className="flex flex-col gap-1.5">
          <Label
            htmlFor="password"
            error={!!passwordError}
            className="flex items-center font-bold text-[11px] tracking-widest text-slate-500"
          >
            CONTRASEÑA
          </Label>
          <Input
            id="password"
            type="password"
            name="password"
            placeholder="••••••••"
            value={formData.password}
            onChange={onChange}
            error={!!passwordError}
            helperText={passwordError}
            autoComplete="new-password"
          />
        </div>

        {/* 5. REPETIR CONTRASEÑA */}
        <div className="flex flex-col gap-1.5">
          <Label
            htmlFor="confirmPassword"
            error={!!mismatchError}
            className="flex items-center font-bold text-[11px] tracking-widest text-slate-500"
          >
            REPETIR CONTRASEÑA
          </Label>
          <Input
            id="confirmPassword"
            type="password"
            name="confirmPassword"
            placeholder="••••••••"
            value={formData.confirmPassword}
            onChange={onChange}
            error={!!mismatchError}
            helperText={mismatchError}
            autoComplete="new-password"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full mt-2 py-3 rounded-md font-bold uppercase tracking-wide transition-colors duration-300 flex items-center justify-center gap-2 ${
            loading
              ? "bg-slate-400 text-white cursor-not-allowed"
              : "bg-marca-primario hover:bg-opacity-90 text-white cursor-pointer"
          }`}
        >
          {loading ? "Procesando..." : "Registrarme"}
        </button>
      </form>

      <div className="mt-6 text-center">
        <button
          type="button"
          onClick={onBack}
          className="text-sm font-semibold text-slate-500 hover:text-marca-primario hover:underline focus:outline-none cursor-pointer flex items-center justify-center gap-1 mx-auto"
        >
          <Icon name="arrow_back" size="16px" />
          Ya tengo cuenta, volver
        </button>
      </div>
    </div>
  );
};