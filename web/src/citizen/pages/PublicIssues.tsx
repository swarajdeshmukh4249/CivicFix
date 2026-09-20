import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../api/client";
import { useApi } from "../../hooks/useApi";
import { WardMap } from "../../components/WardMap";
import { CategoryTag, StatusTag, SyntheticTag } from "../../components/Badges";
import { LoadingState, ErrorState, EmptyState } from "../../components/States";
import { CATEGORY_LABELS } from "../../api/types";
import "./publicissues.css";

export function PublicIssues() {
  const navigate = useNavigate();
  const [category, setCategory] = useState("");
  const { data: mapData, loading: mapLoading } = useApi(() => api.map(), []);
  const { data: issueList, loading, error, reload } = useApi(
    () => api.listIssues({ category: category || undefined, limit: 50 }),
    [category]
  );

  const filteredMapIssues = useMemo(() => {
    if (!mapData) return [];
    if (!category) return mapData.issues;
    return mapData.issues.filter((i) => i.category === category);
  }, [mapData, category]);

  return (
    <div className="public-issues">
      <h1>Public issues</h1>
      <p className="public-issues__intro">
        Civic issues currently being tracked across Pune, grouped from citizen reports.
      </p>

      <div className="public-issues__filter">
        <label htmlFor="category-filter">Category</label>
        <select id="category-filter" value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">All categories</option>
          {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      {mapLoading ? (
        <LoadingState label="Loading map…" />
      ) : (
        <WardMap issues={filteredMapIssues} onIssueClick={(id) => navigate(`/citizen/issues/${id}`)} height="420px" />
      )}

      <div className="public-issues__list">
        {loading && <LoadingState label="Loading issues…" />}
        {error && <ErrorState message={error} onRetry={reload} />}
        {issueList && issueList.items.length === 0 && <EmptyState>No issues match this filter yet.</EmptyState>}
        {issueList &&
          issueList.items.map((issue) => (
            <button
              key={issue.issue_id}
              className="public-issue-row"
              onClick={() => navigate(`/citizen/issues/${issue.issue_id}`)}
            >
              <div className="public-issue-row__tags">
                <CategoryTag category={issue.category} />
                <StatusTag status={issue.status} />
                {issue.is_synthetic && <SyntheticTag />}
              </div>
              <span className="public-issue-row__meta">
                Ward {issue.ward_id ?? "—"} · {issue.report_count} report{issue.report_count === 1 ? "" : "s"}
              </span>
            </button>
          ))}
      </div>
    </div>
  );
}
