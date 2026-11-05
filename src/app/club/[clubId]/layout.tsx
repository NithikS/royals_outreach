import { Suspense } from "react";
import ClubPanelNavUI from "./nav";
import { getClubPendingRequestCount } from "@/actions/clubRequests";
import "../../css/shell.css";

export default function ClubPanelLayout({ children, params }: LayoutProps<"/club/[clubId]">) {
  return (
    <div className="shell">
      {/* Nav reads the club id from the URL, so it streams in at request time */}
      <Suspense fallback={null}>
        <ClubPanelNavLoader params={params} />
      </Suspense>

      <main className="shell-main">
        <div className="page-content">{children}</div>
      </main>
    </div>
  );
}

async function ClubPanelNavLoader({ params }: { params: Promise<{ clubId: string }> }) {
  const clubId = Number((await params).clubId);
  const pendingRequests = Number.isInteger(clubId) ? await getClubPendingRequestCount(clubId) : 0;

  return <ClubPanelNavUI pendingRequests={pendingRequests} />;
}
