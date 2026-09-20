import { useState } from "react";
import { Link } from "react-router-dom";
import { api, ApiError } from "../../api/client";
import { useApi } from "../../hooks/useApi";
import { CATEGORY_LABELS } from "../../api/types";
import type { ReportCreateResponse } from "../../api/types";
import "./reportissue.css";

function severityMessage(severity: string): string {
  if (severity === "critical") return "This looks serious and has been flagged for prompt attention.";
  if (severity === "moderate") return "This has been logged as a moderate-priority issue.";
  return "This has been logged as a minor issue.";
}

export function ReportIssue() {
  const { data: mapData } = useApi(() => api.map(), []);
  const [text, setText] = useState("");
  const [wardId, setWardId] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ReportCreateResponse | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      const response = await api.createReport({
        raw_text: text.trim(),
        ward_id: wardId ? Number(wardId) : null,
      });
      setResult(response);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong submitting your report. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (result) {
    return <ReportResult result={result} onReportAnother={() => { setResult(null); setText(""); }} />;
  }

  return (
    <div className="report-form">
      <h1>Report a civic issue</h1>
      <p className="report-form__intro">
        Describe what's happening, in your own words. Mentioning a landmark or ward helps us place it
        accurately.
      </p>
      <form onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="raw_text">What's the issue?</label>
          <textarea
            id="raw_text"
            rows={5}
            required
            minLength={10}
            placeholder="e.g. Streetlight has been out for a week near Ward 12, it's very dark at night"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
        </div>
        <div className="field">
          <label htmlFor="ward">Ward (optional)</label>
          <select id="ward" value={wardId} onChange={(e) => setWardId(e.target.value)}>
            <option value="">I didn't mention a ward above / not sure</option>
            {mapData?.wards.map((w) => (
              <option key={w.ward_id} value={w.ward_id}>
                Ward {w.ward_id} — {w.name}
              </option>
            ))}
          </select>
          <span className="field__hint">
            Only used if we can't place your report from the description itself.
          </span>
        </div>
        {error && (
          <p className="report-form__error" role="alert">
            {error}
          </p>
        )}
        <button type="submit" className="button button--primary" disabled={submitting}>
          {submitting ? "Submitting…" : "Submit report"}
        </button>
      </form>
    </div>
  );
}

function ReportResult({ result, onReportAnother }: { result: ReportCreateResponse; onReportAnother: () => void }) {
  const categoryLabel = CATEGORY_LABELS[result.category] ?? result.category;
  const locationMessage =
    result.location_precision === "precise"
      ? "We placed this at a precise location."
      : result.location_precision === "ward_level"
      ? `We placed this in Ward ${result.report.ward_id ?? "—"}.`
      : "We couldn't determine a specific location from your description.";

  return (
    <div className="report-result">
      <h1>Thank you — your report is in.</h1>
      <p className="report-result__intro">Here's what happened with it, step by step:</p>

      <ol className="report-result__steps">
        <li>
          <strong>Classified as:</strong> {categoryLabel}
        </li>
        <li>
          <strong>Location:</strong> {locationMessage}
        </li>
        <li>
          <strong>Grouping:</strong>{" "}
          {result.joined_existing_issue
            ? "This matches an issue already being tracked nearby — your report has been added as supporting evidence."
            : "This is a new issue in our system."}
        </li>
        <li>
          <strong>Public records check:</strong>{" "}
          {result.matched_work
            ? "A related public work was found in this area."
            : "No related public work was found for this issue yet."}
        </li>
        <li>
          <strong>Status:</strong> {severityMessage(result.severity)}
        </li>
      </ol>

      {result.matched_work && (
        <div className="report-result__work card">
          <p className="report-result__work-label">Related public work</p>
          <p className="report-result__work-name">{result.matched_work.work?.work_name}</p>
          {result.matched_work.work?.completed_on && (
            <p className="report-result__work-meta">Completed {result.matched_work.work.completed_on}</p>
          )}
        </div>
      )}

      <p className="report-result__record">
        This is issue <span className="mono">#{result.issue_id}</span>, part of the public record for
        your ward.
      </p>

      <div className="report-result__actions">
        <button type="button" className="button button--ghost" onClick={onReportAnother}>
          Report another issue
        </button>
        <Link to="/citizen/issues" className="button button--ghost">
          See public issues
        </Link>
      </div>
    </div>
  );
}
