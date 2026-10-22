import { Suspense } from "react";
import ClubPanelNavUI from "./nav";
import "../../css/shell.css";

export default function ClubPanelLayout({ children }: LayoutProps<"/club/[clubId]">) {
  return (
    <div className="shell">
      {/* Nav reads the club id from the URL, so it streams in at request time */}
      <Suspense fallback={null}>
        <ClubPanelNavUI />
      </Suspense>

      <main className="shell-main">
        <div className="page-content">{children}</div>
      </main>
    </div>
  );
}
