import { Outlet } from "react-router-dom";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import "./admin.css";

export function AdminLayout() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <a href="#admin-main" className="skip-link">
        Skip to content
      </a>
      <Header type="admin" />
      <main id="admin-main" className="max-w-7xl mx-auto px-6 py-8">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
