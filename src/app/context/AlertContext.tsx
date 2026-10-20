"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";

type AlertType = "success" | "danger" | "warning" | "info";

export interface Alert {
  message: string;
  type: AlertType;
}

export interface AlertContextType {
  alert: Alert | null;
  showAlert: (message: string, type?: AlertType) => void;
  clearAlert: () => void;
}

const AlertContext = createContext<AlertContextType | null>(null);

export function AlertProvider({ children }: { children: React.ReactNode }) {
  const [alert, setAlert] = useState<Alert | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Clear a pending auto dismiss when the provider unmounts
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  function showAlert(message: string, type: AlertType = "success") {
    setAlert({ message, type });

    // Auto dismiss after 10 seconds, restarting the timer for each new alert
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setAlert(null), 10000);
  }

  function clearAlert() {
    if (timerRef.current) clearTimeout(timerRef.current);
    setAlert(null);
  }

  return (
    <AlertContext.Provider value={{ alert, showAlert, clearAlert }}>
      {children}
    </AlertContext.Provider>
  );
}

export function useAlert(): AlertContextType {
  const ctx = useContext(AlertContext);
  if (!ctx) {
    throw new Error("useAlert must be used inside <AlertProvider>");
  }
  return ctx;
}
