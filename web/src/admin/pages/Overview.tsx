import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../api/client";
import { useApi } from "../../hooks/useApi";
import { WardMap } from "../../components/WardMap";
import { LoadingState, ErrorState } from "../../components/States";
import { CATEGORY_LABELS } from "../../api/types";
import { GlowingCard } from "../../components/ui/GlowingCard";
import { 
  BarChart3, 
  MapPin, 
  FileText, 
  Layers, 
  CheckCircle2, 
  Building2, 
  ShieldAlert, 
  Filter, 
  SlidersHorizontal 
} from "lucide-react";

const STAT_CONFIG: Record<
  string,
  { label: string; icon: React.ReactNode; color: string }
> = {
  wards: { label: "Pune Wards", icon: <MapPin className="w-4 h-4 text-blue-500" />, color: "text-blue-600" },
  works: { label: "MPLADS Works", icon: <Building2 className="w-4 h-4 text-emerald-500" />, color: "text-emerald-600" },
  reports: { label: "Citizen Reports", icon: <FileText className="w-4 h-4 text-indigo-500" />, color: "text-indigo-600" },
  issues: { label: "Civic Issues", icon: <Layers className="w-4 h-4 text-purple-500" />, color: "text-purple-600" },
  matches: { label: "Computed Matches", icon: <CheckCircle2 className="w-4 h-4 text-cyan-500" />, color: "text-cyan-600" },
  sensitive_sites: { label: "Sensitive Sites", icon: <Building2 className="w-4 h-4 text-amber-500" />, color: "text-amber-600" },
  verification_signals: { label: "Verification Signals", icon: <ShieldAlert className="w-4 h-4 text-rose-500" />, color: "text-rose-600" },
};

export function Overview() {
  const navigate = useNavigate();
  const { data: stats } = useApi(() => api.stats(), []);
  const { data: mapData, loading: mapLoading, error: mapError, reload } = useApi(() => api.map(), []);

  const [ward, setWard] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("");
  const [minPriority, setMinPriority] = useState(0);

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
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground mb-2 flex items-center gap-2.5">
          <BarChart3 className="w-8 h-8 text-primary" />
          <span>Pune Administrative Overview</span>
        </h1>
        <p className="text-secondary text-base sm:text-lg leading-relaxed">
          Spatial overview of citizen complaints, formula-scored priorities, and matched government public works across Pune wards.
        </p>
      </div>

      {/* Top Stat Metrics in GlowingCards */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5">
          {Object.entries(STAT_CONFIG).map(([key, config]) => {
            const val = stats[key as keyof typeof stats];
            return (
              <GlowingCard key={key} innerClassName="p-4 justify-between">
                <div className="flex items-center justify-between text-secondary mb-1">
                  <span className="text-xs font-mono uppercase tracking-wider">{config.label}</span>
                  {config.icon}
                </div>
                <div className="text-2xl sm:text-3xl font-bold font-mono text-foreground mt-1">
                  {val != null ? val.toLocaleString() : "—"}
                </div>
              </GlowingCard>
            );
          })}
        </div>
      )}

      {/* Filter Control Bar in GlowingCard */}
      <GlowingCard borderWidth={1} spread={30} className="border-border">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <Filter className="w-4 h-4 text-primary" />
            <span>Map Filters &amp; Thresholds</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <select
              value={ward}
              onChange={(e) => setWard(e.target.value)}
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
              onChange={(e) => setCategory(e.target.value)}
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
              onChange={(e) => setStatus(e.target.value)}
              aria-label="Filter by status"
              className="px-3 py-2 border border-border rounded-xl bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">All Statuses</option>
              <option value="open">Open</option>
              <option value="reopened">Reopened</option>
              <option value="closed">Closed</option>
            </select>

            <div className="flex items-center gap-2 px-3 py-1.5 border border-border rounded-xl bg-background text-sm">
              <SlidersHorizontal className="w-4 h-4 text-secondary shrink-0" />
              <span className="text-xs text-secondary whitespace-nowrap">Min Priority:</span>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={minPriority}
                onChange={(e) => setMinPriority(Number(e.target.value))}
                className="w-full cursor-pointer"
              />
              <span className="font-mono text-xs font-bold text-primary w-8 text-right">
                {minPriority.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </GlowingCard>

      {/* WardMap in styled container */}
      <div className="rounded-2xl border border-border p-2 bg-white/80 shadow-xs space-y-2">
        {mapLoading && (
          <div className="h-[540px] flex items-center justify-center">
            <LoadingState label="Loading spatial map data…" />
          </div>
        )}
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
        <div className="px-3 py-2 text-xs text-secondary flex flex-wrap items-center justify-between gap-2 border-t border-border/60">
          <span>
            {filteredIssues.length} issue{filteredIssues.length === 1 ? "" : "s"} visible on map
          </span>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rotate-45 bg-blue-600 inline-block" />
              Matched MPLADS works
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-500 inline-block" />
              Sensitive sites
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
export default Overview;
