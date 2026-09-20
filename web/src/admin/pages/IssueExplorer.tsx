import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../api/client";
import { useApi } from "../../hooks/useApi";
import { CategoryTag, StatusTag, SyntheticTag } from "../../components/Badges";
import { LoadingState, ErrorState, EmptyState } from "../../components/States";
import { CATEGORY_LABELS } from "../../api/types";
import "./issueexplorer.css";

const PAGE_SIZE = 25;

export function IssueExplorer() {
  const navigate = useNavigate();
  const [ward, setWard] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("");
  const [minPriority, setMinPriority] = useState(0);
  const [sort, setSort] = useState<"recent" | "priority">("recent");
  const [offset, setOffset] = useState(0);

  const { data: mapData } = useApi(() => api.map(), []);
  const { data, loading, error, reload } = useApi(
    () =>
      api.listIssues({
        ward_id: ward ? Number(ward) : undefined,
        category: category || undefined,
        status: status || undefined,
        min_priority: minPriority > 0 ? minPriority : undefined,
        sort,
        limit: PAGE_SIZE,
        offset,
      }),
    [ward, category, status, minPriority, sort, offset]
  );

  // /api/issues carries no per-issue match indicator - cross-referenced
  // against /api/matches (the real source of that fact) rather than guessed.
  const { data: matches } = useApi(() => api.listMatches({ limit: 500 }), []);
  const matchedIssueIds = useMemo(() => new Set((matches ?? []).map((m) => m.issue_id)), [matches]);

  function resetAndSet<T>(setter: (v: T) => void) {
    return (value: T) => {
      setOffset(0);
      setter(value);
    };
  }

  return (
    <div className="issue-explorer">
      <h1>Issue Explorer</h1>

      <div className="issue-explorer__filters">
        <select value={ward} onChange={(e) => resetAndSet(setWard)(e.target.value)} aria-label="Filter by ward">
          <option value="">All wards</option>
          {mapData?.wards.map((w) => (
            <option key={w.ward_id} value={w.ward_id}>
              Ward {w.ward_id} — {w.name}
            </option>
          ))}
        </select>
        <select value={category} onChange={(e) => resetAndSet(setCategory)(e.target.value)} aria-label="Filter by category">
          <option value="">All categories</option>
          {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <select value={status} onChange={(e) => resetAndSet(setStatus)(e.target.value)} aria-label="Filter by status">
          <option value="">All statuses</option>
          <option value="open">Open</option>
          <option value="reopened">Reopened</option>
          <option value="closed">Closed</option>
        </select>
        <label className="issue-explorer__priority-filter">
          Min priority
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={minPriority}
            onChange={(e) => resetAndSet(setMinPriority)(Number(e.target.value))}
          />
          <span className="mono">{minPriority.toFixed(2)}</span>
        </label>
        <select
          value={sort}
          onChange={(e) => resetAndSet(setSort)(e.target.value as "recent" | "priority")}
          aria-label="Sort by"
        >
          <option value="recent">Most recent</option>
          <option value="priority">Highest priority</option>
        </select>
      </div>

      {loading && <LoadingState label="Loading issues…" />}
      {error && <ErrorState message={error} onRetry={reload} />}
      {data && data.items.length === 0 && <EmptyState>No issues match these filters.</EmptyState>}

      {data && data.items.length > 0 && (
        <>
          <div className="issue-table-scroll">
          <table className="issue-table">
            <thead>
              <tr>
                <th>Issue</th>
                <th>Category</th>
                <th>Ward</th>
                <th>Reports</th>
                <th>Status</th>
                <th>Public work</th>
                <th>Priority</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((issue) => (
                <tr
                  key={issue.issue_id}
                  onClick={() => navigate(`/admin/issues/${issue.issue_id}`)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      navigate(`/admin/issues/${issue.issue_id}`);
                    }
                  }}
                  tabIndex={0}
                  aria-label={`View issue ${issue.issue_id}`}
                >
                  <td className="mono">
                    #{issue.issue_id}
                    {issue.is_synthetic && (
                      <>
                        {" "}
                        <SyntheticTag />
                      </>
                    )}
                  </td>
                  <td>
                    <CategoryTag category={issue.category} />
                  </td>
                  <td>{issue.ward_id ?? "—"}</td>
                  <td>{issue.report_count}</td>
                  <td>
                    <StatusTag status={issue.status} />
                  </td>
                  <td>
                    {matchedIssueIds.has(issue.issue_id) ? (
                      <span className="issue-table__match issue-table__match--yes">Matched</span>
                    ) : (
                      <span className="issue-table__match">No match</span>
                    )}
                  </td>
                  <td className="mono">{issue.priority_score?.toFixed(2) ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>

          <div className="issue-explorer__pagination">
            <button
              type="button"
              className="button button--ghost"
              disabled={offset === 0}
              onClick={() => setOffset(Math.max(0, offset - PAGE_SIZE))}
            >
              Previous
            </button>
            <span className="mono">
              {offset + 1}–{Math.min(offset + PAGE_SIZE, data.total)} of {data.total}
            </span>
            <button
              type="button"
              className="button button--ghost"
              disabled={offset + PAGE_SIZE >= data.total}
              onClick={() => setOffset(offset + PAGE_SIZE)}
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}
