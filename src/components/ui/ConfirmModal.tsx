import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Modal } from './Modal';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: 'default' | 'danger';
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  tone = 'default',
  onConfirm,
  onCancel
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onCancel}
      title={title}
      subtitle="Confirme a ação antes de continuar"
      icon={<AlertTriangle size={18} />}
      maxWidth="540px"
    >
      <div className="space-y-5 text-left">
        <p className="text-sm text-secondary leading-relaxed">{message}</p>

        <div className="flex flex-wrap justify-end gap-2">
          <button type="button" onClick={onCancel} className="btn-ghost px-4 py-2 text-sm">
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={tone === 'danger' ? 'btn-primary px-4 py-2 text-sm bg-alert hover:bg-alert/90' : 'btn-primary px-4 py-2 text-sm'}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
};