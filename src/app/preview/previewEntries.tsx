"use client";

import React from "react";

// Primitives: forms
import SaveButton from "../components/saveButton";
import IconButton from "../components/iconButton";
import Badge from "../components/badge";
import Input from "../components/input";
import Select from "../components/select";
import Checkbox from "../components/checkbox";
import Radio from "../components/radio";
import Switch from "../components/switch";

// Primitives: display
import PageTitle from "../components/pageTitle";
import SectionHead from "../components/sectionHead";
import Card from "../components/card";
import StatCard from "../components/statCard";
import BannerHeader from "../components/bannerHeader";
import ProgressRing from "../components/progressRing";
import ProgressBar from "../components/progressBar";
import InfoTable, { type InfoTableRow } from "../components/infoTable";

// Primitives: navigation and shell
import SideNav, { STUDENT_NAV_ITEMS, type SideNavItem } from "../components/sideNav";
import MobileNav from "../components/MobileNav";
import BottomNav from "../components/bottomNav";
import AppHeader from "../components/appHeader";
import LogoButton from "../components/logoButton";
import LoginButton from "../components/loginButton";
import AdminButtons from "../components/adminButtons";
import Tabs from "../components/tabs";

// Primitives: feedback
import ModalShell from "../components/ModalShell";
import ConfirmDialog from "../components/ConfirmDialog";
import ToastStack from "../components/ToastStack";
import AlertMessage from "../components/AlertMessage";
import Tooltip from "../components/tooltip";
import HelpButton from "../components/helpButton";

// Shared composites
import ListRow, { ListRowDate, ListRowIcon } from "../components/listRow";
import EmptyState from "../components/emptyState";
import FormSection, { FormSectionSpan } from "../components/formSection";
import FilterBar from "../components/filterBar";
import DetailList from "../components/detailList";
import RequestRow, { type HourRequest } from "../components/requestRow";
import RecentRequests from "../components/recentRequests";
import HoursStatRow from "../components/hoursStatRow";
import CategoryProgress from "../components/categoryProgress";
import ClubCard from "../components/clubCard";
import ClubPicker from "../components/clubPicker";
import ClubPanelTiles from "../components/clubPanelTiles";
import OpportunityCard, { type Opportunity } from "../components/opportunityCard";
import ExportOptions, { type ExportIncludeOption } from "../components/exportOptions";
import StudentLookup, { type LookupStudent } from "../components/studentLookup";
import EditHoursDialog from "../components/EditHoursDialog";
import ClubDirectory, { type DirectoryClub } from "../components/ClubDirectory";
import CreateClubDialog from "../components/CreateClubDialog";
import AssignStaffDialog from "../components/AssignStaffDialog";
import UserMenu from "../components/userMenu";
import SiteFooter from "../components/siteFooter";

// Club Executive Panel
import ClubPanelNav from "../components/clubPanelNav";
import ClubSectionHeader from "../components/clubSectionHeader";
import ClubSaveBar from "../components/clubSaveBar";
import ClubSettingRow from "../components/clubSettingRow";
import StudentRosterModal, { type RosterStudent } from "../components/StudentRosterModal";

// App wiring
import Providers from "../components/Providers";

import { PreviewDemos } from "./previewDemos";
import { cb, label } from "./previewTools";
import { formatHours } from "@/lib/formatHours";
import { fullName, type PersonName } from "@/lib/personName";

// ================= Registry types =================

/** How the gallery mounts an example. */
export type PreviewFrame =
  | "inline"
  /** Fixed-position side nav, contained in a 640px tall box. */
  | "nav"
  /** Phone-sized box that forces the under-768px components to show. */
  | "mobile"
  /** Overlay: an Open button mounts it, onClose unmounts it. */
  | "dialog";

/** Keeps a prop in gallery state so controlled components respond to clicks. */
export type PreviewControl = {
  value: string;
  change: string;
  /** Next value from the previous value and the callback args. Defaults to the first arg. */
  map?: (prev: never, ...args: never[]) => unknown;
};

type Example<P> = {
  label: string;
  props: P;
  frame?: PreviewFrame;
  /** Max width of the preview box in px (stretchy components like StatCard). */
  width?: number;
  controls?: PreviewControl[];
  /** Custom mount, e.g. UserMenu inside a SideNav footer. Receives the (controlled) props. */
  render?: (props: P) => React.ReactNode;
};

export type PreviewEntry = {
  name: string;
  file: string;
  group: string;
  /** Pages from the mockups the component is planned for. */
  pages: string[];
  note?: string;
  component: React.ElementType;
  examples: Example<Record<string, unknown>>[];
};

export const PREVIEW_GROUPS = [
  "Forms",
  "Display",
  "Navigation And Shell",
  "Feedback",
  "Shared Composites",
  "Club Executive Panel",
  "App Wiring",
] as const;

/** Type-checks each example's props against the real component, then erases the type. */
function entry<P extends object>(e: {
  name: string;
  file: string;
  group: (typeof PREVIEW_GROUPS)[number];
  pages: string[];
  note?: string;
  component: React.ComponentType<P>;
  examples: Example<P>[];
}): PreviewEntry {
  return e as unknown as PreviewEntry;
}

const toggle = (prev: string[], value: string) =>
  prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value];

// ================= Fake data =================

const STAFF_NAV: SideNavItem[] = [
  { value: "home", label: "Home", icon: "house" },
  { value: "clubs", label: "All Clubs", icon: "people" },
  { value: "lookup", label: "Look Up Students", icon: "search" },
];

const ADMIN_NAV: SideNavItem[] = [...STAFF_NAV, { value: "reports", label: "Reports", icon: "bar-chart" }];

const ALL_STAFF: PersonName[] = [
  { fName: "Iroh", lName: "Bennett" },
  { fName: "Tom", lName: "Brooks" },
  { fName: "David", lName: "Chen" },
  { fName: "Linh", lName: "Nguyen" },
  { fName: "Chidi", lName: "Okafor" },
  { fName: "Priya", lName: "Patel" },
];

const REQ_PENDING_EMAIL: HourRequest = {
  id: 101,
  opportunity: "Park Cleanup",
  student: { fName: "Aang", lName: "Smith" },
  club: "Key Club",
  category: "Service",
  date: "Oct 2",
  fullDate: "Oct 2, 2026",
  hours: 2,
  status: "Pending",
  awaitingEmail: true,
  hasPhoto: true,
  organization: "Fishers Parks",
  coordinator: "Sam Patel",
  coordinatorEmail: "spatel@fishers.in.us",
};

const REQ_PENDING: HourRequest = {
  id: 102,
  opportunity: "Bake Sale Setup",
  student: { fName: "Katara", lName: "Lopez" },
  club: "Art Club",
  category: "Event Help",
  date: "Sep 30",
  hours: 1,
  status: "Pending",
};

const REQ_APPROVED: HourRequest = {
  id: 103,
  opportunity: "Food Pantry Pack-Out",
  student: { fName: "Sokka", lName: "Reed" },
  club: "Key Club",
  category: "Service",
  date: "Sep 27",
  hours: 3,
  status: "Approved",
};

const REQ_DENIED: HourRequest = {
  id: 104,
  opportunity: "Robotics Camp Helper",
  student: { fName: "Zuko", lName: "Hale" },
  club: "Robotics Club",
  category: "General Hours",
  date: "Sep 20",
  hours: 1,
  status: "Denied",
  denyMessage: "Camp sign-in sheet does not list this student.",
};

const OPP_FOOD: Opportunity = {
  id: "food",
  name: "Food Pantry Pack-Out",
  month: "OCT",
  day: 10,
  club: "Key Club",
  time: "9:00 AM to 12:00 PM",
  location: "Fishers Community Pantry",
  category: "Service",
  hours: 3,
  slots: 12,
  taken: 4,
  slotsPerStudent: 1,
};

const OPP_FULL: Opportunity = {
  id: "mural",
  name: "Library Mural Painting",
  month: "OCT",
  day: 18,
  club: "Art Club",
  time: "1:00 PM to 4:00 PM",
  location: "Fishers Public Library",
  category: "Event Help",
  hours: 3,
  slots: 8,
  taken: 8,
};

const OPP_RECURRING: Opportunity = {
  id: "tutor",
  name: "After School Tutoring",
  month: "OCT",
  day: 24,
  moreDates: 2,
  dateLabel: "Oct 24, Oct 31, Nov 7",
  club: "National Honor Society",
  time: "3:00 PM to 4:30 PM",
  location: "HSE Library",
  category: "Tutoring",
  hours: 1.5,
  slots: 20,
  taken: 13,
  slotsPerStudent: 3,
};

const LOOKUP_STUDENTS: LookupStudent[] = [
  {
    id: "aang",
    fName: "Aang",
    lName: "Smith",
    email: "asmith@hse.edu",
    gradYear: 2029,
    studentId: "309871",
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
    gradYear: 2027,
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
    studentId: "306230",
    clubs: [
      { name: "National Honor Society", goal: 20, group: "Juniors", categories: [{ name: "Service", goal: 12 }, { name: "Tutoring", goal: 8 }] },
      { name: "Robotics Club", goal: 8, categories: [] },
    ],
    logs: [
      { id: 9, opportunity: "Robot Build Day", club: "Robotics Club", category: "General Hours", date: "Oct 1", hours: 5, status: "Approved" },
      { id: 10, opportunity: "Tutoring Night", club: "National Honor Society", category: "Tutoring", date: "Sep 22", hours: 2, status: "Pending" },
    ],
  },
];

const DIRECTORY_CLUBS: DirectoryClub[] = [
  { name: "Key Club", icon: "heart", members: 64, categories: 2, staff: [{ fName: "Tom", lName: "Brooks" }, { fName: "Priya", lName: "Patel" }] },
  { name: "Art Club", icon: "palette", members: 41, categories: 2, staff: [{ fName: "David", lName: "Chen" }] },
  { name: "Robotics Club", icon: "gear", members: 28, categories: 0, staff: [{ fName: "Chidi", lName: "Okafor" }] },
  { name: "National Honor Society", icon: "award", members: 120, categories: 3, staff: [{ fName: "Iroh", lName: "Bennett" }, { fName: "Linh", lName: "Nguyen" }] },
  { name: "Chess Club", icon: "puzzle", members: 19, categories: 0, staff: [] },
];

const ROSTER: RosterStudent[] = [
  { id: "304512", fName: "Katara", lName: "Lopez", meta: "Signed up Oct 1" },
  { id: "306230", fName: "Sokka", lName: "Reed", meta: "Signed up Oct 2" },
  { id: "309871", fName: "Aang", lName: "Smith", meta: "Signed up Oct 3" },
  { id: "305118", fName: "Jordan", lName: "Reyes", meta: "Signed up Oct 3" },
  { id: "307744", fName: "Maya", lName: "Lindgren", meta: "Signed up Oct 5" },
];

const STUDENT_EXPORT: ExportIncludeOption[] = [
  { value: "members", label: "Club Memberships", checked: true },
  { value: "total", label: "Total Hours", checked: true },
  { value: "clubHrs", label: "Club-Specific Hours", checked: true },
  { value: "cats", label: "Category Breakdown", checked: false },
];

const CLUB_EXPORT: ExportIncludeOption[] = [
  { value: "members", label: "Members", checked: true },
  { value: "requests", label: "Hour Requests", checked: true },
  { value: "progress", label: "Hours Progress", checked: false },
  { value: "opps", label: "Opportunities", checked: false },
];

type TableRow = { id: number; fName: string; lName: string; club: string; hours: number; status: HourRequest["status"] };

const TABLE_ROWS: TableRow[] = [
  { id: 1, fName: "Katara", lName: "Lopez", club: "National Honor Society", hours: 18, status: "Approved" },
  { id: 2, fName: "Aang", lName: "Smith", club: "Key Club", hours: 6, status: "Pending" },
  { id: 3, fName: "Sokka", lName: "Reed", club: "Robotics Club", hours: 5, status: "Approved" },
  { id: 4, fName: "Zuko", lName: "Hale", club: "Robotics Club", hours: 1, status: "Denied" },
];

const TONE = { Pending: "pending", Approved: "approved", Denied: "denied" } as const;

// ================= Entries =================

export const PREVIEW_ENTRIES: PreviewEntry[] = [
  // ---------- Forms ----------
  entry({
    name: "SaveButton",
    file: "saveButton.tsx",
    group: "Forms",
    pages: ["All apps: every form, dialog footer and card action", "Student · Log Hours (Submit Hours)", "Staff / Admin · All Clubs (Create Club, Assign Staff)", "Coordinator (Approve / Deny)"],
    component: SaveButton,
    examples: [
      { label: "Primary", props: { children: "Submit Hours", icon: "send", onClick: cb("onClick", "(e)") } },
      { label: "Secondary", props: { children: "Cancel", variant: "secondary", onClick: cb("onClick", "(e)") } },
      { label: "Danger", props: { children: "Delete Club", variant: "danger", icon: "trash", onClick: cb("onClick", "(e)") } },
      { label: "Dashed", props: { children: "Add Category", variant: "dashed", icon: "plus-lg", onClick: cb("onClick", "(e)") } },
      { label: "Small Pill", props: { children: "All Requests", variant: "pill", size: "sm", iconRight: "arrow-right", onClick: cb("onClick", "(e)") } },
      { label: "Disabled", props: { children: "Save Changes", icon: "check-lg", disabled: true } },
    ],
  }),
  entry({
    name: "IconButton",
    file: "iconButton.tsx",
    group: "Forms",
    pages: ["Club Panel · Hour Requests, Opportunities (edit pencil)", "Staff / Admin · Look Up Students (edit logged hours)", "Every dialog (close, remove staff, remove student)"],
    component: IconButton,
    examples: [
      { label: "Edit Pencil", props: { icon: "pencil", label: "Edit", size: 22, onClick: cb("onClick", "(e)") } },
      { label: "Remove", props: { icon: "x-lg", label: "Remove", size: 20, onClick: cb("onClick", "(e)") } },
      { label: "Filled", props: { icon: "plus-lg", label: "Add", size: 20, variant: "filled", onClick: cb("onClick", "(e)") } },
    ],
  }),
  entry({
    name: "Badge",
    file: "badge.tsx",
    group: "Forms",
    pages: ["Student · My Requests", "Club Panel · Hour Requests", "Staff / Admin · Look Up Students", "Coordinator (request status)"],
    component: Badge,
    examples: [
      { label: "Pending", props: { tone: "pending", children: "Pending" } },
      { label: "Approved", props: { tone: "approved", children: "Approved" } },
      { label: "Denied", props: { tone: "denied", children: "Denied" } },
      { label: "Awaiting Email", props: { tone: "info", children: "Awaiting Email" } },
      { label: "Filled", props: { tone: "info", filled: true, icon: false, children: "Student Exec" } },
    ],
  }),
  entry({
    name: "Input",
    file: "input.tsx",
    group: "Forms",
    pages: ["Student · Log Hours", "Public · Login", "Every dialog and search field"],
    component: Input,
    examples: [
      { label: "Hours", width: 360, props: { label: "Hours", type: "number", defaultValue: 3, suffix: "hrs", hint: "Round to the nearest half hour." } },
      { label: "Search", width: 360, props: { icon: "search", placeholder: "Search Clubs" } },
      { label: "Error", width: 360, props: { label: "Coordinator Email", defaultValue: "spatel@", error: "Enter a full email address.", required: true } },
      { label: "Multiline", width: 480, props: { label: "Description", multiline: true, rows: 4, placeholder: "What did you do?" } },
    ],
  }),
  entry({
    name: "Select",
    file: "select.tsx",
    group: "Forms",
    pages: ["Student · Log Hours (club, category)", "Admin · Reports", "Dialogs (Create Club, Assign Staff, Edit Logged Hours)", "Filter bars"],
    component: Select,
    examples: [
      { label: "Club", width: 360, props: { label: "Club", placeholder: "Select A Club", options: ["Key Club", "Art Club", "Robotics Club"] } },
      {
        label: "Object Options",
        width: 360,
        props: {
          label: "Category",
          hint: "Robotics Club has general hours only.",
          options: [
            { value: "service", label: "Service" },
            { value: "event", label: "Event Help" },
          ],
          defaultValue: "service",
        },
      },
      { label: "Error", width: 360, props: { label: "Assign Staff", placeholder: "Select Staff", options: ALL_STAFF.map(fullName), error: "Pick a staff sponsor." } },
    ],
  }),
  entry({
    name: "Checkbox",
    file: "checkbox.tsx",
    group: "Forms",
    pages: ["Student · Export Portfolio", "Admin · Reports", "Club Panel · Export"],
    component: Checkbox,
    examples: [
      { label: "With Description", props: { label: "Category Breakdown", description: "Hours per category for each club.", defaultChecked: true, onChange: cb("onChange", "(checked)") } },
      { label: "Disabled", props: { label: "Club Memberships", checked: true, disabled: true } },
    ],
  }),
  entry({
    name: "Radio",
    file: "radio.tsx",
    group: "Forms",
    pages: ["Not used in the mockups (ported from the design system)"],
    component: Radio,
    examples: [
      { label: "Row", props: { options: ["CSV", "Excel", "PDF"], defaultValue: "CSV", direction: "row", ariaLabel: "File Format", onChange: cb("onChange", "(value)") } },
      { label: "Column", props: { options: [{ value: "all", label: "All Students" }, { value: "met", label: "Met Goal" }, { value: "behind", label: "Behind Goal", disabled: true }], defaultValue: "all", ariaLabel: "Students" } },
    ],
  }),
  entry({
    name: "Switch",
    file: "switch.tsx",
    group: "Forms",
    pages: ["Club Panel · Club Config, Categories, Exec And Roles", "Admin · Reports, Home (leaderboard toggle)"],
    component: Switch,
    examples: [
      { label: "Labeled", props: { label: "Needs Email Verification", defaultChecked: true, onChange: cb("onChange", "(checked)") } },
      { label: "No Label", props: { ariaLabel: "Double Dipping", defaultChecked: false } },
    ],
  }),

  // ---------- Display ----------
  entry({
    name: "PageTitle",
    file: "pageTitle.tsx",
    group: "Display",
    pages: ["Every logged-in page (Student, Staff, Admin)"],
    component: PageTitle,
    examples: [
      { label: "Left", props: { children: "My Requests", subtitle: "Every hour request you have submitted.", align: "left" } },
      { label: "Center", props: { children: "Welcome, Aang Smith!", align: "center" } },
    ],
  }),
  entry({
    name: "SectionHead",
    file: "sectionHead.tsx",
    group: "Display",
    pages: ["Every page (locked: all section heads use SectionHead)"],
    component: SectionHead,
    examples: [
      { label: "With Action", props: { children: "Recent Requests", action: <SaveButton size="sm" icon="inbox">All Requests</SaveButton> } },
      { label: "Large", props: { children: "Key Club", size: "lg" } },
    ],
  }),
  entry({
    name: "Card",
    file: "card.tsx",
    group: "Display",
    pages: ["Not used directly in the mockups (generic panel)"],
    component: Card,
    examples: [
      {
        label: "Plain",
        width: 460,
        props: {
          title: "School Goal",
          tone: "blue",
          action: <IconButton icon="pencil" label="Edit School Goal" size={20} />,
          children: <p>12,480 of 20,000 hrs logged this year.</p>,
        },
      },
      {
        label: "Bar",
        width: 460,
        props: { title: "Quick Reports", header: "bar", children: <p>Pick a report to download.</p> },
      },
    ],
  }),
  entry({
    name: "StatCard",
    file: "statCard.tsx",
    group: "Display",
    pages: ["Student · Home", "Admin · Home", "Staff / Admin · Look Up Students", "Club Panel · Overview"],
    component: StatCard,
    examples: [
      { label: "Tint", width: 280, props: { label: "Approved", value: "6 hrs", icon: "check-circle-fill" } },
      { label: "Solid With Goal", width: 320, props: { label: "School Hours", value: "12,480", of: "20,000 hrs", icon: "clock", tone: "solid" } },
    ],
  }),
  entry({
    name: "BannerHeader",
    file: "bannerHeader.tsx",
    group: "Display",
    pages: ["Student · Home, All Clubs", "Staff / Admin · Look Up Students", "Club Panel · Overview"],
    component: BannerHeader,
    examples: [
      {
        label: "Student Home",
        props: {
          eyebrow: "Class Of 2029",
          title: "Welcome, Aang Smith!",
          children: <SaveButton variant="danger" icon="plus-circle" size="lg">Log Hours</SaveButton>,
        },
      },
      { label: "Text Only", props: { eyebrow: "Class Of 2027 · klopez@hse.edu", title: "Katara Lopez", subtitle: "2 clubs · 6 hrs approved" } },
    ],
  }),
  entry({
    name: "ProgressRing",
    file: "progressRing.tsx",
    group: "Display",
    pages: ["Student · Home, Goal Progress", "Admin · Home (school goal)", "Club Panel · Hours Progress"],
    component: ProgressRing,
    examples: [
      { label: "Default", props: { value: 6, goal: 25, size: 180 } },
      { label: "Percent Label", props: { value: 12480, goal: 20000, size: 160, label: "62%", sublabel: "of school goal", ticks: false } },
    ],
  }),
  entry({
    name: "ProgressBar",
    file: "progressBar.tsx",
    group: "Display",
    pages: ["Student · Goal Progress, All Clubs, Opportunities", "Club Panel · Hours Progress, Opportunities (slots)"],
    component: ProgressBar,
    examples: [
      { label: "Category", width: 460, props: { label: "Service", value: 3, goal: 10 } },
      { label: "Slots (No Label)", width: 240, props: { label: "", showValue: false, value: 4, goal: 12, height: 12 } },
    ],
  }),
  entry({
    name: "InfoTable",
    file: "infoTable.tsx",
    group: "Display",
    pages: ["Generic table, no single mockup page (turns into cards under 768px)"],
    component: InfoTable,
    examples: [
      {
        label: "Rows",
        props: {
          columns: [
            { key: "student", label: "Student", render: label((r: InfoTableRow) => fullName(r as PersonName), "(r) => fullName(r)") },
            { key: "club", label: "Club" },
            { key: "hours", label: "Hours", align: "right", width: "110px", render: label((r: InfoTableRow) => formatHours(r.hours as number), "(r) => formatHours(r.hours)") },
            {
              key: "status",
              label: "Status",
              width: "140px",
              render: label(
                (r: InfoTableRow) => <Badge tone={TONE[r.status as HourRequest["status"]]}>{r.status as string}</Badge>,
                "(r) => <Badge tone={…}>{r.status}</Badge>",
              ),
            },
          ],
          rows: TABLE_ROWS,
          onRowClick: cb("onRowClick", "(row)"),
        },
      },
      { label: "Empty", props: { columns: [{ key: "student", label: "Student" }], rows: [], empty: "No students match your filters." } },
    ],
  }),

  // ---------- Navigation and shell ----------
  entry({
    name: "SideNav",
    file: "sideNav.tsx",
    group: "Navigation And Shell",
    pages: ["Student App (every page)", "Staff App (Home, All Clubs, Look Up Students)", "Admin App (+ Reports)", "Club Panel (through ClubPanelNav)"],
    note: "Position fixed in the app; framed here. Collapses to the icon rail under 1024px. Also exports STUDENT_NAV_ITEMS, NavLockup and NavItemLink.",
    component: SideNav,
    examples: [
      {
        label: "Student",
        frame: "nav",
        controls: [{ value: "value", change: "onChange" }],
        props: { items: STUDENT_NAV_ITEMS, value: "home", onChange: cb("onChange", "(value)"), user: { fName: "Aang", lName: "Smith", role: "Student" } },
      },
      {
        label: "Staff",
        frame: "nav",
        controls: [{ value: "value", change: "onChange" }],
        props: { items: STAFF_NAV, value: "clubs", onChange: cb("onChange", "(value)"), user: { fName: "Iroh", lName: "Bennett", role: "Staff" } },
      },
      {
        label: "Admin Compact",
        frame: "nav",
        controls: [{ value: "value", change: "onChange" }],
        props: { items: ADMIN_NAV, value: "reports", compact: true, user: { fName: "Toph", lName: "Beifong", role: "Admin" } },
      },
    ],
  }),
  entry({
    name: "MobileNav",
    file: "MobileNav.tsx",
    group: "Navigation And Shell",
    pages: ["All logged-in apps under 768px (replaces SideNav)"],
    note: "Hidden above 768px in the app; forced visible in this phone frame. Tap the menu icon to open the drawer.",
    component: MobileNav,
    examples: [
      {
        label: "Student",
        frame: "mobile",
        controls: [{ value: "value", change: "onChange" }],
        props: { items: STUDENT_NAV_ITEMS, value: "home", onChange: cb("onChange", "(value)"), user: { fName: "Aang", lName: "Smith", role: "Student" } },
      },
      {
        label: "Club Panel Back",
        frame: "mobile",
        controls: [{ value: "value", change: "onChange" }],
        props: { items: STAFF_NAV, value: "home", back: { label: "Back To Staff Homepage", href: "/staff" }, user: { fName: "Iroh", lName: "Bennett", role: "Staff" } },
      },
    ],
  }),
  entry({
    name: "BottomNav",
    file: "bottomNav.tsx",
    group: "Navigation And Shell",
    pages: ["All logged-in apps on phones (under 768px)"],
    note: "Uses each item's shortLabel. Hidden above 768px in the app; forced visible in this phone frame.",
    component: BottomNav,
    examples: [
      {
        label: "Student",
        frame: "mobile",
        controls: [{ value: "value", change: "onChange" }],
        props: { items: STUDENT_NAV_ITEMS, value: "req", onChange: cb("onChange", "(value)") },
      },
    ],
  }),
  entry({
    name: "AppHeader",
    file: "appHeader.tsx",
    group: "Navigation And Shell",
    pages: ["Public · Homepage", "Public · Login"],
    component: AppHeader,
    examples: [
      {
        label: "Homepage",
        props: {
          links: [
            { label: "How It Works", href: "#how-it-works" },
            { label: "Why It Matters", href: "#why-it-matters" },
            { label: "Contact", href: "#contact" },
          ],
          activeHref: "#how-it-works",
          logoHref: "/",
        },
      },
      { label: "Signed In", props: { links: [], action: <LoginButton signedIn onLogout={cb("onLogout")} /> } },
    ],
  }),
  entry({
    name: "LogoButton",
    file: "logoButton.tsx",
    group: "Navigation And Shell",
    pages: ["Public · Homepage, Login (inside AppHeader)"],
    component: LogoButton,
    examples: [{ label: "Default", props: { href: "/" } }],
  }),
  entry({
    name: "LoginButton",
    file: "loginButton.tsx",
    group: "Navigation And Shell",
    pages: ["Public · Homepage, Login (inside AppHeader)"],
    component: LoginButton,
    examples: [
      { label: "Signed Out", props: { label: "Sign In", onSignIn: cb("onSignIn") } },
      { label: "Signed In", props: { signedIn: true, onLogout: cb("onLogout") } },
    ],
  }),
  entry({
    name: "AdminButtons",
    file: "adminButtons.tsx",
    group: "Navigation And Shell",
    pages: ["Nav tiles (design system NavTile, royal_rumble adminButtons)"],
    component: AdminButtons,
    examples: [
      { label: "Primary", width: 320, props: { children: "Log Hours", icon: "plus-circle", onClick: cb("onClick") } },
      { label: "Danger", width: 320, props: { children: "Delete Club", icon: "trash", variant: "danger", onClick: cb("onClick") } },
      { label: "Dashed", width: 320, props: { children: "Create Club", icon: "plus-lg", variant: "dashed", onClick: cb("onClick") } },
      { label: "Custom Color", width: 320, props: { children: "Reports", icon: "bar-chart", backgroundColor: "var(--primaryRed)", onClick: cb("onClick") } },
    ],
  }),
  entry({
    name: "Tabs",
    file: "tabs.tsx",
    group: "Navigation And Shell",
    pages: ["Student · My Requests, Opportunities", "Club Panel · Hour Requests, Export", "Admin · Reports"],
    component: Tabs,
    examples: [
      {
        label: "With Counts",
        controls: [{ value: "value", change: "onChange" }],
        props: {
          tabs: [
            { value: "all", label: "All", count: 5 },
            { value: "pending", label: "Pending", count: 2 },
            { value: "approved", label: "Approved", count: 2 },
            { value: "denied", label: "Denied", count: 1 },
          ],
          value: "pending",
          onChange: cb("onChange", "(value)"),
          ariaLabel: "Request Status",
        },
      },
      {
        label: "Strings",
        controls: [{ value: "value", change: "onChange" }],
        props: { tabs: ["Open Sign Ups", "My Sign Ups"], value: "Open Sign Ups", ariaLabel: "Opportunities" },
      },
    ],
  }),

  // ---------- Feedback ----------
  entry({
    name: "ModalShell",
    file: "ModalShell.tsx",
    group: "Feedback",
    pages: ["Every dialog (Create Club, Assign Staff, Edit Logged Hours, Add Category, ...)"],
    note: "Locks page scroll and traps focus while open. Escape, the scrim and the X call onClose.",
    component: ModalShell,
    examples: [
      {
        label: "Add Category",
        frame: "dialog",
        props: {
          title: "Add Category",
          width: "520px",
          children: (
            <>
              <Input label="Category Name" placeholder="e.g. Tutoring" />
              <Input label="Hour Goal" type="number" suffix="hrs" defaultValue={5} />
            </>
          ),
          footer: (
            <>
              <SaveButton variant="secondary">Cancel</SaveButton>
              <SaveButton icon="plus-lg">Add Category</SaveButton>
            </>
          ),
        },
      },
    ],
  }),
  entry({
    name: "ConfirmDialog",
    file: "ConfirmDialog.tsx",
    group: "Feedback",
    pages: ["Admin · All Clubs (Delete Club)", "Any delete or confirm (requests, categories, opportunities, sheets, roles)"],
    component: ConfirmDialog,
    examples: [
      {
        label: "Delete Club",
        frame: "dialog",
        props: {
          title: "Delete Club",
          message: "Delete Chess Club? Its categories, member groups and opportunities will be removed. Logged hours stay on student records.",
          confirmLabel: "Delete Club",
          tone: "danger",
          onConfirm: cb("onConfirm"),
        },
      },
      {
        label: "Primary",
        frame: "dialog",
        props: {
          title: "Approve 7 Requests",
          message: "Approve every pending request for Key Club?",
          confirmLabel: "Approve All",
          tone: "primary",
          onConfirm: cb("onConfirm"),
        },
      },
    ],
  }),
  entry({
    name: "ToastStack",
    file: "ToastStack.tsx",
    group: "Feedback",
    pages: ["Root layout (all apps): mounted once in src/app/layout.tsx"],
    note: "Pages call useToast().showToast(message, type). The buttons below fire real toasts into the stack the layout already mounts.",
    component: ToastStack,
    examples: [{ label: "Bottom Right", props: {}, render: () => <PreviewDemos.ToastButtons /> }],
  }),
  entry({
    name: "AlertMessage",
    file: "AlertMessage.tsx",
    group: "Feedback",
    pages: ["Root layout (all apps): mounted once in src/app/layout.tsx"],
    note: "Takes no props; reads useAlert(). The buttons below call showAlert(message, type).",
    component: AlertMessage,
    examples: [{ label: "Default", props: {}, render: () => <PreviewDemos.AlertButtons /> }],
  }),
  entry({
    name: "Tooltip",
    file: "tooltip.tsx",
    group: "Feedback",
    pages: ["Not used in the mockups (from the design system)"],
    component: Tooltip,
    examples: [
      {
        label: "Top",
        props: {
          content: "Waiting on the coordinator to confirm by email.",
          children: <Badge tone="info">Awaiting Email</Badge>,
          placement: "top",
        },
      },
      { label: "Bottom", props: { content: "Robotics Club has general hours only.", children: "Hover Me", placement: "bottom" } },
    ],
  }),
  entry({
    name: "HelpButton",
    file: "helpButton.tsx",
    group: "Feedback",
    pages: ["Not used (locked decision: no Help button)"],
    note: "Shown with fixed={false} here; the default pins it to the bottom-right corner.",
    component: HelpButton,
    examples: [
      { label: "Inline", props: { label: "Help", fixed: false, onClick: cb("onClick") } },
      { label: "Compact", props: { compact: true, fixed: false, onClick: cb("onClick") } },
    ],
  }),

  // ---------- Shared composites ----------
  entry({
    name: "ListRow",
    file: "listRow.tsx",
    group: "Shared Composites",
    pages: ["Every list: borderless row with a 2px divider (requests, events, clubs, students)"],
    note: "Also exports ListRowDate and ListRowIcon for the leading slot.",
    component: ListRow,
    examples: [
      {
        label: "Event",
        props: {
          title: "Food Pantry Pack-Out",
          titleSize: "lg",
          leading: <ListRowDate month="OCT" day="10" variant="solid" />,
          subtitle: "Key Club · 9:00 AM to 12:00 PM",
          meta: "3 hrs",
          trailing: <SaveButton size="sm">Sign Up</SaveButton>,
          density: "roomy",
        },
      },
      {
        label: "Club Setting",
        props: {
          title: "Key Club",
          leading: <ListRowIcon icon="heart" />,
          subtitle: "64 Members · 2 Categories",
          subtitleTone: "muted",
          trailing: <Switch ariaLabel="Active" defaultChecked />,
        },
      },
      {
        label: "Selected",
        props: {
          title: "Katara Lopez",
          inlineMeta: "Art Club · Sep 30",
          meta: "1 hr",
          trailing: <Badge tone="pending">Pending</Badge>,
          selected: true,
          onClick: cb("onClick"),
        },
      },
      {
        label: "Accent Date",
        props: {
          title: "After School Tutoring",
          leading: <ListRowDate month="OCT" day="24" note="+2 More" variant="accent" />,
          subtitle: "Oct 24, Oct 31, Nov 7 · Tutoring · 1.5 hrs",
          children: "HSE Library",
          highlighted: true,
        },
      },
    ],
  }),
  entry({
    name: "EmptyState",
    file: "emptyState.tsx",
    group: "Shared Composites",
    pages: ["Every list when it has no rows"],
    component: EmptyState,
    examples: [
      {
        label: "Framed",
        props: {
          icon: "inbox",
          title: "No Requests Yet",
          message: "Log your first hours to see them here.",
          action: <SaveButton size="sm" icon="plus-circle">Log Hours</SaveButton>,
          framed: true,
        },
      },
      { label: "Small", props: { message: "No requests match your filters.", size: "sm" } },
    ],
  }),
  entry({
    name: "FormSection",
    file: "formSection.tsx",
    group: "Shared Composites",
    pages: ["Student · Log Hours", "Club Panel · Club Config", "Admin · Reports (custom report builder)", "Dialogs"],
    note: "Wrap a child in FormSectionSpan (also exported) to span both columns.",
    component: FormSection,
    examples: [
      {
        label: "Red Frame",
        props: {
          title: "Opportunity Details",
          tone: "red",
          columns: 2,
          children: (
            <>
              <Input label="Opportunity" placeholder="Park Cleanup" />
              <Select label="Club" placeholder="Select A Club" options={["Key Club", "Art Club", "Robotics Club"]} />
              <Input label="Date" type="date" />
              <Input label="Hours" type="number" suffix="hrs" />
              <FormSectionSpan>
                <Input label="Description" multiline placeholder="What did you do?" />
              </FormSectionSpan>
            </>
          ),
          footer: <SaveButton type="submit" iconRight="arrow-right">Next</SaveButton>,
          onSubmit: cb("onSubmit", "(e)"),
        },
      },
      {
        label: "Blue Bar",
        props: {
          title: "Hour Rules",
          tone: "blue",
          header: "bar",
          columns: 1,
          action: <Badge tone="info" filled icon={false}>Staff Only</Badge>,
          description: "How hours count toward this club's goals.",
          children: <Switch label="Exec Needs Hours" defaultChecked />,
        },
      },
      {
        label: "Open (No Frame)",
        props: {
          title: "1. Pick A Club",
          tone: "none",
          columns: 1,
          children: <ClubPicker />,
        },
      },
      {
        label: "Centered",
        props: {
          title: "Hours Submitted",
          tone: "blue",
          centered: true,
          children: <p>Your Key Club request is pending review.</p>,
          footer: <SaveButton variant="secondary">Log More Hours</SaveButton>,
        },
      },
    ],
  }),
  entry({
    name: "FilterBar",
    file: "filterBar.tsx",
    group: "Shared Composites",
    pages: ["Staff / Admin · All Clubs, Look Up Students", "Club Panel · Hour Requests, Hours Progress, Member Groups, Opportunities"],
    component: FilterBar,
    examples: [
      {
        label: "Row",
        controls: [{ value: "activeChips", change: "onChipToggle", map: toggle as PreviewControl["map"] }],
        props: {
          searchPlaceholder: "Search Students",
          onSearchChange: cb("onSearchChange", "(value)"),
          selects: [
            { name: "club", options: ["All Clubs", "Key Club", "Art Club", "Robotics Club"], defaultValue: "All Clubs" },
            { name: "status", options: ["All Statuses", "Pending", "Approved", "Denied"], defaultValue: "All Statuses", width: "180px" },
          ],
          onSelectChange: cb("onSelectChange", "(name, value)"),
          chips: [
            { value: "photo", label: "Has Photo", count: 3 },
            { value: "awaiting", label: "Awaiting Email", count: 2 },
          ],
          activeChips: ["photo"],
          onChipToggle: cb("onChipToggle", "(value)"),
        },
      },
      {
        label: "With Action",
        props: {
          searchPlaceholder: "Search Clubs",
          actions: <SaveButton variant="danger" icon="plus-circle">Create Club</SaveButton>,
        },
      },
      {
        label: "Stacked",
        width: 300,
        props: {
          layout: "stacked",
          searchLabel: "Search",
          searchPlaceholder: "Name Or ID",
          selects: [{ name: "group", label: "Member Group", options: ["All Groups", "Seniors", "Juniors"], defaultValue: "All Groups" }],
        },
      },
    ],
  }),
  entry({
    name: "DetailList",
    file: "detailList.tsx",
    group: "Shared Composites",
    pages: ["Student · Log Hours (review step), My Requests (details)", "Club Panel · Hour Requests (side panel)"],
    component: DetailList,
    examples: [
      {
        label: "Two Columns",
        props: {
          columns: 2,
          items: [
            { label: "Date", value: "Oct 2, 2026" },
            { label: "Club", value: "Key Club" },
            { label: "Category", value: "Service" },
            { label: "Hours", value: "2 hrs" },
            { label: "Organization", value: "Fishers Parks" },
            { label: "Coordinator", value: "Sam Patel" },
          ],
        },
      },
      {
        label: "Stacked Side Panel",
        width: 360,
        props: {
          layout: "stacked",
          size: "sm",
          items: [
            { label: "Student", value: "Zuko Hale" },
            { label: "Opportunity", value: "Robotics Camp Helper" },
            { label: "Hours", value: "1 hr" },
            { label: "Deny Message", value: "Camp sign-in sheet does not list this student.", full: true, tone: "danger" },
          ],
        },
      },
    ],
  }),
  entry({
    name: "RequestRow",
    file: "requestRow.tsx",
    group: "Shared Composites",
    pages: ["Student · Home, My Requests, All Clubs", "Club Panel · Hour Requests (with Approve / Deny / Edit)"],
    note: "Exports the HourRequest type and STATUS_TONE used across the app.",
    component: RequestRow,
    examples: [
      { label: "Student Stacked", props: { request: REQ_APPROVED, layout: "stacked", showCategory: true } },
      {
        label: "Club Panel Pending",
        props: {
          request: REQ_PENDING_EMAIL,
          showStudent: true,
          showCategory: true,
          showAwaitingEmail: true,
          onApprove: cb("onApprove", "(id)"),
          onDeny: cb("onDeny", "(id)"),
          onEdit: cb("onEdit", "(id)"),
        },
      },
      { label: "Inline", props: { request: REQ_PENDING, layout: "inline" } },
      { label: "Denied Selected", props: { request: REQ_DENIED, showStudent: true, selected: true, onSelect: cb("onSelect", "(id)") } },
    ],
  }),
  entry({
    name: "RecentRequests",
    file: "recentRequests.tsx",
    group: "Shared Composites",
    pages: ["Student · Home", "Student · All Clubs (club view, showClub false)"],
    component: RecentRequests,
    examples: [
      { label: "Home", props: { requests: [REQ_PENDING_EMAIL, REQ_PENDING, REQ_APPROVED], title: "Recent Requests", actionLabel: "All Requests", onViewAll: cb("onViewAll") } },
      { label: "Single Club", props: { requests: [REQ_PENDING_EMAIL, REQ_APPROVED], title: "Key Club Requests", showClub: false } },
      { label: "Empty", props: { requests: [], emptyMessage: "You have not logged any hours yet." } },
    ],
  }),
  entry({
    name: "HoursStatRow",
    file: "hoursStatRow.tsx",
    group: "Shared Composites",
    pages: ["Student · Home", "Student · Goal Progress"],
    component: HoursStatRow,
    examples: [{ label: "Default", props: { approved: 6, pending: 3, denied: 1 } }],
  }),
  entry({
    name: "CategoryProgress",
    file: "categoryProgress.tsx",
    group: "Shared Composites",
    pages: ["Student · Goal Progress, Home", "Club Panel · Overview, Hours Progress (total and detail variants)"],
    component: CategoryProgress,
    examples: [
      {
        label: "Student Club",
        props: {
          name: "Key Club",
          earned: 3,
          goal: 15,
          pending: 2,
          line: "3 hrs approved · 2 hrs pending",
          categories: [
            { name: "Service", value: 3, goal: 10 },
            { name: "Event Help", value: 0, goal: 5 },
          ],
        },
      },
      { label: "General Hours Only", props: { name: "Robotics Club", earned: 1, goal: 8, categories: [] } },
      {
        label: "Club Total",
        props: {
          variant: "total",
          earned: 186,
          goal: 400,
          ringCaption: "Club Total",
          ringNote: "1 of 8 Met Goal",
          categories: [
            { name: "Service", value: 120, goal: 240, line: "8 students · 50% of goal" },
            { name: "Tutoring", value: 66, goal: 160, line: "5 students · 41% of goal" },
          ],
        },
      },
      {
        label: "Student Detail",
        width: 560,
        props: {
          variant: "detail",
          ringSize: 110,
          earned: 20,
          goal: 20,
          heading: "Katara Lopez",
          meta: "Seniors · Class Of 2027",
          badge: <Badge tone="approved">Met Goal</Badge>,
          categories: [
            { name: "Service", value: 12, goal: 12 },
            { name: "Tutoring", value: 8, goal: 8 },
          ],
        },
      },
    ],
  }),
  entry({
    name: "ClubCard",
    file: "clubCard.tsx",
    group: "Shared Composites",
    pages: ["Staff · Home", "Staff / Admin · All Clubs", "Student · Home (Exec Clubs), All Clubs, Opportunities, Export (tile variant)"],
    component: ClubCard,
    examples: [
      {
        label: "Card",
        width: 380,
        props: {
          name: "Key Club",
          icon: "heart",
          meta: "64 Members · 2 Categories",
          children: (
            <>
              <span className="staff-card-label">Staff</span>
              <div className="staff-card-staff">Tom Brooks, Priya Patel</div>
            </>
          ),
          actions: <SaveButton size="sm" variant="secondary" icon="person-plus">Assign Staff</SaveButton>,
        },
      },
      { label: "Tile Selected", width: 320, props: { variant: "tile", name: "Art Club", icon: "palette", meta: "2 open events", selected: true, onClick: cb("onClick") } },
      { label: "Tile Checkable", width: 320, props: { variant: "tile", name: "Robotics Club", icon: "gear", meta: "1 hr approved", checkable: true, onClick: cb("onClick") } },
    ],
  }),
  entry({
    name: "ClubPicker",
    file: "clubPicker.tsx",
    group: "Shared Composites",
    pages: ["Student · Opportunities (single)", "Student · Export Portfolio (multi)"],
    component: ClubPicker,
    examples: [
      {
        label: "Single",
        controls: [{ value: "selected", change: "onSelect", map: ((_: string[], v: string) => [v]) as PreviewControl["map"] }],
        props: {
          mode: "single",
          clubs: [
            { value: "Key Club", name: "Key Club", icon: "heart", meta: "4 open events" },
            { value: "Art Club", name: "Art Club", icon: "palette", meta: "2 open events" },
            { value: "Robotics Club", name: "Robotics Club", icon: "gear", meta: "1 open event" },
          ],
          selected: ["Key Club"],
          onSelect: cb("onSelect", "(value)"),
        },
      },
      {
        label: "Multi",
        controls: [{ value: "selected", change: "onSelect", map: toggle as PreviewControl["map"] }],
        props: {
          mode: "multi",
          clubs: [
            { value: "Key Club", name: "Key Club", icon: "heart", meta: "5 hrs approved" },
            { value: "Art Club", name: "Art Club", icon: "palette", meta: "3 hrs approved" },
            { value: "Robotics Club", name: "Robotics Club", icon: "gear", meta: "0 hrs approved" },
          ],
          selected: ["Key Club", "Art Club"],
          onSelect: cb("onSelect", "(value)"),
        },
      },
      { label: "Locked", props: { mode: "multi", locked: true } },
    ],
  }),
  entry({
    name: "ClubPanelTiles",
    file: "clubPanelTiles.tsx",
    group: "Shared Composites",
    pages: ["Staff · Home (Your Clubs)", "Student · Home (Exec Clubs)"],
    component: ClubPanelTiles,
    examples: [
      {
        label: "Staff",
        props: {
          title: "Your Clubs",
          clubs: [
            { name: "National Honor Society", icon: "award", total: 1540 },
            { name: "Student Council", icon: "megaphone", total: 820 },
          ],
          onOpenPanel: cb("onOpenPanel", "(club)"),
        },
      },
      { label: "Student Exec", props: { title: "Exec Clubs", clubs: [{ name: "Art Club", icon: "palette", total: 310 }], onOpenPanel: cb("onOpenPanel", "(club)") } },
      { label: "Empty", props: { clubs: [], emptyText: "You are not assigned to any clubs yet." } },
    ],
  }),
  entry({
    name: "OpportunityCard",
    file: "opportunityCard.tsx",
    group: "Shared Composites",
    pages: ["Student · Opportunities (open, mine)", "Student · Home, All Clubs (compact)", "Club Panel · Opportunities (manage)"],
    note: "Exports the Opportunity type.",
    component: OpportunityCard,
    examples: [
      { label: "Open", props: { opportunity: OPP_FOOD, variant: "open", onSignUp: cb("onSignUp", "(id)"), onCancel: cb("onCancel", "(id)") } },
      { label: "Open Signed Up", props: { opportunity: OPP_FOOD, variant: "open", signedUp: true, onCancel: cb("onCancel", "(id)") } },
      { label: "Open Full", props: { opportunity: OPP_FULL, variant: "open", onSignUp: cb("onSignUp", "(id)") } },
      { label: "Mine", props: { opportunity: OPP_FOOD, variant: "mine", onCancel: cb("onCancel", "(id)") } },
      { label: "Compact", props: { opportunity: OPP_FOOD, variant: "compact" } },
      {
        label: "Manage",
        props: {
          opportunity: OPP_RECURRING,
          variant: "manage",
          onViewRegistered: cb("onViewRegistered", "(id)"),
          onEdit: cb("onEdit", "(id)"),
        },
      },
    ],
  }),
  entry({
    name: "ExportOptions",
    file: "exportOptions.tsx",
    group: "Shared Composites",
    pages: ["Student · Export Portfolio", "Club Panel · Export"],
    note: "Exports the ExportIncludeOption type.",
    component: ExportOptions,
    examples: [
      {
        label: "Student Portfolio",
        controls: [
          {
            value: "includeOptions",
            change: "onIncludeChange",
            map: ((prev: ExportIncludeOption[], value: string, checked: boolean) =>
              prev.map((o) => (o.value === value ? { ...o, checked } : o))) as PreviewControl["map"],
          },
        ],
        props: {
          includeOptions: STUDENT_EXPORT,
          onIncludeChange: cb("onIncludeChange", "(value, checked)"),
          title: "Full Portfolio",
          summary: "2 clubs · 6 hrs approved",
          exportLabel: "Export Portfolio",
          onExport: cb("onExport"),
        },
      },
      {
        label: "Club Export Done",
        controls: [
          { value: "format", change: "onFormatChange" },
          {
            value: "includeOptions",
            change: "onIncludeChange",
            map: ((prev: ExportIncludeOption[], value: string, checked: boolean) =>
              prev.map((o) => (o.value === value ? { ...o, checked } : o))) as PreviewControl["map"],
          },
        ],
        props: {
          formats: ["CSV", "Excel"],
          format: "Excel",
          onFormatChange: cb("onFormatChange", "(format)"),
          includeOptions: CLUB_EXPORT,
          includeTitle: "Sheets",
          title: "Key Club Export",
          summary: "64 members · 412 hrs approved",
          exportLabel: "Export Sheets",
          exportIcon: "download",
          onExport: cb("onExport"),
          done: true,
          doneMessage: "Export ready.",
        },
      },
    ],
  }),
  entry({
    name: "StudentLookup",
    file: "studentLookup.tsx",
    group: "Shared Composites",
    pages: ["Staff · Look Up Students", "Admin · Look Up Students", "Club Panel · Look Up Students (club prop)"],
    note: "Search and student tabs are interactive. The pencil opens EditHoursDialog. Exports LookupStudent and StudentClub types.",
    component: StudentLookup,
    examples: [
      { label: "School-Wide", props: { students: LOOKUP_STUDENTS, editable: true, onSaveLog: cb("onSaveLog", "(log)"), maxTabs: 5 } },
      {
        label: "Club Scoped",
        props: {
          students: LOOKUP_STUDENTS,
          club: "National Honor Society",
          editable: true,
          onSaveLog: cb("onSaveLog", "(log)"),
          searchPlaceholder: "Search By Name, Email Or ID",
        },
      },
    ],
  }),
  entry({
    name: "EditHoursDialog",
    file: "EditHoursDialog.tsx",
    group: "Shared Composites",
    pages: ["Staff / Admin · Look Up Students (edit logged hours)", "Club Panel · Hour Requests (edit or override)"],
    component: EditHoursDialog,
    examples: [
      {
        label: "With Categories",
        frame: "dialog",
        props: {
          request: { ...REQ_PENDING, student: { fName: "Katara", lName: "Lopez" } },
          categories: ["Event Help", "Fundraising"],
          onSave: cb("onSave", "(request)"),
          onDelete: cb("onDelete", "(id)"),
        },
      },
      { label: "General Hours Only", frame: "dialog", props: { request: { ...REQ_DENIED, student: undefined }, categories: [], onSave: cb("onSave", "(request)") } },
    ],
  }),
  entry({
    name: "ClubDirectory",
    file: "ClubDirectory.tsx",
    group: "Shared Composites",
    pages: ["Staff · All Clubs", "Admin · All Clubs (adds Delete Club and Club Executive Panel)"],
    note: "Search works; Create Club, Assign Staff and Delete Club open their dialogs. Exports the DirectoryClub type.",
    component: ClubDirectory,
    examples: [
      {
        label: "Staff",
        props: {
          clubs: DIRECTORY_CLUBS,
          allStaff: ALL_STAFF,
          onCreateClub: cb("onCreateClub", "(values)"),
          onAddStaff: cb("onAddStaff", "(club, staff)"),
          onRemoveStaff: cb("onRemoveStaff", "(club, staff)"),
        },
      },
      {
        label: "Admin",
        props: {
          clubs: DIRECTORY_CLUBS,
          allStaff: ALL_STAFF,
          onCreateClub: cb("onCreateClub", "(values)"),
          onAddStaff: cb("onAddStaff", "(club, staff)"),
          onRemoveStaff: cb("onRemoveStaff", "(club, staff)"),
          onDeleteClub: cb("onDeleteClub", "(club)"),
          onOpenPanel: cb("onOpenPanel", "(club)"),
        },
      },
    ],
  }),
  entry({
    name: "CreateClubDialog",
    file: "CreateClubDialog.tsx",
    group: "Shared Composites",
    pages: ["Staff / Admin · All Clubs (opened from ClubDirectory)"],
    component: CreateClubDialog,
    examples: [{ label: "Default", frame: "dialog", props: { staffOptions: ALL_STAFF, onCreate: cb("onCreate", "(values)") } }],
  }),
  entry({
    name: "AssignStaffDialog",
    file: "AssignStaffDialog.tsx",
    group: "Shared Composites",
    pages: ["Staff / Admin · All Clubs (opened from ClubDirectory)"],
    component: AssignStaffDialog,
    examples: [
      {
        label: "Key Club",
        frame: "dialog",
        controls: [
          { value: "assigned", change: "onAdd", map: ((prev: PersonName[], s: PersonName) => [...prev, s]) as PreviewControl["map"] },
          { value: "assigned", change: "onRemove", map: ((prev: PersonName[], s: PersonName) => prev.filter((n) => fullName(n) !== fullName(s))) as PreviewControl["map"] },
        ],
        props: {
          clubName: "Key Club",
          assigned: [{ fName: "Tom", lName: "Brooks" }, { fName: "Priya", lName: "Patel" }],
          allStaff: ALL_STAFF,
          onAdd: cb("onAdd", "(staff)"),
          onRemove: cb("onRemove", "(staff)"),
        },
      },
    ],
  }),
  entry({
    name: "UserMenu",
    file: "userMenu.tsx",
    group: "Shared Composites",
    pages: ["Every side nav (Aang Smith log out menu)"],
    note: "Pass it as SideNav's footer and toggle `open` from onUserClick. Click the user block to toggle it.",
    component: UserMenu,
    examples: [
      {
        label: "In SideNav",
        frame: "nav",
        props: {
          open: true,
          fName: "Aang",
          lName: "Smith",
          detail: "Student · Class Of 2029",
          items: [{ label: "Export Portfolio", icon: "file-earmark-arrow-down", onClick: cb("onClick") }],
          logoutLabel: "Log Out",
          onLogout: cb("onLogout"),
        },
        render: (p) => <PreviewDemos.UserMenuInNav {...p} />,
      },
    ],
  }),
  entry({
    name: "SiteFooter",
    file: "siteFooter.tsx",
    group: "Shared Composites",
    pages: ["Public · Homepage (with Sign In link)", "Public · Login (no link)"],
    component: SiteFooter,
    examples: [
      { label: "Homepage", props: { text: "Royals Outreach · Hamilton Southeastern High School · Fishers, IN", linkLabel: "Sign In", linkHref: "/login" } },
      { label: "Login", props: { text: "Royals Outreach · Hamilton Southeastern High School · Fishers, IN" } },
    ],
  }),

  // ---------- Club Executive Panel ----------
  entry({
    name: "ClubPanelNav",
    file: "clubPanelNav.tsx",
    group: "Club Executive Panel",
    pages: ["Every Club Panel section (side nav with RBAC via canSee)"],
    note: "Student execs only see Overview, Hour Requests, Hours Progress, Opportunities and Image Folder. Image Folder opens OneDrive in a new tab.",
    component: ClubPanelNav,
    examples: [
      {
        label: "Staff",
        frame: "nav",
        controls: [{ value: "value", change: "onChange" }],
        props: {
          role: "Staff",
          value: "requests",
          onChange: cb("onChange", "(section)"),
          badges: { requests: 7, opportunities: 3 },
          imageFolderHref: "https://onedrive.live.com",
          backHref: "/staff",
        },
      },
      {
        label: "Student Exec",
        frame: "nav",
        controls: [{ value: "value", change: "onChange" }],
        props: { role: "Student", value: "overview", badges: { requests: 2 }, backHref: "/student" },
      },
      {
        label: "Admin",
        frame: "nav",
        controls: [{ value: "value", change: "onChange" }],
        props: { role: "Admin", value: "roles", backHref: "/admin" },
      },
    ],
  }),
  entry({
    name: "ClubSectionHeader",
    file: "clubSectionHeader.tsx",
    group: "Club Executive Panel",
    pages: ["Every Club Panel section (title, club name eyebrow, actions)"],
    component: ClubSectionHeader,
    examples: [
      {
        label: "With Actions",
        props: {
          title: "Hour Requests",
          subtitle: "Approve, deny or override logged hours.",
          clubName: "Key Club",
          actions: <SaveButton variant="secondary" icon="plus-lg">Add Hours Manually</SaveButton>,
        },
      },
      { label: "Plain", props: { title: "Club Config", subtitle: "Name, logo and hour rules for this club.", clubName: "National Honor Society" } },
    ],
  }),
  entry({
    name: "ClubSaveBar",
    file: "clubSaveBar.tsx",
    group: "Club Executive Panel",
    pages: ["Club Panel · Club Config, Categories, Member Groups, Exec And Roles"],
    component: ClubSaveBar,
    examples: [
      { label: "Dirty", props: { dirty: true, onDiscard: cb("onDiscard"), onSave: cb("onSave") } },
      { label: "Clean", props: { dirty: false } },
    ],
  }),
  entry({
    name: "ClubSettingRow",
    file: "clubSettingRow.tsx",
    group: "Club Executive Panel",
    pages: ["Club Panel · Club Config (Hour Rules)", "Club Panel · Categories (compact, inside a category card)"],
    component: ClubSettingRow,
    examples: [
      {
        label: "Row",
        controls: [{ value: "checked", change: "onChange" }],
        props: { title: "Exec Needs Hours", description: "Student execs log hours like other members.", checked: true, onChange: cb("onChange", "(checked)"), variant: "row" },
      },
      {
        label: "Compact",
        width: 420,
        controls: [{ value: "checked", change: "onChange" }],
        props: { title: "Needs Club Confirmation", description: "An exec approves each request.", checked: false, variant: "compact" },
      },
      { label: "Disabled", props: { title: "Double Dipping", description: "Count one request toward two clubs.", checked: false, disabled: true } },
    ],
  }),
  entry({
    name: "StudentRosterModal",
    file: "StudentRosterModal.tsx",
    group: "Club Executive Panel",
    pages: ["Club Panel · Opportunities (registered students)", "Club Panel · Member Groups (assigned students)"],
    note: "Exports the RosterStudent type.",
    component: StudentRosterModal,
    examples: [
      {
        label: "Registered",
        frame: "dialog",
        props: {
          title: "Registered · After School Tutoring",
          students: ROSTER,
          footerActions: <SaveButton variant="secondary" icon="download">Export Registered</SaveButton>,
        },
      },
      {
        label: "Member Group",
        frame: "dialog",
        props: {
          title: "Assigned Students · Seniors",
          students: ROSTER.map(({ id, fName, lName }) => ({ id, fName, lName })),
          onRemove: cb("onRemove", "(id)"),
          limit: 3,
        },
      },
    ],
  }),

  // ---------- App wiring ----------
  entry({
    name: "Providers",
    file: "Providers.tsx",
    group: "App Wiring",
    pages: ["Root layout (session provider goes here once auth is added)"],
    note: "Renders its children unchanged for now.",
    component: Providers,
    examples: [{ label: "Default", props: { children: <p>App content renders here.</p> } }],
  }),
];
