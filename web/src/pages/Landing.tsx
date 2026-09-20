import { Link } from "react-router-dom";
import { useApi } from "../hooks/useApi";
import { api } from "../api/client";
import "./landing.css";

export function Landing() {
  const { data: stats } = useApi(() => api.stats(), []);

  return (
    <div className="landing">
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <header className="landing__header">
        <div className="landing__brand">
          <span className="landing__mark" aria-hidden="true" />
          <div>
            <span className="landing__title">WardSentry</span>
            <span className="landing__subtitle">Civic issue triage &amp; accountability</span>
          </div>
        </div>
        <nav className="landing__nav" aria-label="Main navigation">
          <Link to="/citizen">Report an issue</Link>
          <Link to="/admin">Administrator console</Link>
        </nav>
      </header>

      <main id="main">
        <section className="landing__hero">
          <p className="landing__eyebrow">Prototype · no authentication</p>
          <h1>Civic complaints don't disappear into a queue. They get linked to what's already being done.</h1>
          <p className="landing__lede">
            WardSentry reads citizen reports, groups duplicates of the same underlying problem, scores what
            needs attention first — and checks whether a public work was already funded to fix it. Every
            score is a printed formula, every claim cites its source records. Nothing is a black box.
          </p>
          <div className="landing__actions">
            <Link to="/citizen" className="button button--primary">
              Report an issue
            </Link>
            <Link to="/admin" className="button button--ghost">
              Open administrator console
            </Link>
          </div>
          {stats && (
            <p className="landing__stat-line">
              Tracking {stats.issues.toLocaleString()} civic issues from {stats.reports.toLocaleString()}{" "}
              reports across {stats.wards} wards, against {stats.works.toLocaleString()} real public-works
              records.
            </p>
          )}
        </section>

        <section className="landing__differentiator">
          <h2>What makes this different</h2>
          <p>
            We hold {stats ? stats.works.toLocaleString() : "60,359"} cleaned MPLADS public-works records —
            real, government-published funding data. When a recurring civic issue matches a public work
            already funded to address it, WardSentry surfaces that connection with a stated match reason and
            a spatial/category relationship, so review starts with evidence instead of a blank complaint.
          </p>
        </section>

        <section className="landing__how">
          <h2>How it works</h2>
          <ol className="landing__steps">
            <li>
              <span className="landing__step-num">1</span>
              <div>
                <strong>Reports are grouped, not duplicated.</strong> The same problem reported by multiple
                people becomes one tracked issue, not a pile of tickets.
              </div>
            </li>
            <li>
              <span className="landing__step-num">2</span>
              <div>
                <strong>Priority is a formula, never a model.</strong> Exposure, severity, recurrence, and
                time-open combine into one printable, auditable score — computed at runtime, every time.
              </div>
            </li>
            <li>
              <span className="landing__step-num">3</span>
              <div>
                <strong>Every signal names its sources.</strong> Verification signals cite the exact record
                ids behind them — evidence for human review, never a finding of guilt.
              </div>
            </li>
          </ol>
        </section>
      </main>

      <footer className="landing__footer">
        <p>
          WardSentry is a hackathon prototype. Data shown here is generated for demonstration and does not
          reflect an official Pune Municipal Corporation service.
        </p>
      </footer>
    </div>
  );
}
