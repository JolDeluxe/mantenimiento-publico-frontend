// src/components/ui/modal.jsx
import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/utils/cn';
import { Icon } from './z_index';

export const Modal = ({
  isOpen,
  onClose,
  children,
  className = ""
}) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
    >
      <div
        className={cn(
          "bg-white rounded-2xl shadow-2xl relative flex flex-col max-h-[90vh] w-full max-w-2xl animate-in zoom-in-95 duration-200 overflow-hidden",
          className
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>,
    document.body
  );
};

export const ModalHeader = ({ title, onClose, className = "", children }) => (
  <div className={cn("shrink-0 p-5 border-b border-slate-100 relative bg-white", className)}>
    {children || (
      <h2 className="text-base font-bold text-slate-800 tracking-wider">
        {title}
      </h2>
    )}
    {onClose && (
      <button
        type="button"
        onClick={onClose}
        className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100"
        aria-label="Cerrar modal"
      >
        <Icon name="close" size="20px" />
      </button>
    )}
  </div>
);

export const ModalBody = ({ children, className = "" }) => (
  <div className={cn("grow overflow-y-auto overflow-x-hidden p-5 font-lectura custom-scrollbar", className)}>
    {children}
  </div>
);

export const ModalFooter = ({ children, className = "" }) => (
  <div className={cn("shrink-0 flex items-center justify-end gap-3 p-4 px-5 border-t border-slate-100 bg-slate-50/80 rounded-b-2xl", className)}>
    {children}
  </div>
);