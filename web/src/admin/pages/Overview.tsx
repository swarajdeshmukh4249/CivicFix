import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../api/client";
import { useApi } from "../../hooks/useApi";
import { WardMap } from "../../components/WardMap";
import { LoadingState, ErrorState } from "../../components/States";
import { CATEGORY_LABELS } from "../../api/types";
import "./overview.css";

const STAT_LABELS: Record<string, string> = {
  wards: "Wards",
  works: "MPLADS works",
  reports: "Citizen reports",
  issues: "Civic issues",
  matches: "Computed matches",
  sensitive_sites: "Sensitive sites",
  verification_signals: "Verification signals",
};

export function Overview() {
  const navigate = useNavigate();
  const { data: stats } = useApi(() => api.stats(), []);
  const { data: mapData, loading: mapLoading, error: mapError, reload } = useApi(() => api.map(), []);

  const [ward, setWard] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("");
  const [minPriority, setMinPriority] = useState(0);

  // /api/map's issue points carry no ward_id (a real gap - see README note
  // below), so a ward filter is resolved via /api/issues (which does
  // support ward_id) and applied as a membership filter over the map data,
  // rather than fabricating a ward on the map response.
  const wardFilterActive = ward !== "";
  const { data: wardIssueIds } = useApi(
    () => (wardFilterActive ? api.listIssues({ ward_id: Number(ward), limit: 200 }) : Promise.resolve(null)),
    [ward]
  );
  const wardIssueIdSet = useMemo(
    () => (wardIssueIds ? new Set(wardIssueIds.items.map((i) => i.issue_id)) : null),
    [wardIssueIds]
  );

  const filteredIssues = useMemo(() => {
    if (!mapData) return [];
    return mapData.issues.filter((i) => {
      if (wardFilterActive && (!wardIssueIdSet || !wardIssueIdSet.has(i.issue_id))) return false;
      if (category && i.category !== category) return false;
      if (status && i.status !== status) return false;
      if (minPriority > 0 && (i.priority_score ?? 0) < minPriority) return false;
      return true;
    });
  }, [mapData, category, status, minPriority, wardFilterActive, wardIssueIdSet]);

  return (
    <div className="overview">
      {stats && (
        <dl className="overview__stats">
          {Object.entries(STAT_LABELS).map(([key, label]) => (
            <div key={key} className="overview__stat">
              <dt>{label}</dt>
              <dd className="mono">{stats[key as keyof typeof stats].toLocaleString()}</dd>
            </div>
          ))}
        </dl>
      )}

      <div className="overview__map-section">
        <div className="overview__map-header">
          <h1>Pune — spatial overview</h1>
          <div className="overview__filters">
            <select value={ward} onChange={(e) => setWard(e.target.value)} aria-label="Filter by ward">
              <option value="">All wards</option>
              {mapData?.wards.map((w) => (
                <option key={w.ward_id} value={w.ward_id}>
                  Ward {w.ward_id} — {w.name}
                </option>
              ))}
            </select>
            <select value={category} onChange={(e) => setCategory(e.target.value)} aria-label="Filter by category">
              <option value="">All categories</option>
              {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            <select value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Filter by status">
              <option value="">All statuses</option>
              <option value="open">Open</option>
              <option value="reopened">Reopened</option>
              <option value="closed">Closed</option>
            </select>
            <label className="overview__priority-filter">
              Min priority
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={minPriority}
                onChange={(e) => setMinPriority(Number(e.target.value))}
              />
              <span className="mono">{minPriority.toFixed(2)}</span>
            </label>
          </div>
        </div>

        {mapLoading && <LoadingState label="Loading map data…" />}
        {mapError && <ErrorState message={mapError} onRetry={reload} />}
        {mapData && (
          <WardMap
            audience="admin"
            issues={filteredIssues}
            works={mapData.matched_works}
            sites={mapData.sensitive_sites}
            onIssueClick={(id) => navigate(`/admin/issues/${id}`)}
            onWorkClick={() => navigate(`/admin/works`)}
            height="560px"
          />
        )}
        <p className="overview__map-caption">
          {filteredIssues.length} issue{filteredIssues.length === 1 ? "" : "s"} shown · diamonds are matched
          MPLADS works · clustered dots are sensitive sites (schools, hospitals, water bodies)
        </p>
      </div>
    </div>
  );
}
