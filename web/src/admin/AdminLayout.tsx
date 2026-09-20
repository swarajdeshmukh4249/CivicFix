import { NavLink, Outlet } from "react-router-dom";
import "./admin.css";

const SECTIONS = [
  { to: "/admin", end: true, label: "Overview" },
  { to: "/admin/issues", label: "Issue Explorer" },
  { to: "/admin/map", label: "Map" },
  { to: "/admin/works", label: "Public Works" },
  { to: "/admin/verification", label: "Verification" },
];

export function AdminLayout() {
  return (
    <div className="admin">
      <a href="#admin-main" className="skip-link">
        Skip to content
      </a>
      <header className="admin__header">
        <div className="admin__brand">
          <span className="admin__mark" aria-hidden="true" />
          <span className="admin__title">WardSentry — Intelligence Console</span>
          <span className="admin__prototype-flag">Prototype · no authentication</span>
        </div>
        <nav className="admin__nav" aria-label="Administrator navigation">
          {SECTIONS.map((s) => (
            <NavLink key={s.to} to={s.to} end={s.end} className={({ isActive }) => (isActive ? "is-active" : "")}>
              {s.label}
            </NavLink>
          ))}
        </nav>
      </header>
      <main id="admin-main" className="admin__main">
        <Outlet />
      </main>
    </div>
  );
}
