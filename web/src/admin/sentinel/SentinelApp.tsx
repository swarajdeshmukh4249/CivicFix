import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { SentinelProvider, useSentinel } from './SentinelContext';
import { SentinelNav } from './components/SentinelNav';
import { WardOfficerDashboard } from './views/WardOfficerDashboard';
import { FieldDispatchView } from './views/FieldDispatchView';
import { ReviewerVigilanceConsole } from './views/ReviewerVigilanceConsole';
import './sentinel.css';

function TabRouterSync() {
  const { activeTab, setActiveTab } = useSentinel();
  const navigate = useNavigate();
  const location = useLocation();

  // Sync route changes to context
  useEffect(() => {
    const path = location.pathname;
    if (path === '/dispatch') {
      if (activeTab !== 'field-dispatch') setActiveTab('field-dispatch');
    } else if (path === '/vigilance' || path === '/reviewer') {
      if (activeTab !== 'reviewer-console') setActiveTab('reviewer-console');
    } else if (path === '/' || path === '/dashboard' || path === '/ward') {
      if (activeTab !== 'ward-dashboard') setActiveTab('ward-dashboard');
    }
  }, [location.pathname]);

  // Sync context tab switches to route URL
  useEffect(() => {
    if (activeTab === 'ward-dashboard' && location.pathname !== '/' && location.pathname !== '/dashboard') {
      navigate('/', { replace: true });
    } else if (activeTab === 'field-dispatch' && location.pathname !== '/dispatch') {
      navigate('/dispatch', { replace: true });
    } else if (activeTab === 'reviewer-console' && location.pathname !== '/vigilance') {
      navigate('/vigilance', { replace: true });
    }
  }, [activeTab]);

  // Global Keybindings (1, 2, 3) to switch views during live judge demonstrations
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }
      if (e.key === '1') {
        setActiveTab('ward-dashboard');
      } else if (e.key === '2') {
        setActiveTab('field-dispatch');
      } else if (e.key === '3') {
        setActiveTab('reviewer-console');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setActiveTab]);

  return null;
}

function SentinelMain() {
  return (
    <div className="sentinel-root flex flex-col min-h-screen bg-[#FAF8F5]">
      <TabRouterSync />
      {/* Top Level Sticky Navigation */}
      <SentinelNav />

      {/* Main Spacious Viewport with Direct Route Matching */}
      <main className="flex-1 w-full">
        <Routes>
          <Route path="/" element={<WardOfficerDashboard />} />
          <Route path="/dashboard" element={<WardOfficerDashboard />} />
          <Route path="/dispatch" element={<FieldDispatchView />} />
          <Route path="/vigilance" element={<ReviewerVigilanceConsole />} />
          <Route path="/reviewer" element={<ReviewerVigilanceConsole />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Institutional Editorial Footer */}
      <footer className="bg-white border-t border-[#E2DACF] py-4 px-6 text-xs text-[#544344]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-['Chivo'] font-black text-sm text-[#4A1525]">
              CivicFix Sentinel
            </span>
            <span>• Pune Municipal Corporation Operational Intelligence Platform</span>
          </div>

          <div className="flex items-center gap-4 text-[11px] font-mono">
            <span>Secure Node: PMC-GRID-NODE-02</span>
            <span>Telemetry Latency: 18ms</span>
            <span className="text-[#2D6A4F] font-bold">ALL SENSORS ONLINE</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export function SentinelApp() {
  return (
    <BrowserRouter>
      <SentinelProvider>
        <SentinelMain />
      </SentinelProvider>
    </BrowserRouter>
  );
}

export default SentinelApp;
