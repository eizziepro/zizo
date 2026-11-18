import React, { useEffect } from 'react';
import { XClose } from '@untitledui/icons';

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  width?: 'md' | 'lg' | 'xl' | '2xl';
}

export const Drawer: React.FC<DrawerProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  width = 'lg',
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const widthClass = {
    md: 'max-w-md',
    lg: 'max-w-xl',
    xl: 'max-w-2xl',
    '2xl': 'max-w-3xl',
  }[width];

  return (
    <div className="fixed inset-0 z-[120] overflow-hidden" role="dialog" aria-modal="true">
      <div
        className="fixed inset-0 bg-[#17191A]/60 backdrop-blur-xs transition-opacity duration-300"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div
          className={`w-screen ${widthClass} bg-white border-l border-[#E1E0DD] shadow-2xl flex flex-col justify-between text-left`}
        >
          <div className="p-6 border-b border-[#E1E0DD] flex items-start justify-between gap-4">
            <div className="space-y-1">
              {title && <h2 className="text-xl font-semibold text-[#17191A]">{title}</h2>}
              {description && <p className="text-xs text-[#5D5E5F]">{description}</p>}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-[6px] p-1.5 text-[#5D5E5F] hover:text-[#17191A] hover:bg-[#F0EFEC] transition-colors"
              aria-label="Close drawer"
            >
              <XClose className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6">{children}</div>

          {footer && (
            <div className="p-6 border-t border-[#E1E0DD] bg-[#FAF9F6] flex items-center justify-end gap-3">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
