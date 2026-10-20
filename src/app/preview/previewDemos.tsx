"use client";

import React, { useState } from "react";
import SaveButton from "../components/saveButton";
import SideNav from "../components/sideNav";
import UserMenu from "../components/userMenu";
import { useToast } from "../context/ToastContext";
import { useAlert } from "../context/AlertContext";

const TYPES = ["success", "info", "warning", "danger"] as const;

const MESSAGES: Record<(typeof TYPES)[number], string> = {
  success: "Hours submitted.",
  info: "Key Club added a new opportunity.",
  warning: "Coordinator email has not been verified yet.",
  danger: "Could not save changes.",
};

const VARIANTS = { success: "primary", info: "secondary", warning: "dashed", danger: "danger" } as const;

function ToastButtons() {
  const { showToast } = useToast();
  return (
    <div className="preview-button-row">
      {TYPES.map((type) => (
        <SaveButton key={type} size="sm" variant={VARIANTS[type]} onClick={() => showToast(MESSAGES[type], type)}>
          showToast(&quot;{type}&quot;)
        </SaveButton>
      ))}
    </div>
  );
}

function AlertButtons() {
  const { showAlert } = useAlert();
  return (
    <div className="preview-button-row">
      {TYPES.map((type) => (
        <SaveButton key={type} size="sm" variant={VARIANTS[type]} onClick={() => showAlert(MESSAGES[type], type)}>
          showAlert(&quot;{type}&quot;)
        </SaveButton>
      ))}
    </div>
  );
}

function UserMenuInNav(props: React.ComponentProps<typeof UserMenu>) {
  const [open, setOpen] = useState(props.open ?? true);
  return (
    <SideNav
      value="home"
      onUserClick={() => setOpen((o) => !o)}
      footer={<UserMenu {...props} open={open} onClose={() => setOpen(false)} />}
    />
  );
}

export const PreviewDemos = { ToastButtons, AlertButtons, UserMenuInNav };
