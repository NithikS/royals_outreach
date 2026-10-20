"use client";

import React from "react";
import "bootstrap-icons/font/bootstrap-icons.css";
import ListRow from "./listRow";
import Badge from "./badge";
import SaveButton from "./saveButton";
import IconButton from "./iconButton";
import "./requestRow.css";
import { formatHours } from "@/lib/formatHours";
import { fullName, type PersonName } from "@/lib/personName";

export type HourRequestStatus = "Pending" | "Approved" | "Denied";

export type HourRequest = {
  id: string | number;
  opportunity: string;
  student?: PersonName;
  club?: string;
  category?: string;
  /** Short date as shown in lists ("Oct 2"). */
  date: string;
  /** Full date for detail panels ("Sep 20, 2026"). */
  fullDate?: string;
  hours: number;
  status: HourRequestStatus;
  /** Pending and waiting on the coordinator's email verification. */
  awaitingEmail?: boolean;
  hasPhoto?: boolean;
  organization?: string;
  coordinator?: string;
  coordinatorEmail?: string;
  message?: string;
  denyMessage?: string;
};

export const STATUS_TONE: Record<HourRequestStatus, "pending" | "approved" | "denied"> = {
  Pending: "pending",
  Approved: "approved",
  Denied: "denied",
};

type RequestRowProps = {
  request?: HourRequest;
  /** "stacked" puts details on a second line (My Requests, club panel); "inline" keeps one line (Home, All Clubs). */
  layout?: "stacked" | "inline";
  /** Student name becomes the title and the opportunity moves to the details (club Hour Requests). */
  showStudent?: boolean;
  showClub?: boolean;
  showCategory?: boolean;
  showDate?: boolean;
  /** Pending rows waiting on a coordinator show an "Awaiting Email" badge instead of Pending. */
  showAwaitingEmail?: boolean;
  /** Set false to hide the Pending badge (club Pending tab, where every row is pending). */
  showPendingBadge?: boolean;
  divider?: "silver" | "blue" | "none";
  selected?: boolean;
  highlighted?: boolean;
  /** Makes the row clickable (master/detail lists). */
  onSelect?: (id: HourRequest["id"]) => void;
  /** Shows Approve on pending rows ("Override Approve" when awaiting email). */
  onApprove?: (id: HourRequest["id"]) => void;
  /** Shows Deny on pending rows. */
  onDeny?: (id: HourRequest["id"]) => void;
  /** Shows a pencil button to edit or override the request (any status). */
  onEdit?: (id: HourRequest["id"]) => void;
  className?: string;
};

const DEFAULT_REQUEST: HourRequest = {
  id: 1,
  opportunity: "Park Cleanup",
  club: "Key Club",
  category: "Service",
  date: "Oct 2",
  hours: 2,
  status: "Pending",
};

export default function RequestRow({
  request = DEFAULT_REQUEST,
  layout = "stacked",
  showStudent = false,
  showClub = true,
  showCategory = false,
  showDate = true,
  showAwaitingEmail = false,
  showPendingBadge = true,
  divider = "silver",
  selected = false,
  highlighted = false,
  onSelect,
  onApprove,
  onDeny,
  onEdit,
  className = "",
}: RequestRowProps) {
  const pending = request.status === "Pending";
  const awaiting = pending && !!request.awaitingEmail;

  const details = [
    showStudent ? request.opportunity : null,
    showClub ? request.club : null,
    showCategory ? request.category : null,
    showDate ? request.date : null,
  ].filter(Boolean);
  const detailText = details.length ? details.join(" · ") : undefined;
  const title = showStudent && request.student ? fullName(request.student) : request.opportunity;

  return (
    <ListRow
      title={title}
      inlineMeta={layout === "inline" ? detailText : undefined}
      subtitle={layout === "stacked" ? detailText : undefined}
      divider={divider}
      selected={selected}
      highlighted={highlighted}
      onClick={onSelect ? () => onSelect(request.id) : undefined}
      className={`request-row ${className}`.trim()}
      meta={
        <span className="request-row-meta">
          {request.hasPhoto && (
            <i className="bi bi-camera request-row-photo" title="Photo Attached" aria-label="Photo Attached" />
          )}
          <span className="request-row-hours">{formatHours(request.hours)}</span>
        </span>
      }
      trailing={
        <>
          {awaiting && showAwaitingEmail ? (
            <Badge tone="info">Awaiting Email</Badge>
          ) : (
            (!pending || showPendingBadge) && (
              <Badge tone={STATUS_TONE[request.status]}>{request.status}</Badge>
            )
          )}
          {((pending && (onApprove || onDeny)) || onEdit) && (
            <span className="request-row-actions">
              {pending && onApprove && (
                <SaveButton size="sm" onClick={() => onApprove(request.id)}>
                  {awaiting ? "Override Approve" : "Approve"}
                </SaveButton>
              )}
              {pending && onDeny && (
                <SaveButton size="sm" variant="danger" onClick={() => onDeny(request.id)}>
                  Deny
                </SaveButton>
              )}
              {onEdit && (
                <IconButton icon="pencil" label="Edit Or Override" size={20} onClick={() => onEdit(request.id)} />
              )}
            </span>
          )}
        </>
      }
    />
  );
}
