import { useState } from "react";
import { api } from "../../api/client";
import { useApi } from "../../hooks/useApi";
import { CategoryTag, PrecisionTag } from "../../components/Badges";
import { LoadingState, ErrorState, EmptyState } from "../../components/States";
import { CATEGORY_LABELS } from "../../api/types";
import { hasDistinctDescription } from "../../lib/work";
import { GlowingCard } from "../../components/ui/GlowingCard";
import { Building2, Filter, ChevronLeft, ChevronRight } from "lucide-react";

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
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground mb-2 flex items-center gap-2.5">
          <Building2 className="w-8 h-8 text-primary" />
          <span>Public Works — MPLADS Directory</span>
        </h1>
        <p className="text-secondary text-base sm:text-lg leading-relaxed">
          Cleaned government MPLADS public-works records used by CivicFix to verify reported problems against funded projects.
        </p>
      </div>

      {/* Filter Toolbar in GlowingCard */}
      <GlowingCard borderWidth={1} spread={30} className="border-border">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <Filter className="w-4 h-4 text-primary" />
            <span>Filter Public Works:</span>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            <select
              value={ward}
              onChange={(e) => {
                setWard(e.target.value);
                setOffset(0);
              }}
              aria-label="Filter by ward"
              className="px-3 py-2 border border-border rounded-xl bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">All Wards</option>
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
              className="px-3 py-2 border border-border rounded-xl bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">All Categories</option>
              {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </GlowingCard>

      {loading && <LoadingState label="Loading public works records…" />}
      {error && <ErrorState message={error} onRetry={reload} />}
      {works && works.length === 0 && <EmptyState>No works match this filter.</EmptyState>}

      {works && works.length > 0 && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {works.map((w) => (
              <GlowingCard key={w.work_id} innerClassName="p-5 justify-between">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="font-mono text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-md">
                      #{w.work_id}
                    </span>
                    <div className="flex gap-1.5 flex-wrap">
                      {w.category && <CategoryTag category={w.category} />}
                      {w.location_precision && <PrecisionTag precision={w.location_precision} />}
                    </div>
                  </div>

                  <h3 className="text-base font-bold text-foreground mb-2 line-clamp-2" title={w.work_name}>
                    {w.work_name}
                  </h3>

                  {hasDistinctDescription(w.work_name, w.description) && (
                    <p className="text-xs text-secondary mb-4 line-clamp-3 leading-relaxed">
                      {w.description}
                    </p>
                  )}
                </div>

                <div className="pt-3 border-t border-border/70 mt-3">
                  <dl className="grid grid-cols-2 gap-2 text-xs font-mono">
                    <div>
                      <dt className="text-secondary text-[10px] uppercase">Status</dt>
                      <dd className="font-semibold text-foreground truncate">{w.status ?? "—"}</dd>
                    </div>
                    <div>
                      <dt className="text-secondary text-[10px] uppercase">Completed</dt>
                      <dd className="font-semibold text-foreground truncate">{w.completed_on ?? "—"}</dd>
                    </div>
                    <div>
                      <dt className="text-secondary text-[10px] uppercase">Cost</dt>
                      <dd className="font-bold text-emerald-600">
                        {w.cost != null ? `₹${w.cost.toLocaleString()}` : "—"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-secondary text-[10px] uppercase">Ward / Agency</dt>
                      <dd className="font-semibold text-foreground truncate" title={w.agency ?? ""}>
                        Ward {w.ward_id ?? "—"} · {w.agency ?? "PMC"}
                      </dd>
                    </div>
                  </dl>
                </div>
              </GlowingCard>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between p-4 bg-white/80 rounded-xl border border-border shadow-xs">
            <button
              type="button"
              className="btn py-1.5 px-3 rounded-lg border border-border text-xs font-medium hover:bg-muted disabled:opacity-40 flex items-center gap-1 transition-colors"
              disabled={offset === 0}
              onClick={() => setOffset(Math.max(0, offset - PAGE_SIZE))}
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </button>

            <span className="font-mono text-xs text-secondary">
              Page offset: {offset + 1}–{offset + works.length}
            </span>

            <button
              type="button"
              className="btn py-1.5 px-3 rounded-lg border border-border text-xs font-medium hover:bg-muted disabled:opacity-40 flex items-center gap-1 transition-colors"
              disabled={works.length < PAGE_SIZE}
              onClick={() => setOffset(offset + PAGE_SIZE)}
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
export default PublicWorks;
