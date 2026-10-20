import React from "react";
import StatCard from "./statCard";
import "../css/student.css";
import { formatHours } from "@/lib/formatHours";

type HoursStatRowProps = {
  approved?: number;
  pending?: number;
  denied?: number;
  className?: string;
};

export default function HoursStatRow({
  approved = 6,
  pending = 3,
  denied = 1,
  className = "",
}: HoursStatRowProps) {
  return (
    <div className={`student-stat-row ${className}`.trim()}>
      <StatCard label="Approved" value={formatHours(approved)} icon="check-circle-fill" />
      <StatCard label="Pending" value={formatHours(pending)} icon="hourglass-split" />
      <StatCard label="Denied" value={formatHours(denied)} icon="x-circle-fill" />
    </div>
  );
}
