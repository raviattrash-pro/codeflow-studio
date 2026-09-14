import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContextType {
  toasts: Toast[];
  showToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    return {
      toasts: [],
      showToast: () => {},
      removeToast: () => {},
    };
  }
  return context;
};

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = 'toast_' + Math.random().toString(36).substring(2, 9);
    const newToast: Toast = { ...toast, id };
    setToasts((prev) => [...prev.slice(-4), newToast]); // keep max 5 toasts

    const duration = toast.duration ?? 3500;
    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ toasts, showToast, removeToast }}>
      {children}
      {/* Toast Render Portal */}
      <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => {
          const bgColors = {
            success: 'bg-[#0f172a] border-emerald-500/40 text-emerald-300 shadow-emerald-950/40',
            error: 'bg-[#0f172a] border-red-500/40 text-red-300 shadow-red-950/40',
            warning: 'bg-[#0f172a] border-amber-500/40 text-amber-300 shadow-amber-950/40',
            info: 'bg-[#0f172a] border-indigo-500/40 text-indigo-300 shadow-indigo-950/40',
          }[toast.type];

          const Icon = {
            success: CheckCircle2,
            error: AlertCircle,
            warning: AlertTriangle,
            info: Info,
          }[toast.type];

          const iconColors = {
            success: 'text-emerald-400',
            error: 'text-red-400',
            warning: 'text-amber-400',
            info: 'text-indigo-400',
          }[toast.type];

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl border shadow-xl backdrop-blur-md transition-all duration-300 transform translate-y-0 ${bgColors}`}
              role="alert"
            >
              <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${iconColors}`} />
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold text-white tracking-wide">{toast.title}</div>
                {toast.message && <div className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">{toast.message}</div>}
              </div>
              <button
                type="button"
                onClick={() => removeToast(toast.id)}
                className="text-slate-500 hover:text-slate-300 transition shrink-0 p-0.5 rounded cursor-pointer"
                aria-label="Dismiss notification"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};
