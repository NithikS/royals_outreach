import { Suspense } from "react";
import { connection } from "next/server";
import MyRequestsUI from "./ui";
import { getMyRequests } from "@/actions/hours";
import { schoolToday } from "@/lib/schoolDate";

export default function MyRequestsPage() {
  return (
    <Suspense fallback={null}>
      <MyRequestsLoader />
    </Suspense>
  );
}

async function MyRequestsLoader() {
  // TODO: reading the session makes this request-time once auth is added
  await connection();
  const requests = await getMyRequests();

  return <MyRequestsUI requests={requests} today={schoolToday()} />;
}
