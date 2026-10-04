import { useState } from 'react';
import { useSentinel } from '../SentinelContext';
import type { CivicIssue } from '../types';

interface Props {
  onSelectIssue: (issue: CivicIssue) => void;
}

export function SpatialWardMap({ onSelectIssue }: Props) {
  const { issues, selectedIssueId } = useSentinel();
  const [zoomLevel, setZoomLevel] = useState(1);
  const [activeLayer, setActiveLayer] = useState<'all' | 'water' | 'roads' | 'gaps'>('all');

  // Filtered pins based on active layer
  const visibleIssues = issues.filter((iss) => {
    if (activeLayer === 'water') return iss.category === 'water_supply';
    if (activeLayer === 'roads') return iss.category === 'pothole_road';
    if (activeLayer === 'gaps') return iss.isVisibilityGap;
    return true;
  });

  return (
    <div className="relative w-full h-[480px] lg:h-[540px] bg-[#FAF8F5] border border-[#E2DACF] overflow-hidden select-none flex flex-col">
      {/* Top Map Context Ribbon */}
      <div className="absolute top-3 left-3 z-20 flex flex-wrap items-center gap-2">
        <div className="bg-white/95 backdrop-blur-xs px-3 py-1.5 border border-[#C5B8A8] shadow-xs flex items-center gap-2">
          <span className="w-2.5 h-2.5 bg-[#EAAA0F]"></span>
          <span className="font-['Chivo'] text-xs uppercase tracking-wider text-[#1B1B1B] font-bold">
            Ward 14 (Kothrud) • Prabhag Grid K-14
          </span>
          <span className="text-[11px] text-[#544344] font-mono">8.4 km²</span>
        </div>

        {/* Layer Filters */}
        <div className="hidden sm:flex items-center bg-white/95 border border-[#C5B8A8] p-0.5 shadow-xs">
          <button
            type="button"
            onClick={() => setActiveLayer('all')}
            className={`px-2 py-1 text-[11px] font-['Chivo'] font-bold uppercase ${
              activeLayer === 'all' ? 'bg-[#4A1525] text-white' : 'text-[#333333] hover:bg-[#F5F1EB]'
            }`}
          >
            All Layers
          </button>
          <button
            type="button"
            onClick={() => setActiveLayer('water')}
            className={`px-2 py-1 text-[11px] font-['Chivo'] font-bold uppercase ${
              activeLayer === 'water' ? 'bg-[#4A1525] text-white' : 'text-[#333333] hover:bg-[#F5F1EB]'
            }`}
          >
            Water Grid
          </button>
          <button
            type="button"
            onClick={() => setActiveLayer('roads')}
            className={`px-2 py-1 text-[11px] font-['Chivo'] font-bold uppercase ${
              activeLayer === 'roads' ? 'bg-[#4A1525] text-white' : 'text-[#333333] hover:bg-[#F5F1EB]'
            }`}
          >
            Roads / Tenders
          </button>
          <button
            type="button"
            onClick={() => setActiveLayer('gaps')}
            className={`px-2 py-1 text-[11px] font-['Chivo'] font-bold uppercase ${
              activeLayer === 'gaps' ? 'bg-[#EAAA0F] text-[#1B1B1B]' : 'text-[#333333] hover:bg-[#F5F1EB]'
            }`}
          >
            Visibility Gaps
          </button>
        </div>
      </div>

      {/* Map Control Tools (Right Rail) */}
      <div className="absolute top-3 right-3 z-20 flex flex-col gap-1.5 shadow-xs">
        <button
          type="button"
          onClick={() => setZoomLevel((z) => Math.min(z + 0.2, 1.6))}
          title="Zoom In"
          aria-label="Zoom In"
          className="w-8 h-8 bg-white border border-[#C5B8A8] flex items-center justify-center text-[#1B1B1B] font-bold hover:bg-[#FAF8F5]"
        >
          +
        </button>
        <button
          type="button"
          onClick={() => setZoomLevel((z) => Math.max(z - 0.2, 0.8))}
          title="Zoom Out"
          aria-label="Zoom Out"
          className="w-8 h-8 bg-white border border-[#C5B8A8] flex items-center justify-center text-[#1B1B1B] font-bold hover:bg-[#FAF8F5]"
        >
          −
        </button>
        <button
          type="button"
          onClick={() => setZoomLevel(1)}
          title="Recenter Ward"
          aria-label="Recenter Ward"
          className="w-8 h-8 bg-white border border-[#C5B8A8] flex items-center justify-center text-[#4A1525] hover:bg-[#FAF8F5]"
        >
          <span className="material-symbols-outlined text-[18px]">my_location</span>
        </button>
      </div>

      {/* SVG Vector Map Rendering Canvas */}
      <div className="relative w-full h-full overflow-hidden bg-[#F5F1EB]">
        <svg
          className="w-full h-full transition-transform duration-300 origin-center"
          style={{ transform: `scale(${zoomLevel})` }}
          viewBox="0 0 800 520"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern id="ward-grid-patt" width="36" height="36" patternUnits="userSpaceOnUse">
              <path d="M 36 0 L 0 0 0 36" fill="none" stroke="#FAF8F5" strokeWidth="1.5" />
            </pattern>
            <radialGradient id="wardRadial" cx="50%" cy="50%" r="55%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#EFECE6" stopOpacity="0.95" />
            </radialGradient>
          </defs>

          {/* Ward Terrain Fill */}
          <rect width="100%" height="100%" fill="url(#wardRadial)" />
          <rect width="100%" height="100%" fill="url(#ward-grid-patt)" />

          {/* Ward 14 Boundary Polygon (Kothrud/Bavdhan) */}
          <path
            d="M 60 50 L 730 30 L 760 380 L 680 480 L 160 500 L 40 360 Z"
            fill="#611E29"
            fillOpacity="0.04"
            stroke="#611E29"
            strokeWidth="2.5"
            strokeDasharray="8 5"
          />

          {/* Sector Demarcation Lines */}
          <path d="M 220 80 L 460 270 L 730 300" stroke="#EAAA0F" strokeWidth="1.5" strokeDasharray="3 4" strokeOpacity="0.4" />
          <path d="M 240 420 L 450 390 L 680 480" stroke="#EAAA0F" strokeWidth="1.5" strokeDasharray="3 4" strokeOpacity="0.4" />

          {/* Arterial Road 1: Paud Road Corridor 4 */}
          <path d="M 20 220 Q 280 260 480 210 T 780 280" stroke="#FFFFFF" strokeWidth="16" strokeLinecap="round" />
          <path d="M 20 220 Q 280 260 480 210 T 780 280" stroke="#E2DACF" strokeWidth="10" strokeLinecap="round" />
          <path id="paudRoadText" d="M 80 230 Q 320 265 520 215" fill="none" />
          <text fill="#867273" fontFamily="Noto Sans" fontSize="11" fontWeight="700" letterSpacing="3">
            <textPath href="#paudRoadText" startOffset="10%">
              PAUD ROAD ARTERIAL (CORRIDOR 4)
            </textPath>
          </text>

          {/* Arterial Road 2: Karve Road Link */}
          <path d="M 400 30 L 430 490" stroke="#FFFFFF" strokeWidth="14" />
          <path d="M 400 30 L 430 490" stroke="#E2DACF" strokeWidth="8" />
          <path id="karveRoadText" d="M 410 80 L 435 450" fill="none" />
          <text fill="#867273" fontFamily="Noto Sans" fontSize="10" fontWeight="700" letterSpacing="2">
            <textPath href="#karveRoadText" startOffset="20%">
              KARVE ROAD METRO CORRIDOR
            </textPath>
          </text>

          {/* Water Main Transmission Pipe Line */}
          <path
            d="M 70 120 Q 260 180 540 140 T 740 200"
            stroke="#0284C7"
            strokeWidth="3"
            strokeDasharray="6 3"
            strokeOpacity="0.5"
          />

          {/* Sector Placename Badges */}
          <g opacity="0.8">
            <rect x="110" y="100" width="110" height="22" fill="#FAF8F5" stroke="#C5B8A8" strokeWidth="1" />
            <text x="120" y="115" fill="#4A1525" fontFamily="Chivo" fontSize="10" fontWeight="700" letterSpacing="1">
              SECTOR 14-A
            </text>

            <rect x="520" y="120" width="120" height="22" fill="#FAF8F5" stroke="#C5B8A8" strokeWidth="1" />
            <text x="530" y="135" fill="#4A1525" fontFamily="Chivo" fontSize="10" fontWeight="700" letterSpacing="1">
              IDEAL COLONY
            </text>

            <rect x="130" y="420" width="140" height="22" fill="#FAF8F5" stroke="#C5B8A8" strokeWidth="1" />
            <text x="140" y="435" fill="#4A1525" fontFamily="Chivo" fontSize="10" fontWeight="700" letterSpacing="1">
              SECTOR 14-D (BASTER)
            </text>
          </g>

          {/* Incident Geo-Pins */}
          {visibleIssues.map((issue) => {
            // Coordinate mapping to SVG canvas
            // Paud Road Kinara: [18.5089, 73.8052] -> (280, 240)
            // Paud Phata Ramp: [18.5132, 73.8214] -> (460, 210)
            // Mayur Colony: [18.5583, 73.7938] -> (620, 160)
            // Sector 14-D Gap: [18.5011, 73.7845] -> (190, 410)
            // Streetlight FC: [18.5204, 73.8421] -> (560, 360)
            let cx = 350;
            let cy = 250;
            if (issue.id === 'CF-1042') { cx = 280; cy = 240; }
            if (issue.id === 'CF-1039') { cx = 460; cy = 210; }
            if (issue.id === 'CF-1055') { cx = 620; cy = 160; }
            if (issue.id === 'CF-1070') { cx = 190; cy = 410; }
            if (issue.id === 'CF-1028') { cx = 560; cy = 360; }

            const isSelected = issue.id === selectedIssueId;
            const isP1 = issue.priority.tier === 'P1 Critical';
            const isGap = issue.isVisibilityGap;
            const hasRecurrence = issue.isPostCompletionRecurrence;

            return (
              <g
                key={issue.id}
                className="cursor-pointer transition-transform hover:scale-110"
                onClick={() => onSelectIssue(issue)}
              >
                {/* Clustered Radius Ring */}
                <circle
                  cx={cx}
                  cy={cy}
                  r={issue.clusterRadiusMeters ? Math.min(issue.clusterRadiusMeters * 0.45, 50) : 25}
                  fill={isP1 ? '#BA1A1A' : isGap ? '#EAAA0F' : '#4A1525'}
                  fillOpacity={isSelected ? 0.25 : 0.12}
                  stroke={isP1 ? '#BA1A1A' : isGap ? '#EAAA0F' : '#4A1525'}
                  strokeWidth={isSelected ? 2 : 1}
                  strokeDasharray={isSelected ? '4 2' : 'none'}
                />

                {/* Radar pulse for Visibility Gap or P1 */}
                {(isP1 || isGap) && (
                  <circle
                    cx={cx}
                    cy={cy}
                    r={isSelected ? 28 : 20}
                    fill="none"
                    stroke={isP1 ? '#BA1A1A' : '#EAAA0F'}
                    strokeWidth="1.5"
                    opacity="0.8"
                  >
                    <animate
                      attributeName="r"
                      from="12"
                      to={isSelected ? "36" : "28"}
                      dur="2s"
                      repeatCount="indefinite"
                    />
                    <animate
                      attributeName="opacity"
                      from="0.9"
                      to="0"
                      dur="2s"
                      repeatCount="indefinite"
                    />
                  </circle>
                )}

                {/* Main Pin Box */}
                <rect
                  x={cx - 16}
                  y={cy - 24}
                  width="32"
                  height="26"
                  fill={isP1 ? '#BA1A1A' : isGap ? '#EAAA0F' : '#4A1525'}
                  stroke="#FFFFFF"
                  strokeWidth="2"
                />

                {/* Recurrence Warning Indicator */}
                {hasRecurrence && (
                  <polygon
                    points={`${cx + 12},${cy - 28} ${cx + 22},${cy - 12} ${cx + 2},${cy - 12}`}
                    fill="#F2A900"
                    stroke="#1B1B1B"
                    strokeWidth="1"
                  />
                )}

                {/* Cluster Count Text */}
                <text
                  x={cx}
                  y={cy - 7}
                  fill={isGap ? '#1B1B1B' : '#FFFFFF'}
                  fontFamily="Chivo"
                  fontSize="12"
                  fontWeight="800"
                  textAnchor="middle"
                >
                  {issue.clusteredReportsCount}
                </text>

                {/* Issue Label Callout */}
                <rect
                  x={cx - 40}
                  y={cy + 6}
                  width="80"
                  height="18"
                  fill="#FFFFFF"
                  stroke={isSelected ? '#C74724' : '#C5B8A8'}
                  strokeWidth={isSelected ? 2 : 1}
                />
                <text
                  x={cx}
                  y={cy + 19}
                  fill="#1B1B1B"
                  fontFamily="Chivo"
                  fontSize="9"
                  fontWeight="700"
                  textAnchor="middle"
                >
                  {issue.id} • {issue.priority.score}/100
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Map Bottom Legend Strip */}
      <div className="bg-[#FAF8F5] border-t border-[#E2DACF] px-4 py-2 flex flex-wrap items-center justify-between gap-4 text-xs font-['Chivo']">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 bg-[#BA1A1A]"></span>
            <span className="text-[#1B1B1B]">P1 Critical SLA &lt; 3h</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 bg-[#4A1525]"></span>
            <span className="text-[#1B1B1B]">Standard Aggregated Issue</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 bg-[#EAAA0F]"></span>
            <span className="text-[#1B1B1B]">Visibility Gap (Low Volume, High Need)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[12px] text-[#F2A900]">▲</span>
            <span className="text-[#1B1B1B]">Linked to Active Public Works Tender</span>
          </div>
        </div>

        <div className="text-[11px] text-[#544344]">
          Click pin to inspect cluster • 1 Problem, Not 50 Tickets
        </div>
      </div>
    </div>
  );
}
