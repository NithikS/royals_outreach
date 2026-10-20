"use client";

import React, { useEffect, useState } from "react";
import "bootstrap-icons/font/bootstrap-icons.css";
import PageTitle from "../components/pageTitle";
import SectionHead from "../components/sectionHead";
import FilterBar from "../components/filterBar";
import Tabs from "../components/tabs";
import SaveButton from "../components/saveButton";
import EmptyState from "../components/emptyState";
import { useToast } from "../context/ToastContext";
import { PREVIEW_ENTRIES, PREVIEW_GROUPS, type PreviewEntry } from "./previewEntries";
import { label, printJsx, setPreviewNotify } from "./previewTools";
import "../css/preview.css";

type Example = PreviewEntry["examples"][number];
type MapFn = (prev: unknown, ...args: unknown[]) => unknown;

const slug = (name: string) => `preview-${name.toLowerCase()}`;

export default function ComponentGallery() {
  const { showToast } = useToast();
  const [query, setQuery] = useState("");
  const [groups, setGroups] = useState<string[]>([]);

  // Preview callbacks report through a toast
  useEffect(() => {
    setPreviewNotify((message) => showToast(message, "info"));
  }, [showToast]);

  const q = query.trim().toLowerCase();
  const shown = PREVIEW_ENTRIES.filter(
    (e) =>
      (groups.length === 0 || groups.includes(e.group)) &&
      `${e.name} ${e.file} ${e.pages.join(" ")}`.toLowerCase().includes(q),
  );

  return (
    <div className="preview-page">
      {/* Index */}
      <aside className="preview-index" aria-label="Components">
        {PREVIEW_GROUPS.map((group) => {
          const items = shown.filter((e) => e.group === group);
          if (items.length === 0) return null;
          return (
            <div key={group} className="preview-index-group">
              <div className="preview-index-label">{group}</div>
              {items.map((e) => (
                <a key={e.name} href={`#${slug(e.name)}`} className="preview-index-link">
                  {e.name}
                </a>
              ))}
            </div>
          );
        })}
      </aside>

      {/* Body */}
      <main className="preview-main">
        <PageTitle
          align="left"
          subtitle={`${PREVIEW_ENTRIES.length} components from src/app/components, each with the mockup pages it is planned for, the props passed, and a live render with fake data. Callbacks show a toast when they fire.`}
        >
          Component Preview
        </PageTitle>

        <FilterBar
          searchPlaceholder="Search Components Or Pages"
          searchValue={query}
          onSearchChange={setQuery}
          chips={PREVIEW_GROUPS.map((g) => ({
            value: g,
            label: g,
            count: PREVIEW_ENTRIES.filter((e) => e.group === g).length,
          }))}
          activeChips={groups}
          onChipToggle={(g) => setGroups((prev) => (prev.includes(g) ? prev.filter((v) => v !== g) : [...prev, g]))}
        />

        {PREVIEW_GROUPS.map((group) => {
          const items = shown.filter((e) => e.group === group);
          if (items.length === 0) return null;
          return (
            <section key={group} className="preview-group">
              <SectionHead size="lg">{group}</SectionHead>
              {items.map((e) => (
                <PreviewCard key={e.name} entry={e} />
              ))}
            </section>
          );
        })}

        {shown.length === 0 && <EmptyState icon="search" message="No components match your search." framed />}
      </main>
    </div>
  );
}

function PreviewCard({ entry }: { entry: PreviewEntry }) {
  const [index, setIndex] = useState(0);
  const example = entry.examples[index];
  const dialog = example.frame === "dialog";

  // Dialogs get their onClose from the gallery; show it in the props too
  const shownProps = dialog
    ? { ...example.props, onClose: label(() => {}, "() => setOpen(false)") }
    : example.props;
  const code = printJsx(entry.name, shownProps);

  return (
    <article id={slug(entry.name)} className="preview-card">
      {/* 1. Name */}
      <header className="preview-card-head">
        <h2 className="preview-card-name">{entry.name}</h2>
        <code className="preview-card-file">src/app/components/{entry.file}</code>
      </header>

      {entry.examples.length > 1 && (
        <Tabs
          className="preview-card-tabs"
          ariaLabel={`${entry.name} Examples`}
          tabs={entry.examples.map((ex, i) => ({ value: String(i), label: ex.label }))}
          value={String(index)}
          onChange={(v) => setIndex(Number(v))}
        />
      )}

      <div className="preview-card-grid">
        {/* 2. Pages */}
        <div>
          <div className="preview-label">
            <i className="bi bi-window-stack" aria-hidden="true" /> Used On (Mockups)
          </div>
          <ul className="preview-pages">
            {entry.pages.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
          {entry.note && <p className="preview-note">{entry.note}</p>}
        </div>

        {/* 3. Props */}
        <div className="preview-props">
          <div className="preview-label">
            <i className="bi bi-braces" aria-hidden="true" /> Props Passed
            {entry.examples.length > 1 && <span className="preview-label-example"> · {example.label}</span>}
          </div>
          <pre className="preview-code">
            <code>{code}</code>
          </pre>
        </div>
      </div>

      {/* 4. Live component */}
      <div className="preview-label">
        <i className="bi bi-eye" aria-hidden="true" /> Live Preview
      </div>
      <div className="preview-stage">
        <ExampleStage key={index} entry={entry} example={example} />
      </div>
    </article>
  );
}

function ExampleStage({ entry, example }: { entry: PreviewEntry; example: Example }) {
  const Component = entry.component;
  const controls = example.controls ?? [];
  const [open, setOpen] = useState(false);
  const [values, setValues] = useState<Record<string, unknown>>(() =>
    Object.fromEntries(controls.map((c) => [c.value, example.props[c.value]])),
  );

  // Controlled props live in state; each change callback updates its value, then runs the original
  const props: Record<string, unknown> = { ...example.props, ...values };
  for (const c of controls) {
    const original = example.props[c.change] as ((...args: unknown[]) => void) | undefined;
    const map = (c.map as MapFn | undefined) ?? ((_prev: unknown, next: unknown) => next);
    props[c.change] = (...args: unknown[]) => {
      setValues((prev) => ({ ...prev, [c.value]: map(prev[c.value], ...args) }));
      original?.(...args);
    };
  }
  if (example.frame === "dialog") props.onClose = () => setOpen(false);

  const content = example.render ? example.render(props) : <Component {...props} />;

  if (example.frame === "dialog") {
    return (
      <>
        <SaveButton icon="window" onClick={() => setOpen(true)}>
          Open {entry.name}
        </SaveButton>
        {open && content}
      </>
    );
  }

  if (example.frame === "nav") {
    return (
      <div className="preview-frame-nav">
        {content}
        <div className="preview-frame-page">Page content sits here, right of the side nav.</div>
      </div>
    );
  }

  if (example.frame === "mobile") {
    return (
      <div className="preview-frame-mobile">
        {content}
        <div className="preview-frame-page">Phone width (390px)</div>
      </div>
    );
  }

  return (
    <div className="preview-inline" style={example.width ? { maxWidth: example.width } : undefined}>
      {content}
    </div>
  );
}
