import type { CivicIssue } from '../types';
import { useSentinel } from '../SentinelContext';

interface Props {
  issue: CivicIssue;
  onClose: () => void;
}

export function ClusterDetailModal({ issue, onClose }: Props) {
  const { approveCluster } = useSentinel();

  const handleApprove = () => {
    approveCluster(issue.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#FAF8F5] border border-[#E2DACF] shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto sentinel-scroll">
        {/* Modal Header */}
        <div className="bg-[#4A1525] text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-[#EAAA0F] text-[26px]">hub</span>
            <div>
              <div className="text-[11px] font-bold text-[#EAAA0F] uppercase font-['Chivo'] tracking-widest">
                1 Problem, Not 50 Tickets • Spatial & Semantic Clustering
              </div>
              <h2 className="text-lg font-black font-['Chivo'] text-white">
                Issue {issue.id} Aggregation Breakdown
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

        {/* Modal Content */}
        <div className="p-6 flex flex-col gap-5">
          {/* Cluster Summary Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-white border border-[#C5B8A8] p-3">
              <span className="text-[10px] font-bold uppercase text-[#544344] font-['Chivo'] block">
                Aggregated Reports
              </span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="font-['Chivo'] text-2xl font-black text-[#4A1525]">
                  {issue.clusteredReportsCount}
                </span>
                <span className="text-xs text-[#544344]">citizen complaints</span>
              </div>
              <span className="text-[10px] text-[#2D6A4F] font-semibold mt-1 block">
                ✓ Clustered into 1 actionable ticket
              </span>
            </div>

            <div className="bg-white border border-[#C5B8A8] p-3">
              <span className="text-[10px] font-bold uppercase text-[#544344] font-['Chivo'] block">
                Cluster Geo-Radius
              </span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="font-['Chivo'] text-2xl font-black text-[#C74724]">
                  {issue.clusterRadiusMeters}
                </span>
                <span className="text-xs text-[#544344]">meters</span>
              </div>
              <span className="text-[10px] text-[#544344] mt-1 block">
                Center: {issue.landmark}
              </span>
            </div>

            <div className="bg-white border border-[#C5B8A8] p-3">
              <span className="text-[10px] font-bold uppercase text-[#544344] font-['Chivo'] block">
                Cluster Governance
              </span>
              <div className="mt-1">
                <span className={`inline-block px-2 py-0.5 text-xs font-bold font-['Chivo'] uppercase ${
                  issue.clusterApproval.status === 'Approved'
                    ? 'bg-[#D1E7DD] text-[#0F5132]'
                    : 'bg-[#FEBB28] text-[#1B1B1B]'
                }`}>
                  {issue.clusterApproval.status === 'Approved' ? '✓ Officer Confirmed' : 'Pending Review'}
                </span>
              </div>
              <span className="text-[10px] text-[#544344] mt-1 block">
                {issue.clusterApproval.approvedBy || 'AI Grouping'}
              </span>
            </div>
          </div>

          {/* AI Semantic Logic Explanation for Municipal Admin */}
          <div className="bg-[#F5F1EB] p-3 border-l-4 border-[#EAAA0F] text-xs text-[#333333]">
            <strong className="text-[#1B1B1B] font-['Chivo'] uppercase">De-duplication Intelligence:</strong>{' '}
            Multiple citizen complaints across WhatsApp, the PMC Citizen App, and IVR helpline were logged within
            an 85-meter radius along the Paud Road corridor. The system merged these duplicates to prevent 14 separate
            departmental dispatches for what is physically a single ruptured pipeline.
          </div>

          {/* Underlying Citizen Reports Feed */}
          <div className="flex flex-col gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#544344] font-['Chivo']">
              Raw Citizen Reports in this Cluster ({issue.reports.length} of {issue.clusteredReportsCount} previewed)
            </span>

            <div className="space-y-2 max-h-60 overflow-y-auto sentinel-scroll pr-1">
              {issue.reports.map((report) => (
                <div key={report.id} className="bg-white border border-[#E2DACF] p-3 flex flex-col gap-2">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[#4A1525] font-['Chivo']">{report.id}</span>
                      <span className="px-1.5 py-0.2 bg-[#F5F1EB] text-[10px] font-bold uppercase text-[#544344] border border-[#E2DACF]">
                        {report.source}
                      </span>
                      <span className="text-[#544344]">{report.citizenName} ({report.citizenPhone})</span>
                    </div>
                    <span className="text-[11px] text-[#544344]">{report.timestamp}</span>
                  </div>

                  <p className="text-xs text-[#1B1B1B] bg-[#FAF8F5] p-2 border-l-2 border-[#C5B8A8] italic">
                    "{report.description}"
                  </p>

                  <div className="flex items-center justify-between text-[11px] text-[#544344]">
                    <span>📍 {report.landmark}</span>
                    <span className="font-mono">[{report.coordinates[0].toFixed(4)}, {report.coordinates[1].toFixed(4)}]</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Human-in-the-Loop Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-[#E2DACF]">
            <span className="text-xs text-[#544344]">
              Officer override is permanently recorded in the municipal audit trail.
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 bg-white border border-[#C5B8A8] text-xs font-bold font-['Chivo'] uppercase hover:bg-[#FAF8F5]"
              >
                Close
              </button>
              <button
                type="button"
                onClick={handleApprove}
                className="px-4 py-1.5 bg-[#4A1525] text-white text-xs font-bold font-['Chivo'] uppercase hover:bg-[#C74724] flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px]">check_circle</span>
                <span>Confirm & Approve Cluster</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
