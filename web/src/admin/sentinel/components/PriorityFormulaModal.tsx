import { useState } from 'react';
import type { CivicIssue } from '../types';
import { useSentinel } from '../SentinelContext';

interface Props {
  issue: CivicIssue;
  onClose: () => void;
}

export function PriorityFormulaModal({ issue, onClose }: Props) {
  const { overridePriority } = useSentinel();

  const [recurrence, setRecurrence] = useState(issue.priority.factors.recurrence.points);
  const [safetyRisk, setSafetyRisk] = useState(issue.priority.factors.safetyRisk.points);
  const [majorRoad, setMajorRoad] = useState(issue.priority.factors.majorRoad.points);
  const [publicExposure, setPublicExposure] = useState(issue.priority.factors.publicExposure.points);
  const [overrideReason, setOverrideReason] = useState('Reviewed field telemetry and adjusted factor weighting.');

  const liveTotal = recurrence + safetyRisk + majorRoad + publicExposure;
  const liveTier = liveTotal >= 80 ? 'P1 Critical' : liveTotal >= 60 ? 'P2 Urgent' : 'P3 Standard';

  const handleSaveOverride = () => {
    // Apply changes
    overridePriority(issue.id, 'recurrence', recurrence, overrideReason);
    overridePriority(issue.id, 'safetyRisk', safetyRisk, overrideReason);
    overridePriority(issue.id, 'majorRoad', majorRoad, overrideReason);
    overridePriority(issue.id, 'publicExposure', publicExposure, overrideReason);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#FAF8F5] border border-[#E2DACF] shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto sentinel-scroll">
        {/* Header */}
        <div className="bg-[#4A1525] text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-[#F2A900] text-[26px]">calculate</span>
            <div>
              <div className="text-[11px] font-bold text-[#F2A900] uppercase font-['Chivo'] tracking-widest">
                Explainable Priority • Mathematical Formulation
              </div>
              <h2 className="text-lg font-black font-['Chivo'] text-white">
                Priority Score Breakdown: {issue.id}
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

        {/* Content */}
        <div className="p-6 flex flex-col gap-5">
          {/* Top Formula Banner */}
          <div className="bg-white border border-[#C5B8A8] p-4 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase text-[#544344] font-['Chivo'] block">
                Total Mathematical Triage Score
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="font-['Chivo'] text-4xl font-black text-[#C74724]">
                  {liveTotal}
                </span>
                <span className="text-sm font-bold text-[#544344]">/ 100</span>
                <span className={`px-2 py-0.5 font-['Chivo'] text-xs font-bold uppercase ml-2 ${
                  liveTier === 'P1 Critical' ? 'bg-[#BA1A1A] text-white' : 'bg-[#EAAA0F] text-[#1B1B1B]'
                }`}>
                  {liveTier}
                </span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] font-bold uppercase text-[#544344] font-['Chivo'] block">
                Target Resolution SLA
              </span>
              <span className="font-['Chivo'] text-xl font-bold text-[#4A1525]">
                {liveTier === 'P1 Critical' ? 'Under 3 Hours' : 'Under 6 Hours'}
              </span>
            </div>
          </div>

          <div className="bg-[#F5F1EB] p-3 text-xs text-[#333333] border-l-4 border-[#C74724]">
            <strong>Transparent Formula:</strong> Priority is computed additively from 4 verifiable municipal
            factors rather than an opaque black-box score. Each factor carries a maximum of 25 points.
          </div>

          {/* Factor Sliders & Justifications */}
          <div className="space-y-4">
            {/* Factor 1: Recurrence */}
            <div className="bg-white border border-[#E2DACF] p-3.5 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-['Chivo'] font-bold text-xs text-[#1B1B1B] uppercase">
                    1. Recurrence Factor
                  </span>
                  <p className="text-[11px] text-[#544344]">
                    {issue.priority.factors.recurrence.reason}
                  </p>
                </div>
                <span className="font-['Chivo'] font-bold text-sm text-[#4A1525] bg-[#F5F1EB] px-2 py-0.5">
                  +{recurrence} / 25
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="25"
                value={recurrence}
                onChange={(e) => setRecurrence(Number(e.target.value))}
                className="w-full accent-[#4A1525] cursor-pointer"
              />
            </div>

            {/* Factor 2: Safety Risk */}
            <div className="bg-white border border-[#E2DACF] p-3.5 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-['Chivo'] font-bold text-xs text-[#1B1B1B] uppercase">
                    2. Safety / Structural Risk
                  </span>
                  <p className="text-[11px] text-[#544344]">
                    {issue.priority.factors.safetyRisk.reason}
                  </p>
                </div>
                <span className="font-['Chivo'] font-bold text-sm text-[#C74724] bg-[#F5F1EB] px-2 py-0.5">
                  +{safetyRisk} / 25
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="25"
                value={safetyRisk}
                onChange={(e) => setSafetyRisk(Number(e.target.value))}
                className="w-full accent-[#C74724] cursor-pointer"
              />
            </div>

            {/* Factor 3: Major Road */}
            <div className="bg-white border border-[#E2DACF] p-3.5 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-['Chivo'] font-bold text-xs text-[#1B1B1B] uppercase">
                    3. Arterial Corridor Classification
                  </span>
                  <p className="text-[11px] text-[#544344]">
                    {issue.priority.factors.majorRoad.reason}
                  </p>
                </div>
                <span className="font-['Chivo'] font-bold text-sm text-[#4A1525] bg-[#F5F1EB] px-2 py-0.5">
                  +{majorRoad} / 25
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="25"
                value={majorRoad}
                onChange={(e) => setMajorRoad(Number(e.target.value))}
                className="w-full accent-[#4A1525] cursor-pointer"
              />
            </div>

            {/* Factor 4: Public Exposure */}
            <div className="bg-white border border-[#E2DACF] p-3.5 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-['Chivo'] font-bold text-xs text-[#1B1B1B] uppercase">
                    4. Public Exposure & Vulnerability
                  </span>
                  <p className="text-[11px] text-[#544344]">
                    {issue.priority.factors.publicExposure.reason}
                  </p>
                </div>
                <span className="font-['Chivo'] font-bold text-sm text-[#EAAA0F] bg-[#F5F1EB] px-2 py-0.5">
                  +{publicExposure} / 25
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="25"
                value={publicExposure}
                onChange={(e) => setPublicExposure(Number(e.target.value))}
                className="w-full accent-[#EAAA0F] cursor-pointer"
              />
            </div>
          </div>

          {/* Override Justification Note */}
          <div className="flex flex-col gap-1">
            <label htmlFor="priority-reason" className="text-[11px] font-bold text-[#544344] uppercase font-['Chivo']">
              Official Override Rationale (Logged into Municipal Audit Log):
            </label>
            <input
              id="priority-reason"
              type="text"
              value={overrideReason}
              onChange={(e) => setOverrideReason(e.target.value)}
              className="bg-white border border-[#C5B8A8] p-2 text-xs text-[#1B1B1B] focus:outline-none focus:border-[#4A1525]"
            />
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E2DACF]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white border border-[#C5B8A8] text-xs font-bold font-['Chivo'] uppercase hover:bg-[#FAF8F5]"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveOverride}
              className="px-4 py-2 bg-[#4A1525] hover:bg-[#C74724] text-white text-xs font-bold font-['Chivo'] uppercase flex items-center gap-1.5 shadow-sm"
            >
              <span className="material-symbols-outlined text-[16px]">save</span>
              <span>Commit Priority Override</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
