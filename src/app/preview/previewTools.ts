import React from "react";

// ================= Callbacks =================

type Labeled = { __src?: string };

let notify: (message: string) => void = () => {};

/** The gallery points this at showToast so preview callbacks are visible. */
export function setPreviewNotify(fn: (message: string) => void) {
  notify = fn;
}

function formatArg(arg: unknown): string {
  if (typeof arg === "string") return JSON.stringify(arg);
  if (typeof arg === "number" || typeof arg === "boolean") return String(arg);
  if (arg && typeof arg === "object" && "target" in arg) return "e";
  if (arg && typeof arg === "object") return "{…}";
  return String(arg);
}

/** A fake handler that toasts "name(args) called." and prints as `sig => {…}` in the props panel. */
export function cb(name: string, sig = "()") {
  const fn = (...args: unknown[]) => notify(`${name}(${args.map(formatArg).join(", ")}) called.`);
  return label(fn, `${sig} => {…}`);
}

/** Attach the text the props panel prints for a function (e.g. an InfoTable render). */
export function label<F extends (...args: never[]) => unknown>(fn: F, src: string): F {
  (fn as F & Labeled).__src = src;
  return fn;
}

// ================= JSX printer =================

const IDENT = /^[A-Za-z_$][\w$]*$/;
const MAX = 76;

function typeName(type: unknown): string {
  if (type === React.Fragment) return "";
  if (typeof type === "string") return type;
  if (typeof type === "function") {
    return (type as { displayName?: string }).displayName || type.name || "Component";
  }
  if (type && typeof type === "object") {
    const t = type as { displayName?: string; render?: { name?: string }; type?: unknown };
    return t.displayName || t.render?.name || (t.type ? typeName(t.type) : "Component");
  }
  return "Component";
}

export function printValue(value: unknown, indent = 0): string {
  const pad = "  ".repeat(indent);
  const inner = "  ".repeat(indent + 1);

  if (value === undefined) return "undefined";
  if (value === null) return "null";
  if (typeof value === "string") return JSON.stringify(value);
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  if (typeof value === "function") return (value as Labeled).__src ?? "() => {…}";
  if (React.isValidElement(value)) {
    return printJsx(typeName(value.type), value.props as Record<string, unknown>, indent);
  }

  if (Array.isArray(value)) {
    if (value.length === 0) return "[]";
    const parts = value.map((v) => printValue(v, indent + 1));
    const flat = `[${parts.join(", ")}]`;
    if (!flat.includes("\n") && flat.length + pad.length <= MAX) return flat;
    return `[\n${parts.map((p) => inner + p).join(",\n")},\n${pad}]`;
  }

  if (typeof value === "object") {
    const entries = Object.entries(value).filter(([, v]) => v !== undefined);
    if (entries.length === 0) return "{}";
    const parts = entries.map(
      ([k, v]) => `${IDENT.test(k) ? k : JSON.stringify(k)}: ${printValue(v, indent + 1)}`,
    );
    const flat = `{ ${parts.join(", ")} }`;
    if (!flat.includes("\n") && flat.length + pad.length <= MAX) return flat;
    return `{\n${parts.map((p) => inner + p).join(",\n")},\n${pad}}`;
  }

  return String(value);
}

function printAttr(key: string, value: unknown, indent: number) {
  if (value === true) return key;
  if (typeof value === "string") return `${key}=${JSON.stringify(value)}`;
  return `${key}={${printValue(value, indent)}}`;
}

function flattenChildren(children: unknown): unknown[] {
  if (children === undefined || children === null || typeof children === "boolean") return [];
  if (Array.isArray(children)) return children.flatMap(flattenChildren);
  return [children];
}

/** Prints a component call as formatted JSX: `<Name prop="x" other={{ … }} />`. */
export function printJsx(name: string, props: Record<string, unknown>, indent = 0): string {
  const pad = "  ".repeat(indent);
  const inner = "  ".repeat(indent + 1);
  const { children, ...rest } = props;

  const attrs = Object.entries(rest)
    .filter(([, v]) => v !== undefined)
    .map(([k, v]) => printAttr(k, v, indent + 1));
  // Text prints bare, elements print as JSX, anything else goes in braces
  const wrapped = flattenChildren(children).map((c) => {
    if (typeof c === "string" || typeof c === "number") return String(c);
    if (React.isValidElement(c)) return printValue(c, indent + 1);
    return `{${printValue(c, indent + 1)}}`;
  });

  const open = `<${name}`;
  const flatAttrs = attrs.length ? ` ${attrs.join(" ")}` : "";
  const oneLine = !attrs.some((a) => a.includes("\n")) && pad.length + open.length + flatAttrs.length <= MAX;

  if (wrapped.length === 0) {
    if (!name) return "<></>";
    return oneLine
      ? `${open}${flatAttrs} />`
      : `${open}\n${attrs.map((a) => inner + a).join("\n")}\n${pad}/>`;
  }

  const head = oneLine ? `${open}${flatAttrs}>` : `${open}\n${attrs.map((a) => inner + a).join("\n")}\n${pad}>`;
  const close = `</${name}>`;
  const flatKids = wrapped.join("");

  if (oneLine && !flatKids.includes("\n") && pad.length + head.length + flatKids.length + close.length <= MAX) {
    return `${head}${flatKids}${close}`;
  }
  return `${head}\n${wrapped.map((k) => inner + k).join("\n")}\n${pad}${close}`;
}
