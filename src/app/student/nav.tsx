"use client";

import { usePathname } from "next/navigation";
import SideNav, { STUDENT_NAV_ITEMS, type SideNavUser } from "@/app/components/sideNav";
import MobileNav from "@/app/components/MobileNav";

const STUDENT_ROUTES: Record<string, string> = {
  home: "/student",
  log: "/student/log",
  hours: "/student/goals",
  req: "/student/requests",
  opps: "/student/opportunities",
  clubs: "/student/clubs",
  export: "/student/export",
};

type StudentNavUIProps = {
  user: SideNavUser | null;
};

export default function StudentNavUI({ user }: StudentNavUIProps) {
  const pathname = usePathname();
  const section = Object.keys(STUDENT_ROUTES).find((value) => STUDENT_ROUTES[value] === pathname);

  const ITEMS = STUDENT_NAV_ITEMS.map((item) =>
    item.value ? { ...item, href: STUDENT_ROUTES[item.value] } : item,
  );

  return (
    <>
      <SideNav items={ITEMS} value={section} user={user} />
      <MobileNav items={ITEMS} value={section} user={user} />
    </>
  );
}
