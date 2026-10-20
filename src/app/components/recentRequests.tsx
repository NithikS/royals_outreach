"use client";

import React from "react";
import SectionHead from "./sectionHead";
import SaveButton from "./saveButton";
import RequestRow, { HourRequest } from "./requestRow";
import EmptyState from "./emptyState";

type RecentRequestsProps = {
  requests?: HourRequest[];
  title?: string;
  /** Button beside the section head; hidden when no handler is given. */
  actionLabel?: string;
  onViewAll?: () => void;
  /** Hide the club on single-club pages (All Clubs club view). */
  showClub?: boolean;
  emptyMessage?: string;
  className?: string;
};

const DEFAULT_REQUESTS: HourRequest[] = [
  { id: 1, opportunity: "Park Cleanup", club: "Key Club", date: "Oct 2", hours: 2, status: "Pending" },
  { id: 2, opportunity: "Bake Sale Setup", club: "Art Club", date: "Sep 30", hours: 1, status: "Pending" },
  { id: 3, opportunity: "Food Pantry Pack-Out", club: "Key Club", date: "Sep 27", hours: 3, status: "Approved" },
];

export default function RecentRequests({
  requests = DEFAULT_REQUESTS,
  title = "Recent Requests",
  actionLabel = "All Requests",
  onViewAll,
  showClub = true,
  emptyMessage = "You have not logged any hours yet.",
  className = "",
}: RecentRequestsProps) {
  return (
    <section className={className || undefined}>
      <SectionHead
        action={
          onViewAll && (
            <SaveButton size="sm" icon="inbox" onClick={onViewAll}>
              {actionLabel}
            </SaveButton>
          )
        }
      >
        {title}
      </SectionHead>
      {requests.length === 0 ? (
        <EmptyState message={emptyMessage} size="sm" />
      ) : (
        <div>
          {requests.map((r) => (
            <RequestRow key={r.id} request={r} layout="inline" showClub={showClub} />
          ))}
        </div>
      )}
    </section>
  );
}
