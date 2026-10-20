import type { Metadata } from "next";
import "bootstrap/dist/css/bootstrap.min.css";
import "./css/globals.css";
import { AlertProvider } from "./context/AlertContext";
import AlertMessage from "./components/AlertMessage";
import { ToastProvider } from "./context/ToastContext";
import ToastStack from "./components/ToastStack";
import Providers from "./components/Providers";

export const metadata: Metadata = {
  title: "Royals Outreach",
  description: "Service-hour tracking for Hamilton Southeastern High School.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <AlertProvider>
            <ToastProvider>
              {/* The alert UI that appears at the top of the screen */}
              <AlertMessage />

              {/* The toast stack that appears in the bottom-right corner */}
              <ToastStack />

              {children}
            </ToastProvider>
          </AlertProvider>
        </Providers>
      </body>
    </html>
  );
}
