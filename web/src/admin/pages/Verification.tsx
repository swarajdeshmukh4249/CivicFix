import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, ApiError } from "../../api/client";
import { useApi } from "../../hooks/useApi";
import { LoadingState, ErrorState, EmptyState } from "../../components/States";
import type { SignalSummary } from "../../api/types";
import "./verification.css";

/**
 * There is no dedicated GET /api/signals endpoint. Signals are only
 * reachable per-issue via GET /api/issues/{id}. This page reconstructs the
 * full signal list by fetching every issue that has a match (from
 * GET /api/matches) and reading its signals - real data throughout, but an
 * N+1 pattern that only works at this prototype's data size (~28 issues).
 * A dedicated GET /api/signals endpoint would be the right fix.
 */
export function Verification() {
  const { data: metrics } = useApi(() => api.metrics(), []);
  const { data: matches } = useApi(() => api.listMatches({ limit: 500 }), []);
  const [signals, setSignals] = useState<SignalSummary[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!matches) return;
    let cancelled = false;
    setLoading(true);
    const issueIds = [...new Set(matches.map((m) => m.issue_id))];
    Promise.all(issueIds.map((id) => api.issueDetail(id)))
      .then((details) => {
        if (cancelled) return;
        setSignals(details.flatMap((d) => d.signals));
        setLoading(false);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err instanceof ApiError ? err.message : "Could not load verification signals.");
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [matches]);

  return (
    <div className="verification">
      <h1>Verification signals</h1>
      <p className="verification__intro">
        Deterministic evidence for human review. These describe documented spatial/category relationships
        and recurrence patterns — never a finding of fraud, corruption, guilt or wrongdoing.
      </p>

      {metrics && (
        <section className="metrics-panel">
          <h2>Evaluation numbers</h2>
          <div className="metrics-panel__grid">
            <div className="metrics-panel__card">
              <p className="metrics-panel__label">Classifier (macro-F1)</p>
              {metrics.classification.trained ? (
                <>
                  <p className="metrics-panel__value">
                    {metrics.classification.model_macro_f1?.toFixed(3)} vs {metrics.classification.baseline_macro_f1?.toFixed(3)} baseline
                  </p>
                  <p className="metrics-panel__note">
                    Trained on {metrics.classification.n_train}/{metrics.classification.n_test} NYC 311 train/test rows.{" "}
                    {metrics.classification.deployed
                      ? "Deployed as the live classifier."
                      : "Not deployed — it failed to generalize to our complaint phrasing (domain shift), so the keyword baseline stays live."}
                  </p>
                </>
              ) : (
                <p className="metrics-panel__note">No evaluation run persisted yet.</p>
              )}
            </div>
            <div className="metrics-panel__card">
              <p className="metrics-panel__label">Clustering</p>
              <p className="metrics-panel__value">
                {metrics.clustering.multi_report_issues} / {metrics.clustering.total_issues} issues have 2+ reports
              </p>
              <p className="metrics-panel__note">Largest cluster: {metrics.clustering.largest_cluster_size} reports.</p>
            </div>
            <div className="metrics-panel__card">
              <p className="metrics-panel__label">Location resolution</p>
              <p className="metrics-panel__value">{(metrics.location.resolution_rate * 100).toFixed(1)}%</p>
              <p className="metrics-panel__note">
                {metrics.location.precise_resolved} precise, {metrics.location.ward_level_resolved} ward-level, {metrics.location.unresolved} unresolved
                of {metrics.location.total_reports} reports.
              </p>
            </div>
            <div className="metrics-panel__card">
              <p className="metrics-panel__label">Public-work matcher</p>
              <p className="metrics-panel__value">
                {metrics.matcher.matched_issues} / {metrics.matcher.total_issues_eligible} eligible issues matched
              </p>
              <p className="metrics-panel__note">
                {metrics.matcher.labeled_accuracy != null
                  ? `${(metrics.matcher.labeled_accuracy * 100).toFixed(0)}% accuracy on ${metrics.matcher.labeled_cases} hand-labeled anchor cases.`
                  : "No hand-labeled cases available yet."}
              </p>
            </div>
          </div>
        </section>
      )}

      {loading && <LoadingState label="Loading verification signals…" />}
      {error && <ErrorState message={error} />}
      {signals && signals.length === 0 && <EmptyState>No verification signals exist yet.</EmptyState>}

      {signals && signals.length > 0 && (
        <ul className="verification-list">
          {signals.map((signal) => (
            <li key={signal.signal_id} className="verification-card card">
              <p className="verification-card__rule mono">{signal.rule_name}</p>
              <p className="verification-card__explanation">{signal.explanation}</p>
              <div className="verification-card__footer">
                <span className="verification-card__ids mono">
                  {JSON.stringify(signal.source_record_ids)}
                </span>
                <Link to={`/admin/issues/${signal.issue_id}`} className="verification-card__link">
                  View issue #{signal.issue_id} →
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
