import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { api, ApiError } from "../../api/client";
import { useApi } from "../../hooks/useApi";
import { CategoryTag, StatusTag, SyntheticTag } from "../../components/Badges";
import { LoadingState, ErrorState } from "../../components/States";
import { CATEGORY_LABELS } from "../../api/types";
import { hasDistinctDescription } from "../../lib/work";
import { GlowingCard } from "../../components/ui/GlowingCard";
import { 
  ArrowLeft, 
  MapPin, 
  CheckCircle2, 
  AlertCircle, 
  Building2, 
  MessageSquare, 
  ThumbsUp, 
  ThumbsDown,
  ShieldCheck,
  Clock
} from "lucide-react";

export function PublicIssueDetail() {
  const { issueId } = useParams();
  const { data: issue, loading, error, reload } = useApi(() => api.issueDetail(Number(issueId)), [issueId]);

  if (loading) return <LoadingState label="Loading issue dossier…" />;
  if (error) return <ErrorState message={error} onRetry={reload} />;
  if (!issue) return null;

  const hasWork = issue.matches.length > 0;

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <Link
        to="/citizen/issues"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-secondary hover:text-foreground transition-colors group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Back to all public issues
      </Link>

      {/* Main Issue Header Card */}
      <GlowingCard className="border-border">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <div className="flex gap-2 flex-wrap items-center">
            <span className="font-mono text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-md">
              Issue #{issue.issue_id}
            </span>
            <CategoryTag category={issue.category} />
            <StatusTag status={issue.status} />
            {issue.is_synthetic && <SyntheticTag />}
          </div>
          <div className="flex items-center gap-1 text-xs text-secondary font-mono">
            <MapPin className="w-3.5 h-3.5 text-primary" />
            Ward {issue.ward_id ?? "—"}
          </div>
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground mb-3">
          {CATEGORY_LABELS[issue.category] ?? issue.category}
        </h1>

        <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-secondary pt-3 border-t border-border/80">
          <div className="flex items-center gap-1.5">
            <MessageSquare className="w-4 h-4 text-primary" />
            <span>{issue.report_count} citizen report{issue.report_count === 1 ? "" : "s"}</span>
          </div>
          {issue.first_reported && (
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-secondary" />
              <span>First reported {new Date(issue.first_reported).toLocaleDateString()}</span>
            </div>
          )}
        </div>
      </GlowingCard>

      {/* Public Records Check */}
      <GlowingCard className="border-border">
        <div className="flex items-center gap-2 mb-4">
          <Building2 className="w-5 h-5 text-indigo-600" />
          <h2 className="text-xl font-bold text-foreground">Public Works Cross-Check</h2>
        </div>

        {hasWork ? (
          <div className="space-y-4">
            <p className="text-sm text-secondary leading-relaxed">
              Our spatial matcher identified a government-sanctioned MPLADS work in this area. Ward administrators review this connection for accountability.
            </p>
            {issue.matches.map((match) => (
              <div
                key={match.match_id}
                className="p-4 bg-muted/40 rounded-xl border border-border/80 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-foreground text-sm">
                    {match.work?.work_name}
                  </span>
                  <span className="font-mono text-xs px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                    MPLADS #{match.work_id}
                  </span>
                </div>
                {match.work && hasDistinctDescription(match.work.work_name, match.work.description) && (
                  <p className="text-xs text-secondary leading-relaxed">{match.work.description}</p>
                )}
                {match.match_reason && (
                  <p className="text-xs text-secondary italic bg-background p-2 rounded-lg border border-border/60">
                    Match basis: {match.match_reason}
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 bg-muted/30 rounded-xl border border-border/60 text-sm text-secondary flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-secondary" />
            <span>No related MPLADS public works record has been found for this exact coordinate yet.</span>
          </div>
        )}
      </GlowingCard>

      {/* Review Status notice */}
      {issue.signals.length > 0 && (
        <GlowingCard className="border-border" innerClassName="bg-amber-50/40 border-amber-200/60">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-foreground text-sm mb-1">Under Administrative Verification</h3>
              <p className="text-xs text-secondary leading-relaxed">
                This issue has triggered {issue.signals.length} verification signal{issue.signals.length === 1 ? "" : "s"} based on documented spatial or category criteria, currently prioritized on the administrator review queue.
              </p>
            </div>
          </div>
        </GlowingCard>
      )}

      {/* Citizen Feedback Form (when closed) */}
      {issue.status === "closed" && <FeedbackForm issueId={issue.issue_id} onSubmitted={reload} />}

      {/* Citizen Feedback History */}
      {issue.feedback.length > 0 && (
        <GlowingCard className="border-border">
          <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-primary" />
            <span>Resident Verification Feedback</span>
          </h2>
          <ul className="space-y-3">
            {issue.feedback.map((fb) => (
              <li
                key={fb.feedback_id}
                className="p-3.5 bg-muted/40 rounded-xl border border-border/70 flex items-start gap-3 text-sm"
              >
                {fb.resolved_confirmed ? (
                  <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                )}
                <div>
                  <span className="font-semibold text-foreground">
                    {fb.resolved_confirmed ? "Confirmed Resolved" : "Disputed — Issue Still Persists"}
                  </span>
                  {fb.comment && <p className="text-xs text-secondary mt-1">&ldquo;{fb.comment}&rdquo;</p>}
                </div>
              </li>
            ))}
          </ul>
        </GlowingCard>
      )}
    </div>
  );
}

function FeedbackForm({ issueId, onSubmitted }: { issueId: number; onSubmitted: () => void }) {
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  async function submit(resolvedConfirmed: boolean) {
    setSubmitting(true);
    setError(null);
    try {
      await api.submitFeedback(issueId, { resolved_confirmed: resolvedConfirmed, comment: comment.trim() || null });
      setSubmitted(true);
      onSubmitted();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to submit feedback.");
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <GlowingCard className="border-emerald-300 bg-emerald-50/30">
        <div className="flex items-center gap-3">
          <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
          <div>
            <h3 className="text-base font-bold text-foreground">Thank you for verifying</h3>
            <p className="text-xs text-secondary">Your feedback has been logged into the public accountability record.</p>
          </div>
        </div>
      </GlowingCard>
    );
  }

  return (
    <GlowingCard className="border-primary/30">
      <h2 className="text-xl font-bold text-foreground mb-2">Was this actually resolved?</h2>
      <p className="text-sm text-secondary mb-4 leading-relaxed">
        Municipal records marked this issue as closed. Help your community by confirming or disputing the fix on the ground.
      </p>

      <textarea
        className="w-full p-3.5 border border-border rounded-xl bg-muted/40 text-foreground text-sm mb-4 focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary transition-all"
        rows={2}
        placeholder="Optional comments (e.g. 'Pothole filled with asphalt' or 'Water still leaking from pipeline')"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
      />

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          className="btn btn-black text-xs font-semibold py-2.5 px-5 rounded-lg flex items-center gap-1.5 disabled:opacity-50"
          disabled={submitting}
          onClick={() => submit(true)}
        >
          <ThumbsUp className="w-3.5 h-3.5 text-emerald-400" />
          Yes, it's fixed
        </button>
        <button
          type="button"
          className="btn text-xs font-semibold py-2.5 px-5 rounded-lg border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 flex items-center gap-1.5 disabled:opacity-50 transition-colors"
          disabled={submitting}
          onClick={() => submit(false)}
        >
          <ThumbsDown className="w-3.5 h-3.5 text-red-600" />
          No, still broken
        </button>
      </div>

      {error && (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs" role="alert">
          {error}
        </div>
      )}
    </GlowingCard>
  );
}
export default PublicIssueDetail;
