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
