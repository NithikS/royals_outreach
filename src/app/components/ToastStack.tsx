"use client";

import "bootstrap-icons/font/bootstrap-icons.css";
import "../css/components.css";
import { useToast, type Toast, type ToastType } from "../context/ToastContext";

const ICONS: Record<ToastType, string> = {
  success: "bi-check-circle-fill",
  danger: "bi-x-circle-fill",
  warning: "bi-exclamation-triangle-fill",
  info: "bi-info-circle-fill",
};

function ToastItem({
  toast,
  onClose,
}: {
  toast: Toast;
  onClose: () => void;
}) {
  return (
    <div
      className={`toast-item toast-item-${toast.type}`}
      role="status"
      aria-live="polite"
    >
      <i className={`bi ${ICONS[toast.type]} toast-item-icon`} />

      <span className="toast-item-message">{toast.message}</span>

      <button
        type="button"
        className="toast-item-close"
        aria-label="Close"
        onClick={onClose}
      >
        <i className="bi bi-x" />
      </button>
    </div>
  );
}

// Every toast floats in the bottom-right corner
export default function ToastStack() {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="toast-stack">
      {toasts.map((toast) => (
        <ToastItem
          key={toast.id}
          toast={toast}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
}
