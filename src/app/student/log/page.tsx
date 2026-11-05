import { Suspense } from "react";
import { connection } from "next/server";
import LogHoursUI from "./ui";
import { getLogHoursClubs } from "@/actions/hours";
import { schoolToday } from "@/lib/schoolDate";

export default function LogHoursPage() {
  return (
    <Suspense fallback={null}>
      <LogHoursLoader />
    </Suspense>
  );
}

async function LogHoursLoader() {
  // TODO: reading the session makes this request-time once auth is added
  await connection();
  const clubs = await getLogHoursClubs();

  return <LogHoursUI clubs={clubs} today={schoolToday()} />;
}
