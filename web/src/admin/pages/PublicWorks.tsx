import { useState } from "react";
import { api } from "../../api/client";
import { useApi } from "../../hooks/useApi";
import { CategoryTag, PrecisionTag } from "../../components/Badges";
import { LoadingState, ErrorState, EmptyState } from "../../components/States";
import { CATEGORY_LABELS } from "../../api/types";
import { hasDistinctDescription } from "../../lib/work";
import "./publicworks.css";

const PAGE_SIZE = 30;

export function PublicWorks() {
  const [category, setCategory] = useState("");
  const [ward, setWard] = useState("");
  const [offset, setOffset] = useState(0);
  const { data: mapData } = useApi(() => api.map(), []);
  const { data: works, loading, error, reload } = useApi(
    () => api.listWorks({ category: category || undefined, ward_id: ward ? Number(ward) : undefined, limit: PAGE_SIZE, offset }),
    [category, ward, offset]
  );

  return (
    <div className="public-works">
      <h1>Public Works — MPLADS records</h1>
      <p className="public-works__intro">
        The 318 MPLADS public-works records this system can link civic issues against.
      </p>

      <div className="public-works__filters">
        <select
          value={ward}
          onChange={(e) => {
            setWard(e.target.value);
            setOffset(0);
          }}
          aria-label="Filter by ward"
        >
          <option value="">All wards</option>
          {mapData?.wards.map((w) => (
            <option key={w.ward_id} value={w.ward_id}>
              Ward {w.ward_id} — {w.name}
            </option>
          ))}
        </select>
        <select
          value={category}
          onChange={(e) => {
            setCategory(e.target.value);
            setOffset(0);
          }}
          aria-label="Filter by category"
        >
          <option value="">All categories</option>
          {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      {loading && <LoadingState label="Loading works…" />}
      {error && <ErrorState message={error} onRetry={reload} />}
      {works && works.length === 0 && <EmptyState>No works match this filter.</EmptyState>}

      {works && works.length > 0 && (
        <>
          <div className="work-grid">
            {works.map((w) => (
              <article key={w.work_id} className="work-card card">
                <div className="work-card__tags">
                  {w.category && <CategoryTag category={w.category} />}
                  {w.location_precision && <PrecisionTag precision={w.location_precision} />}
                </div>
                <h3>{w.work_name}</h3>
                {hasDistinctDescription(w.work_name, w.description) && (
                  <p className="work-card__description">{w.description}</p>
                )}
                <dl className="work-card__facts">
                  <div>
                    <dt>Status</dt>
                    <dd>{w.status ?? "—"}</dd>
                  </div>
                  <div>
                    <dt>Completed</dt>
                    <dd>{w.completed_on ?? "—"}</dd>
                  </div>
                  <div>
                    <dt>Cost</dt>
                    <dd>{w.cost != null ? `₹${w.cost.toLocaleString()}` : "—"}</dd>
                  </div>
                  <div>
                    <dt>Ward</dt>
                    <dd>{w.ward_id ?? "—"}</dd>
                  </div>
                  <div>
                    <dt>Agency</dt>
                    <dd>{w.agency ?? "—"}</dd>
                  </div>
                </dl>
              </article>
            ))}
          </div>
          <div className="public-works__pagination">
            <button
              type="button"
              className="button button--ghost"
              disabled={offset === 0}
              onClick={() => setOffset(Math.max(0, offset - PAGE_SIZE))}
            >
              Previous
            </button>
            <button
              type="button"
              className="button button--ghost"
              disabled={works.length < PAGE_SIZE}
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
