"use client";

import { useRef, useState } from "react";
import ClubSectionHeader from "@/app/components/clubSectionHeader";
import SaveButton from "@/app/components/saveButton";
import Tabs from "@/app/components/tabs";
import FilterBar from "@/app/components/filterBar";
import Input from "@/app/components/input";
import RequestRow from "@/app/components/requestRow";
import DetailList, { type DetailItem } from "@/app/components/detailList";
import EmptyState from "@/app/components/emptyState";
import ConfirmDialog from "@/app/components/ConfirmDialog";
import EditHoursDialog from "@/app/components/EditHoursDialog";
import AddHoursDialog from "./addHoursDialog";
import "@/app/css/club.css";
import { useToast } from "@/app/context/ToastContext";
import { formatHours } from "@/lib/formatHours";
import { fullName } from "@/lib/personName";

import type { ClubCategory } from "@/actions/categories";
import type { ClubMember } from "@/actions/members";
import {
  approveClubRequest,
  deleteClubRequest,
  denyClubRequest,
  updateClubRequest,
  type ClubRequest,
} from "@/actions/clubRequests";

type HourRequestsUIProps = {
  clubId: number;
  clubName: string;
  requests: ClubRequest[];
  categories: ClubCategory[];
  /** Active members, the students hours can be added for. */
  members: ClubMember[];
  /** The school's date, so the forms match the server's check. */
  today: string;
};

type Dialog = { type: "add" } | { type: "edit" | "delete"; request: ClubRequest };
type EditResult = { saving: boolean; error: string };

const ALL = "all";

const TABS: { value: string; label: string; empty: string; matches: (request: ClubRequest) => boolean }[] = [
  {
    value: "pending",
    label: "Pending",
    empty: "No pending requests.",
    matches: (r) => r.status === "Pending Club Verification",
  },
  {
    value: "email",
    label: "Awaiting Email",
    empty: "No requests are waiting on a coordinator email.",
    matches: (r) => r.status === "Pending Email Verification",
  },
  { value: "approved", label: "Approved", empty: "No approved requests.", matches: (r) => r.status === "Approved" },
  { value: "denied", label: "Denied", empty: "No denied requests.", matches: (r) => r.status === "Denied" },
];

// A coordinator on a request past the email step verified it. Requests that only need the
// club have no coordinator, so they have nobody to show.
const approvedBy = (request: ClubRequest) => {
  if (request.status !== "Pending Club Verification" && request.status !== "Approved") return null;
  if (!request.coordinator) return null;
  return request.organization ? `${request.coordinator} at ${request.organization}` : request.coordinator;
};

export default function HourRequestsUI({ clubId, clubName, requests, categories, members, today }: HourRequestsUIProps) {
  const { showToast } = useToast();

  const [tab, setTab] = useState("pending");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState(ALL);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [dialog, setDialog] = useState<Dialog | null>(null);
  const [editState, setEditState] = useState<EditResult>({ saving: false, error: "" });
  const [isDeleting, setIsDeleting] = useState(false);
  const detailsRef = useRef<HTMLDivElement>(null);

  const current = TABS.find((t) => t.value === tab) ?? TABS[0];
  const query = search.trim().toLowerCase();
  const filtering = query !== "" || category !== ALL;

  const visible = requests.filter(
    (r) =>
      current.matches(r) &&
      (category === ALL || String(r.categoryId) === category) &&
      (!query || `${r.student ? fullName(r.student) : ""} ${r.opportunity}`.toLowerCase().includes(query)),
  );
  const selected = visible.find((r) => r.id === selectedId) ?? visible[0];

  const select = (id: ClubRequest["id"]) => {
    setSelectedId(id);
    // The details sit under the list on narrow screens
    detailsRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  };

  const openEdit = (request: ClubRequest) => {
    setEditState({ saving: false, error: "" });
    setDialog({ type: "edit", request });
  };

  const handleEdit = async (request: ClubRequest, edited: { hours: number; isoDate?: string; category?: string; status: ClubRequest["status"] }) => {
    if (editState.saving) return;

    const categoryId = categories.find((c) => c.categoryName === edited.category)?.categoryId ?? null;
    setEditState({ saving: true, error: "" });
    try {
      const result = await updateClubRequest(clubId, request.id, {
        hours: edited.hours,
        isoDate: edited.isoDate ?? request.isoDate,
        categoryId,
        status: edited.status,
      });
      if (result.success) {
        setDialog(null);
        setEditState({ saving: false, error: "" });
        showToast("Request updated.", "success");
      } else {
        setEditState({ saving: false, error: result.error });
      }
    } catch {
      setEditState({ saving: false, error: "Could not save your changes. Please try again." });
    }
  };

  const handleDelete = async (request: ClubRequest) => {
    if (isDeleting) return;

    setIsDeleting(true);
    try {
      const result = await deleteClubRequest(clubId, request.id);
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
    <div className="club-requests">
      {/* Header */}
      <ClubSectionHeader
        title="Hour Requests"
        subtitle="Review, approve and manage hours submitted to this club."
        clubName={clubName}
        actions={
          <SaveButton size="sm" variant="secondary" icon="plus-circle" onClick={() => setDialog({ type: "add" })}>
            Add Hours Manually
          </SaveButton>
        }
      />

      <Tabs
        ariaLabel="Filter Requests"
        tabs={TABS.map((t) => ({ value: t.value, label: t.label, count: requests.filter(t.matches).length }))}
        value={tab}
        onChange={setTab}
      />

      <FilterBar
        searchPlaceholder="Search Students Or Opportunities"
        searchValue={search}
        onSearchChange={setSearch}
        selects={
          categories.length > 0
            ? [
                {
                  name: "category",
                  value: category,
                  options: [
                    { value: ALL, label: "All Categories" },
                    ...categories.map((c) => ({ value: String(c.categoryId), label: c.categoryName })),
                  ],
                },
              ]
            : []
        }
        onSelectChange={(_, value) => setCategory(value)}
      />

      {visible.length === 0 ? (
        <EmptyState icon="inbox" message={filtering ? "No requests match your filters." : current.empty} />
      ) : (
        <div className="club-requests-body">
          {/* List */}
          <div className="club-requests-list">
            {visible.map((r) => (
              <RequestRow
                key={r.id}
                request={r}
                showStudent
                showClub={false}
                showCategory
                showDate={false}
                showPendingBadge={false}
                selected={r.id === selected?.id}
                onSelect={(id) => select(Number(id))}
              />
            ))}
          </div>

          {/* Details */}
          <div ref={detailsRef}>
            {selected && (
              <RequestDetails
                key={selected.id}
                clubId={clubId}
                request={selected}
                onEdit={() => openEdit(selected)}
              />
            )}
          </div>
        </div>
      )}

      {/* Dialogs */}
      {dialog?.type === "add" && (
        <AddHoursDialog
          clubId={clubId}
          categories={categories}
          members={members}
          today={today}
          onClose={() => setDialog(null)}
          onAdded={(requestId) => {
            setDialog(null);
            setTab("approved");
            setSearch("");
            setCategory(ALL);
            setSelectedId(requestId);
            showToast("Hours added.", "success");
          }}
        />
      )}
      {dialog?.type === "edit" && (
        <EditHoursDialog
          key={dialog.request.id}
          title="Edit Request"
          width="640px"
          request={dialog.request}
          categories={categories.map((c) => c.categoryName)}
          saving={editState.saving}
          error={editState.error}
          onClose={() => setDialog(null)}
          onSave={(edited) => handleEdit(dialog.request, edited)}
          onDelete={() => setDialog({ type: "delete", request: dialog.request })}
        />
      )}
      {dialog?.type === "delete" && (
        <ConfirmDialog
          title="Delete Request"
          message={`Delete ${dialog.request.opportunity} for ${dialog.request.student ? fullName(dialog.request.student) : "this student"}? This cannot be undone.`}
          confirmLabel={isDeleting ? "Deleting..." : "Delete Request"}
          onConfirm={() => handleDelete(dialog.request)}
          onClose={() => setDialog(null)}
        />
      )}
    </div>
  );
}

type RequestDetailsProps = {
  clubId: number;
  request: ClubRequest;
  onEdit: () => void;
};

function RequestDetails({ clubId, request, onEdit }: RequestDetailsProps) {
  const { showToast } = useToast();

  const [denyMessage, setDenyMessage] = useState("");
  const [isReviewing, setIsReviewing] = useState(false);

  const canReview = request.status === "Pending Email Verification" || request.status === "Pending Club Verification";
  const approver = approvedBy(request);

  const review = async (action: () => Promise<{ success: true } | { success: false; error: string }>, message: string) => {
    if (isReviewing) return;

    setIsReviewing(true);
    try {
      const result = await action();
      if (result.success) showToast(message, "success");
      else showToast(result.error, "danger");
    } catch {
      showToast("Could not save this review. Please try again.", "danger");
    } finally {
      setIsReviewing(false);
    }
  };

  const items: DetailItem[] = [
    { label: "Date", value: request.fullDate },
    { label: "Hours", value: formatHours(request.hours) },
    ...(approver
      ? [
          { label: "Approved By", value: approver, full: true },
          ...(request.coordinatorEmail ? [{ label: "Coordinator Email", value: request.coordinatorEmail, full: true }] : []),
        ]
      : [
          ...(request.status === "Pending Email Verification"
            ? [
                {
                  label: "Verification",
                  value: request.coordinator ? "Not Yet Verified" : "The student has not added a coordinator yet.",
                  full: true,
                },
              ]
            : []),
          ...(request.organization ? [{ label: "Organization", value: request.organization }] : []),
          ...(request.coordinator
            ? [{ label: "Coordinator", value: [request.coordinator, request.coordinatorEmail].filter(Boolean).join(" · ") }]
            : []),
        ]),
    ...(request.message ? [{ label: "Student Message", value: request.message, full: true }] : []),
    ...(request.denyMessage
      ? [{ label: "Deny Message", value: request.denyMessage, full: true, tone: "danger" as const }]
      : []),
  ];

  return (
    <div className="club-requests-details">
      <div>
        <h2 className="club-requests-details-title">{request.student ? fullName(request.student) : request.opportunity}</h2>
        <div className="club-requests-details-subtitle">
          {[request.opportunity, request.category].filter(Boolean).join(" · ")}
        </div>
      </div>

      <DetailList items={items} columns={2} layout="stacked" />

      {canReview && (
        <>
          <Input
            label="Deny Message (Optional)"
            multiline
            rows={3}
            placeholder="Shown to the student if you deny this request."
            value={denyMessage}
            onChange={(e) => setDenyMessage(e.target.value)}
          />
          <div className="club-requests-review">
            <SaveButton
              fullWidth
              disabled={isReviewing}
              onClick={() => review(() => approveClubRequest(clubId, request.id), "Hours approved.")}
            >
              {request.status === "Pending Email Verification" ? "Override Approve" : "Approve"}
            </SaveButton>
            <SaveButton
              fullWidth
              variant="danger"
              disabled={isReviewing}
              onClick={() => review(() => denyClubRequest(clubId, request.id, denyMessage), "Request denied.")}
            >
              Deny
            </SaveButton>
          </div>
        </>
      )}

      <SaveButton fullWidth variant="secondary" icon="pencil" disabled={isReviewing} onClick={onEdit}>
        Edit Or Override
      </SaveButton>
    </div>
  );
}
