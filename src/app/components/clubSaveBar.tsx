import React from "react";
import SaveButton from "./saveButton";
import "../css/club.css";

type ClubSaveBarProps = {
  /** Enables Discard and Save Changes and shows the unsaved message. */
  dirty?: boolean;
  /** A save is running: shows the saving message and disables both buttons. */
  saving?: boolean;
  onDiscard?: () => void;
  onSave?: () => void;
  dirtyText?: string;
  cleanText?: string;
  savingText?: string;
  saveLabel?: string;
  discardLabel?: string;
  className?: string;
};

export default function ClubSaveBar({
  dirty = false,
  saving = false,
  onDiscard,
  onSave,
  dirtyText = "You have unsaved changes.",
  cleanText = "All changes saved.",
  savingText = "Saving...",
  saveLabel = "Save Changes",
  discardLabel = "Discard",
  className = "",
}: ClubSaveBarProps) {
  return (
    <div className={`club-save-bar ${className}`.trim()}>
      <span className="club-save-bar-text" aria-live="polite">
        {saving ? savingText : dirty ? dirtyText : cleanText}
      </span>
      <div className="club-save-bar-buttons">
        <SaveButton variant="secondary" disabled={!dirty || saving} onClick={onDiscard}>
          {discardLabel}
        </SaveButton>
        <SaveButton icon="check-lg" disabled={!dirty || saving} onClick={onSave}>
          {saveLabel}
        </SaveButton>
      </div>
    </div>
  );
}
