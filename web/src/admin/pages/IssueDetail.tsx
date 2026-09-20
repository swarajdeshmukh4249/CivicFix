import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { api, ApiError, mediaUrl } from "../../api/client";
import { useApi } from "../../hooks/useApi";
import { CategoryTag, StatusTag, SyntheticTag, PrecisionTag, LanguageTag } from "../../components/Badges";
import { LoadingState, ErrorState } from "../../components/States";
import { PriorityBreakdownView } from "../../components/PriorityBreakdown";
import { EvidenceChain, type EvidenceChainNode } from "../../components/EvidenceChain";
import { WardMap } from "../../components/WardMap";
import { CATEGORY_LABELS } from "../../api/types";
import { hasDistinctDescription } from "../../lib/work";
import "./issuedetail.css";

export function IssueDetail() {
  const { issueId } = useParams();
  const { data: issue, loading, error, reload } = useApi(() => api.issueDetail(Number(issueId)), [issueId]);
  const [closing, setClosing] = useState(false);
  const [closeError, setCloseError] = useState<string | null>(null);

  if (loading) return <LoadingState label="Loading evidence dossier…" />;
  if (error) return <ErrorState message={error} onRetry={reload} />;
  if (!issue) return null;

  const topMatch = issue.matches[0] ?? null;
  const canClose = issue.status === "open" || issue.status === "reopened";

  async function handleClose() {
    if (!issue) return;
    setClosing(true);
    setCloseError(null);
    try {
      await api.closeIssue(issue.issue_id);
      await reload();
    } catch (e) {
      setCloseError(e instanceof ApiError ? e.message : "Failed to close issue.");
    } finally {
      setClosing(false);
    }
  }

  const chainNodes: EvidenceChainNode[] = [
    {
      label: `${issue.report_count} citizen report${issue.report_count === 1 ? "" : "s"}`,
      present: issue.report_count > 0,
    },
    { label: `Civic issue #${issue.issue_id}`, present: true },
    {
      label: issue.priority_score != null ? `Priority ${issue.priority_score.toFixed(2)}` : "Priority not yet computed",
      detail: issue.priority_breakdown?.exposure_detail.matched_site
        ? `Exposure: ${issue.priority_breakdown.exposure_detail.matched_site.kind}`
        : undefined,
      present: issue.priority_score != null,
    },
    {
      label: topMatch ? `MPLADS work #${topMatch.work_id}` : "No qualifying public-work match found",
      detail: topMatch?.work?.work_name,
      present: !!topMatch,
    },
    {
      label: issue.signals.length > 0 ? `${issue.signals.length} verification signal${issue.signals.length === 1 ? "" : "s"}` : "No verification signals",
      present: issue.signals.length > 0,
    },
  ];

  return (
    <div className="issue-detail">
      <Link to="/admin/issues" className="issue-detail__back">
        ← Issue Explorer
      </Link>

      <header className="issue-detail__header">
        <div className="issue-detail__tags">
          <CategoryTag category={issue.category} />
          <StatusTag status={issue.status} />
          <PrecisionTag precision={issue.location_precision} />
          {issue.is_synthetic && <SyntheticTag />}
        </div>
        <h1>
          Issue #{issue.issue_id} — {CATEGORY_LABELS[issue.category] ?? issue.category}
        </h1>
        <dl className="issue-detail__facts">
          <div>
            <dt>Ward</dt>
            <dd>{issue.ward_id ?? "—"}</dd>
          </div>
          <div>
            <dt>Reports</dt>
            <dd>{issue.report_count}</dd>
          </div>
          <div>
            <dt>First reported</dt>
            <dd>{issue.first_reported ? new Date(issue.first_reported).toLocaleDateString() : "—"}</dd>
          </div>
          <div>
            <dt>Last reported</dt>
            <dd>{issue.last_reported ? new Date(issue.last_reported).toLocaleDateString() : "—"}</dd>
          </div>
          <div>
            <dt>Recurrence count</dt>
            <dd>{issue.recurrence_count}</dd>
          </div>
        </dl>
        {canClose && (
          <div className="issue-detail__actions">
            <button type="button" onClick={handleClose} disabled={closing}>
              {closing ? "Marking resolved…" : "Mark as resolved"}
            </button>
            {closeError && <span className="issue-detail__close-error">{closeError}</span>}
          </div>
        )}
      </header>

      <section className="issue-detail__section">
        <h2>Citizen evidence</h2>
        <ol className="report-timeline">
          {issue.reports.map((report) => (
            <li key={report.id} className="report-timeline__item">
              <div className="report-timeline__meta">
                <span className="mono">#{report.id}</span>
                <span>{new Date(report.reported_at).toLocaleString()}</span>
                {report.severity && <span>{report.severity}</span>}
                {report.is_synthetic && <SyntheticTag />}
                {report.language && report.language !== "en" && <LanguageTag language={report.language} />}
              </div>
              <p className="report-timeline__text">{report.raw_text}</p>
              {report.location_phrase && (
                <p className="report-timeline__location">Location cue: "{report.location_phrase}"</p>
              )}
              {report.photo_url && (
                <img src={mediaUrl(report.photo_url)} alt="" className="report-timeline__photo" />
              )}
            </li>
          ))}
        </ol>
      </section>

      {issue.priority_breakdown && (
        <section className="issue-detail__section">
          <h2>Why this issue has this priority</h2>
          <PriorityBreakdownView breakdown={issue.priority_breakdown} />
        </section>
      )}

      {issue.location && (
        <section className="issue-detail__section">
          <h2>Spatial context</h2>
          <WardMap
            audience="admin"
            focusMarker={{ lat: issue.location.lat, lon: issue.location.lon, label: `Issue #${issue.issue_id}` }}
            works={topMatch?.work?.location ? [{ work_id: topMatch.work_id, category: topMatch.category, work_name: topMatch.work.work_name, location: topMatch.work.location, location_precision: topMatch.work.location_precision ?? "unknown" }] : []}
            center={[issue.location.lat, issue.location.lon]}
            zoom={topMatch?.distance_m != null ? 16 : 13}
            height="360px"
          />
        </section>
      )}

      <section className="issue-detail__section">
        <h2>Public work connection</h2>
        {issue.matches.length === 0 ? (
          <p className="issue-detail__no-match">No qualifying public-work match found.</p>
        ) : (
          issue.matches.map((match) => (
            <div key={match.match_id} className="work-connection card">
              <p className="work-connection__label">Computed public-record relationship</p>
              {match.work && (
                <>
                  <h3>{match.work.work_name}</h3>
                  {hasDistinctDescription(match.work.work_name, match.work.description) && (
                    <p className="work-connection__description">{match.work.description}</p>
                  )}
                  <dl className="work-connection__facts">
                    <div>
                      <dt>Work ID</dt>
                      <dd className="mono">#{match.work_id}</dd>
                    </div>
                    <div>
                      <dt>Category</dt>
                      <dd>{CATEGORY_LABELS[match.work.category ?? ""] ?? match.work.category ?? "—"}</dd>
                    </div>
                    <div>
                      <dt>Status</dt>
                      <dd>{match.work.status ?? "—"}</dd>
                    </div>
                    <div>
                      <dt>Completed</dt>
                      <dd>{match.work.completed_on ?? "—"}</dd>
                    </div>
                    <div>
                      <dt>Agency</dt>
                      <dd>{match.work.agency ?? "—"}</dd>
                    </div>
                    <div>
                      <dt>Semantic score</dt>
                      <dd className="mono">{match.semantic_score.toFixed(2)}</dd>
                    </div>
                    <div>
                      <dt>Combined score</dt>
                      <dd className="mono">{match.combined_score.toFixed(2)}</dd>
                    </div>
                    <div>
                      <dt>Spatial precision</dt>
                      <dd>
                        <PrecisionTag precision={match.issue_location_precision} />
                      </dd>
                    </div>
                    <div>
                      <dt>Distance</dt>
                      <dd>{match.distance_m != null ? `${match.distance_m.toFixed(0)}m` : "Not measured (ward-level)"}</dd>
                    </div>
                  </dl>
                </>
              )}
              <p className="work-connection__reason">{match.match_reason}</p>
              <p className="work-connection__disclaimer">
                This is a computed record relationship, not a claim of causation.
              </p>
            </div>
          ))
        )}
      </section>

      <section className="issue-detail__section">
        <h2>Verification signals</h2>
        {issue.signals.length === 0 ? (
          <p className="issue-detail__no-match">No verification signals for this issue.</p>
        ) : (
          <ul className="signal-list">
            {issue.signals.map((signal) => (
              <li key={signal.signal_id} className="signal-card card">
                <p className="signal-card__rule mono">{signal.rule_name}</p>
                <p className="signal-card__explanation">{signal.explanation}</p>
                <p className="signal-card__ids mono">
                  Source records: {JSON.stringify(signal.source_record_ids)}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="issue-detail__section">
        <h2>Evidence relationship</h2>
        <EvidenceChain nodes={chainNodes} />
      </section>
    </div>
  );
}
