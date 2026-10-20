"use client";

import React, { useState } from "react";
import Input from "./input";
import Tabs from "./tabs";
import BannerHeader from "./bannerHeader";
import StatCard from "./statCard";
import SectionHead from "./sectionHead";
import Badge from "./badge";
import IconButton from "./iconButton";
import ProgressRing from "./progressRing";
import ProgressBar from "./progressBar";
import ListRow from "./listRow";
import EmptyState from "./emptyState";
import EditHoursDialog from "./EditHoursDialog";
import { HourRequest, STATUS_TONE } from "./requestRow";
import "./studentLookup.css";
import { formatHours } from "@/lib/formatHours";
import { plural } from "@/lib/plural";
import { fullName } from "@/lib/personName";

export type StudentClub = {
  name: string;
  /** Club hour goal for this student. */
  goal: number;
  /** Shows the Student Exec badge in Club Affiliations. */
  exec?: boolean;
  /** Empty means the club tracks general hours only (e.g. Robotics Club). */
  categories?: { name: string; goal: number }[];
  /** Member group inside this club, shown in the club-scoped detail row. */
  group?: string;
};

export type LookupStudent = {
  /** Unique key; also used as the selected tab value. */
  id: string;
  fName: string;
  lName: string;
  email: string;
  gradYear: number | string;
  /** School student ID, shown in the club view and matched by search. */
  studentId?: string;
  clubs: StudentClub[];
  logs: HourRequest[];
};

type StudentLookupProps = {
  students?: LookupStudent[];
  /**
   * Scope everything to one club (Club Executive Panel): only that club's logs,
   * a detail row with Member Group, three stat cards and Category Progress.
   */
  club?: string;
  /** Shows the pencil on each logged hours row and the Edit Logged Hours dialog. */
  editable?: boolean;
  /** Called with the edited log when Save Changes is pressed. */
  onSaveLog?: (log: HourRequest) => void;
  /** Most student tabs shown at once; extra matches get a "Showing 5 of N" line. */
  maxTabs?: number;
  query?: string;
  onQueryChange?: (query: string) => void;
  selectedId?: string;
  onSelect?: (id: string) => void;
  searchPlaceholder?: string;
  emptyText?: string;
  className?: string;
};

const DEFAULT_STUDENTS: LookupStudent[] = [
  {
    id: "aang",
    fName: "Aang",
    lName: "Smith",
    email: "asmith@hse.edu",
    gradYear: 2027,
    clubs: [
      { name: "Key Club", goal: 15, categories: [{ name: "Service", goal: 10 }, { name: "Event Help", goal: 5 }] },
      { name: "Art Club", goal: 8, exec: true, categories: [{ name: "Event Help", goal: 5 }, { name: "Fundraising", goal: 3 }] },
      { name: "Robotics Club", goal: 8, categories: [] },
    ],
    logs: [
      { id: 1, opportunity: "Park Cleanup", club: "Key Club", category: "Service", date: "Oct 2", hours: 2, status: "Pending" },
      { id: 2, opportunity: "Food Pantry Pack-Out", club: "Key Club", category: "Service", date: "Sep 27", hours: 3, status: "Approved" },
      { id: 3, opportunity: "Bake Sale Setup", club: "Art Club", category: "Event Help", date: "Sep 30", hours: 1, status: "Pending" },
      { id: 4, opportunity: "Welcome Week Greeter", club: "Art Club", category: "Event Help", date: "Sep 13", hours: 3, status: "Approved" },
      { id: 5, opportunity: "Robotics Camp Helper", club: "Robotics Club", category: "General Hours", date: "Sep 20", hours: 1, status: "Denied" },
    ],
  },
  {
    id: "katara",
    fName: "Katara",
    lName: "Lopez",
    email: "klopez@hse.edu",
    gradYear: 2026,
    studentId: "304512",
    clubs: [
      { name: "National Honor Society", goal: 20, exec: true, group: "Seniors", categories: [{ name: "Service", goal: 12 }, { name: "Tutoring", goal: 8 }] },
      { name: "Art Club", goal: 8, categories: [{ name: "Event Help", goal: 5 }, { name: "Fundraising", goal: 3 }] },
    ],
    logs: [
      { id: 6, opportunity: "Canned Food Drive", club: "National Honor Society", category: "Service", date: "Oct 4", hours: 4, status: "Approved" },
      { id: 7, opportunity: "Tutoring Night", club: "National Honor Society", category: "Tutoring", date: "Sep 22", hours: 2, status: "Approved" },
      { id: 8, opportunity: "Mural Painting", club: "Art Club", category: "Event Help", date: "Sep 18", hours: 2, status: "Pending" },
    ],
  },
  {
    id: "sokka",
    fName: "Sokka",
    lName: "Reed",
    email: "sreed@hse.edu",
    gradYear: 2028,
    clubs: [{ name: "Robotics Club", goal: 8, categories: [] }],
    logs: [
      { id: 9, opportunity: "Robot Build Day", club: "Robotics Club", category: "General Hours", date: "Oct 1", hours: 5, status: "Approved" },
    ],
  },
];

function sumHours(logs: HourRequest[], test: (log: HourRequest) => boolean) {
  return logs.reduce((total, log) => total + (test(log) ? log.hours : 0), 0);
}

export default function StudentLookup({
  students = DEFAULT_STUDENTS,
  club,
  editable = true,
  onSaveLog,
  maxTabs = 5,
  query,
  onQueryChange,
  selectedId,
  onSelect,
  searchPlaceholder = "Search Students",
  emptyText = "No students match your search.",
  className = "",
}: StudentLookupProps) {
  const [innerQuery, setInnerQuery] = useState("");
  const [innerSelected, setInnerSelected] = useState<string>();
  const [editing, setEditing] = useState<HourRequest | null>(null);

  const q = (query ?? innerQuery).trim().toLowerCase();
  const pool = club ? students.filter((s) => s.clubs.some((c) => c.name === club)) : students;
  const matches = pool.filter((s) =>
    `${fullName(s)} ${s.email} ${s.studentId ?? ""}`.toLowerCase().includes(q),
  );
  const current = selectedId ?? innerSelected;
  const student = matches.find((s) => s.id === current) ?? matches[0];

  // Keep the selected student on its tab even when it falls past maxTabs
  const shown = matches.slice(0, maxTabs);
  if (student && !shown.includes(student)) shown[shown.length - 1] = student;

  function changeQuery(next: string) {
    setInnerQuery(next);
    onQueryChange?.(next);
  }

  function select(id: string) {
    setInnerSelected(id);
    onSelect?.(id);
  }

  return (
    <div className={`student-lookup ${className}`.trim()}>
      {/* Search */}
      <div className="student-lookup-search">
        <Input
          icon="search"
          placeholder={searchPlaceholder}
          value={query ?? innerQuery}
          onChange={(e) => changeQuery(e.target.value)}
        />
        {student && (
          <Tabs
            ariaLabel="Matching Students"
            tabs={shown.map((s) => ({ value: s.id, label: fullName(s) }))}
            value={student.id}
            onChange={select}
          />
        )}
        {matches.length > maxTabs && (
          <div className="student-lookup-more">
            Showing {maxTabs} of {matches.length} students. Keep typing to narrow the list.
          </div>
        )}
        {!student && <div className="student-lookup-empty">{emptyText}</div>}
      </div>

      {/* Detail */}
      {student && (
        <StudentDetail
          student={student}
          club={club}
          editable={editable}
          onEdit={setEditing}
        />
      )}

      {/* Edit dialog */}
      {editing && (
        <EditHoursDialog
          key={editing.id}
          request={editing}
          onClose={() => setEditing(null)}
          onSave={(log) => {
            onSaveLog?.(log);
            setEditing(null);
          }}
        />
      )}
    </div>
  );
}

function StudentDetail({
  student,
  club,
  editable,
  onEdit,
}: {
  student: LookupStudent;
  club?: string;
  editable: boolean;
  onEdit: (log: HourRequest) => void;
}) {
  const logs = club ? student.logs.filter((l) => l.club === club) : student.logs;
  const clubs = club ? student.clubs.filter((c) => c.name === club) : student.clubs;
  const scopedClub = clubs[0];

  const approved = sumHours(logs, (l) => l.status === "Approved");
  const pending = sumHours(logs, (l) => l.status === "Pending");
  const denied = sumHours(logs, (l) => l.status === "Denied");

  const earnedIn = (name: string, category?: string) =>
    sumHours(
      logs,
      (l) =>
        l.club === name &&
        l.status === "Approved" &&
        (category === undefined || l.category === category),
    );

  const categoryBars = (c: StudentClub) =>
    c.categories && c.categories.length > 0 ? (
      c.categories.map((k) => (
        <ProgressBar
          key={k.name}
          label={k.name}
          value={earnedIn(c.name, k.name)}
          goal={k.goal}
        />
      ))
    ) : (
      <ProgressBar label="General Hours" value={earnedIn(c.name)} goal={c.goal} />
    );

  const details = [
    { label: "Email", value: student.email },
    { label: "Student ID", value: student.studentId ?? "None" },
    { label: "Grad Class", value: String(student.gradYear) },
    { label: "Member Group", value: scopedClub?.group ?? "None" },
  ];

  return (
    <div className="student-lookup-detail">
      {/* Header */}
      <BannerHeader
        eyebrow={club ? `Class Of ${student.gradYear}` : `Class Of ${student.gradYear} · ${student.email}`}
        title={fullName(student)}
      />

      {club && (
        <div className="student-lookup-facts">
          {details.map((d) => (
            <div key={d.label}>
              <div className="student-lookup-fact-label">{d.label}</div>
              <div className="student-lookup-fact-value">{d.value}</div>
            </div>
          ))}
        </div>
      )}

      {/* Stats */}
      <div className={`student-lookup-stats ${club ? "student-lookup-stats-three" : ""}`.trim()}>
        <StatCard label={club ? "Approved" : "Total Approved"} value={formatHours(approved)} tone="solid" />
        <StatCard label="Pending" value={formatHours(pending)} />
        <StatCard label="Denied" value={formatHours(denied)} />
        {!club && <StatCard label="Clubs" value={String(student.clubs.length)} />}
      </div>

      {/* Club affiliations (school-wide view only) */}
      {!club && (
        <section>
          <SectionHead>Club Affiliations</SectionHead>
          <div className="student-lookup-list">
            {clubs.map((c) => {
              const requests = logs.filter((l) => l.club === c.name).length;
              return (
                <ListRow
                  key={c.name}
                  title={c.name}
                  titleSize="lg"
                  density="roomy"
                  subtitle={`${formatHours(earnedIn(c.name))} approved · ${plural(requests, "Request")}`}
                  trailing={
                    c.exec && (
                      <Badge tone="info" filled icon={false}>
                        Student Exec
                      </Badge>
                    )
                  }
                />
              );
            })}
          </div>
        </section>
      )}

      {/* Progress */}
      {club ? (
        scopedClub && (
          <section>
            <SectionHead>Category Progress</SectionHead>
            <div className="student-lookup-bars">{categoryBars(scopedClub)}</div>
          </section>
        )
      ) : (
        <section>
          <SectionHead>Goal Progress</SectionHead>
          <div className="student-lookup-goals">
            {clubs.map((c) => {
              const earned = earnedIn(c.name);
              return (
                <div key={c.name} className="student-lookup-goal">
                  <div className="student-lookup-goal-ring">
                    <ProgressRing
                      value={earned}
                      goal={c.goal}
                      size={130}
                      label={earned}
                      sublabel={`of ${c.goal} hrs`}
                    />
                    <span className="student-lookup-goal-name">{c.name}</span>
                  </div>
                  <div className="student-lookup-bars">{categoryBars(c)}</div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Logged hours */}
      <section>
        <SectionHead>Logged Hours</SectionHead>
        <div className="student-lookup-list">
          {logs.map((l) => (
            <ListRow
              key={l.id}
              title={l.opportunity}
              inlineMeta={[club ? undefined : l.club, l.category, l.date].filter(Boolean).join(" · ")}
              meta={formatHours(l.hours)}
              trailing={
                <>
                  <Badge tone={STATUS_TONE[l.status]}>{l.status}</Badge>
                  {editable && (
                    <IconButton
                      icon="pencil"
                      label="Edit"
                      className="student-lookup-edit"
                      onClick={() => onEdit(l)}
                    />
                  )}
                </>
              }
            />
          ))}
          {logs.length === 0 && <EmptyState size="sm" message="No hours logged yet." />}
        </div>
      </section>
    </div>
  );
}
