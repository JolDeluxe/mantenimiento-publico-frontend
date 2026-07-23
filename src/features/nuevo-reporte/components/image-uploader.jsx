import React, { useRef } from 'react';
import { Icon } from '@/components/ui/z_index';

export const ImageUploader = ({ imagenes = [], onImagesChange, maxImages = 3 }) => {
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (imagenes.length + files.length > maxImages) {
      alert(`Solo puedes subir un máximo de ${maxImages} imágenes en total.`);
      return;
    }
    onImagesChange([...imagenes, ...files]);
  };

  const handleRemoveImage = (indexToRemove) => {
    onImagesChange(imagenes.filter((_, idx) => idx !== indexToRemove));
  };

  const hasReachedMax = imagenes.length >= maxImages;

  return (
    <div className="flex flex-col gap-2 mt-2 mb-1">
      <div className="flex items-center justify-between">
        <label className="text-[10.5px] font-bold text-slate-500 uppercase tracking-wider">Evidencia Fotográfica (Opcional)</label>
        <span className="text-[9px] font-extrabold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
          {imagenes.length} / {maxImages}
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {!hasReachedMax && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-16 h-16 flex flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 hover:bg-slate-100 hover:border-slate-400 transition-colors cursor-pointer text-slate-500 shrink-0"
          >
            <Icon name="add_a_photo" size="sm" />
            <span className="text-[9px] font-bold">Añadir</span>
          </button>
        )}

        {imagenes.map((img, idx) => (
          <div key={idx} className="relative w-16 h-16 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden group shrink-0">
            <img 
              src={URL.createObjectURL(img)} 
              alt={`evidencia-${idx}`} 
              className="w-full h-full object-cover"
            />
            <button
              type="button"
              onClick={() => handleRemoveImage(idx)}
              className="absolute top-1 right-1 w-5 h-5 bg-white/90 hover:bg-white text-rose-500 rounded-full flex items-center justify-center shadow-sm opacity-90 hover:opacity-100 transition-all cursor-pointer"
            >
              <Icon name="close" size="xs" className="scale-75" />
            </button>
          </div>
        ))}
      </div>

      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/png, image/jpeg, image/webp"
        multiple
        onChange={handleFileChange}
      />
    </div>
  );
};
