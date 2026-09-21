import { Outlet } from "react-router-dom";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import "./citizen.css";

export function CitizenLayout() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <Header type="citizen" />
      <main id="main" className="max-w-7xl mx-auto px-6 py-8">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
