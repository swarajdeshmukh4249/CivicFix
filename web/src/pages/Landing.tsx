import { Link } from "react-router-dom";
import { useApi } from "../hooks/useApi";
import { api } from "../api/client";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { GlowingCard, GlowingCardIcon } from "../components/ui/GlowingCard";
import { 
  Sparkles, 
  ShieldCheck, 
  Search, 
  Users, 
  RefreshCw, 
  MapPin, 
  ArrowRight, 
  FileText,
  CheckCircle2,
  Layers
} from "lucide-react";

export function Landing() {
  const { data: stats } = useApi(() => api.stats(), []);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-primary/20">
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <Header type="citizen" />

      <main id="main" className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 py-10 md:py-16 w-full">
        {/* Hero Section */}
        <section className="text-center max-w-4xl mx-auto mb-16 space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-border/80 bg-muted text-xs font-mono text-secondary mb-2">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            Prototype · Pune Municipal Corporation
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-foreground leading-[1.15]">
            Civic complaints don't disappear into a queue.
            <span className="block mt-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
              They get linked to what's already funded.
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-secondary max-w-2xl mx-auto leading-relaxed">
            CivicFix groups duplicate citizen reports into single issues, computes priority via transparent formulas, and cross-references government MPLADS records so review starts with verified evidence.
          </p>

          <div className="flex flex-col sm:flex-row gap-3.5 justify-center items-center pt-4">
            <Link
              to="/citizen"
              className="btn btn-black px-7 py-3 rounded-xl font-medium shadow-sm hover:shadow flex items-center gap-2 text-base w-full sm:w-auto justify-center"
            >
              Enter Citizen Portal
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/admin"
              className="btn px-7 py-3 rounded-xl font-medium border border-border bg-white hover:bg-muted text-foreground transition-colors text-base w-full sm:w-auto justify-center flex items-center gap-2"
            >
              <ShieldCheck className="w-4 h-4 text-primary" />
              Administrator Console
            </Link>
          </div>
        </section>

        {/* Live Metrics Grid with GlowingCards */}
        {stats && (
          <section className="mb-20">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <GlowingCard className="text-left">
                <div className="text-xs font-mono uppercase text-secondary mb-1 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-primary" />
                  Civic Issues
                </div>
                <div className="text-3xl font-bold font-mono text-foreground">
                  {stats.issues.toLocaleString()}
                </div>
                <div className="text-xs text-secondary mt-1">Unique problem sites</div>
              </GlowingCard>

              <GlowingCard className="text-left">
                <div className="text-xs font-mono uppercase text-secondary mb-1 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-indigo-500" />
                  Citizen Reports
                </div>
                <div className="text-3xl font-bold font-mono text-foreground">
                  {stats.reports.toLocaleString()}
                </div>
                <div className="text-xs text-secondary mt-1">Grouped &amp; deduplicated</div>
              </GlowingCard>

              <GlowingCard className="text-left">
                <div className="text-xs font-mono uppercase text-secondary mb-1 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-emerald-500" />
                  Pune Wards
                </div>
                <div className="text-3xl font-bold font-mono text-foreground">
                  {stats.wards}
                </div>
                <div className="text-xs text-secondary mt-1">Active municipal coverage</div>
              </GlowingCard>

              <GlowingCard className="text-left">
                <div className="text-xs font-mono uppercase text-secondary mb-1 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-500" />
                  MPLADS Works
                </div>
                <div className="text-3xl font-bold font-mono text-foreground">
                  {stats.works.toLocaleString()}
                </div>
                <div className="text-xs text-secondary mt-1">Cleaned government records</div>
              </GlowingCard>
            </div>
          </section>
        )}

        {/* Feature Grid with GlowingEffect - Inspired by glowing-effect-demo-2.js */}
        <section className="mb-20">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-3">
              Intelligent Civic Accountability
            </h2>
            <p className="text-secondary text-base">
              Built on transparent formulas and government data, designed to make urban governance auditable and efficient.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            {/* Feature 1 */}
            <div className="md:col-span-7">
              <GlowingCard className="h-full">
                <GlowingCardIcon>
                  <Sparkles className="w-5 h-5 text-purple-600" />
                </GlowingCardIcon>
                <div className="space-y-2 mt-auto">
                  <h3 className="text-xl font-bold text-foreground">
                    Duplicate Grouping &amp; Clustering
                  </h3>
                  <p className="text-sm text-secondary leading-relaxed">
                    Instead of clogging departments with duplicate tickets, reports describing the same underlying problem are automatically clustered into a single tracked civic issue.
                  </p>
                </div>
              </GlowingCard>
            </div>

            {/* Feature 2 */}
            <div className="md:col-span-5">
              <GlowingCard className="h-full">
                <GlowingCardIcon>
                  <Users className="w-5 h-5 text-blue-600" />
                </GlowingCardIcon>
                <div className="space-y-2 mt-auto">
                  <h3 className="text-xl font-bold text-foreground">
                    Multilingual Voice Intake
                  </h3>
                  <p className="text-sm text-secondary leading-relaxed">
                    Citizens report directly using English, Hindi, or Marathi speech-to-text with automatic translation to ensure equal accessibility across all wards.
                  </p>
                </div>
              </GlowingCard>
            </div>

            {/* Feature 3 */}
            <div className="md:col-span-4">
              <GlowingCard className="h-full">
                <GlowingCardIcon>
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                </GlowingCardIcon>
                <div className="space-y-2 mt-auto">
                  <h3 className="text-xl font-bold text-foreground">
                    MPLADS Record Verification
                  </h3>
                  <p className="text-sm text-secondary leading-relaxed">
                    Cross-references 60,000+ government public works records to detect if a reported problem overlaps with an already funded project.
                  </p>
                </div>
              </GlowingCard>
            </div>

            {/* Feature 4 */}
            <div className="md:col-span-4">
              <GlowingCard className="h-full">
                <GlowingCardIcon>
                  <Search className="w-5 h-5 text-amber-600" />
                </GlowingCardIcon>
                <div className="space-y-2 mt-auto">
                  <h3 className="text-xl font-bold text-foreground">
                    Auditable Priority Formula
                  </h3>
                  <p className="text-sm text-secondary leading-relaxed">
                    Severity, population exposure, recurrence, and days-open calculate priority dynamically. Every term and weight is visible and verifiable.
                  </p>
                </div>
              </GlowingCard>
            </div>

            {/* Feature 5 */}
            <div className="md:col-span-4">
              <GlowingCard className="h-full">
                <GlowingCardIcon>
                  <RefreshCw className="w-5 h-5 text-rose-600" />
                </GlowingCardIcon>
                <div className="space-y-2 mt-auto">
                  <h3 className="text-xl font-bold text-foreground">
                    Citizen Dispute &amp; Feedback Loop
                  </h3>
                  <p className="text-sm text-secondary leading-relaxed">
                    When an issue is marked resolved, residents can confirm or dispute the fix. Disputing reopens the issue automatically with evidence.
                  </p>
                </div>
              </GlowingCard>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-foreground mb-3">How CivicFix Works</h2>
            <p className="text-secondary text-base">Three deterministic steps from citizen report to verified resolution.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <GlowingCard>
              <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 text-primary font-bold flex items-center justify-center text-sm mb-4">
                1
              </div>
              <h3 className="font-bold text-lg text-foreground mb-2">Report &amp; Cluster</h3>
              <p className="text-sm text-secondary leading-relaxed">
                Residents submit photo and description. The intake engine groups it with nearby matching issues.
              </p>
            </GlowingCard>

            <GlowingCard>
              <div className="w-8 h-8 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-600 font-bold flex items-center justify-center text-sm mb-4">
                2
              </div>
              <h3 className="font-bold text-lg text-foreground mb-2">Score &amp; Match</h3>
              <p className="text-sm text-secondary leading-relaxed">
                Calculates auditable priority score and queries spatial records for active or completed municipal works.
              </p>
            </GlowingCard>

            <GlowingCard>
              <div className="w-8 h-8 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 font-bold flex items-center justify-center text-sm mb-4">
                3
              </div>
              <h3 className="font-bold text-lg text-foreground mb-2">Triage &amp; Resolve</h3>
              <p className="text-sm text-secondary leading-relaxed">
                Ward officers receive routed dossiers with cite-backed evidence, followed by citizen closure verification.
              </p>
            </GlowingCard>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
export default Landing;
