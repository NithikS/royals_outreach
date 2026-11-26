import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { cacheLife } from "next/cache";
import "bootstrap-icons/font/bootstrap-icons.css";
import AppHeader from "./components/appHeader";
import Badge from "./components/badge";
import ProgressBar from "./components/progressBar";
import ProgressRing from "./components/progressRing";
import SchoolFooter from "./components/schoolFooter";
import royalsOutreachLogo from "./assets/logo.png";
import "./css/home.css";
import { getSchoolStats } from "@/actions/stats";
import { formatHours } from "@/lib/formatHours";

const NAV_LINKS = [
  { label: "Impact", href: "#impact" },
  { label: "Features", href: "#features" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Made At HSE", href: "#made-at-hse" },
];

const STATS = [
  { label: "Hours Served", tone: "blue" },
  { label: "Students", tone: "red" },
  { label: "Clubs", tone: "blue" },
  { label: "This Month", tone: "red" },
];

const WHY = [
  {
    value: "58%",
    text: "of admissions leaders say community service has a positive impact on acceptance.",
  },
  {
    value: "53%",
    text: "say it is used as a tie breaker between equally qualified applicants.",
  },
];

const ROLES = [
  {
    title: "Students",
    number: "01",
    points: [
      "Log hours in a minute",
      "Track your club goals",
      "Export a portfolio for college",
    ],
    preview: (
      <div className="home-role-preview home-role-preview-row">
        <ProgressRing
          value={17}
          goal={25}
          size={112}
          thickness={10}
          label="17"
          sublabel="of 25 hrs"
        />
        <div className="home-role-preview-bars">
          <ProgressBar label="Key Club" value={12} goal={15} height={10} />
          <ProgressBar label="NHS" value={5} goal={10} height={10} />
        </div>
      </div>
    ),
  },
  {
    title: "Club Execs",
    number: "02",
    points: [
      "Approve hour requests",
      "Scan IDs for event attendance",
      "Post opportunities with sign ups",
    ],
    preview: (
      <div className="home-role-preview">
        <div className="home-role-request">
          Canned Food Drive · 4 hrs
          <Badge tone="approved">Approved</Badge>
        </div>
        <div className="home-role-request">
          Tutoring Night · 2 hrs
          <Badge tone="pending">Pending</Badge>
        </div>
      </div>
    ),
  },
  {
    title: "Sponsors",
    number: "03",
    points: [
      "See school wide reports",
      "Look up any student",
      "Export anything to Excel",
    ],
    preview: (
      <div className="home-role-preview">
        <ProgressBar
          label="National Honor Society"
          value={4210}
          goal={5000}
          height={10}
        />
        <ProgressBar label="Key Club" value={3385} goal={5000} height={10} />
      </div>
    ),
  },
];

const STEPS = [
  {
    icon: "pencil-square",
    title: "Log",
    body: "Students log their hours or sign up for an opportunity.",
    preview: (
      <div className="home-step-preview home-step-preview-form">
        <div className="home-step-field">Food Pantry Pack Out</div>
        <div className="home-step-form-row">
          <div className="home-step-field">3 hrs</div>
          <span className="home-step-submit">Submit</span>
        </div>
      </div>
    ),
  },
  {
    icon: "envelope-check",
    title: "Verify",
    body: "Outside coordinators confirm the hours from an email when needed.",
    preview: (
      <div className="home-step-preview home-step-preview-row">
        <i className="bi bi-envelope-paper-fill home-step-preview-icon" />
        <div className="home-step-coordinator">
          <div className="home-step-coordinator-name">Dana Whitfield</div>
          <div className="home-step-coordinator-org">Midwest Food Bank</div>
        </div>
        <i className="bi bi-check-circle-fill home-step-preview-check" />
      </div>
    ),
  },
  {
    icon: "person-check-fill",
    title: "Approve",
    body: "A club exec or sponsor approves the request.",
    preview: (
      <div className="home-step-preview home-step-preview-row home-step-preview-spread">
        <span className="home-step-request">Pack Out · 3 hrs</span>
        <Badge tone="approved">Approved</Badge>
      </div>
    ),
  },
  {
    icon: "trophy-fill",
    title: "Count",
    body: "Hours add up for the student, the club and all of HSE.",
    red: true,
    preview: (
      <div className="home-step-preview home-step-preview-red">
        <ProgressBar label="Key Club Goal" value={15} goal={15} height={10} />
      </div>
    ),
  },
];

export default function HomePage() {
  return (
    <div className="home">
      <AppHeader variant="blue" links={NAV_LINKS} />

      <main>
        {/* Hero */}
        <section className="home-hero">
          <div className="home-hero-inner">
            <div className="home-hero-text">
              <p className="home-label">Hamilton Southeastern High School</p>
              <h1 className="home-hero-title">
                Royals
                <br />
                give <span className="home-hero-title-red">back.</span>
              </h1>
              <p className="home-hero-lead">
                Log your service hours, get them approved by your club, and help
                HSE build its biggest year of service yet.
              </p>
              <div className="home-buttons">
                <Link href="/login" className="home-btn home-btn-red">
                  <i className="bi bi-box-arrow-in-right" aria-hidden="true" />
                  Sign In
                </Link>
                <Link href="#impact" className="home-btn home-btn-line">
                  Our Impact
                </Link>
              </div>
              <Suspense fallback={<HeroCountLines clubs="–" students="–" />}>
                <HeroCounts />
              </Suspense>
            </div>
            <div className="home-hero-logo-wrap">
              <div className="home-hero-circle" aria-hidden="true" />
              <Image
                src={royalsOutreachLogo}
                alt="Royals Outreach logo"
                className="home-hero-logo"
                sizes="(max-width: 900px) 260px, 440px"
                preload
              />
            </div>
          </div>
        </section>

        {/* Our Impact This Year */}
        <section
          id="impact"
          className="home-section"
          aria-labelledby="impact-title"
        >
          <p className="home-label">Season Stats</p>
          <h2 id="impact-title" className="home-h2">
            Our impact this year
          </h2>
          <Suspense fallback={<StatBoxes values={STATS.map(() => "–")} />}>
            <SchoolStats />
          </Suspense>
        </section>

        {/* Why It Matters */}
        <section
          id="why-it-matters"
          className="home-why"
          aria-labelledby="why-title"
        >
          <div className="home-why-inner">
            <div>
              <p className="home-label">Why It Matters</p>
              <h2 id="why-title" className="home-h2 home-why-title">
                Service hours matter after graduation
              </h2>
              <p className="home-why-text">
                In a 2018 survey of 264 college admissions leaders, service
                experience carried real weight in who gets accepted.
              </p>
              <p className="home-why-source">
                Source: Newton, D. (2018). Forbes.
              </p>
            </div>
            <div className="home-why-facts">
              {WHY.map((fact) => (
                <div key={fact.value} className="home-why-fact">
                  <span className="home-why-value">{fact.value}</span>
                  <span className="home-why-fact-text">{fact.text}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Built For Every Royal */}
        <section
          id="features"
          className="home-section"
          aria-labelledby="features-title"
        >
          <p className="home-label">The Roster</p>
          <h2 id="features-title" className="home-h2">
            Built for every Royal
          </h2>
          <div className="home-roles">
            {ROLES.map((role) => (
              <article key={role.title} className="home-role">
                <div className="home-role-head">
                  <h3 className="home-role-title">{role.title}</h3>
                  <span className="home-role-number" aria-hidden="true">
                    {role.number}
                  </span>
                </div>
                <div aria-hidden="true">{role.preview}</div>
                <ul className="home-role-points">
                  {role.points.map((point) => (
                    <li key={point} className="home-role-point">
                      <i className="bi bi-star-fill" aria-hidden="true" />
                      {point}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>

        {/* How It Works */}
        <section
          id="how-it-works"
          className="home-section"
          aria-labelledby="how-title"
        >
          <p className="home-label">The Play</p>
          <h2 id="how-title" className="home-h2">
            How it works
          </h2>
          <ol className="home-steps">
            {STEPS.map((step, i) => (
              <li
                key={step.title}
                className={`home-step ${step.red ? "home-step-red" : ""}`.trim()}
              >
                <div className="home-step-top">
                  <span className="home-step-icon" aria-hidden="true">
                    <i className={`bi bi-${step.icon}`} />
                  </span>
                  <span className="home-step-number">STEP {i + 1}</span>
                </div>
                <h3 className="home-step-title">{step.title}</h3>
                <p className="home-step-body">{step.body}</p>
                <div aria-hidden="true">{step.preview}</div>
              </li>
            ))}
          </ol>
        </section>

        {/* Made At HSE */}
        <section
          id="made-at-hse"
          className="home-section home-made-section"
          aria-labelledby="made-title"
        >
          <div className="home-made">
            <div className="home-made-stripe" aria-hidden="true" />
            {/* TODO: add photo (swap this placeholder for next/image with fill and object-fit: cover) */}
            <div className="home-made-photo" aria-hidden="true">
              <i className="bi bi-person-fill" />
              Photo
            </div>
            <div className="home-made-body">
              {/* <p className="home-label home-made-label">Made At HSE</p> */}
              <h2 id="made-title" className="home-made-title">
                <span className="home-made-by">Made by</span>
                Nithik Sajja
              </h2>
              <p className="home-made-text">
                Built in HSE&apos;s <b>Software Development Capstone</b> class,
                where students team up to build real apps for real clients.
              </p>
              <div className="home-buttons">
                <a
                  className="home-btn home-btn-red"
                  href="https://nithiksajja.com"
                  target="_blank"
                  rel="noopener"
                >
                  nithiksajja.com
                </a>
                <a
                  className="home-btn home-btn-white"
                  href="https://cs.hseapps.org"
                  target="_blank"
                  rel="noopener"
                >
                  About The Class
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Ready line */}
        <p className="home-ready">
          Ready to log your hours?
          <Link href="/login" className="home-ready-link">
            Sign In <i className="bi bi-arrow-right" aria-hidden="true" />
          </Link>
        </p>
      </main>

      <SchoolFooter
        className="home-footer"
        lines={[
          { icon: "geo-alt-fill", text: "12499 Olio Road, Fishers, IN 46037" },
          { icon: "telephone-fill", text: "Office (317) 594-4190" },
          // TODO: real contact email
          { icon: "envelope-fill", text: "Questions? [email goes here]" },
        ]}
        bottom={
          <div className="home-footer-strip">
            <span>
              Royals Outreach · Hamilton Southeastern High School · Fishers, IN
            </span>
            <span>
              Built by{" "}
              <a href="https://nithiksajja.com" target="_blank" rel="noopener">
                Nithik Sajja
              </a>{" "}
              in the{" "}
              <a href="https://cs.hseapps.org" target="_blank" rel="noopener">
                Software Development Capstone
              </a>
            </span>
          </div>
        }
      />
    </div>
  );
}

// Same numbers for every visitor, so they are cached and refreshed hourly.
// The hero line and the stat boxes share this one cached call.
async function getHomeStats() {
  "use cache";
  cacheLife("hours");
  const stats = await getSchoolStats();

  return {
    totalHours: formatHours(stats.totalHours),
    students: stats.studentsServing.toLocaleString("en-US"),
    clubs: stats.clubs.toLocaleString("en-US"),
    thisMonth: formatHours(stats.hoursThisMonth),
  };
}

async function HeroCounts() {
  const stats = await getHomeStats();
  return <HeroCountLines clubs={stats.clubs} students={stats.students} />;
}

function HeroCountLines({
  clubs,
  students,
}: {
  clubs: string;
  students: string;
}) {
  return (
    <div className="home-hero-counts">
      <span>
        <i className="bi bi-building" aria-hidden="true" /> {clubs} clubs and
        honor societies
      </span>
      <span>
        <i className="bi bi-people-fill" aria-hidden="true" /> {students}{" "}
        students serving
      </span>
    </div>
  );
}

async function SchoolStats() {
  const stats = await getHomeStats();
  return (
    <StatBoxes
      values={[stats.totalHours, stats.students, stats.clubs, stats.thisMonth]}
    />
  );
}

function StatBoxes({ values }: { values: string[] }) {
  return (
    <div className="home-stats">
      {STATS.map((stat, i) => (
        <div key={stat.label} className="home-stat">
          <div className="home-stat-label">{stat.label}</div>
          <div className={`home-stat-value home-stat-value-${stat.tone}`}>
            <StatValue value={values[i]} />
          </div>
        </div>
      ))}
    </div>
  );
}

// "18,420 hrs" keeps its unit, set smaller so the big number fits the box
function StatValue({ value }: { value: string }) {
  const [number, ...unit] = value.split(" ");
  return (
    <>
      {number}
      {unit.length > 0 && (
        <span className="home-stat-unit"> {unit.join(" ")}</span>
      )}
    </>
  );
}
