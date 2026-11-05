import { Suspense } from "react";
import { connection } from "next/server";
import StudentNavUI from "./nav";
import { getCurrentStudent } from "@/actions/student";
import "../css/shell.css";

export default function StudentLayout({ children }: LayoutProps<"/student">) {
  return (
    <div className="shell">
      {/* Nav shows the signed-in student, so it streams in at request time */}
      <Suspense fallback={null}>
        <StudentNavLoader />
      </Suspense>

      <main className="shell-main">
        <div className="page-content">{children}</div>
      </main>
    </div>
  );
}

async function StudentNavLoader() {
  // TODO: reading the session makes this request-time once auth is added
  await connection();
  const student = await getCurrentStudent();

  return <StudentNavUI user={student ? { fName: student.fName, lName: student.lName, role: "Student" } : null} />;
}
