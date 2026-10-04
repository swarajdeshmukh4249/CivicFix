import { useSentinel } from '../SentinelContext';

export function SentinelNav() {
  const {
    activeTab,
    setActiveTab,
    activeWard,
    setActiveWard,
    metrics,
    issues
  } = useSentinel();

  const recurrenceCount = issues.filter((i) => i.isPostCompletionRecurrence).length;
  const visibilityGapCount = issues.filter((i) => i.isVisibilityGap).length;

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-[#E2DACF] shadow-sm select-none">
      {/* Top Brand & Telemetry Bar */}
      <div className="h-14 px-6 flex items-center justify-between gap-4 bg-white border-b border-[#E2DACF]/70">
        <div className="flex items-center gap-4">
          {/* BetterWork Geometric Diamond Logo + Identity */}
          <div className="flex items-center gap-3">
            <div className="relative w-7 h-7 flex items-center justify-center shrink-0">
              <div className="absolute w-3.5 h-3.5 bg-[#C74724] rotate-45 -translate-x-1.5 -translate-y-1.5"></div>
              <div className="absolute w-3.5 h-3.5 bg-[#F2A900] rotate-45 translate-x-1.5 -translate-y-1.5"></div>
              <div className="absolute w-3.5 h-3.5 bg-[#4A1525] rotate-45 -translate-x-1.5 translate-y-1.5"></div>
              <div className="absolute w-3.5 h-3.5 bg-[#EAAA0F] rotate-45 translate-x-1.5 translate-y-1.5"></div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-['Chivo'] font-black text-[20px] tracking-tight text-[#1B1B1B]">
                CivicFix <span className="text-[#C74724]">Sentinel</span>
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#4A1525] bg-[#F5F1EB] px-2 py-0.5 border border-[#E2DACF]">
                PMC Operations & Vigilance
              </span>
            </div>
          </div>

          <div className="h-4 w-[1px] bg-[#C5B8A8]/60 hidden md:block"></div>

          {/* Live Sync Status */}
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-0.5 bg-[#FAF8F5] border border-[#E2DACF]">
            <span className="w-2 h-2 bg-[#2D6A4F] animate-pulse"></span>
            <span className="text-[11px] font-bold tracking-wider text-[#2D6A4F] uppercase font-['Chivo']">
              Live Grid Sync • 18ms
            </span>
          </div>

          {/* Core USP Banner */}
          <div className="hidden xl:flex items-center gap-2 px-3 py-1 bg-[#F5F1EB] border-l-2 border-[#C74724] text-[11px]">
            <span className="font-['Chivo'] font-bold text-[#4A1525] uppercase tracking-wide">Core USP:</span>
            <span className="text-[#333333] italic">
              "Connecting citizen grievances to the public works already funded to prevent them."
            </span>
          </div>
        </div>

        {/* Right Operations Controls */}
        <div className="flex items-center gap-3">
          {/* Ward Switcher */}
          <div className="flex items-center gap-1.5">
            <label htmlFor="ward-select" className="text-[11px] font-bold text-[#544344] uppercase font-['Chivo'] hidden sm:inline">
              Active Ward:
            </label>
            <select
              id="ward-select"
              value={activeWard}
              onChange={(e) => setActiveWard(e.target.value)}
              className="bg-[#FAF8F5] text-[#1B1B1B] text-xs font-semibold px-2.5 py-1.5 border border-[#C5B8A8] focus:outline-none focus:border-[#C74724] cursor-pointer"
            >
              <option value="14">Ward 14 (Kothrud - Bavdhan)</option>
              <option value="21">Ward 21 (Shivajinagar - FC Rd)</option>
              <option value="8">Ward 08 (Aundh - Baner)</option>
              <option value="all">All PMC Prabhags (1-41)</option>
            </select>
          </div>

          {/* Recurrence Defect Pill */}
          {recurrenceCount > 0 && (
            <div
              className="flex items-center gap-1.5 px-2.5 py-1 bg-[#BA1A1A] text-white font-['Chivo'] text-xs font-bold uppercase tracking-wider cursor-pointer hover:bg-[#881f00] transition-colors"
              title="Post-Completion Recurrences Detected within Defect Liability Period"
              onClick={() => setActiveTab('reviewer-console')}
            >
              <span className="material-symbols-outlined text-[15px]">warning</span>
              <span>{recurrenceCount} Post-Work Defects</span>
            </div>
          )}

          {/* Proactive Visibility Gap Pill */}
          {visibilityGapCount > 0 && (
            <div
              className="hidden lg:flex items-center gap-1.5 px-2 py-1 bg-[#EAAA0F] text-[#1B1B1B] font-['Chivo'] text-xs font-bold uppercase tracking-wider cursor-pointer hover:bg-[#F2A900] transition-colors"
              title="Low complaint volume vs high infrastructure decay detected"
              onClick={() => setActiveTab('ward-dashboard')}
            >
              <span className="material-symbols-outlined text-[15px]">radar</span>
              <span>{visibilityGapCount} Visibility Gap</span>
            </div>
          )}

          {/* Officer Persona Profile */}
          <div className="flex items-center gap-2 pl-2 border-l border-[#E2DACF]">
            <div className="w-8 h-8 bg-[#4A1525] flex items-center justify-center text-white font-bold text-xs">
              <span className="material-symbols-outlined text-[18px]">badge</span>
            </div>
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-[11px] font-bold text-[#1B1B1B] leading-none font-['Chivo']">A. Kulkarni</span>
              <span className="text-[10px] text-[#544344]">Assistant Commissioner</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Spacious Pillars Navigation Bar */}
      <nav className="h-12 px-6 bg-[#FAF8F5] flex items-center justify-between border-b border-[#E2DACF] overflow-x-auto">
        <div className="flex items-center gap-2">
          {/* Pillar 1: Ward Officer Dashboard */}
          <button
            type="button"
            onClick={() => setActiveTab('ward-dashboard')}
            className={`px-4 py-2 font-['Chivo'] text-xs uppercase tracking-wider font-bold transition-all flex items-center gap-2 ${
              activeTab === 'ward-dashboard'
                ? 'bg-[#4A1525] text-white shadow-xs'
                : 'text-[#4E423E] hover:text-[#4A1525] hover:bg-[#ECE6DE]'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">map</span>
            <span>1. Ward Officer Dashboard</span>
            <span className={`px-1.5 py-0.2 text-[10px] font-bold ${
              activeTab === 'ward-dashboard' ? 'bg-[#C74724] text-white' : 'bg-[#E8E2D8] text-[#1B1B1B]'
            }`}>
              {metrics.clusteredIssuesCount} Issues
            </span>
          </button>

          {/* Pillar 2: Field Dispatch & Verification */}
          <button
            type="button"
            onClick={() => setActiveTab('field-dispatch')}
            className={`px-4 py-2 font-['Chivo'] text-xs uppercase tracking-wider font-bold transition-all flex items-center gap-2 ${
              activeTab === 'field-dispatch'
                ? 'bg-[#4A1525] text-white shadow-xs'
                : 'text-[#4E423E] hover:text-[#4A1525] hover:bg-[#ECE6DE]'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">local_shipping</span>
            <span>2. Field Dispatch & Verification</span>
            <span className="px-1.5 py-0.2 text-[10px] font-bold bg-[#EAAA0F] text-[#1B1B1B]">
              3 Squads
            </span>
          </button>

          {/* Pillar 3: Reviewer / Vigilance Console */}
          <button
            type="button"
            onClick={() => setActiveTab('reviewer-console')}
            className={`px-4 py-2 font-['Chivo'] text-xs uppercase tracking-wider font-bold transition-all flex items-center gap-2 ${
              activeTab === 'reviewer-console'
                ? 'bg-[#4A1525] text-white shadow-xs'
                : 'text-[#4E423E] hover:text-[#4A1525] hover:bg-[#ECE6DE]'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">policy</span>
            <span>3. Reviewer / Vigilance Console</span>
            {recurrenceCount > 0 && (
              <span className="px-1.5 py-0.2 text-[10px] font-bold bg-[#BA3D1D] text-white animate-pulse">
                {recurrenceCount} Post-Work Alerts
              </span>
            )}
          </button>
        </div>

        {/* Global Keybind & GPS readout */}
        <div className="hidden lg:flex items-center gap-4 text-xs font-mono text-[#544344]">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[14px] text-[#C74724]">my_location</span>
            <span>PMC Ward 14 Grid: 18.5089° N, 73.8052° E</span>
          </div>
          <div className="bg-white px-2 py-0.5 border border-[#C5B8A8] text-[11px] font-sans font-semibold">
            Press <kbd className="font-mono font-bold bg-[#ECE6DE] px-1">1</kbd>, <kbd className="font-mono font-bold bg-[#ECE6DE] px-1">2</kbd>, <kbd className="font-mono font-bold bg-[#ECE6DE] px-1">3</kbd> to switch views
          </div>
        </div>
      </nav>
    </header>
  );
}
