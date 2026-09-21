import { useNavigate } from "react-router-dom";
import { api } from "../../api/client";
import { useApi } from "../../hooks/useApi";
import { WardMap } from "../../components/WardMap";
import { LoadingState, ErrorState } from "../../components/States";
import { GlowingCard } from "../../components/ui/GlowingCard";
import { Map } from "lucide-react";

export function MapView() {
  const navigate = useNavigate();
  const { data, loading, error, reload } = useApi(() => api.map(), []);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground mb-2 flex items-center gap-2.5">
          <Map className="w-8 h-8 text-primary" />
          <span>Spatial Evidence Map</span>
        </h1>
        <p className="text-secondary text-base sm:text-lg leading-relaxed">
          Every civic issue, matched MPLADS public work, and sensitive site across Pune rendered on a single spatial evidence canvas.
        </p>
      </div>

      {loading && <LoadingState label="Loading spatial map dataset…" />}
      {error && <ErrorState message={error} onRetry={reload} />}

      {data && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-border p-2 bg-white/80 shadow-xs">
            <WardMap
              audience="admin"
              issues={data.issues}
              works={data.matched_works}
              sites={data.sensitive_sites}
              onIssueClick={(id) => navigate(`/admin/issues/${id}`)}
              height="calc(100vh - 280px)"
            />
          </div>

          {/* Map legend in GlowingCard */}
          <GlowingCard borderWidth={1} spread={30} className="border-border" innerClassName="p-4">
            <div className="flex flex-wrap items-center justify-between gap-4 text-xs font-medium">
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded-full bg-[#0f766e] shrink-0" />
                <span className="text-foreground">Civic Issues (colored by category, sized by priority formula)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rotate-45 bg-[#2563eb] shrink-0" />
                <span className="text-foreground">Matched MPLADS Works (government public works)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded-full bg-[#64748b] shrink-0" />
                <span className="text-foreground">Sensitive Sites (clustered schools, hospitals, water bodies)</span>
              </div>
            </div>
          </GlowingCard>
        </div>
      )}
    </div>
  );
}
export default MapView;
