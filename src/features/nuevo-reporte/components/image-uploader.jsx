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
    <div className="flex flex-col gap-3 mt-4 mb-4">
      <div className="flex items-center justify-between">
        <label className="text-sm font-bold text-slate-700">Evidencia Fotográfica (Opcional)</label>
        <span className="text-xs text-slate-500 font-medium bg-slate-100 px-2 py-0.5 rounded-full">
          {imagenes.length} / {maxImages}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {imagenes.map((img, idx) => (
          <div key={idx} className="relative aspect-square rounded-xl bg-slate-100 border border-slate-200 overflow-hidden group">
            <img 
              src={URL.createObjectURL(img)} 
              alt={`evidencia-${idx}`} 
              className="w-full h-full object-cover"
            />
            <button
              type="button"
              onClick={() => handleRemoveImage(idx)}
              className="absolute top-1.5 right-1.5 w-7 h-7 bg-white/90 hover:bg-white text-rose-500 rounded-full flex items-center justify-center shadow-sm opacity-90 hover:opacity-100 transition-all"
            >
              <Icon name="close" size="sm" />
            </button>
          </div>
        ))}

        {!hasReachedMax && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="aspect-square flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 hover:bg-slate-100 hover:border-slate-400 transition-colors cursor-pointer text-slate-500"
          >
            <Icon name="add_a_photo" size="md" />
            <span className="text-[10px] font-semibold">Añadir Foto</span>
          </button>
        )}
      </div>

      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/png, image/jpeg, image/webp"
        multiple
        onChange={handleFileChange}
      />
      <p className="text-[11px] text-slate-500 font-medium">Puedes seleccionar hasta {maxImages} imágenes (.jpg, .png, .webp).</p>
    </div>
  );
};
