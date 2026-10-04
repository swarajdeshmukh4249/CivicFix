import { useState } from 'react';
import { useSentinel } from '../SentinelContext';

export function FieldDispatchView() {
  const {
    issues,
    squads,
    selectedIssueId,
    setSelectedIssueId,
    confirmDispatch,
    toggleMaterialCheck,
    setActiveTab
  } = useSentinel();

  const selectedIssue = issues.find((i) => i.id === selectedIssueId) ?? issues[0];
  const [selectedSquadId, setSelectedSquadId] = useState<string>(squads[0].id);
  const [officerNote] = useState<string>(
    'Field squad deployed with hydraulic pipe clamp and surface cutter. Sub-base verified.'
  );
  const [stepIndex, setStepIndex] = useState<number>(2); // Step 2: Verification

  const handleConfirmDispatch = () => {
    confirmDispatch(selectedIssue.id, selectedSquadId);
  };

  void officerNote;

  const handleAdvanceToAudit = () => {
    setActiveTab('reviewer-console');
  };

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto px-6 py-6 pb-16">
      {/* Top Context & Progress Header */}
      <section className="bg-white border border-[#E2DACF] p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 bg-[#4A1525]"></span>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#4A1525] font-['Chivo']">
              Pillar 2 • Municipal Field Operations & Governance
            </span>
            <span className="bg-[#FAF8F5] text-[#544344] text-[10px] font-bold px-2 py-0.5 border border-[#E2DACF] font-['Chivo'] uppercase">
              Confirm-Before-Dispatch Protocol
            </span>
          </div>
          <h1 className="text-2xl font-black font-['Chivo'] text-[#1B1B1B] tracking-tight">
            Field Dispatch & Verification Hub
          </h1>
          <p className="text-xs text-[#544344] mt-0.5">
            Strict human-in-the-loop governance gating municipal squad truck rollout, GPS telemetry lock,
            and materials verification before dispatching field crews.
          </p>
        </div>

        {/* Stepper Progress Indicator (Warm Editorial Style) */}
        <div className="bg-[#FAF8F5] border border-[#E2DACF] p-3 flex flex-col gap-1 min-w-[280px]">
          <div className="flex items-center justify-between text-[11px] font-bold font-['Chivo'] uppercase">
            <span className="text-[#4A1525]">Step {stepIndex} of 3</span>
            <span className="text-[#C74724]">
              {stepIndex === 1 ? '1. Telemetry Check' : stepIndex === 2 ? '2. Photo & Materials' : '3. Supervisor Sign-off'}
            </span>
          </div>
          <div className="w-full flex items-center gap-1 mt-1">
            <div
              onClick={() => setStepIndex(1)}
              className={`h-1.5 flex-1 cursor-pointer transition-all ${
                stepIndex >= 1 ? 'bg-[#EAAA0F]' : 'bg-[#E2DACF]'
              }`}
            />
            <div
              onClick={() => setStepIndex(2)}
              className={`h-1.5 flex-1 cursor-pointer transition-all ${
                stepIndex >= 2 ? 'bg-[#C74724]' : 'bg-[#E2DACF]'
              }`}
            />
            <div
              onClick={() => setStepIndex(3)}
              className={`h-1.5 flex-1 cursor-pointer transition-all ${
                stepIndex >= 3 ? 'bg-[#2D6A4F]' : 'bg-[#E2DACF]'
              }`}
            />
          </div>
        </div>
      </section>

      {/* Main 2-Column Work Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Incident Dispatch Selector & Squad Fleet */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {/* Dispatch Queue Card */}
          <div className="bg-white border border-[#E2DACF] p-4 shadow-xs flex flex-col gap-3">
            <div className="flex items-center justify-between border-b border-[#E2DACF] pb-2">
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#4A1525] font-['Chivo'] flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px]">priority_high</span>
                <span>Active Triage Queue for Dispatch</span>
              </h2>
              <span className="text-[11px] text-[#544344] font-mono">{issues.length} Issues</span>
            </div>

            <div className="space-y-2 max-h-[320px] overflow-y-auto sentinel-scroll pr-1">
              {issues.map((issue) => {
                const isSelected = issue.id === selectedIssueId;
                const isDispatched = issue.dispatchApproval?.confirmed ?? false;

                return (
                  <div
                    key={issue.id}
                    onClick={() => setSelectedIssueId(issue.id)}
                    className={`p-3 border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-[#4A1525] bg-[#FFFBF7]'
                        : 'border-[#E2DACF] bg-[#FAF8F5] hover:border-[#C5B8A8]'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs mb-1">
                      <div className="flex items-center gap-1.5">
                        <span className="font-['Chivo'] font-bold text-[#4A1525]">{issue.id}</span>
                        <span className={`px-1.5 py-0.2 text-[10px] font-bold uppercase font-['Chivo'] ${
                          issue.priority.tier === 'P1 Critical' ? 'bg-[#BA1A1A] text-white' : 'bg-[#EAAA0F] text-[#1B1B1B]'
                        }`}>
                          {issue.priority.tier}
                        </span>
                      </div>
                      <span className={`px-2 py-0.5 text-[10px] font-bold uppercase font-['Chivo'] ${
                        isDispatched ? 'bg-[#D1E7DD] text-[#0F5132]' : 'bg-[#FFDAD6] text-[#93000A]'
                      }`}>
                        {isDispatched ? 'Dispatched' : 'Pending Gate'}
                      </span>
                    </div>

                    <div className="font-['Chivo'] font-bold text-xs text-[#1B1B1B] truncate">
                      {issue.title}
                    </div>
                    <div className="text-[11px] text-[#544344] truncate mt-0.5">
                      📍 {issue.landmark} • {issue.clusteredReportsCount} reports
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Confirm-Before-Dispatch Governance Gate */}
          <div className="bg-white border-2 border-[#C74724] p-5 shadow-xs flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <span className="font-['Chivo'] font-black text-sm uppercase text-[#4A1525] tracking-wide flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[#C74724] text-[18px]">verified_user</span>
                <span>Confirm-Before-Dispatch Authorization</span>
              </span>
              <span className="text-[10px] font-bold bg-[#FAF8F5] px-2 py-0.5 border border-[#E2DACF] uppercase font-['Chivo']">
                Gate Lock
              </span>
            </div>

            <div className="text-xs text-[#544344] leading-relaxed bg-[#FAF8F5] p-3 border border-[#E2DACF]">
              To prevent wasteful fuel burns and duplicate truck dispatches, human officer must confirm that
              evidence cluster <strong>#{selectedIssue.id}</strong> has valid spatial telemetry before authorising squad departure.
            </div>

            {/* Squad Fleet Selection */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="squad-select" className="text-[11px] font-bold text-[#544344] uppercase font-['Chivo']">
                Select Municipal Squad Unit:
              </label>
              <select
                id="squad-select"
                value={selectedSquadId}
                onChange={(e) => setSelectedSquadId(e.target.value)}
                className="bg-[#FAF8F5] border border-[#C5B8A8] text-xs font-semibold p-2 focus:outline-none focus:border-[#4A1525] cursor-pointer"
              >
                {squads.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} • ETA {s.etaMinutes}m ({s.status})
                  </option>
                ))}
              </select>
            </div>

            {/* Selected Squad Specs */}
            {(() => {
              const activeSquad = squads.find((s) => s.id === selectedSquadId);
              if (!activeSquad) return null;
              return (
                <div className="bg-[#F5F1EB] p-3 text-xs flex flex-col gap-1.5">
                  <div className="flex justify-between">
                    <span className="text-[#544344]">Lead Officer:</span>
                    <span className="font-bold text-[#1B1B1B]">{activeSquad.leadOfficer}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#544344]">Vehicle Plate:</span>
                    <span className="font-mono text-[#1B1B1B]">{activeSquad.vehiclePlate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#544344]">Equipment Loadout:</span>
                    <span className="font-semibold text-[#4A1525]">{activeSquad.specialtyEquipment.join(', ')}</span>
                  </div>
                </div>
              );
            })()}

            {/* Officer Dispatch Dispatch Action */}
            {selectedIssue.dispatchApproval.confirmed ? (
              <div className="bg-[#D1E7DD] border border-[#A3CFBB] text-[#0F5132] p-3 text-xs font-bold font-['Chivo'] flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[18px]">local_shipping</span>
                  <span>DISPATCH CONFIRMED at {selectedIssue.dispatchApproval.dispatchTime}</span>
                </div>
                <span className="text-[10px] uppercase font-mono">{selectedIssue.dispatchApproval.authorizedBy}</span>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleConfirmDispatch}
                className="w-full py-3 bg-[#4A1525] hover:bg-[#C74724] text-white font-['Chivo'] text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-xs transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">verified</span>
                <span>Confirm Telemetry & Dispatch Squad Now</span>
              </button>
            )}
          </div>
        </div>

        {/* Right Column: Authentic Step-by-Step Field Verification Studio View */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {/* Active Incident Case Brief */}
          <div className="bg-white border border-[#E2DACF] p-4 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#544344] font-['Chivo']">
                Active Verification Case #{selectedIssue.id}
              </span>
              <h2 className="text-base font-bold font-['Chivo'] text-[#1B1B1B]">
                {selectedIssue.title}
              </h2>
              <span className="text-xs text-[#544344]">📍 {selectedIssue.landmark}</span>
            </div>

            <div className="text-right">
              <span className="text-[10px] font-bold uppercase text-[#544344] font-['Chivo'] block">SLA Clock</span>
              <span className="font-['Chivo'] font-bold text-sm text-[#C74724] flex items-center gap-1 justify-end">
                <span className="material-symbols-outlined text-[14px]">timelapse</span>
                <span>{selectedIssue.priority.slaHours}h Remaining</span>
              </span>
            </div>
          </div>

          {/* Evidence Comparison: Citizen (Before) vs Field Camera Viewport (After) */}
          <div className="bg-white border border-[#E2DACF] p-5 shadow-xs flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-[#E2DACF] pb-2">
              <span className="font-['Chivo'] font-bold text-xs uppercase text-[#4A1525] tracking-wider flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px]">compare</span>
                <span>Field Evidence Comparison & Capture Viewport</span>
              </span>
              <span className="text-[11px] font-mono text-[#544344]">Dual-Stream Sync</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Before: Citizen Evidence Photo */}
              <div className="bg-[#FAF8F5] border border-[#E2DACF] p-3 flex flex-col gap-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-['Chivo'] font-bold text-[10px] bg-[#4A1525] text-white px-2 py-0.5 uppercase">
                    1. Citizen Evidence (Before)
                  </span>
                  <span className="text-[11px] text-[#544344]">{selectedIssue.reports[0]?.timestamp ?? '07:18 AM'}</span>
                </div>

                <div className="relative w-full h-48 bg-black overflow-hidden flex items-center justify-center">
                  <img
                    src={selectedIssue.resolutionAudit.beforePhotoUrl}
                    alt="Citizen incident report evidence"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-2 left-2 bg-black/80 text-white text-[10px] font-mono px-2 py-1">
                    REPORTED #CR-{selectedIssue.id}
                  </div>
                </div>

                <p className="text-[11px] text-[#544344] italic">
                  "{selectedIssue.reports[0]?.description ?? 'Citizen logged severe infrastructure failure.'}"
                </p>
              </div>

              {/* After: Officer Live Camera Viewfinder (From Stitch PWA) */}
              <div className="bg-[#FAF8F5] border border-[#C74724] p-3 flex flex-col gap-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-['Chivo'] font-bold text-[10px] bg-[#C74724] text-white px-2 py-0.5 uppercase">
                    2. Resolution Viewport (After)
                  </span>
                  <div className="flex items-center gap-1 bg-white px-1.5 py-0.5 border border-[#E2DACF]">
                    <span className="w-2 h-2 bg-[#2D6A4F] animate-pulse"></span>
                    <span className="text-[10px] font-bold text-[#2D6A4F] font-['Chivo'] uppercase">
                      GPS Lock Active
                    </span>
                  </div>
                </div>

                {/* Viewfinder simulation with HUD reticle */}
                <div className="relative w-full h-48 bg-[#1B1B1B] overflow-hidden flex flex-col justify-between p-2">
                  <img
                    src={selectedIssue.resolutionAudit.afterPhotoUrl}
                    alt="Field resolution viewfinder stream"
                    className="absolute inset-0 w-full h-full object-cover opacity-90"
                  />

                  {/* Top HUD */}
                  <div className="relative z-10 flex items-center justify-between text-[10px] text-white font-mono bg-black/75 px-2 py-0.5">
                    <span>18.5089° N, 73.8052° E</span>
                    <span className="text-[#2D6A4F] font-bold">Accuracy: ±1.8m</span>
                  </div>

                  {/* Center Target Reticle */}
                  <div className="relative z-10 pointer-events-none self-center my-auto flex items-center justify-center">
                    <div className="w-14 h-14 relative reticle-anim">
                      <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-[#F2A900]"></div>
                      <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-[#F2A900]"></div>
                      <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-[#F2A900]"></div>
                      <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-[#F2A900]"></div>
                      <div className="absolute inset-0 flex items-center justify-center text-[#F2A900] text-[10px] font-mono">
                        +
                      </div>
                    </div>
                  </div>

                  {/* Bottom HUD */}
                  <div className="relative z-10 flex items-center justify-between text-[10px] text-white font-mono bg-black/75 px-2 py-0.5">
                    <span>Optical Parallax: LOCKED</span>
                    <span className="text-[#F2A900]">Confidence: 99.4%</span>
                  </div>
                </div>

                <div className="text-[11px] text-[#2D6A4F] font-semibold flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">verified</span>
                  <span>Dual GeoTag match verified against citizen origin coordinate.</span>
                </div>
              </div>
            </div>

            {/* Materials & Components Verification Checklist */}
            <div className="bg-[#FAF8F5] border border-[#E2DACF] p-4 flex flex-col gap-2 mt-2">
              <span className="font-['Chivo'] font-bold text-xs uppercase text-[#4A1525] tracking-wider">
                Materials & Replacement Checklist Verification
              </span>
              <p className="text-xs text-[#544344]">
                Confirm that standard municipal specification materials have been physically installed on site:
              </p>

              <div className="space-y-1.5 mt-1">
                {selectedIssue.materialsChecklist.map((mat, idx) => (
                  <label
                    key={mat.item}
                    className="flex items-center justify-between p-2 bg-white border border-[#E2DACF] cursor-pointer hover:bg-[#F5F1EB] transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={mat.checked}
                        onChange={() => toggleMaterialCheck(selectedIssue.id, idx)}
                        className="w-4 h-4 accent-[#4A1525] cursor-pointer"
                      />
                      <span className="text-xs font-semibold text-[#1B1B1B]">{mat.item}</span>
                    </div>
                    <span className="text-[11px] font-mono font-bold text-[#4A1525] bg-[#F5F1EB] px-2 py-0.5">
                      {mat.requiredQty}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Submit to Reviewer / Vigilance Console */}
            <div className="flex items-center justify-between pt-3 border-t border-[#E2DACF]">
              <span className="text-xs text-[#544344]">
                Once verified, send this case directly to the Reviewer / Vigilance Console for audit.
              </span>
              <button
                type="button"
                onClick={handleAdvanceToAudit}
                className="px-5 py-2.5 bg-[#4A1525] hover:bg-[#C74724] text-white font-['Chivo'] text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-sm transition-colors"
              >
                <span>Advance to Reviewer Console</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

