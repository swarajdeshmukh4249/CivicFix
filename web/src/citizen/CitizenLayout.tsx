import { NavLink, Outlet } from "react-router-dom";
import "./citizen.css";

export function CitizenLayout() {
  return (
    <div className="citizen">
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <header className="citizen__header">
        <div className="citizen__brand">
          <span className="citizen__mark" aria-hidden="true" />
          <div>
            <span className="citizen__title">WardSentry</span>
            <span className="citizen__subtitle">Pune civic issue reporting</span>
          </div>
        </div>
        <nav className="citizen__nav" aria-label="Main navigation">
          <NavLink to="/citizen" end className={({ isActive }) => (isActive ? "is-active" : "")}>
            Home
          </NavLink>
          <NavLink to="/citizen/report" className={({ isActive }) => (isActive ? "is-active" : "")}>
            Report an issue
          </NavLink>
          <NavLink to="/citizen/issues" className={({ isActive }) => (isActive ? "is-active" : "")}>
            Public issues
          </NavLink>
        </nav>
      </header>
      <main id="main" className="citizen__main">
        <Outlet />
      </main>
      <footer className="citizen__footer">
        <p>
          WardSentry is a prototype. Data shown here is generated for demonstration and does not reflect an
          official Pune Municipal Corporation service.
        </p>
      </footer>
    </div>
  );
}
