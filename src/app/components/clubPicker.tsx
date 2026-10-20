"use client";

import ClubCard from "./clubCard";
import "../css/student.css";

export type ClubPickerOption = {
  value: string;
  name: string;
  icon: string;
  /** Line under the name ("3 open events", "3 hrs approved"). */
  meta?: string;
};

type ClubPickerProps = {
  clubs?: ClubPickerOption[];
  /** "single" picks one club (Opportunities); "multi" checks several (Export Portfolio). */
  mode?: "single" | "multi";
  /** Selected club values. Single mode uses the first one. */
  selected?: string[];
  /** Called with the clicked club's value; the page updates `selected`. */
  onSelect?: (value: string) => void;
  /** Show every club selected and disable clicks (full portfolio). */
  locked?: boolean;
  ariaLabel?: string;
  className?: string;
};

const DEFAULT_CLUBS: ClubPickerOption[] = [
  { value: "Key Club", name: "Key Club", icon: "heart", meta: "4 open events" },
  { value: "Art Club", name: "Art Club", icon: "palette", meta: "2 open events" },
  { value: "Robotics Club", name: "Robotics Club", icon: "gear", meta: "1 open event" },
];

export default function ClubPicker({
  clubs = DEFAULT_CLUBS,
  mode = "single",
  selected = ["Key Club"],
  onSelect,
  locked = false,
  ariaLabel = "Clubs",
  className = "",
}: ClubPickerProps) {
  const multi = mode === "multi";

  return (
    <div className={`student-club-picker ${className}`.trim()} role="group" aria-label={ariaLabel}>
      {clubs.map((club) => {
        const isSelected = locked || (multi ? selected.includes(club.value) : selected[0] === club.value);

        return (
          <ClubCard
            key={club.value}
            variant="tile"
            name={club.name}
            icon={club.icon}
            meta={club.meta}
            selected={isSelected}
            checkable={multi}
            disabled={locked}
            onClick={() => onSelect?.(club.value)}
          />
        );
      })}
    </div>
  );
}
