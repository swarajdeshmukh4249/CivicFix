import type { LocationPrecision } from "../api/types";
import { CATEGORY_LABELS } from "../api/types";
import "./badges.css";

export function CategoryTag({ category }: { category: string }) {
  return (
    <span className="tag tag--category" style={{ borderColor: `var(--cat-${category}, var(--ink-faint))` }}>
      <span className="tag__dot" style={{ background: `var(--cat-${category}, var(--ink-faint))` }} />
      {CATEGORY_LABELS[category] ?? category}
    </span>
  );
}

export function SeverityTag({ severity }: { severity: string }) {
  const color = severity === "critical" ? "var(--critical)" : severity === "moderate" ? "var(--moderate)" : "var(--cosmetic)";
  return (
    <span className="tag" style={{ borderColor: color, color }}>
      {severity}
    </span>
  );
}

export function PrecisionTag({ precision }: { precision: LocationPrecision }) {
  if (precision === "precise") {
    return (
      <span className="tag" style={{ borderColor: "var(--precise)", color: "var(--precise)" }}>
        Precise location
      </span>
    );
  }
  if (precision === "ward_level") {
    return (
      <span className="tag" style={{ borderColor: "var(--ward-level)", color: "var(--ward-level)" }}>
        Ward-level location
      </span>
    );
  }
  return (
    <span className="tag" style={{ borderColor: "var(--ink-faint)", color: "var(--ink-faint)" }}>
      Location unknown
    </span>
  );
}

export function SyntheticTag() {
  return <span className="tag tag--synthetic">Demo data</span>;
}

export function StatusTag({ status }: { status: string }) {
  return <span className="tag tag--status">{status}</span>;
}
