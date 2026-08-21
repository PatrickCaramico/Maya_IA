import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
  maxWidth?: string;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  icon,
  maxWidth = '760px'
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
      <div 
        className="relative w-full card-nebula overflow-hidden flex flex-col max-h-[90vh]"
        style={{ maxWidth }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-nebula bg-nebula-elevated">
          <div className="flex items-center gap-3">
            {icon && (
              <div className="w-9 h-9 rounded-lg bg-pulse/20 text-pulse flex items-center justify-center border border-pulse/30">
                {icon}
              </div>
            )}
            <div>
              <h2 className="text-lg font-bold text-frost font-heading tracking-tight">{title}</h2>
              {subtitle && <p className="text-xs text-secondary">{subtitle}</p>}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-secondary hover:text-frost hover:bg-white/10 transition-colors"
            title="Fechar (Esc)"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {children}
        </div>
      </div>
    </div>
  );
};
