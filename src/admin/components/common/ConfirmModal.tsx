import React from 'react';
import { Modal } from '../untitledui/Modal';
import { Button } from '../untitledui/Button';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  isLoading?: boolean;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  destructive = true,
  isLoading = false,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      description={description}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isLoading}>
            {cancelLabel}
          </Button>
          <Button
            variant={destructive ? 'destructive' : 'primary'}
            onClick={onConfirm}
            isLoading={isLoading}
          >
            {confirmLabel}
          </Button>
        </>
      }
    >
      <p className="text-sm text-[#5D5E5F]">
        This action cannot be undone. Please confirm you would like to proceed.
      </p>
    </Modal>
  );
};
