import React, { useEffect } from 'react';
import { Modal } from './modal';
import { Icon } from './icon';

export const ImageViewer = ({ images, index, onClose, onNavigate }) => {
    const isOpen = index !== null && images?.length > 0;

    // Agregar soporte para navegación con teclado
    useEffect(() => {
        if (!isOpen) return;
        
        const handleKeyDown = (e) => {
            if (e.key === 'ArrowRight') {
                onNavigate((index + 1) % images.length);
            } else if (e.key === 'ArrowLeft') {
                onNavigate((index - 1 + images.length) % images.length);
            } else if (e.key === 'Escape') {
                onClose();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, index, images?.length, onNavigate, onClose]);

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            className="bg-transparent shadow-none w-full max-w-none h-full flex items-center justify-center p-0"
        >
            <div className="relative w-full h-full flex flex-col items-center justify-center pointer-events-none">
                {/* Header Overlay */}
                <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between z-50 pointer-events-auto">
                    {images?.length > 1 ? (
                        <span className="text-white/80 text-sm font-bold bg-black/40 px-3 py-1 rounded-full drop-shadow">
                            {index + 1} / {images.length}
                        </span>
                    ) : <div />}
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex items-center justify-center shrink-0 w-10 h-10 text-white bg-black/40 hover:bg-black/60 rounded-full transition-colors active:scale-90 cursor-pointer"
                    >
                        <Icon name="close" size="md" />
                    </button>
                </div>

                {/* Left Arrow */}
                {images?.length > 1 && (
                    <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); onNavigate((index - 1 + images.length) % images.length); }}
                        className="absolute left-2 md:left-6 flex items-center justify-center shrink-0 w-10 h-10 md:w-12 md:h-12 text-white bg-black/40 hover:bg-black/60 rounded-full z-50 active:scale-90 cursor-pointer transition-colors pointer-events-auto"
                    >
                        <Icon name="chevron_left" size="md" />
                    </button>
                )}

                {/* Imagen */}
                {isOpen && (
                    <img
                        src={images[index]}
                        alt={`Evidencia ${index + 1}`}
                        className="max-w-full max-h-full object-contain drop-shadow-2xl pointer-events-auto"
                        onClick={(e) => e.stopPropagation()}
                    />
                )}

                {/* Right Arrow */}
                {images?.length > 1 && (
                    <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); onNavigate((index + 1) % images.length); }}
                        className="absolute right-2 md:right-6 flex items-center justify-center shrink-0 w-10 h-10 md:w-12 md:h-12 text-white bg-black/40 hover:bg-black/60 rounded-full z-50 active:scale-90 cursor-pointer transition-colors pointer-events-auto"
                    >
                        <Icon name="chevron_right" size="md" />
                    </button>
                )}
            </div>
        </Modal>
    );
};
