import Link from "next/link";
import Image from "next/image";
import royalsOutreachLogo from "../assets/logo.png";
import "../css/logo+login.css";

export default function LogoButton({
  href = "/",
  className = "",
}: {
  href?: string;
  className?: string;
}) {
  return (
    <Link href={href} className={`home-logo-button ${className}`.trim()} aria-label="Royals Outreach Home">
      <Image
        src={royalsOutreachLogo}
        alt="Royals Outreach Logo"
        width={72}
        height={72}
        className="logo"
      />
    </Link>
  );
}
