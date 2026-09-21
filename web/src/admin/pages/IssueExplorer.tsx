import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../api/client";
import { useApi } from "../../hooks/useApi";
import { CategoryTag, StatusTag, SyntheticTag } from "../../components/Badges";
import { LoadingState, ErrorState, EmptyState } from "../../components/States";
import { CATEGORY_LABELS } from "../../api/types";
import { GlowingCard } from "../../components/ui/GlowingCard";
import { Filter, SlidersHorizontal, ArrowUpDown, ChevronLeft, ChevronRight, Layers } from "lucide-react";

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

  const { data: matches } = useApi(() => api.listMatches({ limit: 500 }), []);
  const matchedIssueIds = useMemo(() => new Set((matches ?? []).map((m) => m.issue_id)), [matches]);

  function resetAndSet<T>(setter: (v: T) => void) {
    return (value: T) => {
      setOffset(0);
      setter(value);
    };
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground mb-2 flex items-center gap-2.5">
          <Layers className="w-8 h-8 text-primary" />
          <span>Issue Explorer</span>
        </h1>
        <p className="text-secondary text-base sm:text-lg leading-relaxed">
          Triage and inspect civic issues across wards with runtime priority scoring and MPLADS evidence matching.
        </p>
      </div>

      {/* Filter Toolbar in GlowingCard */}
      <GlowingCard borderWidth={1} spread={30} className="border-border">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <Filter className="w-4 h-4 text-primary" />
            <span>Search &amp; Filter Criteria</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            <select
              value={ward}
              onChange={(e) => resetAndSet(setWard)(e.target.value)}
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
              onChange={(e) => resetAndSet(setCategory)(e.target.value)}
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

            <select
              value={status}
              onChange={(e) => resetAndSet(setStatus)(e.target.value)}
              aria-label="Filter by status"
              className="px-3 py-2 border border-border rounded-xl bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">All Statuses</option>
              <option value="open">Open</option>
              <option value="reopened">Reopened</option>
              <option value="closed">Closed</option>
            </select>

            <div className="flex items-center gap-2 px-3 py-1.5 border border-border rounded-xl bg-background text-sm">
              <SlidersHorizontal className="w-3.5 h-3.5 text-secondary shrink-0" />
              <span className="text-xs text-secondary whitespace-nowrap">Min Priority:</span>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={minPriority}
                onChange={(e) => resetAndSet(setMinPriority)(Number(e.target.value))}
                className="w-full cursor-pointer"
              />
              <span className="font-mono text-xs font-bold text-primary w-7 text-right">
                {minPriority.toFixed(2)}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <ArrowUpDown className="w-4 h-4 text-secondary shrink-0" />
              <select
                value={sort}
                onChange={(e) => resetAndSet(setSort)(e.target.value as "recent" | "priority")}
                aria-label="Sort by"
                className="w-full px-3 py-2 border border-border rounded-xl bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="recent">Most Recent</option>
                <option value="priority">Highest Priority</option>
              </select>
            </div>
          </div>
        </div>
      </GlowingCard>

      {/* Issues Table Container in GlowingCard */}
      <GlowingCard className="border-border overflow-hidden" innerClassName="p-0">
        {loading && (
          <div className="p-8">
            <LoadingState label="Loading issue dossiers…" />
          </div>
        )}
        {error && (
          <div className="p-8">
            <ErrorState message={error} onRetry={reload} />
          </div>
        )}
        {data && data.items.length === 0 && (
          <div className="p-8">
            <EmptyState>No issues match these filters.</EmptyState>
          </div>
        )}

        {data && data.items.length > 0 && (
          <div>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-border bg-muted/50 text-xs font-mono uppercase text-secondary">
                    <th className="p-3.5 font-semibold">Issue ID</th>
                    <th className="p-3.5 font-semibold">Category</th>
                    <th className="p-3.5 font-semibold">Ward</th>
                    <th className="p-3.5 font-semibold">Reports</th>
                    <th className="p-3.5 font-semibold">Status</th>
                    <th className="p-3.5 font-semibold">Public Work</th>
                    <th className="p-3.5 font-semibold text-right">Priority</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60 text-sm">
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
                      className="hover:bg-muted/60 cursor-pointer transition-colors group"
                    >
                      <td className="p-3.5 font-mono font-bold text-primary group-hover:underline">
                        #{issue.issue_id}
                        {issue.is_synthetic && (
                          <span className="ml-1.5">
                            <SyntheticTag />
                          </span>
                        )}
                      </td>
                      <td className="p-3.5">
                        <CategoryTag category={issue.category} />
                      </td>
                      <td className="p-3.5 font-mono text-secondary">
                        {issue.ward_id != null ? `Ward ${issue.ward_id}` : "—"}
                      </td>
                      <td className="p-3.5 font-mono text-foreground font-semibold">
                        {issue.report_count}
                      </td>
                      <td className="p-3.5">
                        <StatusTag status={issue.status} />
                      </td>
                      <td className="p-3.5">
                        {matchedIssueIds.has(issue.issue_id) ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 font-mono">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                            Matched
                          </span>
                        ) : (
                          <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium bg-muted text-secondary border border-border/80">
                            Unmatched
                          </span>
                        )}
                      </td>
                      <td className="p-3.5 font-mono text-right font-bold text-foreground">
                        {issue.priority_score?.toFixed(2) ?? "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination footer */}
            <div className="p-4 border-t border-border bg-muted/30 flex items-center justify-between">
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
                Showing {offset + 1}–{Math.min(offset + PAGE_SIZE, data.total)} of {data.total} issues
              </span>

              <button
                type="button"
                className="btn py-1.5 px-3 rounded-lg border border-border text-xs font-medium hover:bg-muted disabled:opacity-40 flex items-center gap-1 transition-colors"
                disabled={offset + PAGE_SIZE >= data.total}
                onClick={() => setOffset(offset + PAGE_SIZE)}
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </GlowingCard>
    </div>
  );
}
export default IssueExplorer;
