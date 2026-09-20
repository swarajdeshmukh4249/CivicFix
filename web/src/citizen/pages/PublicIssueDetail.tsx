import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { api, ApiError } from "../../api/client";
import { useApi } from "../../hooks/useApi";
import { CategoryTag, StatusTag, SyntheticTag } from "../../components/Badges";
import { LoadingState, ErrorState } from "../../components/States";
import { CATEGORY_LABELS } from "../../api/types";
import { hasDistinctDescription } from "../../lib/work";
import "./publicissuedetail.css";

export function PublicIssueDetail() {
  const { issueId } = useParams();
  const { data: issue, loading, error, reload } = useApi(() => api.issueDetail(Number(issueId)), [issueId]);

  if (loading) return <LoadingState label="Loading issue…" />;
  if (error) return <ErrorState message={error} onRetry={reload} />;
  if (!issue) return null;

  const hasWork = issue.matches.length > 0;

  return (
    <div className="public-issue-detail">
      <Link to="/citizen/issues" className="public-issue-detail__back">
        ← All public issues
      </Link>
      <div className="public-issue-detail__tags">
        <CategoryTag category={issue.category} />
        <StatusTag status={issue.status} />
        {issue.is_synthetic && <SyntheticTag />}
      </div>
      <h1>
        {CATEGORY_LABELS[issue.category] ?? issue.category} — Ward {issue.ward_id ?? "—"}
      </h1>
      <p className="public-issue-detail__summary">
        Reported {issue.report_count} time{issue.report_count === 1 ? "" : "s"}
        {issue.first_reported && ` since ${new Date(issue.first_reported).toLocaleDateString()}`}.
      </p>

      <section className="public-issue-detail__section">
        <h2>Public records check</h2>
        {hasWork ? (
          <>
            <p>A related public work was found in this area. Administrators are reviewing the connection.</p>
            {issue.matches.map((match) => (
              <div key={match.match_id} className="public-issue-detail__work card">
                <p className="public-issue-detail__work-name">{match.work?.work_name}</p>
                {match.work && hasDistinctDescription(match.work.work_name, match.work.description) && (
                  <p className="public-issue-detail__work-description">{match.work.description}</p>
                )}
                {match.match_reason && (
                  <p className="public-issue-detail__work-reason">{match.match_reason}</p>
                )}
              </div>
            ))}
          </>
        ) : (
          <p>No related public work has been found for this issue yet.</p>
        )}
      </section>

      {issue.signals.length > 0 && (
        <section className="public-issue-detail__section">
          <h2>Under review</h2>
          <p>This issue has evidence available for administrator review.</p>
        </section>
      )}

      {issue.status === "closed" && <FeedbackForm issueId={issue.issue_id} onSubmitted={reload} />}

      {issue.feedback.length > 0 && (
        <section className="public-issue-detail__section">
          <h2>Citizen feedback</h2>
          <ul className="public-issue-detail__feedback-list">
            {issue.feedback.map((fb) => (
              <li key={fb.feedback_id}>
                {fb.resolved_confirmed ? "✓ Confirmed resolved" : "✗ Reported still unresolved"}
                {fb.comment && ` — "${fb.comment}"`}
              </li>
            ))}
          </ul>
        </section>
      )}

      <p className="public-issue-detail__id mono">Issue #{issue.issue_id}</p>
    </div>
  );
}

function FeedbackForm({ issueId, onSubmitted }: { issueId: number; onSubmitted: () => void }) {
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  async function submit(resolvedConfirmed: boolean) {
    setSubmitting(true);
    setError(null);
    try {
      await api.submitFeedback(issueId, { resolved_confirmed: resolvedConfirmed, comment: comment.trim() || null });
      setSubmitted(true);
      onSubmitted();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to submit feedback.");
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <section className="public-issue-detail__section">
        <h2>Was this actually fixed?</h2>
        <p>Thanks — your feedback has been recorded.</p>
      </section>
    );
  }

  return (
    <section className="public-issue-detail__section">
      <h2>Was this actually fixed?</h2>
      <p>This issue was marked resolved. Let us know if that's accurate.</p>
      <textarea
        className="public-issue-detail__feedback-comment"
        rows={2}
        placeholder="Optional comment"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
      />
      <div className="public-issue-detail__feedback-actions">
        <button type="button" className="button button--primary" disabled={submitting} onClick={() => submit(true)}>
          Yes, it's fixed
        </button>
        <button type="button" className="button button--ghost" disabled={submitting} onClick={() => submit(false)}>
          No, still broken
        </button>
      </div>
      {error && (
        <p className="report-form__error" role="alert">
          {error}
        </p>
      )}
    </section>
  );
}
