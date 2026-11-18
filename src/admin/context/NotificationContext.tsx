import React, { createContext, useContext, useState, useCallback } from 'react';

export type NotificationVariant = 'success' | 'error' | 'warning' | 'info';

export interface ToastItem {
  id: string;
  title: string;
  description?: string;
  variant: NotificationVariant;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface NotificationContextType {
  toasts: ToastItem[];
  addToast: (toast: Omit<ToastItem, 'id'>) => void;
  removeToast: (id: string) => void;
  toast: (title: string, description?: string, variant?: NotificationVariant) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((toastData: Omit<ToastItem, 'id'>) => {
    const id = 'toast-' + Math.random().toString(36).substring(2, 9);
    const newToast: ToastItem = { ...toastData, id };
    setToasts((prev) => [...prev, newToast]);

    setTimeout(() => {
      removeToast(id);
    }, 5000);
  }, [removeToast]);

  const toast = useCallback((title: string, description?: string, variant: NotificationVariant = 'info') => {
    addToast({ title, description, variant });
  }, [addToast]);

  return (
    <NotificationContext.Provider value={{ toasts, addToast, removeToast, toast }}>
      {children}
      {/* Toast container floating bottom-right */}
      <div
        className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none"
        aria-live="polite"
      >
        {toasts.map((t) => {
          const borderClass =
            t.variant === 'success'
              ? 'border-emerald-500 bg-emerald-950/90 text-emerald-100'
              : t.variant === 'error'
              ? 'border-rose-500 bg-rose-950/90 text-rose-100'
              : t.variant === 'warning'
              ? 'border-amber-500 bg-amber-950/90 text-amber-100'
              : 'border-[#17645F] bg-[#17191A]/95 text-[#FAF9F6]';

          return (
            <div
              key={t.id}
              className={`pointer-events-auto rounded-[var(--radius,8px)] border p-4 shadow-xl backdrop-blur-sm transition-all duration-300 flex items-start justify-between gap-3 ${borderClass}`}
              role="alert"
            >
              <div className="space-y-1">
                <p className="font-semibold text-sm leading-tight">{t.title}</p>
                {t.description && <p className="text-xs opacity-90 leading-normal">{t.description}</p>}
                {t.action && (
                  <button
                    type="button"
                    onClick={() => {
                      t.action?.onClick();
                      removeToast(t.id);
                    }}
                    className="text-xs font-semibold underline mt-1.5 inline-block hover:opacity-80"
                  >
                    {t.action.label}
                  </button>
                )}
              </div>
              <button
                type="button"
                onClick={() => removeToast(t.id)}
                className="opacity-70 hover:opacity-100 text-xs shrink-0 p-1"
                aria-label="Close notification"
              >
                ✕
              </button>
            </div>
          );
        })}
      </div>
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
