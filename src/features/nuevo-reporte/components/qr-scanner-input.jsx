import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Icon } from '@/components/ui/z_index';
import { cn } from '@/utils/cn';

/**
 * Lector de QR con UI propia.
 * Usa la cámara trasera por defecto y evita los controles nativos de html5-qrcode.
 */
export const QrScannerInput = ({
  onScanSuccess,
  onScanError,
  isProcessing = false,
  validationError = '',
  onRetry,
}) => {
  const readerIdRef = useRef(`qr-reader-${Math.random().toString(36).slice(2)}`);
  const successRef = useRef(onScanSuccess);
  const errorRef = useRef(onScanError);

  const [status, setStatus] = useState('starting');
  const [errorMessage, setErrorMessage] = useState('');
  const [detectedCode, setDetectedCode] = useState('');
  const [restartToken, setRestartToken] = useState(0);

  useEffect(() => {
    successRef.current = onScanSuccess;
    errorRef.current = onScanError;
  }, [onScanSuccess, onScanError]);

  useEffect(() => {
    if (validationError) setStatus('invalid');
  }, [validationError]);

  useEffect(() => {
    let disposed = false;
    let scanLocked = false;
    const scanner = new Html5Qrcode(readerIdRef.current, { verbose: false });

    const stopScanner = async () => {
      try {
        if (scanner.isScanning) await scanner.stop();
        scanner.clear();
      } catch {
        // El scanner puede desmontarse antes de terminar de iniciar.
      }
    };

    const handleSuccess = async (decodedText) => {
      if (scanLocked || disposed) return;
      scanLocked = true;
      setDetectedCode(decodedText);
      setStatus('detected');
      successRef.current?.(decodedText);
      await stopScanner();
    };

    const handleError = (message) => {
      errorRef.current?.(message);
    };

    const startScanner = async () => {
      setStatus('starting');
      setErrorMessage('');
      setDetectedCode('');

      const config = {
        fps: 12,
        disableFlip: true,
        aspectRatio: 1,
        qrbox: (viewfinderWidth, viewfinderHeight) => {
          const size = Math.floor(Math.min(viewfinderWidth, viewfinderHeight) * 0.58);
          const bounded = Math.max(118, Math.min(size, 172));
          return { width: bounded, height: bounded };
        },
      };

      try {
        let cameraConfig = { facingMode: { exact: 'environment' } };

        try {
          const cameras = await Html5Qrcode.getCameras();
          const rearCamera = cameras.find((camera) =>
            /back|rear|environment|trasera|posterior/i.test(camera.label || '')
          );
          if (rearCamera?.id) cameraConfig = rearCamera.id;
        } catch {
          // Algunos navegadores no devuelven labels antes del permiso.
        }

        await scanner.start(cameraConfig, config, handleSuccess, handleError);
        if (!disposed) setStatus('scanning');
      } catch (firstError) {
        try {
          await scanner.start({ facingMode: 'environment' }, config, handleSuccess, handleError);
          if (!disposed) setStatus('scanning');
        } catch (secondError) {
          console.error('[QR] No se pudo iniciar la cámara:', firstError, secondError);
          if (!disposed) {
            setStatus('error');
            setErrorMessage('No se pudo abrir la cámara. Revisa permisos o ingresa el código por teclado.');
          }
        }
      }
    };

    startScanner();

    return () => {
      disposed = true;
      stopScanner();
    };
  }, [restartToken]);

  const handleRetry = () => {
    onRetry?.();
    setRestartToken((current) => current + 1);
  };

  const statusCopy = {
    starting: {
      icon: 'progress_activity',
      title: 'Iniciando cámara',
      detail: 'Permite el acceso para escanear.',
    },
    detected: {
      icon: 'check_circle',
      title: isProcessing ? 'Vinculando equipo' : 'QR detectado',
      detail: detectedCode,
    },
    invalid: {
      icon: 'error',
      title: 'Equipo no encontrado',
      detail: validationError || 'No se pudo validar este código.',
    },
    error: {
      icon: 'error',
      title: 'Cámara no disponible',
      detail: errorMessage,
    },
  };

  const currentCopy = statusCopy[status];
  const showStatusPanel = status !== 'scanning' && currentCopy;
  const showRetry = status === 'invalid' || status === 'error';

  return (
    <div className="flex h-full min-h-0 w-full flex-col items-center justify-center gap-2">
      <div className="flex w-[min(100%,280px,42dvh)] max-w-full items-center justify-between gap-2">
        <div className="inline-flex min-w-0 items-center gap-1.5 rounded-full bg-slate-900/90 px-2.5 py-1 text-[8.5px] font-extrabold uppercase tracking-wider text-white border border-slate-800/60">
          <Icon name="photo_camera" size="12px" />
          <span className="truncate">Cámara trasera</span>
        </div>
        <button
          type="button"
          onClick={handleRetry}
          className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-[#66494a] border border-slate-200 shadow-sm active:scale-95"
          aria-label="Reiniciar escaneo"
        >
          <Icon name="refresh" size="16px" />
        </button>
      </div>

      <div className="relative aspect-square w-[min(100%,280px,42dvh)] max-w-full overflow-hidden rounded-2xl border border-white/50 bg-slate-950 shadow-[0_10px_30px_rgba(15,23,42,0.16)]">
        <div className="relative h-full w-full overflow-hidden bg-slate-900">
          <div
            id={readerIdRef.current}
            className={cn(
              'cuadra-qr-reader absolute inset-0 h-full w-full',
              status !== 'scanning' && 'opacity-35'
            )}
          />
        </div>
      </div>

      {status === 'scanning' && (
        <div className="flex w-[min(100%,280px,42dvh)] max-w-full items-center gap-2 rounded-xl border border-slate-200/70 bg-white/80 px-3 py-2 text-slate-600">
          <Icon name="qr_code_scanner" size="14px" className="shrink-0 text-slate-500" />
          <p className="truncate text-[10px] font-semibold">
            Apunta al código QR del equipo.
          </p>
        </div>
      )}

      {showStatusPanel && (
        <div className="w-[min(100%,280px,42dvh)] max-w-full rounded-xl border border-slate-200/70 bg-white/85 p-2 text-slate-700">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-[#66494a]">
              <Icon
                name={currentCopy.icon}
                size="18px"
                className={cn(status === 'starting' && 'animate-spin')}
              />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-800">
                {currentCopy.title}
              </p>
              <p className="mt-0.5 line-clamp-2 text-[9.5px] leading-snug font-medium text-slate-500">
                {currentCopy.detail}
              </p>
            </div>
            {showRetry && (
              <button
                type="button"
                onClick={handleRetry}
                className="ml-auto shrink-0 rounded-lg bg-[#66494a]/10 px-2 py-1.5 text-[8.5px] font-extrabold uppercase tracking-wider text-[#66494a] active:scale-95"
              >
                Reintentar
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default QrScannerInput;
