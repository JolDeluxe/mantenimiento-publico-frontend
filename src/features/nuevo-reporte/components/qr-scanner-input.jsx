import React, { useEffect, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { Icon } from '@/components/ui/z_index';

/**
 * Componente lector de códigos QR.
 */
export const QrScannerInput = ({ onScanSuccess, onScanError }) => {
  const successRef = useRef(onScanSuccess);
  const errorRef = useRef(onScanError);

  useEffect(() => {
    successRef.current = onScanSuccess;
    errorRef.current = onScanError;
  }, [onScanSuccess, onScanError]);

  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      'qr-reader',
      {
        fps: 12,
        qrbox: { width: 250, height: 250 },
        rememberLastUsedCamera: true,
        supportedScanTypes: [0],
        aspectRatio: 1.0,
      },
      false
    );

    const handleSuccess = (decodedText) => {
      scanner.clear()
        .then(() => {
          if (successRef.current) successRef.current(decodedText);
        })
        .catch((err) => {
          console.error('[QR] Error al limpiar scanner tras éxito:', err);
          if (successRef.current) successRef.current(decodedText);
        });
    };

    const handleError = (error) => {
      if (errorRef.current) errorRef.current(error);
    };

    scanner.render(handleSuccess, handleError);

    return () => {
      scanner.clear().catch(() => {
        console.debug('[QR] Scanner ya apagado o desmontado.');
      });
    };
  }, []);

  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="bg-white/70 backdrop-blur-md border border-white/30 rounded-2xl p-4 shadow-[0_8px_30px_rgba(0,0,0,0.02)] relative overflow-hidden">
        <div 
          id="qr-reader" 
          className="overflow-hidden rounded-xl border border-slate-100" 
        />
      </div>

      <div className="flex items-start gap-2.5 px-2 text-slate-500">
        <Icon name="info" className="text-sm mt-0.5 shrink-0" />
        <p className="text-[11px] leading-relaxed">
          Alinea el código QR del equipo dentro del cuadro indicador. Asegúrate de contar con buena iluminación.
        </p>
      </div>
    </div>
  );
};

export default QrScannerInput;
