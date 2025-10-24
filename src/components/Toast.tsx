'use client';

import { useEffect, useState } from 'react';

/**
 * Type de toast : 'success', 'error', 'info', 'warning'
 */
export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastProps {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
  onClose: (id: string) => void;
}

/**
 * Composant Toast individual
 */
function Toast({ id, message, type, duration = 4000, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => onClose(id), duration);
    return () => clearTimeout(timer);
  }, [id, duration, onClose]);

  const typeStyles = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-blue-500',
    warning: 'bg-yellow-500',
  };

  const icons = {
    success: '✓',
    error: '✕',
    info: 'ℹ',
    warning: '⚠',
  };

  return (
    <div
      className={`${typeStyles[type]} text-white px-6 py-3 rounded-lg shadow-lg flex items-center space-x-3 animate-slide-in-right`}
      role="alert"
    >
      <span className="text-xl font-bold">{icons[type]}</span>
      <span className="flex-1">{message}</span>
      <button
        onClick={() => onClose(id)}
        className="text-white/80 hover:text-white transition ml-4"
        aria-label="Fermer la notification"
      >
        ×
      </button>
    </div>
  );
}

/**
 * Hook pour gérer les toasts
 */
export function useToast() {
  const [toasts, setToasts] = useState<Array<{
    id: string;
    message: string;
    type: ToastType;
  }>>([]);

  const addToast = (message: string, type: ToastType = 'info', duration?: number) => {
    const id = `toast-${Date.now()}`;
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration || 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return { toasts, addToast, removeToast };
}

/**
 * Conteneur de toasts
 */
interface ToastContainerProps {
  toasts: Array<{ id: string; message: string; type: ToastType }>;
  onClose: (id: string) => void;
}

export function ToastContainer({ toasts, onClose }: ToastContainerProps) {
  return (
    <div className="fixed bottom-4 right-4 space-y-2 z-50 max-w-sm">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          id={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={onClose}
        />
      ))}
    </div>
  );
}




