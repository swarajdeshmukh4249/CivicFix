import { Navigate, Route, BrowserRouter, Routes } from "react-router-dom";
import { Landing } from "./pages/Landing";
import { CitizenLayout } from "./citizen/CitizenLayout";
import { Home } from "./citizen/pages/Home";
import { ReportIssue } from "./citizen/pages/ReportIssue";
import { PublicIssues } from "./citizen/pages/PublicIssues";
import { PublicIssueDetail } from "./citizen/pages/PublicIssueDetail";
import { AdminLayout } from "./admin/AdminLayout";
import { Overview } from "./admin/pages/Overview";
import { IssueExplorer } from "./admin/pages/IssueExplorer";
import { IssueDetail } from "./admin/pages/IssueDetail";
import { MapView } from "./admin/pages/MapView";
import { PublicWorks } from "./admin/pages/PublicWorks";
import { Verification } from "./admin/pages/Verification";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />

        {/* Citizen portal: separate layout/route boundary, not CSS-hidden
            admin content. Prototype only - no auth exists on either side. */}
        <Route path="/citizen" element={<CitizenLayout />}>
          <Route index element={<Home />} />
          <Route path="report" element={<ReportIssue />} />
          <Route path="issues" element={<PublicIssues />} />
          <Route path="issues/:issueId" element={<PublicIssueDetail />} />
        </Route>

        {/* Administrator console: prototype area, structured so real
            auth/authorization can be added at this boundary later. */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Overview />} />
          <Route path="issues" element={<IssueExplorer />} />
          <Route path="issues/:issueId" element={<IssueDetail />} />
          <Route path="map" element={<MapView />} />
          <Route path="works" element={<PublicWorks />} />
          <Route path="verification" element={<Verification />} />
        </Route>

        <Route path="*" element={<Navigate to="/citizen" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
