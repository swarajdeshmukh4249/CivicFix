import { createContext, useContext, useState, useMemo } from 'react';
import type {
  CivicIssue,
  DashboardMetrics,
  FieldSquad,
} from './types';

// Authentic Pune Municipal Corporation photo references
const PHOTO_WATER_BURST = 'https://lh3.googleusercontent.com/aida-public/AB6AXuDZh1ARAP6h6eNC5oMDaTa9xAZzfh-tB3jQtY-ICKMcdObn7FjB3U90Pno6h6VQ-HEmjCFzuvr9uLBfb1McrdeMjVxSmWAZjiMfN9vhDLsqBca3YZj5_F_4YPYIzixT30StWnZILH6SGPuiJT6WefiQQIgI2hDKxcXhooXxIYD0TJb6pXLcqwsi8atjoV9bf4BxeTs2LKJJbq8OgeeZu4l9EoegNGNdjSJxjk3pEnLaRi4qhmkMEXY1';
const PHOTO_POTHOLE_TRENCH = 'https://lh3.googleusercontent.com/aida-public/AB6AXuAyJbjYf__QxBSq_MxvHU87mtEC5UTPZfV9GDENWKtYnidwE5Gr6pp13xt7MG1yHWnCvWjIqrEdK-FZgYM2Xq601o0GiUcLgwbM1Oqcx3F1Vtw5j0sejIE25L1kp6OACKkxgHONDUvY0I6t2FtiGSqVdTubBRWKNBJmlBlEpYd2bykpkPMQm-BW2LDFn65lHx2dbn8wZTrMTMaFKS_IvjfvqPrDBk7SxxBTtZsczu2wmL5uNySOTsgL';
const PHOTO_DRAIN_BEFORE = 'https://lh3.googleusercontent.com/aida-public/AB6AXuArOiMj54MiQLXpESyrItof07KOLqqeif6px3NfV-_TH4jxkClZKO_3QS8f8cjwSDglPktNt5YohJM-wmCKiNdfwLnVvbit1euiCBxo4vLsSj6Hoixz_BK-xVhNrNQXUYGmussO_k74wUdFIATJ6Ju7fHzppB4YhDeMWS8ZvkhlsAZievuvAAuWmvo249jp9jCMTPV1gjVQAIvC86OpM4rLfdNOVo5KXdj0mlawOMZyFIRMBuh07Q53';
const PHOTO_DRAIN_AFTER = 'https://lh3.googleusercontent.com/aida-public/AB6AXuAIia5bIIRLK9D1C0ika6iLxpa_6SbsStivsLO42UrNuoeu2LLxvLM7fJHBdDx3qODo-94PfNP9JroC_MUvl4lx1hVp8o3feqrE9JLod3X2nkForQYTVFZhqf6EvN-DytW1ouLVspaDmga0l27ot4Eyw3iDEjU_Yn0HFwZM0ETu3kcdNAW5Jcm8QlyIIcR-_mRCL-KMmu1LIIdYoJajaHK7mZL_6XYl7735UiMnO7IXZIwyjq_oNIVE';

export const INITIAL_SQUADS: FieldSquad[] = [
  {
    id: 'squad-alpha-4',
    name: 'Squad Alpha-4 (Rapid Water & Hydraulics)',
    leadOfficer: 'Inspector Sachin Shinde (ID: PMC-408)',
    contactNumber: '+91 98220 14890',
    vehiclePlate: 'MH-12-PMC-4401 (E-Utility)',
    zone: 'Zone 3 (Kothrud/Karve)',
    status: 'Available',
    currentCoordinates: [18.5085, 73.8049],
    etaMinutes: 12,
    specialtyEquipment: ['Hydraulic Valve Clamp', 'Trench Sump Pump (450L/min)', 'Sub-surface Acoustic Leak Detector']
  },
  {
    id: 'squad-unit-b2',
    name: 'Unit B-2 (Civil Works & Road Surface)',
    leadOfficer: 'Supervisor Santosh Pawar (ID: PMC-409)',
    contactNumber: '+91 98220 33412',
    vehiclePlate: 'MH-12-PMC-8819 (Heavy Tipper)',
    zone: 'Zone 2 (Aundh-Baner)',
    status: 'On Site',
    currentCoordinates: [18.5580, 73.7935],
    etaMinutes: 24,
    specialtyEquipment: ['Cold Bitumen Compactor', 'Reinforced Cast-iron Grate Hoist', 'High-temp Mastic Sprayer']
  },
  {
    id: 'squad-rr-07',
    name: 'Rapid Response Squad #07 (Drainage & Silt)',
    leadOfficer: 'Foreman Rajesh Gokhale (ID: PMC-412)',
    contactNumber: '+91 98220 55198',
    vehiclePlate: 'MH-12-PMC-1294 (Jetting Machine)',
    zone: 'Zone 1 (Shivajinagar/Deccan)',
    status: 'Available',
    currentCoordinates: [18.5201, 73.8418],
    etaMinutes: 18,
    specialtyEquipment: ['High-velocity Jetting Vacuum', 'CCTV Pipe Inspection Rover', 'Biochemical De-odourizer']
  }
];

export const INITIAL_ISSUES: CivicIssue[] = [
  {
    id: 'CF-1042',
    pmcTicketNumber: 'PMC-2024-8841',
    title: 'High-Pressure Water Main Rupture & Curb Flooding',
    category: 'water_supply',
    categoryLabel: 'Water Mains / Pipe Rupture',
    wardId: 14,
    wardName: 'Ward 14 (Kothrud)',
    sector: 'Sector 14-A',
    landmark: 'Paud Road, near Kinara Hotel & PMT Bus Depot',
    coordinates: [18.5089, 73.8052],

    // 1 Problem, Not 50 Tickets: Clustered 14 citizen reports into 1
    clusteredReportsCount: 14,
    clusterRadiusMeters: 85,
    clusterApproval: { status: 'Approved', approvedBy: 'Ward Officer Kulkarni' },
    reports: [
      {
        id: 'REP-401',
        source: 'WhatsApp',
        citizenName: 'Aditya Deshpande',
        citizenPhone: '+91 98221 *****',
        timestamp: 'Today, 07:18 AM',
        description: 'Huge water gusher from road joint near Kinara hotel. Pressure is eroding the asphalt and flooding shops.',
        photoUrl: PHOTO_WATER_BURST,
        landmark: 'Paud Road Kinara Hotel',
        coordinates: [18.5089, 73.8052],
        sentiment: 'critical'
      },
      {
        id: 'REP-402',
        source: 'PMC Citizen App',
        citizenName: 'Sneha Kadam',
        citizenPhone: '+91 98222 *****',
        timestamp: 'Today, 07:29 AM',
        description: 'Clean drinking water getting wasted on road for last 45 minutes. Traffic is halted.',
        landmark: 'Near Kothrud Bus Depot',
        coordinates: [18.5091, 73.8050],
        sentiment: 'critical'
      },
      {
        id: 'REP-403',
        source: 'IVR Helpline',
        citizenName: 'Ganesh Joshi',
        citizenPhone: '+91 98223 *****',
        timestamp: 'Today, 07:44 AM',
        description: 'पाउड रस्त्यावर पाईप फुटला आहे. भरपूर पाणी वाहत आहे.',
        landmark: 'Paud Road Opp Petrol Pump',
        coordinates: [18.5088, 73.8054],
        sentiment: 'frustrated'
      }
    ],

    // Explainable Priority: 92/100
    priority: {
      score: 92,
      tier: 'P1 Critical',
      slaHours: 2.75,
      factors: {
        recurrence: { label: 'Recurrence Factor', points: 25, weight: 25, reason: '3rd pressurized joint failure on this conduit in 60 days' },
        safetyRisk: { label: 'Safety / Subsurface Undermining', points: 24, weight: 25, reason: 'High-pressure wash undermining sub-base under transit lane' },
        majorRoad: { label: 'Arterial Corridor Classification', points: 23, weight: 25, reason: 'Paud Road Corridor 4 (High-density public bus route)' },
        publicExposure: { label: 'Public Exposure & Grievance', points: 20, weight: 25, reason: 'Impacts 18,000+ direct residents & morning peak commute' }
      },
      formulaString: '+25 Recurrence, +24 Safety Risk, +23 Major Road, +20 Public Exposure'
    },
    priorityApproval: { overridden: false },

    // Civic Visibility Gap: false
    isVisibilityGap: false,

    // Work -> Outcome Check (The Killer Feature!)
    linkedWork: {
      id: 'WRK-WTR-2023-88',
      scheme: 'AMRUT 2.0',
      projectName: '24x7 Water Supply Distribution Pipeline Upgradation (Package 4A - Paud Corridor)',
      tenderNumber: 'PMC/WTR/2023/88',
      contractorName: 'Navnirman Infra & Hydro Ltd',
      sanctionedBudget: '₹1.42 Crores',
      awardedDate: '15 Jan 2023',
      completedDate: '18 Nov 2023',
      warrantyEndDate: '17 Nov 2025',
      contractorContact: 'Er. R. Singhania (+91 99210 44102)',
      isWithinDLP: true,
      defectPenaltyClauses: 'Clause 14.2: Contractor strictly liable for 100% emergency repair costs and ₹50,000/day civil penalty for pressurized distribution bursts occurring within 24-month DLP.'
    },
    isPostCompletionRecurrence: true,
    recurrenceLatencyDays: 78,
    contractorWarrantyStatus: 'Under Warranty (Defect Liability Active)',

    lifecycleStage: 'Prioritized',
    assignedSquad: INITIAL_SQUADS[0],
    dispatchApproval: { confirmed: false },
    materialsChecklist: [
      { item: '600mm High-Pressure Ductile Iron Pipe Sleeve', requiredQty: '1 Unit', checked: false },
      { item: 'Cold Rubber Flange Joint Gasket (EPDM)', requiredQty: '2 Sets', checked: false },
      { item: 'Asphalt Trench Cold Mix (40kg bags)', requiredQty: '6 Bags', checked: false }
    ],
    resolutionAudit: {
      audited: false,
      status: 'Pending',
      beforePhotoUrl: PHOTO_WATER_BURST,
      afterPhotoUrl: PHOTO_DRAIN_AFTER,
      dualGpsConfidence: 98.8,
      parallaxCheck: 'Passed',
      contractorDeductionInitiated: false,
      officialComments: ''
    },
    createdAt: '2024-03-24T07:18:00Z',
    updatedAt: '2024-03-24T08:05:00Z'
  },

  {
    id: 'CF-1039',
    pmcTicketNumber: 'PMC-2024-8839',
    title: 'Exposed Deep Trench Pothole on Flyover Curved Ramp',
    category: 'pothole_road',
    categoryLabel: 'Road Works / Deep Trench',
    wardId: 14,
    wardName: 'Ward 14 (Kothrud)',
    sector: 'Sector 14-B',
    landmark: 'Paud Phata Flyover Curved Ramp Incline',
    coordinates: [18.5132, 73.8214],

    clusteredReportsCount: 8,
    clusterRadiusMeters: 40,
    clusterApproval: { status: 'Approved', approvedBy: 'Ward Officer Kulkarni' },
    reports: [
      {
        id: 'REP-390',
        source: 'Twitter/X',
        citizenName: 'Pune Traffic Watch',
        citizenPhone: 'Public Alert',
        timestamp: 'Today, 06:45 AM',
        description: 'Severe deep trench on Paud Phata flyover ramp. Bikers swerving dangerously at high speed.',
        photoUrl: PHOTO_POTHOLE_TRENCH,
        landmark: 'Paud Phata Flyover Ramp',
        coordinates: [18.5132, 73.8214],
        sentiment: 'critical'
      }
    ],

    // Explainable Priority: 87/100
    priority: {
      score: 87,
      tier: 'P1 Critical',
      slaHours: 3.15,
      factors: {
        recurrence: { label: 'Recurrence Factor', points: 25, weight: 25, reason: 'Previous patch failed prematurely under heavy bus axle loads' },
        safetyRisk: { label: 'Safety Risk', points: 20, weight: 25, reason: 'High risk of two-wheeler skid on curved grade incline' },
        majorRoad: { label: 'Major Road', points: 18, weight: 25, reason: 'Main bypass linking Western bypass to city center' },
        publicExposure: { label: 'Public Exposure', points: 14, weight: 25, reason: '22,000+ daily vehicular trips on this flyover slipway' }
      },
      formulaString: '+25 Recurrence, +20 Safety Risk, +18 Major Road, +14 Public Exposure'
    },
    priorityApproval: { overridden: false },

    isVisibilityGap: false,

    // Work -> Outcome Check: Linked to MPLADS Project!
    linkedWork: {
      id: 'WRK-MPLAD-PUN-402',
      scheme: 'MPLADS',
      projectName: 'Paud Phata Flyover Asphalt Resurfacing & Mastic Wearing Coat',
      tenderNumber: 'PMC/PWD/2023/118',
      contractorName: 'Shree Sai Infratech Ltd',
      sanctionedBudget: '₹48.50 Lakhs',
      awardedDate: '04 Aug 2023',
      completedDate: '12 Dec 2023',
      warrantyEndDate: '11 Dec 2024',
      contractorContact: 'Mr. Vivek Patil (+91 98900 12891)',
      isWithinDLP: true,
      defectPenaltyClauses: 'Clause 9.4: Contractor warrants bituminous compaction against raveling and pothole formation for 12 months. Defects shall be rectified within 48h at contractor cost.'
    },
    isPostCompletionRecurrence: true,
    recurrenceLatencyDays: 65,
    contractorWarrantyStatus: 'Within 12-Month Defect Liability Period',

    lifecycleStage: 'Matched to Public Work',
    assignedSquad: INITIAL_SQUADS[1],
    dispatchApproval: { confirmed: false },
    materialsChecklist: [
      { item: 'Hot Premix Bituminous Mastic (grade VG-30)', requiredQty: '80 kg', checked: false },
      { item: 'Bitumen Tack Coat Emulsion', requiredQty: '10 Liters', checked: false },
      { item: 'High-visibility Hazard Cones', requiredQty: '4 Nos', checked: true }
    ],
    resolutionAudit: {
      audited: false,
      status: 'Pending',
      beforePhotoUrl: PHOTO_POTHOLE_TRENCH,
      afterPhotoUrl: PHOTO_DRAIN_AFTER,
      dualGpsConfidence: 99.1,
      parallaxCheck: 'Passed',
      contractorDeductionInitiated: false,
      officialComments: ''
    },
    createdAt: '2024-03-24T06:45:00Z',
    updatedAt: '2024-03-24T07:30:00Z'
  },

  {
    id: 'CF-1055',
    pmcTicketNumber: 'PMC-2024-8812',
    title: 'Underground Storm Drain Clearance & Grate Re-seating',
    category: 'drainage_sewage',
    categoryLabel: 'Drainage / Storm Sewer',
    wardId: 8,
    wardName: 'Ward 08 (Aundh-Baner)',
    sector: 'Baner Corridor',
    landmark: 'Mayur Colony Main Road, near D-Mart Lane',
    coordinates: [18.5583, 73.7938],

    clusteredReportsCount: 5,
    clusterRadiusMeters: 30,
    clusterApproval: { status: 'Approved', approvedBy: 'Deputy Commissioner Shirole' },
    reports: [
      {
        id: 'REP-312',
        source: 'PMC Citizen App',
        citizenName: 'Milind Ranade',
        citizenPhone: '+91 97640 *****',
        timestamp: 'Today, 08:14 AM',
        description: 'Storm drain completely choked with silt and plastic debris. Water backing up to shops.',
        photoUrl: PHOTO_DRAIN_BEFORE,
        landmark: 'Mayur Colony Main Road',
        coordinates: [18.5583, 73.7938],
        sentiment: 'frustrated'
      }
    ],

    // Explainable Priority: 74/100
    priority: {
      score: 74,
      tier: 'P2 Urgent',
      slaHours: 4.0,
      factors: {
        recurrence: { label: 'Recurrence Factor', points: 18, weight: 25, reason: 'Seasonal silt buildup before monsoon' },
        safetyRisk: { label: 'Safety Risk', points: 22, weight: 25, reason: 'Backflow flooding onto pedestrian walkway' },
        majorRoad: { label: 'Major Road', points: 16, weight: 25, reason: 'Secondary municipal connector road' },
        publicExposure: { label: 'Public Exposure', points: 18, weight: 25, reason: 'Commercial shopfronts affected' }
      },
      formulaString: '+18 Recurrence, +22 Safety Risk, +16 Major Road, +18 Public Exposure'
    },
    priorityApproval: { overridden: false },

    isVisibilityGap: false,
    isPostCompletionRecurrence: true,
    recurrenceLatencyDays: 42,
    contractorWarrantyStatus: 'Within 12-Month Defect Liability Period',
    lifecycleStage: 'Verified',
    assignedSquad: INITIAL_SQUADS[1],
    dispatchApproval: { confirmed: true, authorizedBy: 'Supervisor S. Pawar', dispatchTime: '08:30 AM' },
    materialsChecklist: [
      { item: '600mm Heavy-Duty Concrete Cast Iron Grate', requiredQty: '1 Unit', checked: true },
      { item: 'Hydraulic De-silting Extraction Scoop', requiredQty: '1 Unit', checked: true },
      { item: 'Bio-enzymatic Drain Clearer Concentrate', requiredQty: '5 Liters', checked: true }
    ],
    resolutionAudit: {
      audited: false,
      status: 'Pending',
      beforePhotoUrl: PHOTO_DRAIN_BEFORE,
      afterPhotoUrl: PHOTO_DRAIN_AFTER,
      dualGpsConfidence: 99.4,
      parallaxCheck: 'Passed',
      contractorDeductionInitiated: false,
      officialComments: 'Squad Unit B-2 completed silt suction and grate seating. Ready for Vigilance sign-off.'
    },
    createdAt: '2024-03-24T08:14:00Z',
    updatedAt: '2024-03-24T10:33:00Z'
  },

  {
    id: 'CF-1070',
    pmcTicketNumber: 'PMC-2024-8890',
    title: 'Civic Visibility Gap: Stormwater Siltation & Broken Kerb Stones',
    category: 'drainage_sewage',
    categoryLabel: 'Infrastructure Deficit (Low Complaint Volume vs High Need)',
    wardId: 14,
    wardName: 'Ward 14 (Kothrud)',
    sector: 'Sector 14-D (Bavdhan Lowline Basti)',
    landmark: 'Bavdhan Lowline Drainage Channel culvert',
    coordinates: [18.5011, 73.7845],

    clusteredReportsCount: 1, // Only 1 complaint because of digital divide!
    clusterRadiusMeters: 120,
    clusterApproval: { status: 'Pending' },
    reports: [
      {
        id: 'REP-110',
        source: 'IVR Helpline',
        citizenName: 'Sunita Kamble',
        citizenPhone: '+91 94220 *****',
        timestamp: 'Yesterday, 05:20 PM',
        description: 'गटाराचे पाणी साचून राहिले आहे. डास झाले आहेत.',
        landmark: 'Bavdhan Culvert near ZP School',
        coordinates: [18.5011, 73.7845],
        sentiment: 'moderate'
      }
    ],

    priority: {
      score: 79,
      tier: 'P2 Urgent',
      slaHours: 6.0,
      factors: {
        recurrence: { label: 'Recurrence Factor', points: 15, weight: 25, reason: 'Historical pre-monsoon chronic inundation zone' },
        safetyRisk: { label: 'Safety / Public Health Risk', points: 26, weight: 25, reason: 'High vector disease vulnerability (Dengue/Malaria cluster zone)' },
        majorRoad: { label: 'Road / Culvert Impact', points: 18, weight: 25, reason: 'Single access road for 3,400 settlement residents' },
        publicExposure: { label: 'Vulnerability Index', points: 20, weight: 25, reason: 'Low smartphone reporting density vs extreme physical siltation' }
      },
      formulaString: '+15 Recurrence, +26 Safety Risk, +18 Culvert Impact, +20 Vulnerability Index'
    },
    priorityApproval: { overridden: false },

    // CIVIC VISIBILITY GAP FLAG!
    isVisibilityGap: true,
    visibilityGapDetails: {
      sensorDecayIndex: 91,
      telemetrySource: 'PMC IoT Ultrasonic Silt Sensor #SLT-14-09 + GIS Topographic Inundation Layer',
      reportingDeficitPercent: 86,
      proactiveRecommendation: 'Low citizen ticket volume (only 1 report logged) contradicts critical IoT silt reading (91/100). System recommends immediate PROACTIVE FIELD VERIFICATION PATROL rather than awaiting citizen complaints.'
    },

    isPostCompletionRecurrence: false,
    recurrenceLatencyDays: 0,
    contractorWarrantyStatus: 'No linked public work / proactive inspection pending',
    lifecycleStage: 'Reported',
    dispatchApproval: { confirmed: false },
    materialsChecklist: [
      { item: 'Silt Vacuum Truck Extraction Kit', requiredQty: '1 Unit', checked: false },
      { item: 'Pre-cast Concrete Kerbstone replacement', requiredQty: '8 Units', checked: false }
    ],
    resolutionAudit: {
      audited: false,
      status: 'Pending',
      beforePhotoUrl: PHOTO_DRAIN_BEFORE,
      afterPhotoUrl: PHOTO_DRAIN_AFTER,
      dualGpsConfidence: 97.2,
      parallaxCheck: 'Passed',
      contractorDeductionInitiated: false,
      officialComments: ''
    },
    createdAt: '2024-03-24T05:20:00Z',
    updatedAt: '2024-03-24T08:00:00Z'
  },

  {
    id: 'CF-1028',
    pmcTicketNumber: 'PMC-2024-8798',
    title: 'High-Mast Streetlight Junction Relay Burnout',
    category: 'streetlight',
    categoryLabel: 'Streetlight & Electrical Grid',
    wardId: 21,
    wardName: 'Ward 21 (Shivajinagar)',
    sector: 'FC Road Junction',
    landmark: 'Fergusson College Road & Goodluck Cafe Chowk',
    coordinates: [18.5204, 73.8421],

    clusteredReportsCount: 6,
    clusterRadiusMeters: 60,
    clusterApproval: { status: 'Approved', approvedBy: 'Ward Officer Joshi' },
    reports: [
      {
        id: 'REP-201',
        source: 'PMC Citizen App',
        citizenName: 'Rahul Mehta',
        citizenPhone: '+91 98230 *****',
        timestamp: 'Yesterday, 09:30 PM',
        description: 'Complete blackout at Goodluck chowk high mast. Traffic signals flickering.',
        landmark: 'Goodluck Cafe Chowk',
        coordinates: [18.5204, 73.8421],
        sentiment: 'critical'
      }
    ],

    priority: {
      score: 68,
      tier: 'P2 Urgent',
      slaHours: 5.0,
      factors: {
        recurrence: { label: 'Recurrence', points: 14, weight: 25, reason: 'Repeated voltage surge trips' },
        safetyRisk: { label: 'Night Pedestrian Safety', points: 22, weight: 25, reason: 'High footfall student district with multiple blind pedestrian crossings' },
        majorRoad: { label: 'FC Road Arterial', points: 18, weight: 25, reason: 'Major central Pune high street' },
        publicExposure: { label: 'Public Exposure', points: 14, weight: 25, reason: 'Busy commercial eatery hub' }
      },
      formulaString: '+14 Recurrence, +22 Safety Risk, +18 FC Road Arterial, +14 Public Exposure'
    },
    priorityApproval: { overridden: false },

    isVisibilityGap: false,
    lifecycleStage: 'Matched to Public Work',
    linkedWork: {
      id: 'WRK-PMC-ELEC-2023',
      scheme: 'Municipal Ward Fund',
      projectName: 'Shivajinagar High-Mast LED Conversion & Smart Junction Lighting',
      tenderNumber: 'PMC/ELEC/2023/45',
      contractorName: 'Prabhat Electricals & Power Systems',
      sanctionedBudget: '₹22.40 Lakhs',
      awardedDate: '10 Feb 2023',
      completedDate: '30 Jul 2023',
      warrantyEndDate: '29 Jul 2026',
      contractorContact: 'Mr. S. Kulkarni (+91 98224 88190)',
      isWithinDLP: true,
      defectPenaltyClauses: 'Clause 6.1: 3-Year comprehensive warranty on LED drivers and contactor relays.'
    },
    isPostCompletionRecurrence: true,
    recurrenceLatencyDays: 230,
    contractorWarrantyStatus: 'Within 36-Month Comprehensive Warranty',

    assignedSquad: INITIAL_SQUADS[2],
    dispatchApproval: { confirmed: false },
    materialsChecklist: [
      { item: '63A 4-Pole Contactor Switch Unit', requiredQty: '1 Unit', checked: false },
      { item: '10kA Surge Protection Device (SPD)', requiredQty: '1 Unit', checked: false }
    ],
    resolutionAudit: {
      audited: false,
      status: 'Pending',
      beforePhotoUrl: PHOTO_POTHOLE_TRENCH,
      afterPhotoUrl: PHOTO_DRAIN_AFTER,
      dualGpsConfidence: 96.5,
      parallaxCheck: 'Passed',
      contractorDeductionInitiated: false,
      officialComments: ''
    },
    createdAt: '2024-03-23T21:30:00Z',
    updatedAt: '2024-03-24T06:00:00Z'
  }
];

export type NavigationTab = 'ward-dashboard' | 'field-dispatch' | 'reviewer-console';

interface SentinelContextType {
  issues: CivicIssue[];
  squads: FieldSquad[];
  selectedIssueId: string;
  selectedIssue: CivicIssue | undefined;
  activeTab: NavigationTab;
  categoryFilter: string;
  priorityFilter: string;
  searchQuery: string;
  activeWard: string;
  metrics: DashboardMetrics;

  // Setters
  setActiveTab: (tab: NavigationTab) => void;
  setSelectedIssueId: (id: string) => void;
  setCategoryFilter: (category: string) => void;
  setPriorityFilter: (priority: string) => void;
  setSearchQuery: (query: string) => void;
  setActiveWard: (ward: string) => void;

  // Core Intelligence Actions
  approveCluster: (issueId: string) => void;
  overridePriority: (issueId: string, factorKey: keyof CivicIssue['priority']['factors'], newPoints: number, reason: string) => void;
  confirmDispatch: (issueId: string, squadId: string) => void;
  toggleMaterialCheck: (issueId: string, materialIndex: number) => void;
  signOffResolution: (issueId: string, status: 'Approved' | 'Flagged Defect' | 'Rejected', comments: string, penaltyInitiated?: boolean) => void;
  triggerProactivePatrol: (issueId: string) => void;
  flagContractorDefectNotice: (issueId: string, reason: string) => void;
}

const SentinelContext = createContext<SentinelContextType | null>(null);

export function SentinelProvider({ children }: { children: React.ReactNode }) {
  const [issues, setIssues] = useState<CivicIssue[]>(INITIAL_ISSUES);
  const [squads] = useState<FieldSquad[]>(INITIAL_SQUADS);
  const [selectedIssueId, setSelectedIssueId] = useState<string>('CF-1042');
  const [activeTab, setActiveTab] = useState<NavigationTab>('ward-dashboard');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeWard, setActiveWard] = useState<string>('14');

  const selectedIssue = useMemo(
    () => issues.find((i) => i.id === selectedIssueId) ?? issues[0],
    [issues, selectedIssueId]
  );

  // Compute live dashboard metrics
  const metrics: DashboardMetrics = useMemo(() => {
    const totalIncoming = issues.reduce((acc, curr) => acc + curr.clusteredReportsCount, 0);
    const p1s = issues.filter((i) => i.priority.tier === 'P1 Critical').length;
    const visibilityGaps = issues.filter((i) => i.isVisibilityGap).length;
    const recurrences = issues.filter((i) => i.isPostCompletionRecurrence).length;

    return {
      totalIncomingReports: totalIncoming + 29, // include archived
      clusteredIssuesCount: issues.length,
      activeP1Count: p1s,
      visibilityGapsDetected: visibilityGaps,
      postCompletionRecurrences: recurrences,
      avgSlaResponseTimeHours: 3.2,
      contractorDefectRecoveries: '₹14.25 L'
    };
  }, [issues]);

  // Core Actions
  const approveCluster = (issueId: string) => {
    setIssues((prev) =>
      prev.map((iss) =>
        iss.id === issueId
          ? {
              ...iss,
              clusterApproval: { status: 'Approved', approvedBy: 'Ward Officer (Verified)' },
              lifecycleStage: iss.lifecycleStage === 'Reported' ? 'Clustered' : iss.lifecycleStage
            }
          : iss
      )
    );
  };

  const overridePriority = (
    issueId: string,
    factorKey: keyof CivicIssue['priority']['factors'],
    newPoints: number,
    reason: string
  ) => {
    setIssues((prev) =>
      prev.map((iss) => {
        if (iss.id !== issueId) return iss;
        const currentFactors = { ...iss.priority.factors };
        currentFactors[factorKey] = {
          ...currentFactors[factorKey],
          points: newPoints,
          reason: `${currentFactors[factorKey].reason} (Officer override: ${reason})`
        };
        const newScore = Math.min(
          100,
          Math.max(
            0,
            currentFactors.recurrence.points +
              currentFactors.safetyRisk.points +
              currentFactors.majorRoad.points +
              currentFactors.publicExposure.points
          )
        );
        const newTier = newScore >= 80 ? 'P1 Critical' : newScore >= 60 ? 'P2 Urgent' : 'P3 Standard';

        return {
          ...iss,
          priority: {
            ...iss.priority,
            score: newScore,
            tier: newTier,
            factors: currentFactors,
            formulaString: `+${currentFactors.recurrence.points} Recurrence, +${currentFactors.safetyRisk.points} Safety Risk, +${currentFactors.majorRoad.points} Major Road, +${currentFactors.publicExposure.points} Public Exposure`
          },
          priorityApproval: {
            overridden: true,
            originalScore: iss.priority.score,
            reason
          },
          lifecycleStage: iss.lifecycleStage === 'Clustered' ? 'Prioritized' : iss.lifecycleStage
        };
      })
    );
  };

  const confirmDispatch = (issueId: string, squadId: string) => {
    const squad = squads.find((s) => s.id === squadId);
    setIssues((prev) =>
      prev.map((iss) =>
        iss.id === issueId
          ? {
              ...iss,
              assignedSquad: squad,
              dispatchApproval: {
                confirmed: true,
                authorizedBy: 'Assistant Commissioner A. Kulkarni',
                dispatchTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              },
              lifecycleStage: 'Dispatched'
            }
          : iss
      )
    );
  };

  const toggleMaterialCheck = (issueId: string, materialIndex: number) => {
    setIssues((prev) =>
      prev.map((iss) => {
        if (iss.id !== issueId) return iss;
        const updated = [...iss.materialsChecklist];
        updated[materialIndex] = {
          ...updated[materialIndex],
          checked: !updated[materialIndex].checked
        };
        return { ...iss, materialsChecklist: updated };
      })
    );
  };

  const signOffResolution = (
    issueId: string,
    status: 'Approved' | 'Flagged Defect' | 'Rejected',
    comments: string,
    penaltyInitiated: boolean = false
  ) => {
    setIssues((prev) =>
      prev.map((iss) =>
        iss.id === issueId
          ? {
              ...iss,
              lifecycleStage: status === 'Approved' ? 'Resolved' : 'Verified',
              resolutionAudit: {
                ...iss.resolutionAudit,
                audited: true,
                status,
                auditedBy: 'Chief Vigilance & Quality Officer (PMC Data Center)',
                auditDate: new Date().toLocaleDateString('en-GB'),
                officialComments: comments,
                contractorDeductionInitiated: penaltyInitiated
              }
            }
          : iss
      )
    );
  };

  const triggerProactivePatrol = (issueId: string) => {
    setIssues((prev) =>
      prev.map((iss) =>
        iss.id === issueId
          ? {
              ...iss,
              assignedSquad: squads[0],
              dispatchApproval: {
                confirmed: true,
                authorizedBy: 'Proactive Visibility Gap Protocol (Auto-Patrol)',
                dispatchTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              },
              lifecycleStage: 'Dispatched'
            }
          : iss
      )
    );
  };

  const flagContractorDefectNotice = (issueId: string, reason: string) => {
    setIssues((prev) =>
      prev.map((iss) =>
        iss.id === issueId
          ? {
              ...iss,
              resolutionAudit: {
                ...iss.resolutionAudit,
                status: 'Flagged Defect',
                contractorDeductionInitiated: true,
                officialComments: `LEGAL NOTICE ISSUED: ${reason}. Security deposit deduction initiated under Defect Liability Clause.`
              }
            }
          : iss
      )
    );
  };

  return (
    <SentinelContext.Provider
      value={{
        issues,
        squads,
        selectedIssueId,
        selectedIssue,
        activeTab,
        categoryFilter,
        priorityFilter,
        searchQuery,
        activeWard,
        metrics,
        setActiveTab,
        setSelectedIssueId,
        setCategoryFilter,
        setPriorityFilter,
        setSearchQuery,
        setActiveWard,
        approveCluster,
        overridePriority,
        confirmDispatch,
        toggleMaterialCheck,
        signOffResolution,
        triggerProactivePatrol,
        flagContractorDefectNotice
      }}
    >
      {children}
    </SentinelContext.Provider>
  );
}

export function useSentinel() {
  const ctx = useContext(SentinelContext);
  if (!ctx) throw new Error('useSentinel must be used within SentinelProvider');
  return ctx;
}
