"use client";

import React from "react";
import "bootstrap-icons/font/bootstrap-icons.css";
import ListRow, { ListRowDate } from "./listRow";
import SaveButton from "./saveButton";
import IconButton from "./iconButton";
import Badge from "./badge";
import ProgressBar from "./progressBar";
import "./opportunityCard.css";
import { formatHours } from "@/lib/formatHours";

export type Opportunity = {
  id: string | number;
  name: string;
  /** Three-letter month of the next date ("OCT"). */
  month: string;
  day: string | number;
  /** Count of extra dates after the first, shown as "+2 More" (manage variant). */
  moreDates?: number;
  /** Every date as typed by the club ("Oct 24, Oct 31, Nov 7"); manage variant. */
  dateLabel?: string;
  club?: string;
  time?: string;
  location?: string;
  category?: string;
  hours: number;
  /** Total slots; leave unset for unlimited. */
  slots?: number;
  /** Slots already taken (registered students). */
  taken?: number;
  slotsPerStudent?: number;
};

type OpportunityCardVariant = "open" | "mine" | "compact" | "manage";

type OpportunityCardProps = {
  opportunity?: Opportunity;
  /** "open" is a student Open Sign Ups row, "mine" a My Sign Ups row, "compact" an
   *  Upcoming Events row, "manage" a club panel row with a slots bar and Registered button. */
  variant?: OpportunityCardVariant;
  /** The student is signed up: shows the Registered badge and swaps Sign Up for Cancel. */
  signedUp?: boolean;
  onSignUp?: (id: Opportunity["id"]) => void;
  onCancel?: (id: Opportunity["id"]) => void;
  /** Manage variant: opens the registered students list. */
  onViewRegistered?: (id: Opportunity["id"]) => void;
  /** Adds a pencil Edit button at the end of the row in any variant. */
  onEdit?: (id: Opportunity["id"]) => void;
  signUpLabel?: string;
  cancelLabel?: string;
  registeredLabel?: string;
  fullLabel?: string;
  /** Row selected in a master/detail list. */
  selected?: boolean;
  onClick?: () => void;
  className?: string;
};

const DEFAULT_OPPORTUNITY: Opportunity = {
  id: "food",
  name: "Food Pantry Pack-Out",
  month: "OCT",
  day: "10",
  club: "Key Club",
  time: "9:00 AM to 12:00 PM",
  location: "Fishers Community Pantry",
  category: "Service",
  hours: 3,
  slots: 12,
  taken: 4,
  slotsPerStudent: 1,
};

export default function OpportunityCard({
  opportunity = DEFAULT_OPPORTUNITY,
  variant = "open",
  signedUp = false,
  onSignUp,
  onCancel,
  onViewRegistered,
  onEdit,
  signUpLabel = "Sign Up",
  cancelLabel = "Cancel",
  registeredLabel = "Registered",
  fullLabel = "Full",
  selected = false,
  onClick,
  className = "",
}: OpportunityCardProps) {
  const o = opportunity;
  const hours = formatHours(o.hours);
  const taken = o.taken ?? 0;
  const hasSlots = o.slots != null;
  const full = hasSlots && taken >= (o.slots ?? 0);
  const perStudent =
    o.slotsPerStudent && o.slotsPerStudent > 1 ? `${o.slotsPerStudent} Per Student` : "";

  // Trailing buttons sit beside (not inside) the row button, so no stopPropagation is needed
  const act = (fn?: (id: Opportunity["id"]) => void) => () => fn?.(o.id);

  const editButton = onEdit && (
    <IconButton icon="pencil" label="Edit" size={22} onClick={act(onEdit)} />
  );

  // Sign Up / Cancel toggle shared by the student variants
  const signUpButton = signedUp ? (
    <SaveButton variant="secondary" size="sm" onClick={act(onCancel)} fullWidth>
      {cancelLabel}
    </SaveButton>
  ) : (
    <SaveButton size="sm" onClick={act(onSignUp)} disabled={full} fullWidth>
      {full ? fullLabel : signUpLabel}
    </SaveButton>
  );

  const rowProps = {
    title: o.name,
    titleSize: "lg" as const,
    density: "roomy" as const,
    selected,
    onClick,
    className: `opportunity-card opportunity-card-${variant} ${className}`.trim(),
  };

  const locationLine = o.location && (
    <div>
      <i className="bi bi-geo-alt" aria-hidden="true" />
      &nbsp; {o.location}
    </div>
  );

  if (variant === "manage") {
    const subtitle = [o.dateLabel ?? `${o.month} ${o.day}`, o.time, o.category, hours]
      .filter(Boolean)
      .join(" · ");

    return (
      <ListRow
        {...rowProps}
        leading={
          <ListRowDate
            variant="accent"
            month={o.month}
            day={o.day}
            note={o.moreDates ? `+${o.moreDates} More` : undefined}
          />
        }
        subtitle={subtitle}
        trailing={
          <>
            {hasSlots && (
              <div className="opportunity-card-slots">
                <ProgressBar value={taken} goal={o.slots} label="" showValue={false} height={12} />
                <span className="opportunity-card-slots-line">
                  {taken} / {o.slots} Slots
                  {perStudent && ` · ${perStudent}`}
                </span>
              </div>
            )}
            {onViewRegistered && (
              <SaveButton variant="secondary" size="sm" icon="people" onClick={act(onViewRegistered)}>
                {registeredLabel} ({taken})
              </SaveButton>
            )}
            {editButton}
          </>
        }
      />
    );
  }

  if (variant === "compact") {
    return (
      <ListRow
        {...rowProps}
        leading={<ListRowDate variant="plain" month={o.month} day={o.day} />}
        subtitle={[o.club, o.time].filter(Boolean).join(" · ")}
        meta={hours}
        trailing={editButton || undefined}
      />
    );
  }

  if (variant === "mine") {
    return (
      <ListRow
        {...rowProps}
        leading={<ListRowDate variant="plain" month={o.month} day={o.day} />}
        subtitle={[o.club, o.time].filter(Boolean).join(" · ")}
        meta={<span className="opportunity-card-hours">{hours}</span>}
        trailing={
          <>
            <span className="opportunity-card-action">
              <SaveButton variant="secondary" size="sm" onClick={act(onCancel)} fullWidth>
                {cancelLabel}
              </SaveButton>
            </span>
            {editButton}
          </>
        }
      >
        {locationLine}
      </ListRow>
    );
  }

  // Open sign ups
  return (
    <ListRow
      {...rowProps}
      leading={<ListRowDate variant="plain" month={o.month} day={o.day} />}
      meta={
        <>
          {hasSlots && (
            <span className="opportunity-card-spots">
              {taken} of {o.slots} spots taken
              {perStudent && ` · ${perStudent}`}
            </span>
          )}
          <span className="opportunity-card-hours">{hours}</span>
        </>
      }
      trailing={
        <>
          <span className="opportunity-card-badge">
            {signedUp && <Badge tone="approved">{registeredLabel}</Badge>}
          </span>
          <span className="opportunity-card-action">{signUpButton}</span>
          {editButton}
        </>
      }
      subtitle={
        o.time && (
          <>
            <i className="bi bi-clock" aria-hidden="true" />
            &nbsp; {o.time}
          </>
        )
      }
    >
      {locationLine}
    </ListRow>
  );
}
