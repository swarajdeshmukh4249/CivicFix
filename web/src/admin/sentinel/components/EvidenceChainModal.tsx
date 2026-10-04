import { useState } from 'react';
import type { CivicIssue } from '../types';
import { useSentinel } from '../SentinelContext';

interface Props {
  issue: CivicIssue;
  onClose: () => void;
}

export function EvidenceChainModal({ issue, onClose }: Props) {
  const { flagContractorDefectNotice } = useSentinel();
  const [defectReason, setDefectReason] = useState(
    'Premature breakdown of newly surfaced asphalt wearing coat within 65 days of completion. Suspected poor bitumen compaction.'
  );
  const [noticeSent, setNoticeSent] = useState(false);

  const work = issue.linkedWork;

  const handleIssueNotice = () => {
    flagContractorDefectNotice(issue.id, defectReason);
    setNoticeSent(true);
    setTimeout(() => {
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#FAF8F5] border border-[#E2DACF] shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto sentinel-scroll">
        {/* Modal Header */}
        <div className="bg-[#4A1525] text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-[#F2A900] text-[26px]">account_tree</span>
            <div>
              <div className="text-[11px] font-bold text-[#F2A900] uppercase font-['Chivo'] tracking-widest">
                The Killer Feature • Accountability Linkage
              </div>
              <h2 className="text-lg font-black font-['Chivo'] text-white">
                Work → Outcome Evidence Chain
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center hover:bg-white/20 text-white transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 flex flex-col gap-6">
          {/* Post-Completion Recurrence Alert Banner */}
          {issue.isPostCompletionRecurrence && (
            <div className="bg-[#FFDAD6] border-l-4 border-[#BA1A1A] p-4 text-[#93000A] flex items-start gap-3">
              <span className="material-symbols-outlined text-[24px] text-[#BA1A1A] shrink-0 mt-0.5">
                warning
              </span>
              <div className="flex-1">
                <div className="font-['Chivo'] font-bold text-sm uppercase tracking-wide">
                  ⚠️ Post-Completion Recurrence Detected — Verification Recommended
                </div>
                <p className="text-xs text-[#544344] mt-1 leading-relaxed">
                  Citizen complaints have recurred at this exact coordinate <strong className="text-[#BA1A1A]">{issue.recurrenceLatencyDays} days</strong> after
                  the linked public works project was certified as completed. This incident falls squarely within the contractor's
                  mandatory <strong>Defect Liability Period (DLP)</strong>.
                </p>
              </div>
            </div>
          )}

          {/* Visual Step-by-Step Evidence Chain */}
          <div className="flex flex-col gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#544344] font-['Chivo']">
              Cryptographic Audit Chain (Complaint → Ward → Project → Tender → Contractor)
            </span>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-2 pt-2">
              {/* Node 1: Complaint Cluster */}
              <div className="bg-white border border-[#C5B8A8] p-3 flex flex-col justify-between">
                <div className="flex items-center justify-between text-[10px] font-bold uppercase font-['Chivo'] text-[#4A1525]">
                  <span>Step 1: Grievance</span>
                  <span className="material-symbols-outlined text-[14px]">report</span>
                </div>
                <div className="my-2">
                  <div className="font-bold text-xs text-[#1B1B1B]">{issue.id}</div>
                  <div className="text-[11px] text-[#544344]">{issue.clusteredReportsCount} Reports Clustered</div>
                </div>
                <div className="text-[10px] font-mono bg-[#F5F1EB] p-1 text-[#333333]">
                  GPS: {issue.coordinates[0].toFixed(3)}, {issue.coordinates[1].toFixed(3)}
                </div>
              </div>

              {/* Node 2: Ward Office */}
              <div className="bg-white border border-[#C5B8A8] p-3 flex flex-col justify-between">
                <div className="flex items-center justify-between text-[10px] font-bold uppercase font-['Chivo'] text-[#4A1525]">
                  <span>Step 2: Prabhag</span>
                  <span className="material-symbols-outlined text-[14px]">location_city</span>
                </div>
                <div className="my-2">
                  <div className="font-bold text-xs text-[#1B1B1B]">{issue.wardName}</div>
                  <div className="text-[11px] text-[#544344]">{issue.sector}</div>
                </div>
                <div className="text-[10px] font-mono bg-[#F5F1EB] p-1 text-[#333333]">
                  Zone 3 Administration
                </div>
              </div>

              {/* Node 3: Public Project */}
              <div className="bg-white border-2 border-[#C74724] p-3 flex flex-col justify-between bg-[#FFFBF7]">
                <div className="flex items-center justify-between text-[10px] font-bold uppercase font-['Chivo'] text-[#C74724]">
                  <span>Step 3: Scheme</span>
                  <span className="material-symbols-outlined text-[14px]">account_balance</span>
                </div>
                <div className="my-2">
                  <div className="font-bold text-xs text-[#1B1B1B] truncate" title={work?.projectName}>
                    {work?.scheme}
                  </div>
                  <div className="text-[10px] text-[#C74724] font-bold">{work?.sanctionedBudget} Sanctioned</div>
                </div>
                <div className="text-[10px] font-mono bg-[#F5F1EB] p-1 text-[#333333]">
                  Done: {work?.completedDate}
                </div>
              </div>

              {/* Node 4: Tender Contract */}
              <div className="bg-white border border-[#C5B8A8] p-3 flex flex-col justify-between">
                <div className="flex items-center justify-between text-[10px] font-bold uppercase font-['Chivo'] text-[#4A1525]">
                  <span>Step 4: Tender</span>
                  <span className="material-symbols-outlined text-[14px]">description</span>
                </div>
                <div className="my-2">
                  <div className="font-bold text-xs text-[#1B1B1B] font-mono">{work?.tenderNumber}</div>
                  <div className="text-[11px] text-[#544344]">PMC e-Procurement</div>
                </div>
                <div className="text-[10px] font-mono bg-[#F5F1EB] p-1 text-[#333333]">
                  DLP Active to {work?.warrantyEndDate}
                </div>
              </div>

              {/* Node 5: Contractor Liability */}
              <div className="bg-white border border-[#C5B8A8] p-3 flex flex-col justify-between">
                <div className="flex items-center justify-between text-[10px] font-bold uppercase font-['Chivo'] text-[#BA1A1A]">
                  <span>Step 5: Vendor</span>
                  <span className="material-symbols-outlined text-[14px]">engineering</span>
                </div>
                <div className="my-2">
                  <div className="font-bold text-xs text-[#1B1B1B] truncate" title={work?.contractorName}>
                    {work?.contractorName}
                  </div>
                  <div className="text-[10px] text-[#BA1A1A] font-bold">Liable for Warranty</div>
                </div>
                <div className="text-[10px] font-mono bg-[#F5F1EB] p-1 text-[#333333] truncate">
                  {work?.contractorContact}
                </div>
              </div>
            </div>
          </div>

          {/* Project & Contract Deep-Dive Details */}
          {work ? (
            <div className="bg-white border border-[#E2DACF] p-4 flex flex-col gap-3">
              <h3 className="font-['Chivo'] font-bold text-sm text-[#4A1525] uppercase tracking-wide flex items-center justify-between">
                <span>Linked Public Project Specification</span>
                <span className="text-xs text-[#C74724] font-mono font-normal">Tender ID: {work.tenderNumber}</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-[#544344] font-semibold block">Full Project Name:</span>
                  <p className="font-bold text-[#1B1B1B] text-sm mt-0.5">{work.projectName}</p>
                </div>
                <div>
                  <span className="text-[#544344] font-semibold block">Funding Scheme & Sanctioned Budget:</span>
                  <p className="font-bold text-[#1B1B1B] text-sm mt-0.5">{work.scheme} • {work.sanctionedBudget}</p>
                </div>
                <div>
                  <span className="text-[#544344] font-semibold block">Contractor Agency:</span>
                  <p className="font-bold text-[#1B1B1B] mt-0.5">{work.contractorName} ({work.contractorContact})</p>
                </div>
                <div>
                  <span className="text-[#544344] font-semibold block">Defect Liability Period (DLP) Status:</span>
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-[#FFDAD6] text-[#BA1A1A] font-bold font-['Chivo'] mt-0.5">
                    <span className="w-1.5 h-1.5 bg-[#BA1A1A] rounded-full"></span>
                    ACTIVE WARRANTY (Expires: {work.warrantyEndDate})
                  </span>
                </div>
              </div>

              <div className="bg-[#FAF8F5] p-3 border border-[#E2DACF] mt-2">
                <span className="font-['Chivo'] font-bold text-[11px] text-[#4A1525] uppercase tracking-wide block">
                  Enforceable Penalty & Rectification Clause:
                </span>
                <p className="text-xs text-[#333333] mt-1 italic">
                  "{work.defectPenaltyClauses}"
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-white p-4 border border-[#E2DACF] text-center text-xs text-[#544344]">
              No direct public works tender linked to this incident coordinate yet.
            </div>
          )}

          {/* Human-in-the-Loop Action Panel */}
          {work && (
            <div className="bg-[#F5F1EB] p-4 border border-[#C5B8A8] flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="font-['Chivo'] font-bold text-xs uppercase text-[#1B1B1B] tracking-wider">
                  Human-in-the-Loop Vigilance Enforcement
                </span>
                <span className="text-[11px] text-[#544344]">
                  Section 72, Maharashtra Municipal Corporations Act
                </span>
              </div>

              {noticeSent ? (
                <div className="bg-[#D1E7DD] border border-[#A3CFBB] text-[#0F5132] p-3 text-xs font-bold font-['Chivo'] flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">verified</span>
                  <span>Defect Notice successfully dispatched to {work.contractorName}. Retention payment escrow frozen.</span>
                </div>
              ) : (
                <>
                  <div className="flex flex-col gap-1">
                    <label htmlFor="defect-reason" className="text-[11px] font-bold text-[#544344] uppercase">
                      Defect Notice Description & Recovery Basis:
                    </label>
                    <textarea
                      id="defect-reason"
                      rows={2}
                      value={defectReason}
                      onChange={(e) => setDefectReason(e.target.value)}
                      className="bg-white border border-[#C5B8A8] p-2 text-xs text-[#1B1B1B] focus:outline-none focus:border-[#C74724]"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2 bg-white text-[#1B1B1B] border border-[#C5B8A8] font-['Chivo'] text-xs font-bold uppercase tracking-wider hover:bg-[#FAF8F5]"
                    >
                      Dismiss
                    </button>
                    <button
                      type="button"
                      onClick={handleIssueNotice}
                      className="px-4 py-2 bg-[#BA1A1A] hover:bg-[#93000A] text-white font-['Chivo'] text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-sm"
                    >
                      <span className="material-symbols-outlined text-[16px]">gavel</span>
                      <span>Issue Formal Defect Notice & Freeze Retention</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
