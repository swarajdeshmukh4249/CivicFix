import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, ApiError } from "../../api/client";
import { useApi } from "../../hooks/useApi";
import { LoadingState, ErrorState, EmptyState } from "../../components/States";
import type { SignalSummary } from "../../api/types";
import { GlowingCard, GlowingCardIcon } from "../../components/ui/GlowingCard";
import { ShieldCheck, Layers, MapPin, Building2, ArrowRight, CheckCircle2 } from "lucide-react";

export function Verification() {
  const { data: metrics } = useApi(() => api.metrics(), []);
  const { data: matches } = useApi(() => api.listMatches({ limit: 500 }), []);
  const [signals, setSignals] = useState<SignalSummary[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!matches) return;
    let cancelled = false;
    setLoading(true);
    const issueIds = [...new Set(matches.map((m) => m.issue_id))];
    Promise.all(issueIds.map((id) => api.issueDetail(id)))
      .then((details) => {
        if (cancelled) return;
        setSignals(details.flatMap((d) => d.signals));
        setLoading(false);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err instanceof ApiError ? err.message : "Could not load verification signals.");
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [matches]);

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground mb-2 flex items-center gap-2.5">
          <ShieldCheck className="w-8 h-8 text-primary" />
          <span>Verification Signals &amp; Audit Engine</span>
        </h1>
        <p className="text-secondary text-base sm:text-lg leading-relaxed">
          Deterministic spatial and category signals surfaced for administrative review. These document verified municipal relationships without black-box conjecture.
        </p>
      </div>

      {/* Evaluation Metrics Cards in GlowingCard */}
      {metrics && (
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-foreground">Pipeline Evaluation Metrics</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <GlowingCard>
              <GlowingCardIcon className="bg-purple-50 text-purple-600 border-purple-200">
                <CheckCircle2 className="w-5 h-5" />
              </GlowingCardIcon>
              <div>
                <span className="text-xs font-mono uppercase text-secondary block mb-1">Classifier (macro-F1)</span>
                {metrics.classification.trained ? (
                  <>
                    <div className="text-2xl font-bold font-mono text-foreground">
                      {metrics.classification.model_macro_f1?.toFixed(3)}
                    </div>
                    <p className="text-xs text-secondary mt-1">
                      vs {metrics.classification.baseline_macro_f1?.toFixed(3)} baseline ({metrics.classification.n_train} training samples).
                    </p>
                  </>
                ) : (
                  <div className="text-sm text-secondary">Keyword baseline deployed</div>
                )}
              </div>
            </GlowingCard>

            <GlowingCard>
              <GlowingCardIcon className="bg-blue-50 text-blue-600 border-blue-200">
                <Layers className="w-5 h-5" />
              </GlowingCardIcon>
              <div>
                <span className="text-xs font-mono uppercase text-secondary block mb-1">Deduplication &amp; Clusters</span>
                <div className="text-2xl font-bold font-mono text-foreground">
                  {metrics.clustering.multi_report_issues} / {metrics.clustering.total_issues}
                </div>
                <p className="text-xs text-secondary mt-1">
                  issues have 2+ reports (peak cluster: {metrics.clustering.largest_cluster_size}).
                </p>
              </div>
            </GlowingCard>

            <GlowingCard>
              <GlowingCardIcon className="bg-emerald-50 text-emerald-600 border-emerald-200">
                <MapPin className="w-5 h-5" />
              </GlowingCardIcon>
              <div>
                <span className="text-xs font-mono uppercase text-secondary block mb-1">Spatial Resolution</span>
                <div className="text-2xl font-bold font-mono text-emerald-600">
                  {(metrics.location.resolution_rate * 100).toFixed(1)}%
                </div>
                <p className="text-xs text-secondary mt-1">
                  {metrics.location.precise_resolved} precise, {metrics.location.ward_level_resolved} ward-level resolved.
                </p>
              </div>
            </GlowingCard>

            <GlowingCard>
              <GlowingCardIcon className="bg-indigo-50 text-indigo-600 border-indigo-200">
                <Building2 className="w-5 h-5" />
              </GlowingCardIcon>
              <div>
                <span className="text-xs font-mono uppercase text-secondary block mb-1">Public-Work Matcher</span>
                <div className="text-2xl font-bold font-mono text-foreground">
                  {metrics.matcher.matched_issues} / {metrics.matcher.total_issues_eligible}
                </div>
                <p className="text-xs text-secondary mt-1">
                  {metrics.matcher.labeled_accuracy != null
                    ? `${(metrics.matcher.labeled_accuracy * 100).toFixed(0)}% benchmark accuracy on anchor cases.`
                    : "Eligible issues cross-checked with MPLADS."}
                </p>
              </div>
            </GlowingCard>
          </div>
        </section>
      )}

      {/* Signals List in GlowingCards */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-primary" />
            <span>Active Verification Signals</span>
          </h2>
          {signals && (
            <span className="text-xs font-mono text-secondary">
              {signals.length} verification signal{signals.length === 1 ? "" : "s"}
            </span>
          )}
        </div>

        {loading && <LoadingState label="Reconstructing verification signal queue…" />}
        {error && <ErrorState message={error} />}
        {signals && signals.length === 0 && (
          <EmptyState>No active verification signals triggered in the database yet.</EmptyState>
        )}

        {signals && signals.length > 0 && (
          <div className="space-y-4">
            {signals.map((signal) => (
              <GlowingCard key={signal.signal_id} innerClassName="p-5 justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-xs font-bold text-primary bg-primary/10 px-2.5 py-0.5 rounded-md">
                      {signal.rule_name}
                    </span>
                    <Link
                      to={`/admin/issues/${signal.issue_id}`}
                      className="text-xs font-semibold text-primary hover:underline flex items-center gap-1 group"
                    >
                      <span>Inspect Issue #{signal.issue_id}</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                  </div>

                  <p className="text-sm text-foreground leading-relaxed">
                    {signal.explanation}
                  </p>

                  <details className="text-xs pt-1">
                    <summary className="cursor-pointer text-secondary hover:text-foreground font-mono">
                      Show source record identifiers
                    </summary>
                    <pre className="mt-2 p-2.5 bg-muted/50 rounded-lg text-[11px] font-mono overflow-auto border border-border/70">
                      {JSON.stringify(signal.source_record_ids, null, 2)}
                    </pre>
                  </details>
                </div>
              </GlowingCard>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
export default Verification;
