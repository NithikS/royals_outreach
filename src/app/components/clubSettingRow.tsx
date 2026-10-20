import React from "react";
import ListRow from "./listRow";
import Switch from "./switch";
import "../css/club.css";

type ClubSettingRowProps = {
  title?: string;
  description?: React.ReactNode;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  /** "row" is a full-width divider row (Hour Rules); "compact" sits inside a category card. */
  variant?: "row" | "compact";
  disabled?: boolean;
  className?: string;
};

export default function ClubSettingRow({
  title = "Exec Needs Hours",
  description = "Student execs log hours like other members.",
  checked = false,
  onChange,
  variant = "row",
  disabled = false,
  className = "",
}: ClubSettingRowProps) {
  return (
    <ListRow
      title={title}
      subtitle={description}
      subtitleTone="muted"
      divider={variant === "row" ? "silver" : "none"}
      density={variant === "row" ? "roomy" : "default"}
      trailing={<Switch checked={checked} onChange={onChange} ariaLabel={title} disabled={disabled} />}
      className={`club-setting-row club-setting-row-${variant} ${className}`.trim()}
    />
  );
}
