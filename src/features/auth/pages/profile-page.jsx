import React, { useEffect } from 'react';
import { useIsDesktop } from '@/hooks/useMediaQuery';
import { useProfile } from '../hooks/use-profile';
import { ProfileDesktop } from '../views/profile-desktop';
import { ProfileMobile } from '../views/profile-mobile';
import { notify } from '@/components/notification/adaptive-notify';

const ProfilePage = () => {
  const isDesktop = useIsDesktop();

  const {
    profile,
    loading,
    updating,
    uploadingImage,
    error,
    success,
    fetchProfile,
    updateProfile,
    uploadImage,
    deleteImage,
    changePassword,
    clearError,
    clearSuccess
  } = useProfile();

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  useEffect(() => {
    if (success?.message) {
      notify.success(success.message);
      const timer = setTimeout(() => clearSuccess?.(), 3000);
      return () => clearTimeout(timer);
    }
  }, [success, clearSuccess]);

  useEffect(() => {
    if (error?.message) {
      const msg = error.message.toLowerCase();

      // Silenciamos estrictamente los errores que los formularios ya manejan en su propia UI
      const isSilencedError =
        msg.includes('contraseña') ||
        msg.includes('datos de entrada inválidos') ||
        msg.includes('correo') || // Error silenciado para que lo maneje GeneralForm
        msg.includes('usuario ya existe') || // Error silenciado para que lo maneje GeneralForm
        msg.includes('nombre de usuario'); // Error silenciado para que lo maneje GeneralForm

      // Si NO es un error silenciado (ej. 500 Server Error o Red), entonces sí lanzamos el Toast
      if (!isSilencedError) {
        notify.error(error.message);
      }
    }
  }, [error]);

  const viewProps = {
    profile,
    loading,
    updating,
    uploadingImage,
    error,
    success,
    onUpdate: updateProfile,
    onChangePassword: changePassword,
    onAvatarUpload: uploadImage,
    onAvatarDelete: deleteImage,
    clearError,
    clearSuccess
  };

  if (!isDesktop) {
    return (
      <div className="h-full w-full overflow-hidden">
        <div className="h-full min-h-0 p-2">
          <ProfileMobile {...viewProps} />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-full md:max-w-3xl lg:max-w-4xl mx-auto">
      <div className="p-2 lg:p-4 space-y-4">
        <ProfileDesktop {...viewProps} />
      </div>
    </div>
  );
};

export default ProfilePage;
