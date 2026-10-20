"use client";

import { createContext, useCallback, useContext, useState } from "react";

export type ToastType = "success" | "danger" | "warning" | "info";

export interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

export interface ToastContextType {
  toasts: Toast[];
  showToast: (message: string, type?: ToastType) => void;
  removeToast: (id: number) => void;
}

const MAX_VISIBLE_TOASTS = 3;

const ToastContext = createContext<ToastContextType | null>(null);

let toastIdCounter = 0;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, type: ToastType = "success") => {
      const id = ++toastIdCounter;

      setToasts((prev) => {
        const next = [...prev, { id, message, type }];
        // Only keep the most recent MAX_VISIBLE_TOASTS on screen at once
        return next.slice(-MAX_VISIBLE_TOASTS);
      });

      setTimeout(() => removeToast(id), 4000);
    },
    [removeToast],
  );

  return (
    <ToastContext.Provider value={{ toasts, showToast, removeToast }}>
      {children}
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextType {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used inside <ToastProvider>");
  }
  return ctx;
}
