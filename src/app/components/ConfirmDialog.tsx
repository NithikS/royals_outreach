"use client";

import React from "react";
import ModalShell from "./ModalShell";
import SaveButton from "./saveButton";
import "../css/components.css";

type ConfirmDialogProps = {
  title?: string;
  message?: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  /** "danger" gives the confirm button the red delete style. */
  tone?: "danger" | "primary";
  onConfirm?: () => void;
  onClose?: () => void;
  width?: string;
};

export default function ConfirmDialog({
  title = "Delete Club",
  message = "Delete Key Club? Its categories, member groups and opportunities will be removed. Logged hours stay on student records.",
  confirmLabel = "Delete Club",
  cancelLabel = "Cancel",
  tone = "danger",
  onConfirm,
  onClose = () => {},
  width = "480px",
}: ConfirmDialogProps) {
  return (
    <ModalShell
      title={title}
      width={width}
      onClose={onClose}
      footer={
        <>
          <SaveButton variant="secondary" onClick={onClose}>
            {cancelLabel}
          </SaveButton>
          <SaveButton variant={tone} onClick={onConfirm}>
            {confirmLabel}
          </SaveButton>
        </>
      }
    >
      <p className="confirm-dialog-text">{message}</p>
    </ModalShell>
  );
}
