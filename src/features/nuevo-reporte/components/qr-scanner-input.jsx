import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Icon } from '@/components/ui/z_index';
import { cn } from '@/utils/cn';
import { HardReloadButton } from '@/components/ui/hard-reload-button';

/**
 * Lector de QR con UI propia.
 * Usa la cámara trasera por defecto y evita los controles nativos de html5-qrcode.
 */
export const QrScannerInput = ({ onScanSuccess, onScanError, isProcessing = false }) => {
  const readerIdRef = useRef(`qr-reader-${Math.random().toString(36).slice(2)}`);
  const scannerRef = useRef(null);
  const successRef = useRef(onScanSuccess);
  const errorRef = useRef(onScanError);

  const [status, setStatus] = useState('starting'); // starting | scanning | detected | error
  const [errorMessage, setErrorMessage] = useState('');
  const [detectedCode, setDetectedCode] = useState('');
  const [restartToken, setRestartToken] = useState(0);

  useEffect(() => {
    successRef.current = onScanSuccess;
    errorRef.current = onScanError;
  }, [onScanSuccess, onScanError]);

  useEffect(() => {
    let disposed = false;
    let scanLocked = false;
    const readerId = readerIdRef.current;
    const scanner = new Html5Qrcode(readerId, { verbose: false });
    scannerRef.current = scanner;

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
          const size = Math.floor(Math.min(viewfinderWidth, viewfinderHeight) * 0.68);
          const bounded = Math.max(170, Math.min(size, 250));
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
    setRestartToken((current) => current + 1);
  };

  return (
    <div className="flex flex-col gap-3 w-full">
      <div className="relative overflow-hidden rounded-2xl border border-white/50 bg-slate-950 shadow-[0_14px_40px_rgba(15,23,42,0.18)]">
        <div className="relative aspect-square max-h-[min(58dvh,320px)] min-h-[240px] w-full overflow-hidden bg-slate-900">
          <div
            id={readerIdRef.current}
            className={cn(
              'cuadra-qr-reader absolute inset-0 h-full w-full',
              status !== 'scanning' && 'opacity-35'
            )}
          />

          <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_34%,rgba(15,23,42,0.55)_35%,rgba(15,23,42,0.72)_100%)]" />

          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="relative h-[68%] w-[68%] max-h-[250px] max-w-[250px] rounded-3xl border border-white/50 shadow-[0_0_0_999px_rgba(15,23,42,0.18)]">
              <span className="absolute -top-0.5 -left-0.5 h-8 w-8 rounded-tl-3xl border-t-4 border-l-4 border-emerald-400" />
              <span className="absolute -top-0.5 -right-0.5 h-8 w-8 rounded-tr-3xl border-t-4 border-r-4 border-emerald-400" />
              <span className="absolute -bottom-0.5 -left-0.5 h-8 w-8 rounded-bl-3xl border-b-4 border-l-4 border-emerald-400" />
              <span className="absolute -bottom-0.5 -right-0.5 h-8 w-8 rounded-br-3xl border-b-4 border-r-4 border-emerald-400" />
              {status === 'scanning' && (
                <span className="absolute left-3 right-3 top-1/2 h-0.5 rounded-full bg-emerald-300/90 shadow-[0_0_18px_rgba(110,231,183,0.8)] animate-pulse" />
              )}
            </div>
          </div>

          <div className="absolute left-3 right-3 top-3 flex items-center justify-between gap-2">
            <div className="inline-flex min-w-0 items-center gap-1.5 rounded-full bg-black/35 px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-wider text-white backdrop-blur-md border border-white/15">
              <Icon name="photo_camera" size="12px" />
              <span className="truncate">Cámara trasera</span>
            </div>
            <HardReloadButton />
          </div>

          {status !== 'scanning' && (
            <div className="absolute inset-x-4 bottom-4 rounded-2xl border border-white/20 bg-black/45 p-3 text-white backdrop-blur-xl">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white/15">
                  <Icon
                    name={status === 'detected' ? 'check_circle' : status === 'error' ? 'error' : 'progress_activity'}
                    size="18px"
                    className={cn(status === 'starting' && 'animate-spin')}
                  />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-extrabold uppercase tracking-wider">
                    {status === 'detected'
                      ? isProcessing ? 'Vinculando equipo' : 'QR detectado'
                      : status === 'error'
                        ? 'Cámara no disponible'
                        : 'Iniciando cámara'}
                  </p>
                  <p className="mt-0.5 truncate text-[10.5px] font-medium text-white/75">
                    {status === 'detected'
                      ? detectedCode
                      : status === 'error'
                        ? errorMessage
                        : 'Permite el acceso a cámara para escanear.'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-start gap-2.5 px-2 text-slate-500">
        <Icon name="info" className="text-sm mt-0.5 shrink-0" />
        <p className="text-[11px] leading-relaxed">
          Apunta al código QR del equipo. También puedes usar ingreso por teclado si el código no se detecta.
        </p>
      </div>
    </div>
  );
};

export default QrScannerInput;
