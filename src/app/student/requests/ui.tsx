"use client";

import { useRef, useState } from "react";
import PageTitle from "@/app/components/pageTitle";
import SaveButton from "@/app/components/saveButton";
import Tabs from "@/app/components/tabs";
import RequestRow, { STATUS_TONE, isPendingStatus } from "@/app/components/requestRow";
import FormSection from "@/app/components/formSection";
import DetailList, { type DetailItem } from "@/app/components/detailList";
import Badge from "@/app/components/badge";
import EmptyState from "@/app/components/emptyState";
import ConfirmDialog from "@/app/components/ConfirmDialog";
import EditRequestDialog from "./editRequestDialog";
import "@/app/css/student.css";
import { useToast } from "@/app/context/ToastContext";
import { formatHours } from "@/lib/formatHours";

import { deleteMyRequest, type MyRequest } from "@/actions/hours";

type MyRequestsUIProps = {
  requests: MyRequest[];
  /** The school's date, so the edit form matches the server's check. */
  today: string;
};

type Dialog = { type: "edit" | "delete"; request: MyRequest };

const FILTERS: { value: string; label: string; matches: (request: MyRequest) => boolean }[] = [
  { value: "all", label: "All", matches: () => true },
  { value: "pending", label: "Pending", matches: (r) => isPendingStatus(r.status) },
  { value: "approved", label: "Approved", matches: (r) => r.status === "Approved" },
  { value: "denied", label: "Denied", matches: (r) => r.status === "Denied" },
];

// The category started needing email verification after this was logged
const needsCoordinator = (request: MyRequest) =>
  request.status === "Pending Email Verification" && !request.coordinatorEmail;

const pendingNote = (request: MyRequest) => {
  if (needsCoordinator(request)) return null;
  if (request.status === "Pending Email Verification") return "Waiting on your coordinator to verify by email.";
  if (request.status !== "Pending Club Verification") return null;
  return request.canChange
    ? "Waiting on your club to review this request."
    : "Your coordinator verified these hours. Waiting on your club to review this request.";
};

export default function MyRequestsUI({ requests, today }: MyRequestsUIProps) {
  const { showToast } = useToast();

  const [filter, setFilter] = useState("all");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [dialog, setDialog] = useState<Dialog | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const detailsRef = useRef<HTMLDivElement>(null);

  const current = FILTERS.find((f) => f.value === filter) ?? FILTERS[0];
  const visible = requests.filter(current.matches);
  const selected = visible.find((r) => r.id === selectedId) ?? visible[0];

  const select = (id: MyRequest["id"]) => {
    setSelectedId(id);
    // The details sit under the list on narrow screens
    detailsRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  };

  const handleDelete = async (request: MyRequest) => {
    if (isDeleting) return;

    setIsDeleting(true);
    try {
      const result = await deleteMyRequest(request.id);
      if (result.success) showToast("Request deleted.", "success");
      else showToast(result.error, "danger");
      setDialog(null);
    } catch {
      showToast("Could not delete this request. Please try again.", "danger");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="my-requests">
      {/* Header */}
      <div className="my-requests-header">
        <PageTitle align="left" subtitle="Every request you have submitted and where it stands." style={{ margin: 0 }}>
          My Requests
        </PageTitle>
        <SaveButton size="sm" icon="plus-circle" href="/student/log">
          Log Hours
        </SaveButton>
      </div>

      {requests.length === 0 ? (
        <EmptyState icon="inbox" message="You have not logged any hours yet." />
      ) : (
        <>
          <Tabs
            ariaLabel="Filter Requests"
            tabs={FILTERS.map((f) => ({ value: f.value, label: f.label, count: requests.filter(f.matches).length }))}
            value={filter}
            onChange={setFilter}
          />

          {visible.length === 0 ? (
            <EmptyState message={`You have no ${current.label.toLowerCase()} requests.`} />
          ) : (
            <div className="my-requests-body">
              {/* List */}
              <div className="my-requests-list">
                {visible.map((r) => (
                  <RequestRow
                    key={r.id}
                    request={r}
                    divider="blue"
                    selected={r.id === selected?.id}
                    notice={needsCoordinator(r) ? "Add Your Coordinator" : undefined}
                    onSelect={(id) => select(Number(id))}
                  />
                ))}
              </div>

              {/* Details */}
              <div ref={detailsRef}>
                {selected && (
                  <RequestDetails
                    request={selected}
                    onEdit={() => setDialog({ type: "edit", request: selected })}
                    onDelete={() => setDialog({ type: "delete", request: selected })}
                  />
                )}
              </div>
            </div>
          )}
        </>
      )}

      {/* Dialogs */}
      {dialog?.type === "edit" && (
        <EditRequestDialog
          key={dialog.request.id}
          request={dialog.request}
          today={today}
          onClose={() => setDialog(null)}
          onSaved={() => {
            setDialog(null);
            showToast("Request updated.", "success");
          }}
        />
      )}
      {dialog?.type === "delete" && (
        <ConfirmDialog
          title="Delete Request"
          message={`Delete ${dialog.request.opportunity}? This cannot be undone.`}
          confirmLabel={isDeleting ? "Deleting..." : "Delete Request"}
          onConfirm={() => handleDelete(dialog.request)}
          onClose={() => setDialog(null)}
        />
      )}
    </div>
  );
}

type RequestDetailsProps = {
  request: MyRequest;
  onEdit: () => void;
  onDelete: () => void;
};

function RequestDetails({ request, onEdit, onDelete }: RequestDetailsProps) {
  const note = pendingNote(request);

  const items: DetailItem[] = [
    { label: "Date", value: request.fullDate },
    { label: "Club", value: request.club },
    ...(request.category ? [{ label: "Category", value: request.category }] : []),
    { label: "Hours", value: formatHours(request.hours) },
    ...(request.organization ? [{ label: "Organization", value: request.organization }] : []),
    ...(request.coordinator ? [{ label: "Coordinator", value: request.coordinator }] : []),
    ...(request.coordinatorEmail ? [{ label: "Email", value: request.coordinatorEmail }] : []),
    ...(request.message ? [{ label: "Message", value: request.message }] : []),
  ];

  return (
    <FormSection
      title="Request Details"
      tone="blue"
      header="bar"
      columns={1}
      className="my-requests-panel"
      footer={
        request.canChange ? (
          <>
            <SaveButton size="sm" variant="danger" icon="trash" onClick={onDelete}>
              Delete
            </SaveButton>
            {needsCoordinator(request) ? (
              <SaveButton size="sm" icon="person-plus" onClick={onEdit}>
                Add Coordinator
              </SaveButton>
            ) : (
              <SaveButton size="sm" icon="pencil" onClick={onEdit}>
                Edit
              </SaveButton>
            )}
          </>
        ) : request.status === "Denied" ? (
          <SaveButton size="sm" variant="secondary" icon="plus-circle" href="/student/log">
            Log Again
          </SaveButton>
        ) : undefined
      }
    >
      <div className="my-requests-details">
        <h3 className="my-requests-details-title">{request.opportunity}</h3>
        <div>
          <Badge tone={STATUS_TONE[request.status]}>{request.status}</Badge>
        </div>
        {note && <p className="my-requests-note">{note}</p>}
        {needsCoordinator(request) && (
          <div className="my-requests-callout" role="status">
            <div className="my-requests-callout-title">Coordinator Needed</div>
            {request.category ?? "This category"} now needs coordinator email verification. Add your coordinator so they
            can verify these hours.
          </div>
        )}
        <DetailList items={items} size="sm" />
        {request.denyMessage && (
          <div className="my-requests-callout">
            <div className="my-requests-callout-title">Reason For Denial</div>
            {request.denyMessage}
          </div>
        )}
      </div>
    </FormSection>
  );
}
