import { Link } from "react-router-dom";
import { useApi } from "../../hooks/useApi";
import { api } from "../../api/client";
import "./home.css";

export function Home() {
  const { data: stats } = useApi(() => api.stats(), []);

  return (
    <div className="home">
      <section className="home__hero">
        <h1>Something wrong in your ward?</h1>
        <p className="home__lede">
          Tell us what's happening — a pothole, a broken streetlight, an overflowing drain — and we'll
          route it to the right place. It takes about a minute.
        </p>
        <div className="home__actions">
          <Link to="/citizen/report" className="button button--primary">
            Report an issue
          </Link>
          <Link to="/citizen/issues" className="button button--ghost">
            See public issues near me
          </Link>
        </div>
      </section>

      {stats && (
        <p className="home__context">
          {stats.issues.toLocaleString()} civic issues are currently being tracked across Pune's 58 wards.
        </p>
      )}

      <section className="home__how">
        <h2>What happens after you report</h2>
        <ol className="home__steps">
          <li>
            <span className="home__step-num">1</span>
            <div>
              <strong>We read your report.</strong> It's grouped with similar reports nearby so the same
              problem isn't tracked twice.
            </div>
          </li>
          <li>
            <span className="home__step-num">2</span>
            <div>
              <strong>We check for related public work.</strong> If a public project was already funded for
              this kind of problem in your area, we surface it.
            </div>
          </li>
          <li>
            <span className="home__step-num">3</span>
            <div>
              <strong>It's ready for review.</strong> Your report becomes part of the public record for your
              ward.
            </div>
          </li>
        </ol>
      </section>
    </div>
  );
}
