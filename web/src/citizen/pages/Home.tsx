import { Link } from "react-router-dom";
import { useApi } from "../../hooks/useApi";
import { api } from "../../api/client";
import { GlowingCard, GlowingCardIcon } from "../../components/ui/GlowingCard";
import { PlusCircle, Search, MapPin, Sparkles, ArrowRight } from "lucide-react";

export function Home() {
  const { data: stats } = useApi(() => api.stats(), []);

  return (
    <div className="max-w-5xl mx-auto space-y-12">
      {/* Hero Welcome */}
      <section className="text-center md:text-left max-w-3xl space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary">
          <Sparkles className="w-3.5 h-3.5" />
          Pune Citizen Intake
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-foreground">
          Something wrong in your ward?
        </h1>
        <p className="text-base sm:text-lg text-secondary leading-relaxed">
          Report potholes, broken streetlights, water contamination, or drainage issues. We automatically link your report to existing municipal works and track resolution transparently.
        </p>
      </section>

      {/* Action Cards with GlowingEffect */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link to="/citizen/report" className="block group">
          <GlowingCard className="h-full border-primary/30">
            <GlowingCardIcon className="bg-primary/10 text-primary border-primary/30">
              <PlusCircle className="w-6 h-6" />
            </GlowingCardIcon>
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors flex items-center justify-between">
                <span>Report an issue</span>
                <ArrowRight className="w-5 h-5 text-secondary group-hover:text-primary group-hover:translate-x-1 transition-all" />
              </h2>
              <p className="text-sm text-secondary leading-relaxed">
                Submit a new complaint with optional photo, voice recording (English, Hindi, Marathi), or landmark description. Takes less than a minute.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-border/80 flex items-center gap-2 text-xs font-semibold text-primary">
              <span>Start reporting</span>
              <span>→</span>
            </div>
          </GlowingCard>
        </Link>

        <Link to="/citizen/issues" className="block group">
          <GlowingCard className="h-full">
            <GlowingCardIcon className="bg-blue-50 text-blue-600 border-blue-200">
              <Search className="w-6 h-6" />
            </GlowingCardIcon>
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors flex items-center justify-between">
                <span>Browse public issues</span>
                <ArrowRight className="w-5 h-5 text-secondary group-hover:text-primary group-hover:translate-x-1 transition-all" />
              </h2>
              <p className="text-sm text-secondary leading-relaxed">
                Explore an interactive map of issues across all 58 Pune wards. See grouped reports, computed priority scores, and verified works.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-border/80 flex items-center gap-2 text-xs font-semibold text-secondary group-hover:text-primary transition-colors">
              <span>View map &amp; list</span>
              <span>→</span>
            </div>
          </GlowingCard>
        </Link>
      </section>

      {/* Live System Notice in GlowingCard */}
      {stats && (
        <GlowingCard borderWidth={1} spread={40} className="border-border">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-primary shrink-0">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-foreground">Pune Civic Data Registry</h3>
                <p className="text-xs text-secondary">
                  Active monitoring across all municipal wards and administrative zones.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-6 font-mono text-sm">
              <div>
                <span className="text-secondary text-xs block">TRACKED ISSUES</span>
                <span className="text-xl font-bold text-foreground">{stats.issues.toLocaleString()}</span>
              </div>
              <div className="h-8 w-px bg-border" />
              <div>
                <span className="text-secondary text-xs block">CITIZEN REPORTS</span>
                <span className="text-xl font-bold text-foreground">{stats.reports.toLocaleString()}</span>
              </div>
              <div className="h-8 w-px bg-border" />
              <div>
                <span className="text-secondary text-xs block">ACTIVE WARDS</span>
                <span className="text-xl font-bold text-foreground">{stats.wards}</span>
              </div>
            </div>
          </div>
        </GlowingCard>
      )}

      {/* 3 Steps Process */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold text-foreground">What happens after you report</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <GlowingCard>
            <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 text-primary font-bold flex items-center justify-center text-sm mb-3">
              1
            </div>
            <h3 className="font-bold text-foreground text-base mb-1">Clustering &amp; Deduplication</h3>
            <p className="text-xs text-secondary leading-relaxed">
              Your report is analyzed for location and category, then grouped with similar reports nearby so the same issue isn't tracked twice.
            </p>
          </GlowingCard>

          <GlowingCard>
            <div className="w-8 h-8 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-600 font-bold flex items-center justify-center text-sm mb-3">
              2
            </div>
            <h3 className="font-bold text-foreground text-base mb-1">Public Works Cross-Check</h3>
            <p className="text-xs text-secondary leading-relaxed">
              If an MPLADS public work or municipal project was previously sanctioned or completed at this location, we surface it as evidence.
            </p>
          </GlowingCard>

          <GlowingCard>
            <div className="w-8 h-8 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 font-bold flex items-center justify-center text-sm mb-3">
              3
            </div>
            <h3 className="font-bold text-foreground text-base mb-1">Public Record &amp; Review</h3>
            <p className="text-xs text-secondary leading-relaxed">
              Your report joins the public record. Once addressed by ward officials, you can confirm the resolution or dispute it with fresh evidence.
            </p>
          </GlowingCard>
        </div>
      </section>
    </div>
  );
}
export default Home;
