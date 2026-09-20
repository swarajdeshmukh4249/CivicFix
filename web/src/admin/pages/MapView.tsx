import { useNavigate } from "react-router-dom";
import { api } from "../../api/client";
import { useApi } from "../../hooks/useApi";
import { WardMap } from "../../components/WardMap";
import { LoadingState, ErrorState } from "../../components/States";
import "./mapview.css";

export function MapView() {
  const navigate = useNavigate();
  const { data, loading, error, reload } = useApi(() => api.map(), []);

  return (
    <div className="map-view">
      <h1>Spatial evidence map</h1>
      <p className="map-view__intro">
        Every civic issue, every matched MPLADS work, and every sensitive site currently in the system —
        one surface, not a decoration.
      </p>
      {loading && <LoadingState label="Loading map data…" />}
      {error && <ErrorState message={error} onRetry={reload} />}
      {data && (
        <WardMap
          audience="admin"
          issues={data.issues}
          works={data.matched_works}
          sites={data.sensitive_sites}
          onIssueClick={(id) => navigate(`/admin/issues/${id}`)}
          height="calc(100vh - 260px)"
        />
      )}
      <ul className="map-view__legend">
        <li>
          <span className="map-view__legend-dot" style={{ background: "var(--cat-drainage_sewage)" }} /> Civic
          issue (colored by category, sized by priority)
        </li>
        <li>
          <span className="map-view__legend-diamond" /> Matched MPLADS work
        </li>
        <li>
          <span className="map-view__legend-dot" style={{ background: "var(--ink-faint)" }} /> Sensitive site
          (clustered)
        </li>
      </ul>
    </div>
  );
}
