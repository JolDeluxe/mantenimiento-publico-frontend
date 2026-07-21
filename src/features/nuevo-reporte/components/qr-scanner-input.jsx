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
    <div className="flex h-full min-h-0 w-full flex-col items-center justify-center gap-1.5">
      <div className="relative aspect-square w-[min(100%,280px,42dvh)] max-w-full overflow-hidden rounded-2xl border border-white/50 bg-slate-950 shadow-[0_10px_30px_rgba(15,23,42,0.16)]">
        <div className="relative h-full w-full overflow-hidden bg-slate-900">
          <div
            id={readerIdRef.current}
            className={cn(
              'cuadra-qr-reader absolute inset-0 h-full w-full',
              status !== 'scanning' && 'opacity-35'
            )}
          />

          <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_28%,rgba(15,23,42,0.50)_29%,rgba(15,23,42,0.72)_100%)]" />

          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="relative h-[64%] w-[64%] max-h-[190px] max-w-[190px] rounded-3xl border border-white/45 shadow-[0_0_0_999px_rgba(15,23,42,0.16)]">
              <span className="absolute -top-0.5 -left-0.5 h-6 w-6 rounded-tl-3xl border-t-4 border-l-4 border-emerald-400" />
              <span className="absolute -top-0.5 -right-0.5 h-6 w-6 rounded-tr-3xl border-t-4 border-r-4 border-emerald-400" />
              <span className="absolute -bottom-0.5 -left-0.5 h-6 w-6 rounded-bl-3xl border-b-4 border-l-4 border-emerald-400" />
              <span className="absolute -bottom-0.5 -right-0.5 h-6 w-6 rounded-br-3xl border-b-4 border-r-4 border-emerald-400" />
              {status === 'scanning' && (
                <span className="absolute left-3 right-3 top-1/2 h-0.5 rounded-full bg-emerald-300/90 shadow-[0_0_18px_rgba(110,231,183,0.8)] animate-pulse" />
              )}
            </div>
          </div>

          <div className="absolute left-2.5 right-2.5 top-2.5 flex items-center justify-between gap-2">
            <div className="inline-flex min-w-0 items-center gap-1.5 rounded-full bg-black/35 px-2.5 py-0.5 text-[8.5px] font-extrabold uppercase tracking-wider text-white backdrop-blur-md border border-white/15">
              <Icon name="photo_camera" size="12px" />
              <span className="truncate">Cámara trasera</span>
            </div>
            <button
              type="button"
              onClick={handleRetry}
              className="pointer-events-auto inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-[#66494a] backdrop-blur-md border border-white/70 shadow-sm active:scale-95"
              aria-label="Reiniciar escaneo"
            >
              <Icon name="refresh" size="16px" />
            </button>
          </div>

          {status === 'scanning' && (
            <div className="absolute inset-x-2.5 bottom-2.5 rounded-xl border border-white/15 bg-black/30 px-2.5 py-1.5 text-white/85 backdrop-blur-md">
              <div className="flex min-w-0 items-center gap-2">
                <Icon name="qr_code_scanner" size="14px" className="shrink-0" />
                <p className="truncate text-[10px] font-semibold">
                  Apunta al código QR del equipo.
                </p>
              </div>
            </div>
          )}

          {showStatusPanel && (
            <div className="absolute inset-x-2.5 bottom-2.5 rounded-xl border border-white/20 bg-black/50 p-2 text-white backdrop-blur-xl">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/15">
                  <Icon
                    name={currentCopy.icon}
                    size="18px"
                    className={cn(status === 'starting' && 'animate-spin')}
                  />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-extrabold uppercase tracking-wider">{currentCopy.title}</p>
                  <p className="mt-0.5 line-clamp-2 text-[9.5px] leading-snug font-medium text-white/75">
                    {currentCopy.detail}
                  </p>
                </div>
                {showRetry && (
                  <button
                    type="button"
                    onClick={handleRetry}
                    className="ml-auto shrink-0 rounded-lg bg-white/15 px-2 py-1.5 text-[8.5px] font-extrabold uppercase tracking-wider text-white active:scale-95"
                  >
                    Reintentar
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QrScannerInput;
