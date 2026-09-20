import type { PriorityBreakdown } from "../api/types";
import "./prioritybreakdown.css";

const TERM_LABELS: Record<keyof PriorityBreakdown["terms"], string> = {
  exposure: "Exposure",
  severity: "Severity",
  recurrence: "Recurrence",
  time_open: "Time open",
};

export function PriorityBreakdownView({ breakdown }: { breakdown: PriorityBreakdown }) {
  const terms = Object.keys(TERM_LABELS) as (keyof PriorityBreakdown["terms"])[];
  return (
    <div className="priority">
      <p className="priority__intro">
        A fixed formula, not a model prediction:{" "}
        <span className="mono">
          Priority = {breakdown.weights.exposure}×Exposure + {breakdown.weights.severity}×Severity +{" "}
          {breakdown.weights.recurrence}×Recurrence + {breakdown.weights.time_open}×TimeOpen
        </span>
      </p>
      <div className="priority__total">
        <span className="priority__score mono">{breakdown.total.toFixed(2)}</span>
        <span className="priority__score-label">computed priority</span>
      </div>
      <ul className="priority__terms">
        {terms.map((key) => {
          const value = breakdown.terms[key];
          const weight = breakdown.weights[key];
          const contribution = value * weight;
          return (
            <li key={key} className="priority-term">
              <div className="priority-term__row">
                <span className="priority-term__label">{TERM_LABELS[key]}</span>
                <span className="priority-term__formula mono">
                  {weight.toFixed(2)} × {value.toFixed(2)} = {contribution.toFixed(3)}
                </span>
              </div>
              <div className="priority-term__track" role="img" aria-label={`${TERM_LABELS[key]} contributes ${contribution.toFixed(2)} of 1.0`}>
                <div className="priority-term__fill" style={{ width: `${Math.min(contribution * 100, 100)}%` }} />
              </div>
            </li>
          );
        })}
      </ul>
      <dl className="priority__detail">
        <div>
          <dt>Severity band</dt>
          <dd>{breakdown.severity_band}</dd>
        </div>
        <div>
          <dt>Recurrence count</dt>
          <dd>{breakdown.recurrence_count}</dd>
        </div>
        <div>
          <dt>Days open</dt>
          <dd>{breakdown.time_open_days}</dd>
        </div>
        <div>
          <dt>Exposure basis</dt>
          <dd>
            {breakdown.exposure_detail.matched_site
              ? `${breakdown.exposure_detail.matched_site.kind}${
                  breakdown.exposure_detail.matched_site.name ? ` — ${breakdown.exposure_detail.matched_site.name}` : ""
                } (${
                  breakdown.exposure_detail.matched_site.distance_m != null
                    ? `${breakdown.exposure_detail.matched_site.distance_m.toFixed(0)}m`
                    : "same ward, ward-level"
                })`
              : "No sensitive site found nearby"}
          </dd>
        </div>
      </dl>
    </div>
  );
}
