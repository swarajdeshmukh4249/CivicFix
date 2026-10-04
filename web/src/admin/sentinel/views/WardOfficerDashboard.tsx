import { useState } from 'react';
import { useSentinel } from '../SentinelContext';
import { SpatialWardMap } from './SpatialWardMap';
import { ClusterDetailModal } from '../components/ClusterDetailModal';
import { PriorityFormulaModal } from '../components/PriorityFormulaModal';
import { EvidenceChainModal } from '../components/EvidenceChainModal';
import type { CivicIssue } from '../types';

export function WardOfficerDashboard() {
  const {
    issues,
    metrics,
    selectedIssueId,
    setSelectedIssueId,
    setActiveTab,
    triggerProactivePatrol,
    searchQuery,
    setSearchQuery,
    categoryFilter,
    setCategoryFilter,
    priorityFilter,
    setPriorityFilter
  } = useSentinel();

  const [modalType, setModalType] = useState<'cluster' | 'priority' | 'evidence' | null>(null);
  const [activeModalIssue, setActiveModalIssue] = useState<CivicIssue | null>(null);

  // Filter issues
  const filteredIssues = issues.filter((iss) => {
    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        iss.id.toLowerCase().includes(q) ||
        iss.title.toLowerCase().includes(q) ||
        iss.landmark.toLowerCase().includes(q) ||
        iss.pmcTicketNumber.toLowerCase().includes(q);
      if (!match) return false;
    }
    // Category
    if (categoryFilter !== 'all' && iss.category !== categoryFilter) {
      return false;
    }
    // Priority
    if (priorityFilter === 'p1' && iss.priority.tier !== 'P1 Critical') return false;
    if (priorityFilter === 'gap' && !iss.isVisibilityGap) return false;
    if (priorityFilter === 'recurrence' && !iss.isPostCompletionRecurrence) return false;

    return true;
  });

  const selectedIssue = issues.find((i) => i.id === selectedIssueId) ?? issues[0];
  const visibilityGapIssue = issues.find((i) => i.isVisibilityGap);

  const openModal = (issue: CivicIssue, type: 'cluster' | 'priority' | 'evidence') => {
    setActiveModalIssue(issue);
    setModalType(type);
  };

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto px-6 py-6 pb-16">
      {/* Top Section: Overview Header & Metrics */}
      <section className="bg-white border border-[#E2DACF] p-6 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2.5 h-2.5 bg-[#C74724] rotate-45"></span>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#4A1525] font-['Chivo']">
              Ward 14 (Kothrud) • Operations Center
            </span>
            <span className="text-[10px] font-bold bg-[#FAF8F5] text-[#544344] px-2 py-0.5 border border-[#E2DACF] uppercase font-['Chivo']">
              Shift 02 • Active Duty
            </span>
          </div>
          <h1 className="text-2xl font-black font-['Chivo'] text-[#1B1B1B] tracking-tight">
            Municipal Ward Officer Dashboard
          </h1>
          <p className="text-xs text-[#544344] mt-1 max-w-2xl">
            Real-time civic intelligence aggregating disparate citizen complaints into cohesive civic issues,
            calculating explainable priority formulas, and linking infrastructure failures to public tenders.
          </p>
        </div>

        {/* Executive Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 min-w-[340px]">
          <div className="bg-[#FAF8F5] border border-[#E2DACF] p-3 flex flex-col justify-between">
            <span className="text-[10px] font-bold text-[#544344] uppercase font-['Chivo']">
              Clustered Issues
            </span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="font-['Chivo'] text-2xl font-black text-[#4A1525]">
                {metrics.clusteredIssuesCount}
              </span>
              <span className="text-[10px] text-[#544344]">from 43 raw</span>
            </div>
            <span className="text-[10px] text-[#2D6A4F] font-semibold mt-1">1 problem, not 50</span>
          </div>

          <div className="bg-[#FAF8F5] border border-[#E2DACF] p-3 flex flex-col justify-between">
            <span className="text-[10px] font-bold text-[#BA1A1A] uppercase font-['Chivo']">
              Critical P1s
            </span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="font-['Chivo'] text-2xl font-black text-[#BA1A1A]">
                {metrics.activeP1Count}
              </span>
              <span className="text-[10px] text-[#544344]">squad needed</span>
            </div>
            <span className="text-[10px] text-[#BA1A1A] font-semibold mt-1">SLA &lt; 3h target</span>
          </div>

          <div className="bg-[#FAF8F5] border border-[#E2DACF] p-3 flex flex-col justify-between">
            <span className="text-[10px] font-bold text-[#C74724] uppercase font-['Chivo']">
              Post-Work Recurrences
            </span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="font-['Chivo'] text-2xl font-black text-[#C74724]">
                {metrics.postCompletionRecurrences}
              </span>
              <span className="text-[10px] text-[#544344]">tenders flagged</span>
            </div>
            <span className="text-[10px] text-[#C74724] font-semibold mt-1">DLP Active</span>
          </div>

          <div className="bg-[#FAF8F5] border border-[#E2DACF] p-3 flex flex-col justify-between">
            <span className="text-[10px] font-bold text-[#EAAA0F] uppercase font-['Chivo']">
              Visibility Gaps
            </span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="font-['Chivo'] text-2xl font-black text-[#EAAA0F]">
                {metrics.visibilityGapsDetected}
              </span>
              <span className="text-[10px] text-[#544344]">quiet ward</span>
            </div>
            <span className="text-[10px] text-[#333333] font-semibold mt-1">Auto-Patrol Alert</span>
          </div>
        </div>
      </section>

      {/* Civic Visibility Gap Banner (Flagging Low Complaint Volume vs High Need) */}
      {visibilityGapIssue && (
        <section className="bg-white border-2 border-[#EAAA0F] p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-[#EAAA0F] flex items-center justify-center text-[#1B1B1B] shrink-0 mt-0.5">
              <span className="material-symbols-outlined text-[24px]">radar</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-['Chivo'] font-bold text-xs uppercase text-[#1B1B1B] tracking-wide">
                  Civic Visibility Gap Detected • Sector 14-D (Bavdhan Lowline)
                </span>
                <span className="text-[10px] font-bold bg-[#FEBB28] text-[#1B1B1B] px-1.5 py-0.2 uppercase font-['Chivo']">
                  Action Required
                </span>
              </div>
              <p className="text-xs text-[#333333] mt-1 leading-relaxed max-w-3xl">
                {visibilityGapIssue.visibilityGapDetails?.proactiveRecommendation}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0 self-end md:self-center">
            <button
              type="button"
              onClick={() => openModal(visibilityGapIssue, 'priority')}
              className="px-3 py-1.5 bg-[#FAF8F5] border border-[#C5B8A8] text-xs font-['Chivo'] font-bold uppercase hover:bg-[#ECE6DE]"
            >
              Inspect Telemetry
            </button>
            <button
              type="button"
              onClick={() => triggerProactivePatrol(visibilityGapIssue.id)}
              className="px-4 py-1.5 bg-[#EAAA0F] hover:bg-[#F2A900] text-[#1B1B1B] text-xs font-['Chivo'] font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-xs"
            >
              <span className="material-symbols-outlined text-[16px]">local_police</span>
              <span>Deploy Verification Patrol</span>
            </button>
          </div>
        </section>
      )}

      {/* Main Spacious Content Grid: Spatial Map (Left) + Clustered Feed (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive Spatial Ward Map */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className="bg-white border border-[#E2DACF] p-4 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#C74724] text-[18px]">share_location</span>
                <h2 className="text-sm font-bold font-['Chivo'] text-[#1B1B1B] uppercase tracking-wide">
                  Spatial Ward Infrastructure & Telemetry Map
                </h2>
              </div>
              <span className="text-[11px] text-[#544344]">Click pin to inspect aggregated issue</span>
            </div>

            <SpatialWardMap
              onSelectIssue={(issue) => {
                setSelectedIssueId(issue.id);
              }}
            />
          </div>

          {/* Selected Issue Quick Inspector Dock */}
          {selectedIssue && (
            <div className="bg-white border-2 border-[#4A1525] p-4 shadow-xs flex flex-col gap-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-['Chivo'] font-bold text-xs bg-[#4A1525] text-white px-2 py-0.5 uppercase tracking-wider">
                    {selectedIssue.id}
                  </span>
                  <span className="text-xs font-bold text-[#544344] font-mono">
                    {selectedIssue.pmcTicketNumber}
                  </span>
                  <span className={`px-2 py-0.5 text-[11px] font-bold uppercase font-['Chivo'] ${
                    selectedIssue.priority.tier === 'P1 Critical' ? 'bg-[#BA1A1A] text-white' : 'bg-[#EAAA0F] text-[#1B1B1B]'
                  }`}>
                    {selectedIssue.priority.tier} ({selectedIssue.priority.score}/100)
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => openModal(selectedIssue, 'priority')}
                    className="px-2.5 py-1 bg-[#FAF8F5] border border-[#C5B8A8] text-[11px] font-['Chivo'] font-bold uppercase hover:bg-[#ECE6DE]"
                  >
                    Formula Breakdown
                  </button>
                  <button
                    type="button"
                    onClick={() => openModal(selectedIssue, 'cluster')}
                    className="px-2.5 py-1 bg-[#FAF8F5] border border-[#C5B8A8] text-[11px] font-['Chivo'] font-bold uppercase hover:bg-[#ECE6DE]"
                  >
                    {selectedIssue.clusteredReportsCount} Reports Grouped
                  </button>
                  {selectedIssue.linkedWork && (
                    <button
                      type="button"
                      onClick={() => openModal(selectedIssue, 'evidence')}
                      className="px-2.5 py-1 bg-[#4A1525] text-white text-[11px] font-['Chivo'] font-bold uppercase hover:bg-[#C74724]"
                    >
                      Evidence Chain
                    </button>
                  )}
                </div>
              </div>

              <h3 className="font-['Chivo'] font-bold text-base text-[#1B1B1B]">
                {selectedIssue.title}
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-[#544344] bg-[#FAF8F5] p-2 border border-[#E2DACF]">
                <div>
                  <span className="font-semibold block text-[#1B1B1B]">📍 Landmark:</span>
                  <span className="truncate block">{selectedIssue.landmark}</span>
                </div>
                <div>
                  <span className="font-semibold block text-[#1B1B1B]">⏱ Target SLA:</span>
                  <span>{selectedIssue.priority.slaHours} hours response</span>
                </div>
                <div>
                  <span className="font-semibold block text-[#1B1B1B]">🛠 Assigned Squad:</span>
                  <span>{selectedIssue.assignedSquad?.name ?? 'Pending Dispatch'}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Aggregated Incident Queue (1 Problem, Not 50 Tickets) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="bg-white border border-[#E2DACF] p-4 shadow-xs flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#4A1525] text-[18px]">format_list_bulleted</span>
                <h2 className="text-sm font-bold font-['Chivo'] text-[#1B1B1B] uppercase tracking-wide">
                  Aggregated Civic Issues Feed
                </h2>
              </div>
              <span className="text-[11px] font-['Chivo'] font-bold text-[#C74724] uppercase">
                1 Problem, Not 50
              </span>
            </div>

            {/* Search Input */}
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-2.5 text-[#867273] text-[18px]">
                search
              </span>
              <input
                type="text"
                placeholder="Search ticket, landmark, road..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-[#FAF8F5] border border-[#C5B8A8] text-xs text-[#1B1B1B] focus:outline-none focus:border-[#4A1525]"
              />
            </div>

            {/* Quick Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sentinel-scroll">
              <button
                type="button"
                onClick={() => { setPriorityFilter('all'); setCategoryFilter('all'); }}
                className={`px-2.5 py-1 text-[11px] font-['Chivo'] font-bold uppercase shrink-0 ${
                  priorityFilter === 'all' && categoryFilter === 'all'
                    ? 'bg-[#4A1525] text-white'
                    : 'bg-[#FAF8F5] text-[#544344] border border-[#E2DACF]'
                }`}
              >
                All ({issues.length})
              </button>
              <button
                type="button"
                onClick={() => setPriorityFilter('p1')}
                className={`px-2.5 py-1 text-[11px] font-['Chivo'] font-bold uppercase shrink-0 ${
                  priorityFilter === 'p1'
                    ? 'bg-[#BA1A1A] text-white'
                    : 'bg-[#FAF8F5] text-[#BA1A1A] border border-[#E2DACF]'
                }`}
              >
                P1 Critical
              </button>
              <button
                type="button"
                onClick={() => setPriorityFilter('recurrence')}
                className={`px-2.5 py-1 text-[11px] font-['Chivo'] font-bold uppercase shrink-0 ${
                  priorityFilter === 'recurrence'
                    ? 'bg-[#C74724] text-white'
                    : 'bg-[#FAF8F5] text-[#C74724] border border-[#E2DACF]'
                }`}
              >
                Post-Work Recurrence
              </button>
              <button
                type="button"
                onClick={() => setPriorityFilter('gap')}
                className={`px-2.5 py-1 text-[11px] font-['Chivo'] font-bold uppercase shrink-0 ${
                  priorityFilter === 'gap'
                    ? 'bg-[#EAAA0F] text-[#1B1B1B]'
                    : 'bg-[#FAF8F5] text-[#1B1B1B] border border-[#E2DACF]'
                }`}
              >
                Visibility Gap
              </button>
            </div>

            {/* Clustered Card Feed */}
            <div className="space-y-3 max-h-[640px] overflow-y-auto sentinel-scroll pr-1">
              {filteredIssues.map((issue) => {
                const isSelected = issue.id === selectedIssueId;
                const isP1 = issue.priority.tier === 'P1 Critical';

                return (
                  <article
                    key={issue.id}
                    onClick={() => setSelectedIssueId(issue.id)}
                    className={`p-4 border transition-all cursor-pointer relative ${
                      isSelected
                        ? 'border-[#4A1525] bg-[#FFFDFB] shadow-sm'
                        : 'border-[#E2DACF] bg-white hover:border-[#C5B8A8]'
                    }`}
                  >
                    {/* Top strip */}
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-['Chivo'] font-bold text-[11px] bg-[#4A1525] text-white px-2 py-0.5 uppercase tracking-wider">
                          #{issue.id}
                        </span>
                        <span className={`font-['Chivo'] font-bold text-[11px] px-2 py-0.5 uppercase tracking-wider ${
                          isP1 ? 'bg-[#BA1A1A] text-white' : 'bg-[#EAAA0F] text-[#1B1B1B]'
                        }`}>
                          {issue.priority.tier} • {issue.priority.score}/100
                        </span>
                      </div>

                      {/* SLA Tag */}
                      <span className="text-[11px] font-bold text-[#C74724] font-['Chivo'] flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">timer</span>
                        <span>SLA {issue.priority.slaHours}h</span>
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="font-['Chivo'] font-bold text-sm text-[#1B1B1B] leading-tight">
                      {issue.title}
                    </h3>
                    <p className="text-xs text-[#544344] mt-1 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px] text-[#C74724]">pin_drop</span>
                      <span className="truncate">{issue.landmark}</span>
                    </p>

                    {/* 1 Problem, Not 50 Tickets Badge */}
                    <div className="flex items-center justify-between gap-2 mt-3 pt-2 border-t border-[#E2DACF]">
                      <div className="flex items-center gap-1 text-xs">
                        <span className="font-['Chivo'] font-bold text-[#4A1525] bg-[#F5F1EB] px-2 py-0.5 border border-[#E2DACF]">
                          {issue.clusteredReportsCount} citizen reports aggregated
                        </span>
                      </div>

                      {/* Recurrence Warning Chip */}
                      {issue.isPostCompletionRecurrence && (
                        <span className="text-[10px] font-bold font-['Chivo'] text-[#BA1A1A] bg-[#FFDAD6] px-1.5 py-0.5 uppercase">
                          ⚠️ Post-Work Defect
                        </span>
                      )}
                    </div>

                    {/* Action Toolbar */}
                    <div className="flex items-center justify-between mt-3 pt-2 border-t border-[#E2DACF]/60 text-xs">
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); openModal(issue, 'cluster'); }}
                        className="text-[#4A1525] hover:text-[#C74724] font-['Chivo'] font-bold uppercase text-[11px] flex items-center gap-0.5"
                      >
                        <span>Cluster Detail</span>
                        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                      </button>

                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); openModal(issue, 'priority'); }}
                        className="text-[#544344] hover:text-[#1B1B1B] font-['Chivo'] font-bold uppercase text-[11px]"
                      >
                        Explain Priority
                      </button>

                      {issue.linkedWork && (
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); openModal(issue, 'evidence'); }}
                          className="text-[#C74724] hover:text-[#BA1A1A] font-['Chivo'] font-bold uppercase text-[11px] flex items-center gap-0.5"
                        >
                          <span className="material-symbols-outlined text-[13px]">link</span>
                          <span>Evidence Chain</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedIssueId(issue.id);
                          setActiveTab('field-dispatch');
                        }}
                        className="bg-[#4A1525] hover:bg-[#C74724] text-white px-2 py-1 font-['Chivo'] font-bold uppercase text-[10px]"
                      >
                        Dispatch
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Render Active Modal */}
      {modalType === 'cluster' && activeModalIssue && (
        <ClusterDetailModal
          issue={activeModalIssue}
          onClose={() => { setModalType(null); setActiveModalIssue(null); }}
        />
      )}
      {modalType === 'priority' && activeModalIssue && (
        <PriorityFormulaModal
          issue={activeModalIssue}
          onClose={() => { setModalType(null); setActiveModalIssue(null); }}
        />
      )}
      {modalType === 'evidence' && activeModalIssue && (
        <EvidenceChainModal
          issue={activeModalIssue}
          onClose={() => { setModalType(null); setActiveModalIssue(null); }}
        />
      )}
    </div>
  );
}
