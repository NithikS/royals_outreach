import React from "react";
import SaveButton from "./saveButton";
import "../css/club.css";

type ClubSaveBarProps = {
  /** Enables Discard and Save Changes and shows the unsaved message. */
  dirty?: boolean;
  onDiscard?: () => void;
  onSave?: () => void;
  dirtyText?: string;
  cleanText?: string;
  saveLabel?: string;
  discardLabel?: string;
  className?: string;
};

export default function ClubSaveBar({
  dirty = false,
  onDiscard,
  onSave,
  dirtyText = "You have unsaved changes.",
  cleanText = "All changes saved.",
  saveLabel = "Save Changes",
  discardLabel = "Discard",
  className = "",
}: ClubSaveBarProps) {
  return (
    <div className={`club-save-bar ${className}`.trim()}>
      <span className="club-save-bar-text" aria-live="polite">
        {dirty ? dirtyText : cleanText}
      </span>
      <div className="club-save-bar-buttons">
        <SaveButton variant="secondary" disabled={!dirty} onClick={onDiscard}>
          {discardLabel}
        </SaveButton>
        <SaveButton icon="check-lg" disabled={!dirty} onClick={onSave}>
          {saveLabel}
        </SaveButton>
      </div>
    </div>
  );
}
