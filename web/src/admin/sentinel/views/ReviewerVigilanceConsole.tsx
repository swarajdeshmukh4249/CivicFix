import { useState } from 'react';
import { useSentinel } from '../SentinelContext';
import { EvidenceChainModal } from '../components/EvidenceChainModal';


export function ReviewerVigilanceConsole() {
  const {
    issues,
    selectedIssueId,
    setSelectedIssueId,
    signOffResolution,
    flagContractorDefectNotice
  } = useSentinel();

  const selectedIssue = issues.find((i) => i.id === selectedIssueId) ?? issues[0];
  const selectedIndex = issues.findIndex((i) => i.id === selectedIssueId);
  const [sliderPos, setSliderPos] = useState<number>(50);
  const [showEvidenceModal, setShowEvidenceModal] = useState<boolean>(false);
  const [signOffComments, setSignOffComments] = useState<string>(
    'Dual geotag coordinates match origin point within 1.8m. Physical repair certified by municipal engineering norms.'
  );
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const [auditChecks, setAuditChecks] = useState({
    photo: true,
    gps: true,
    citizen: true,
    materials: true,
  });

  const goToPrev = () => { if (selectedIndex > 0) setSelectedIssueId(issues[selectedIndex - 1].id); };
  const goToNext = () => { if (selectedIndex < issues.length - 1) setSelectedIssueId(issues[selectedIndex + 1].id); };
  const allChecked = Object.values(auditChecks).every(Boolean);
  const checkedCount = Object.values(auditChecks).filter(Boolean).length;

  const work = selectedIssue.linkedWork;
  const audit = selectedIssue.resolutionAudit;

  const handleApprove = () => {
    signOffResolution(selectedIssue.id, 'Approved', signOffComments, false);
    setActionNotice('Resolution legally approved and sealed into municipal register.');
    setTimeout(() => setActionNotice(null), 3500);
  };

  const handleFlagDefect = () => {
    signOffResolution(
      selectedIssue.id,
      'Flagged Defect',
      'Contractor defect notice triggered under Clause 14.2. Security deposit frozen.',
      true
    );
    flagContractorDefectNotice(
      selectedIssue.id,
      `Workmanship defect reported on ${work?.projectName ?? 'tender contract'}`
    );
    setActionNotice('Contractor Defect Notice served. 10% retention deposit escrow frozen.');
    setTimeout(() => setActionNotice(null), 3500);
  };

  const handleReject = () => {
    signOffResolution(selectedIssue.id, 'Rejected', 'Resolution failed quality inspection. Crew re-dispatch required.');
    setActionNotice('Resolution rejected. Incident returned to active triage queue.');
    setTimeout(() => setActionNotice(null), 3500);
  };

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto px-6 py-6 pb-16">
      {/* Top Banner: Vigilance & Quality Audit Overview */}
      <section className="bg-white border border-[#E2DACF] p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2.5 h-2.5 bg-[#BA1A1A]"></span>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#4A1525] font-['Chivo']">
              Pillar 3 • Municipal Vigilance & Quality Assurance
            </span>
            <span className="text-[10px] font-bold bg-[#FAF8F5] text-[#544344] px-2 py-0.5 border border-[#E2DACF] uppercase font-['Chivo']">
              Stage 03 Verification
            </span>
          </div>
          <h1 className="text-2xl font-black font-['Chivo'] text-[#1B1B1B] tracking-tight">
            Reviewer & Vigilance Console
          </h1>
          <p className="text-xs text-[#544344] mt-1 max-w-2xl">
            Independent institutional review performing multi-modal photographic before/after audits,
            verifying dual GeoTag locks, and connecting complaint clusters directly to public works tenders and contractor liability.
          </p>
        </div>

        {/* Action Notice Toast */}
        {actionNotice && (
          <div className="bg-[#D1E7DD] border border-[#A3CFBB] text-[#0F5132] p-3 text-xs font-bold font-['Chivo'] flex items-center gap-2 shadow-sm animate-pulse">
            <span className="material-symbols-outlined text-[18px]">verified</span>
            <span>{actionNotice}</span>
          </div>
        )}
      </section>

      {/* Case Selector Ribbon + Ticket Navigation */}
      <div className="bg-white border border-[#E2DACF] p-3 flex items-center justify-between gap-3 overflow-x-auto sentinel-scroll shadow-xs">
        <div className="flex items-center gap-3 overflow-x-auto sentinel-scroll">
          <span className="text-xs font-bold font-['Chivo'] text-[#544344] uppercase whitespace-nowrap pl-1 shrink-0">
            Select Audit Case:
          </span>
          {issues.map((iss) => {
            const isSelected = iss.id === selectedIssueId;
            const hasRecurrence = iss.isPostCompletionRecurrence;
            return (
              <button
                key={iss.id}
                type="button"
                onClick={() => setSelectedIssueId(iss.id)}
                className={`px-3 py-1.5 border text-xs font-['Chivo'] font-bold uppercase whitespace-nowrap flex items-center gap-1.5 transition-all ${
                  isSelected
                    ? 'bg-[#4A1525] text-white border-[#4A1525] shadow-xs'
                    : 'bg-[#FAF8F5] text-[#333333] border-[#E2DACF] hover:border-[#C5B8A8]'
                }`}
              >
                <span>{iss.id}</span>
                {hasRecurrence && (
                  <span className="w-2 h-2 rounded-full bg-[#BA1A1A] animate-ping" title="Post-Work Recurrence" />
                )}
                <span className="text-[10px] opacity-80">({iss.categoryLabel.split('/')[0].trim()})</span>
              </button>
            );
          })}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button type="button" onClick={goToPrev} disabled={selectedIndex === 0}
            className="px-3 py-1.5 bg-[#F5F1EB] border border-[#C5B8A8] text-[#1B1B1B] text-xs font-['Chivo'] font-bold uppercase flex items-center gap-1 hover:bg-[#ECE6DE] disabled:opacity-40 disabled:cursor-not-allowed">
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            <span className="hidden sm:inline">Prev</span>
          </button>
          <span className="text-xs text-[#544344] font-mono whitespace-nowrap">{selectedIndex + 1} / {issues.length}</span>
          <button type="button" onClick={goToNext} disabled={selectedIndex === issues.length - 1}
            className="px-3 py-1.5 bg-[#F5F1EB] border border-[#C5B8A8] text-[#1B1B1B] text-xs font-['Chivo'] font-bold uppercase flex items-center gap-1 hover:bg-[#ECE6DE] disabled:opacity-40 disabled:cursor-not-allowed">
            <span className="hidden sm:inline">Next</span>
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </button>
        </div>
      </div>

      {/* Active Case Audit Header Context */}
      <div className="bg-white border border-[#E2DACF] p-6 shadow-xs flex flex-col xl:flex-row xl:items-center justify-between gap-6">
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="bg-[#4A1525] text-white font-['Chivo'] text-xs uppercase px-2.5 py-1 tracking-wider font-bold">
              CASE #{selectedIssue.pmcTicketNumber}
            </span>
            <span className={`font-['Chivo'] text-xs uppercase px-2.5 py-1 tracking-wider font-bold ${
              audit.status === 'Approved'
                ? 'bg-[#D1E7DD] text-[#0F5132]'
                : audit.status === 'Flagged Defect'
                ? 'bg-[#FFDAD6] text-[#93000A]'
                : 'bg-[#EAAA0F] text-[#1B1B1B]'
            }`}>
              {audit.status === 'Pending' ? 'Pending Admin Audit & Sign-off' : audit.status}
            </span>
            <span className="text-[#544344] text-xs flex items-center gap-1 bg-[#FAF8F5] border border-[#E2DACF] px-2.5 py-0.5">
              <span className="material-symbols-outlined text-[15px] text-[#C74724]">location_on</span>
              <span>{selectedIssue.wardName} • {selectedIssue.landmark}</span>
            </span>
          </div>

          <h2 className="text-xl font-black font-['Chivo'] text-[#1B1B1B]">
            {selectedIssue.title}
          </h2>
        </div>

        {/* Quick Metrics Strip */}
        <div className="flex flex-wrap items-center gap-4 bg-[#FAF8F5] border border-[#E2DACF] p-3 px-5 shadow-xs">
          <div className="flex flex-col pr-4 border-r border-[#E2DACF]">
            <span className="text-[10px] font-bold text-[#544344] uppercase font-['Chivo']">Deployment Crew</span>
            <span className="font-['Chivo'] font-bold text-sm text-[#4A1525]">
              {selectedIssue.assignedSquad?.name.split('(')[0] ?? 'Squad Alpha-4'}
            </span>
            <span className="text-[10px] text-[#544344]">
              Lead: {selectedIssue.assignedSquad?.leadOfficer ?? 'S. Shinde'}
            </span>
          </div>

          <div className="flex flex-col pr-4 border-r border-[#E2DACF]">
            <span className="text-[10px] font-bold text-[#544344] uppercase font-['Chivo']">Turnaround SLA</span>
            <div className="flex items-baseline gap-1">
              <span className="font-['Chivo'] font-bold text-sm text-[#1B1B1B]">
                {selectedIssue.priority.slaHours}h Target
              </span>
              <span className="text-[#2D6A4F] text-[10px] font-bold uppercase font-['Chivo']">Met</span>
            </div>
            <span className="text-[10px] text-[#544344]">Logged Today 07:18</span>
          </div>

          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-[#544344] uppercase font-['Chivo']">Dual GeoTag Lock</span>
            <span className="font-['Chivo'] font-black text-sm text-[#2D6A4F]">
              {audit.dualGpsConfidence}% Confidence
            </span>
            <span className="text-[10px] text-[#544344]">Sub-meter parallax</span>
          </div>
        </div>
      </div>

      {/* THE KILLER FEATURE: Work -> Outcome Check Section */}
      {work && (
        <section className={`p-6 border-2 shadow-xs transition-all ${
          selectedIssue.isPostCompletionRecurrence
            ? 'bg-[#FFF8F7] border-[#BA1A1A]'
            : 'bg-white border-[#E2DACF]'
        }`}>
          <div className="flex items-center justify-between border-b border-[#E2DACF] pb-3 mb-4">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#BA1A1A] text-[22px]">account_tree</span>
              <h3 className="text-base font-black font-['Chivo'] text-[#1B1B1B] uppercase tracking-wide">
                Work → Outcome Verification (The Killer Feature)
              </h3>
            </div>
            <button
              type="button"
              onClick={() => setShowEvidenceModal(true)}
              className="px-3 py-1 bg-[#4A1525] text-white text-xs font-bold font-['Chivo'] uppercase hover:bg-[#C74724] flex items-center gap-1"
            >
              <span>Expand Evidence Chain</span>
              <span className="material-symbols-outlined text-[14px]">open_in_new</span>
            </button>
          </div>

          {/* Post-Completion Recurrence Callout */}
          {selectedIssue.isPostCompletionRecurrence && (
            <div className="bg-[#FFDAD6] border-l-4 border-[#BA1A1A] p-4 text-[#93000A] flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined text-[24px] text-[#BA1A1A] shrink-0 mt-0.5">
                  warning
                </span>
                <div>
                  <div className="font-['Chivo'] font-black text-sm uppercase">
                    ⚠️ Post-Completion Recurrence — Verification Recommended
                  </div>
                  <p className="text-xs text-[#544344] mt-0.5">
                    Grievance recurred <strong className="text-[#BA1A1A]">{selectedIssue.recurrenceLatencyDays} days</strong> after
                    the linked project completion date. This failure is legally within contractor's Defect Liability Period (DLP).
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handleFlagDefect}
                  className="px-4 py-2 bg-[#BA1A1A] hover:bg-[#93000A] text-white font-['Chivo'] text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-sm"
                >
                  <span className="material-symbols-outlined text-[16px]">gavel</span>
                  <span>Flag Contractor Defect Notice</span>
                </button>
              </div>
            </div>
          )}

          {/* Connected Tender & Contractor Evidence Matrix */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white border border-[#E2DACF] p-4 text-xs">
            <div>
              <span className="text-[#544344] font-bold uppercase font-['Chivo'] block text-[10px]">
                Public Works Scheme
              </span>
              <span className="font-['Chivo'] font-bold text-[#4A1525] text-sm block mt-0.5">
                {work.scheme}
              </span>
              <span className="text-[11px] text-[#544344] truncate block mt-0.5">{work.projectName}</span>
            </div>

            <div>
              <span className="text-[#544344] font-bold uppercase font-['Chivo'] block text-[10px]">
                Tender Number & Budget
              </span>
              <span className="font-mono font-bold text-[#1B1B1B] text-sm block mt-0.5">
                {work.tenderNumber}
              </span>
              <span className="text-[11px] text-[#2D6A4F] font-bold block mt-0.5">{work.sanctionedBudget} Sanctioned</span>
            </div>

            <div>
              <span className="text-[#544344] font-bold uppercase font-['Chivo'] block text-[10px]">
                Contractor Agency
              </span>
              <span className="font-bold text-[#1B1B1B] text-sm block mt-0.5">
                {work.contractorName}
              </span>
              <span className="text-[11px] text-[#544344] block mt-0.5">{work.contractorContact}</span>
            </div>

            <div>
              <span className="text-[#544344] font-bold uppercase font-['Chivo'] block text-[10px]">
                Warranty & Defect Liability (DLP)
              </span>
              <span className="font-bold text-[#BA1A1A] text-sm block mt-0.5">
                Active to {work.warrantyEndDate}
              </span>
              <span className="text-[11px] text-[#544344] block mt-0.5">Completed: {work.completedDate}</span>
            </div>
          </div>
        </section>
      )}

      {/* MAIN 12-COL AUDIT LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

        {/* LEFT 8 cols: Photo Evidence + Citizen Feedback + Slider + Spatial Map */}
        <div className="lg:col-span-8 flex flex-col gap-6">

          <div className="flex items-center gap-2">
            <span className="w-3 h-3 bg-[#C74724] rotate-45"></span>
            <h2 className="text-base font-black font-['Chivo'] text-[#4A1525] uppercase tracking-wide">Visual Spatial Verification</h2>
            <span className="text-xs text-[#544344] ml-2">Compare citizen intake against field resolution</span>
          </div>

          {/* Side-by-Side Before/After Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* BEFORE Card */}
            <div className="flex flex-col bg-white border border-[#E2DACF] overflow-hidden shadow-xs">
              <div className="bg-[#4A1525] text-white px-4 py-2.5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-[#C74724]"></span>
                  <span className="font-['Chivo'] text-xs font-bold tracking-wider uppercase">1. Citizen Ground Evidence</span>
                </div>
                <span className="bg-[#BA3D1D] text-white font-['Chivo'] text-[10px] px-2 py-0.5 uppercase tracking-wide font-bold">BEFORE</span>
              </div>
              <div className="relative w-full h-64 bg-[#E8E2D8] overflow-hidden">
                <img src={audit.beforePhotoUrl} alt="Citizen incident evidence" className="w-full h-full object-cover" />
                <div className="absolute bottom-3 left-3 bg-black/85 text-white text-[10px] font-mono px-2.5 py-1 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[#EAAA0F] text-[13px]">schedule</span>
                  {selectedIssue.reports[0]?.timestamp ?? '07:18 AM Today'}
                </div>
                <div className="absolute top-3 right-3 bg-white/95 text-[#C74724] text-[10px] font-['Chivo'] font-bold px-2 py-1 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[13px]">warning</span> Critical Defect
                </div>
              </div>
              <div className="p-4 flex flex-col gap-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#544344]">Source:</span>
                  <span className="font-['Chivo'] font-bold text-[10px] text-[#1B1B1B] uppercase">{selectedIssue.reports[0]?.source ?? 'Citizen Mobile'}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#544344]">Spatial Tag:</span>
                  <span className="text-xs font-bold text-[#4A1525] font-mono">18.5089 N, 73.8052 E</span>
                </div>
                <div className="mt-1 p-3 bg-[#F5F1EB] flex flex-col gap-1.5">
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[#C74724] text-[16px]">psychology</span>
                    <span className="font-['Chivo'] text-[10px] text-[#4A1525] uppercase tracking-wider font-bold">AI Computer Vision Telemetry</span>
                  </div>
                  <p className="text-[11px] text-[#333333] leading-relaxed">
                    {selectedIssue.reports[0]?.description ?? 'Critical infrastructure failure detected. Severity confirmed by AI telemetry.'}
                  </p>
                </div>
              </div>
            </div>

            {/* AFTER Card */}
            <div className="flex flex-col bg-white border border-[#E2DACF] overflow-hidden shadow-xs">
              <div className="bg-[#611E29] text-white px-4 py-2.5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-[#EAAA0F]"></span>
                  <span className="font-['Chivo'] text-xs font-bold tracking-wider uppercase">2. Worker Resolution Proof</span>
                </div>
                <span className="bg-[#EAAA0F] text-[#1B1B1B] font-['Chivo'] text-[10px] px-2 py-0.5 uppercase tracking-wide font-bold">RESOLVED</span>
              </div>
              <div className="relative w-full h-64 bg-[#E8E2D8] overflow-hidden">
                <img src={audit.afterPhotoUrl} alt="Field resolution proof" className="w-full h-full object-cover" />
                <div className="absolute bottom-3 left-3 bg-black/85 text-white text-[10px] font-mono px-2.5 py-1 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[#EAAA0F] text-[13px]">schedule</span>
                  Resolution Verified
                </div>
                <div className="absolute top-3 right-3 bg-[#4A1525] text-white text-[10px] font-['Chivo'] font-bold px-2 py-1 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[#EAAA0F] text-[13px]">verified</span> GPS: +-1.8m
                </div>
              </div>
              <div className="p-4 flex flex-col gap-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#544344]">Field App Upload:</span>
                  <span className="font-['Chivo'] font-bold text-[10px] text-[#1B1B1B] uppercase">{selectedIssue.assignedSquad?.name.split('(')[0] ?? 'Squad Alpha-4'} PWA</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#544344]">Spatial Telemetry:</span>
                  <span className="text-xs font-bold text-[#4A1525] font-mono">18.5090 N, 73.8053 E (Exact)</span>
                </div>
                <div className="mt-1 p-3 bg-[#F5F1EB] flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-['Chivo'] text-[10px] text-[#4A1525] uppercase tracking-wider font-bold">Logistics & Materials</span>
                    <span className="text-[10px] font-['Chivo'] text-[#BA3D1D] uppercase font-bold">Inventory Sync</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {selectedIssue.materialsChecklist.filter((m) => m.checked).map((mat) => (
                      <span key={mat.item} className="bg-white px-2 py-0.5 text-[10px] text-[#1B1B1B] border border-[#E2DACF] font-mono">{mat.requiredQty} {mat.item}</span>
                    ))}
                    {selectedIssue.materialsChecklist.filter((m) => m.checked).length === 0 && (
                      <span className="text-[11px] text-[#544344] italic">Materials checklist pending</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Citizen Feedback & Rating */}
          <div className="bg-white border border-[#E2DACF] p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-yellow-50 border border-yellow-200 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[#EAAA0F] text-[28px]">mark_chat_read</span>
              </div>
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className="font-['Chivo'] font-bold text-sm text-[#1B1B1B] tracking-tight">Citizen Verification Pulse</span>
                  <span className="bg-[#EAAA0F] text-[#1B1B1B] font-['Chivo'] text-[10px] uppercase px-2 py-0.5 tracking-wider font-bold">SMS / WhatsApp Auto</span>
                </div>
                <p className="text-xs text-[#544344] italic">"Repair confirmed, issue resolved. Very fast response from PMC. Thank you!"</p>
                <div className="flex items-center gap-3 text-[11px] text-[#544344] pt-1">
                  <span>Received: 10:48 AM</span><span>+91 98*** **221</span>
                  <span className="font-['Chivo'] text-[#4A1525] uppercase font-bold">Audit Hash: #CF-{selectedIssue.id}-OK</span>
                </div>
              </div>
            </div>
            <div className="bg-[#FAF8F5] px-6 py-4 border border-[#E2DACF] flex flex-col items-center shrink-0">
              <div className="flex items-center text-[#EAAA0F] gap-0.5">
                {[1,2,3,4,5].map((s) => (
                  <span key={s} className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                ))}
              </div>
              <span className="font-['Chivo'] font-black text-base text-[#1B1B1B] mt-1">5.0 / 5.0</span>
              <span className="font-['Chivo'] text-[10px] text-[#C74724] uppercase tracking-wider font-bold">Citizen Accepted</span>
            </div>
          </div>

          {/* Interactive Split Slider */}
          <section className="bg-white border border-[#E2DACF] p-5 shadow-xs flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-[#E2DACF] pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#4A1525] text-[20px]">photo_camera_front</span>
                <h3 className="text-sm font-bold font-['Chivo'] text-[#1B1B1B] uppercase tracking-wide">Forensic Resolution Audit Slider</h3>
              </div>
              <span className="text-xs text-[#544344]">Drag to compare</span>
            </div>

        {/* Interactive Split / Slider Proofing Canvas */}
            <div className="relative w-full h-[400px] bg-black overflow-hidden select-none border border-[#E2DACF]">
              {/* Base "After" Image */}
              <img
                src={audit.afterPhotoUrl}
                alt="Resolution completed proof"
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute top-4 right-4 bg-black/80 text-white px-3 py-1 font-['Chivo'] text-xs font-bold uppercase tracking-wider z-10">
                ✓ Squad Resolution (After)
              </div>

              {/* Clipped "Before" Image */}
              <div className="absolute inset-0 overflow-hidden" style={{ width: `${sliderPos}%` }}>
                <img
                  src={audit.beforePhotoUrl}
                  alt="Citizen complaint origin proof"
                  className="absolute inset-0 w-full h-full object-cover max-w-none"
                  style={{ width: '100%', minWidth: '100%' }}
                />
                <div className="absolute top-4 left-4 bg-[#BA1A1A] text-white px-3 py-1 font-['Chivo'] text-xs font-bold uppercase tracking-wider z-10">
                  Citizen Grievance (Before)
                </div>
              </div>

              {/* Draggable Divider Handle */}
              <div
                className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize z-20 flex items-center justify-center shadow-lg"
                style={{ left: `${sliderPos}%` }}
              >
                <div className="w-8 h-8 bg-white border border-[#4A1525] text-[#4A1525] flex items-center justify-center font-bold text-xs shadow-md">
                  ↔
                </div>
              </div>

              {/* Range input */}
              <input
                type="range"
                min="0"
                max="100"
                value={sliderPos}
                onChange={(e) => setSliderPos(Number(e.target.value))}
                className="absolute inset-0 opacity-0 cursor-ew-resize z-30 w-full h-full"
                aria-label="Before and after split slider"
              />

              {/* GPS Watermark */}
              <div className="absolute bottom-4 left-4 z-20 bg-black/80 text-white px-3 py-1.5 text-xs font-mono flex items-center gap-3">
                <span>18.5089 N, 73.8052 E</span>
                <span className="text-[#2D6A4F] font-bold">Lock: {audit.dualGpsConfidence}%</span>
                <span className="text-[#F2A900]">Parallax: {audit.parallaxCheck}</span>
              </div>
            </div>
          </section>


          {/* Spatial Pinpoint Validation */}
          <div className="bg-white border border-[#E2DACF] p-5 shadow-xs flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#C74724]">share_location</span>
                <h3 className="text-sm font-bold font-['Chivo'] text-[#1B1B1B] uppercase tracking-wide">Spatial Pinpoint Validation</h3>
              </div>
              <span className="font-['Chivo'] text-[11px] font-bold text-[#4A1525] uppercase bg-[#F5F1EB] px-2 py-1 border border-[#E2DACF]">
                Delta: 1.2m (Tolerance &lt; 5m)
              </span>
            </div>
            <div className="w-full h-48 bg-[#F5F1EB] border border-[#E2DACF] relative overflow-hidden">
              <svg className="w-full h-full" viewBox="0 0 600 200" xmlns="http://www.w3.org/2000/svg">
                <defs><pattern id="rvc-grid" width="30" height="30" patternUnits="userSpaceOnUse"><path d="M 30 0 L 0 0 0 30" fill="none" stroke="#E2DACF" strokeWidth="1" /></pattern></defs>
                <rect width="100%" height="100%" fill="#FAF8F5" /><rect width="100%" height="100%" fill="url(#rvc-grid)" />
                <path d="M 0 100 Q 200 80 400 110 T 600 90" stroke="#FFFFFF" strokeWidth="12" />
                <path d="M 0 100 Q 200 80 400 110 T 600 90" stroke="#E2DACF" strokeWidth="6" />
                <path d="M 300 0 L 310 200" stroke="#FFFFFF" strokeWidth="10" />
                <path d="M 300 0 L 310 200" stroke="#E2DACF" strokeWidth="5" />
                <circle cx="285" cy="100" r="18" fill="#BA1A1A" fillOpacity="0.15" stroke="#BA1A1A" strokeWidth="1.5" strokeDasharray="4 2" />
                <rect x="277" y="90" width="16" height="14" fill="#BA1A1A" />
                <text x="285" y="101" fill="white" fontFamily="Chivo" fontSize="8" fontWeight="800" textAnchor="middle">B</text>
                <rect x="262" y="108" width="48" height="12" fill="white" stroke="#C5B8A8" />
                <text x="286" y="118" fill="#1B1B1B" fontFamily="Chivo" fontSize="7" fontWeight="700" textAnchor="middle">CITIZEN REPORT</text>
                <circle cx="302" cy="98" r="12" fill="#2D6A4F" fillOpacity="0.15" stroke="#2D6A4F" strokeWidth="1.5" />
                <rect x="294" y="89" width="16" height="14" fill="#2D6A4F" />
                <text x="302" y="100" fill="white" fontFamily="Chivo" fontSize="8" fontWeight="800" textAnchor="middle">R</text>
                <rect x="278" y="107" width="48" height="12" fill="white" stroke="#A3CFBB" />
                <text x="302" y="117" fill="#0F5132" fontFamily="Chivo" fontSize="7" fontWeight="700" textAnchor="middle">SQUAD PROOF</text>
                <line x1="285" y1="97" x2="302" y2="95" stroke="#F2A900" strokeWidth="2" strokeDasharray="3 2" />
                <text x="293" y="90" fill="#F2A900" fontFamily="Chivo" fontSize="8" fontWeight="700" textAnchor="middle">1.2m</text>
              </svg>
              <div className="absolute top-3 left-3 bg-white/95 p-2.5 border border-[#C5B8A8] flex flex-col gap-0.5 max-w-[200px]">
                <span className="font-['Chivo'] text-[10px] text-[#4A1525] uppercase tracking-wider font-bold">PMC GIS Overlay</span>
                <span className="text-[10px] text-[#544344]">Ward {selectedIssue.wardId} - {selectedIssue.sector}</span>
              </div>
              <div className="absolute bottom-3 right-3 bg-[#1B1B1B] text-white px-3 py-1.5 text-[10px] font-['Chivo'] font-bold tracking-wider uppercase flex items-center gap-2">
                <span className="w-2 h-2 bg-[#EAAA0F] animate-ping"></span>Live Geofence Matched
              </div>
            </div>
          </div>
        </div>{/* end left 8 cols */}

        {/* RIGHT 4 cols: Audit Checklist + Crew Performance */}
        <div className="lg:col-span-4 flex flex-col gap-6">

          {/* Audit Checklist */}
          <div className="bg-white border border-[#E2DACF] p-5 shadow-xs flex flex-col gap-5">
            <div className="flex items-center justify-between pb-3 border-b-2 border-[#4A1525]">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#4A1525]">checklist</span>
                <h3 className="font-['Chivo'] font-black text-sm text-[#4A1525] uppercase tracking-wide">Audit Checklist</h3>
              </div>
              <span className="font-['Chivo'] text-[11px] font-bold bg-[#F5F1EB] px-2 py-0.5 text-[#1B1B1B] uppercase border border-[#E2DACF]">
                {checkedCount}/{Object.keys(auditChecks).length} Checks
              </span>
            </div>
            <p className="text-xs text-[#544344]">Verify municipal standard compliance before committing closure to the PMC ledger.</p>
            <div className="flex flex-col gap-3">
              {([
                { key: 'photo' as const, label: 'Photographic Proof Verified', desc: 'Clear documentation, no remaining defects, structural integrity confirmed.' },
                { key: 'gps' as const, label: 'GPS Location Match < 5m', desc: 'Telemetry triangulated via cell tower and field tablet GPS.' },
                { key: 'citizen' as const, label: 'Citizen Acknowledgment Logged', desc: 'Automated feedback pulse verified with affirmative rating.' },
                { key: 'materials' as const, label: 'Material Reconciliation', desc: 'Consumed materials deducted from Ward depot store.' },
              ]).map(({ key, label, desc }) => (
                <label key={key} className="flex items-start gap-3 p-3 bg-[#FAF8F5] hover:bg-[#F5F1EB] transition-colors cursor-pointer select-none border border-[#E2DACF]">
                  <input type="checkbox" checked={auditChecks[key]}
                    onChange={() => setAuditChecks((prev) => ({ ...prev, [key]: !prev[key] }))}
                    className="mt-0.5 w-4 h-4 cursor-pointer" style={{ accentColor: '#4A1525' }} />
                  <div className="flex flex-col">
                    <span className="font-['Chivo'] font-bold text-xs text-[#1B1B1B]">{label}</span>
                    <span className="text-[11px] text-[#544344] mt-0.5">{desc}</span>
                  </div>
                </label>
              ))}
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="signoff-notes-rvc" className="font-['Chivo'] text-[10px] font-bold text-[#1B1B1B] uppercase tracking-wider">Auditor Note (Mandatory for Ledger)</label>
              <textarea id="signoff-notes-rvc" rows={3} value={signOffComments}
                onChange={(e) => setSignOffComments(e.target.value)}
                placeholder="Resolution confirmed..."
                className="bg-[#F5F1EB] text-[#1B1B1B] p-3 text-xs focus:outline-none focus:ring-2 focus:ring-[#C74724] border-0 resize-none" />
            </div>
            <div className="flex flex-col gap-3 pt-2 border-t border-[#E2DACF]">
              <button type="button" onClick={handleApprove} disabled={!allChecked}
                className="w-full bg-[#2D6A4F] hover:bg-[#1B4332] disabled:bg-[#C5B8A8] disabled:cursor-not-allowed text-white py-3.5 px-6 font-['Chivo'] text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all">
                <span className="material-symbols-outlined text-[18px]">check_circle</span>
                Approve Resolution & Close Ticket
              </button>
              <button type="button" onClick={handleReject}
                className="w-full bg-transparent hover:bg-[#F5F1EB] text-[#4A1525] py-2.5 px-4 font-['Chivo'] text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors border-2 border-[#4A1525]">
                <span className="material-symbols-outlined text-[16px]">replay</span>
                Flag for Re-inspection
              </button>
              <button type="button" onClick={handleFlagDefect}
                className="w-full bg-[#FFDAD6] hover:bg-[#BA1A1A] hover:text-white text-[#BA1A1A] py-2 px-4 font-['Chivo'] text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors border border-[#BA1A1A]">
                <span className="material-symbols-outlined text-[15px]">gavel</span>
                Withhold Contractor Deposit
              </button>
            </div>
            <div className="bg-[#FAF8F5] p-3 text-[11px] text-[#544344] flex flex-col gap-1 border border-[#E2DACF]">
              <div className="flex justify-between"><span>Auditor Officer:</span><span className="font-['Chivo'] font-bold text-[#1B1B1B]">A. Kulkarni (Admin Ops 01)</span></div>
              <div className="flex justify-between"><span>Verification Protocol:</span><span className="font-['Chivo'] font-bold text-[#1B1B1B]">PMC-ST-2024-V3</span></div>
              <div className="flex justify-between"><span>Immutable Ledger Stamp:</span><span className="font-['Chivo'] font-bold text-[#4A1525]">SHA256: 4f8a...9c2e</span></div>
            </div>
          </div>

          {/* Crew Performance Snapshot */}
          {selectedIssue.assignedSquad && (
            <div className="bg-white border border-[#E2DACF] p-5 shadow-xs flex flex-col gap-4">
              <div className="flex items-center gap-2 pb-2 border-b border-[#E2DACF]">
                <span className="material-symbols-outlined text-[#EAAA0F]">engineering</span>
                <h4 className="font-['Chivo'] text-xs font-bold uppercase tracking-wider text-[#1B1B1B]">Crew Unit Performance</h4>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#4A1525] text-white font-['Chivo'] font-black text-sm flex items-center justify-center shrink-0">
                  {selectedIssue.assignedSquad.id.slice(-2).toUpperCase()}
                </div>
                <div className="flex flex-col">
                  <span className="font-['Chivo'] font-bold text-sm text-[#1B1B1B]">{selectedIssue.assignedSquad.name.split('(')[0].trim()}</span>
                  <span className="text-[11px] text-[#544344]">{selectedIssue.assignedSquad.zone} Emergency Response</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="bg-[#F5F1EB] p-3 text-center">
                  <span className="font-['Chivo'] font-black text-xl text-[#4A1525] block">98.2%</span>
                  <span className="text-[10px] font-['Chivo'] font-bold uppercase text-[#544344] tracking-wider">SLA Adherence</span>
                </div>
                <div className="bg-[#F5F1EB] p-3 text-center">
                  <span className="font-['Chivo'] font-black text-xl text-[#C74724] block">142</span>
                  <span className="text-[10px] font-['Chivo'] font-bold uppercase text-[#544344] tracking-wider">Closed Oct</span>
                </div>
              </div>
              <div className="bg-[#FAF8F5] p-3 border border-[#E2DACF] text-xs flex flex-col gap-1.5">
                <div className="flex justify-between"><span className="text-[#544344]">Lead Officer:</span><span className="font-bold text-[#1B1B1B]">{selectedIssue.assignedSquad.leadOfficer.split('(')[0].trim()}</span></div>
                <div className="flex justify-between"><span className="text-[#544344]">Vehicle:</span><span className="font-mono font-bold text-[#4A1525]">{selectedIssue.assignedSquad.vehiclePlate}</span></div>
                <div className="flex justify-between"><span className="text-[#544344]">Status:</span>
                  <span className={`font-['Chivo'] font-bold uppercase text-[10px] ${selectedIssue.assignedSquad.status === 'Available' ? 'text-[#2D6A4F]' : 'text-[#C74724]'}`}>{selectedIssue.assignedSquad.status}</span>
                </div>
              </div>
            </div>
          )}
        </div>{/* end right 4 cols */}
      </div>{/* end 12-col grid */}

      {/* Evidence Chain Deep-Dive Modal */}
      {showEvidenceModal && (
        <EvidenceChainModal
          issue={selectedIssue}
          onClose={() => setShowEvidenceModal(false)}
        />
      )}
    </div>
  );
}
