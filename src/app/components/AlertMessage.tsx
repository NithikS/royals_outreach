"use client";

import "bootstrap-icons/font/bootstrap-icons.css";
import "../css/components.css";
import { useAlert, type Alert } from "../context/AlertContext";

const ICONS: Record<Alert["type"], string> = {
  success: "bi-check-circle-fill",
  danger: "bi-x-circle-fill",
  warning: "bi-exclamation-triangle-fill",
  info: "bi-info-circle-fill",
};

export default function AlertMessage() {
  const { alert, clearAlert } = useAlert();

  if (!alert) return null;

  return (
    <div className={`alert-message alert-message-${alert.type}`} role="alert">
      <i className={`bi ${ICONS[alert.type]} alert-message-icon`} />

      <span className="alert-message-text">{alert.message}</span>

      <button
        type="button"
        className="alert-message-close"
        aria-label="Close"
        onClick={clearAlert}
      >
        <i className="bi bi-x-lg" />
      </button>
    </div>
  );
}
