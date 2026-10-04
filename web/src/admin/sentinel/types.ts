export type IssueCategory =
  | 'water_supply'
  | 'pothole_road'
  | 'drainage_sewage'
  | 'streetlight'
  | 'garbage_waste'
  | 'encroachment';

export type LifecycleStage =
  | 'Reported'
  | 'Clustered'
  | 'Prioritized'
  | 'Matched to Public Work'
  | 'Verified'
  | 'Dispatched'
  | 'Resolved';

export interface CitizenReport {
  id: string;
  source: 'WhatsApp' | 'PMC Citizen App' | 'IVR Helpline' | 'Twitter/X' | 'Field Patrol';
  citizenName: string;
  citizenPhone: string;
  timestamp: string;
  description: string;
  photoUrl?: string;
  landmark: string;
  coordinates: [number, number];
  sentiment: 'critical' | 'frustrated' | 'moderate';
}

export interface PriorityFactor {
  label: string;
  points: number;
  weight: number;
  reason: string;
}

export interface ExplainablePriority {
  score: number; // 0 to 100
  tier: 'P1 Critical' | 'P2 Urgent' | 'P3 Standard';
  slaHours: number;
  factors: {
    recurrence: PriorityFactor;
    safetyRisk: PriorityFactor;
    majorRoad: PriorityFactor;
    publicExposure: PriorityFactor;
  };
  formulaString: string; // e.g. "+25 Recurrence, +20 Safety Risk, +18 Major Road, +14 Public Exposure"
}

export interface LinkedPublicWork {
  id: string;
  scheme: 'MPLADS' | 'PMC Smart City' | 'Municipal Ward Fund' | 'AMRUT 2.0';
  projectName: string;
  tenderNumber: string;
  contractorName: string;
  sanctionedBudget: string; // e.g. "₹48.50 Lakhs"
  awardedDate: string;
  completedDate: string;
  warrantyEndDate: string; // Defect Liability Period (DLP)
  contractorContact: string;
  isWithinDLP: boolean; // Defect Liability Period active?
  defectPenaltyClauses: string;
}

export interface FieldSquad {
  id: string;
  name: string;
  leadOfficer: string;
  contactNumber: string;
  vehiclePlate: string;
  zone: string;
  status: 'Available' | 'En Route' | 'On Site' | 'Refueling';
  currentCoordinates: [number, number];
  etaMinutes: number;
  specialtyEquipment: string[];
}

export interface VerificationMaterial {
  item: string;
  requiredQty: string;
  checked: boolean;
  notes?: string;
}

export interface ResolutionAuditData {
  audited: boolean;
  status: 'Pending' | 'Approved' | 'Flagged Defect' | 'Rejected';
  auditedBy?: string;
  auditDate?: string;
  beforePhotoUrl: string;
  afterPhotoUrl: string;
  dualGpsConfidence: number; // e.g. 99.4%
  parallaxCheck: 'Passed' | 'Discrepancy';
  contractorDeductionInitiated: boolean;
  officialComments: string;
}

export interface CivicIssue {
  id: string; // e.g. "CF-1042"
  pmcTicketNumber: string; // e.g. "PMC-2024-8841"
  title: string;
  category: IssueCategory;
  categoryLabel: string;
  wardId: number;
  wardName: string; // e.g. "Ward 14 (Kothrud)"
  sector: string; // e.g. "Sector 14-A"
  landmark: string;
  coordinates: [number, number];
  
  // 1 Problem, Not 50 Tickets (Clustering)
  clusteredReportsCount: number;
  clusterRadiusMeters: number;
  reports: CitizenReport[];
  clusterApproval: {
    status: 'Approved' | 'Pending' | 'Overridden';
    approvedBy?: string;
  };

  // Explainable Priority
  priority: ExplainablePriority;
  priorityApproval: {
    overridden: boolean;
    originalScore?: number;
    reason?: string;
  };

  // Civic Visibility Gap
  isVisibilityGap: boolean;
  visibilityGapDetails?: {
    sensorDecayIndex: number; // 0 - 100
    telemetrySource: string;
    reportingDeficitPercent: number; // e.g. 84% quiet
    proactiveRecommendation: string;
  };

  // Work -> Outcome Check (The Killer Feature)
  linkedWork?: LinkedPublicWork;
  isPostCompletionRecurrence: boolean;
  recurrenceLatencyDays?: number; // Days after completion
  contractorWarrantyStatus?: string;

  // Field Verification & Dispatch
  lifecycleStage: LifecycleStage;
  assignedSquad?: FieldSquad;
  dispatchApproval: {
    confirmed: boolean;
    authorizedBy?: string;
    dispatchTime?: string;
  };
  
  // Field Verification Capture
  materialsChecklist: VerificationMaterial[];
  fieldOfficerNotes?: string;
  fieldOfficerSignature?: string;

  // Reviewer / Vigilance Resolution Audit
  resolutionAudit: ResolutionAuditData;

  createdAt: string;
  updatedAt: string;
}

export interface DashboardMetrics {
  totalIncomingReports: number;
  clusteredIssuesCount: number;
  activeP1Count: number;
  visibilityGapsDetected: number;
  postCompletionRecurrences: number;
  avgSlaResponseTimeHours: number;
  contractorDefectRecoveries: string;
}
