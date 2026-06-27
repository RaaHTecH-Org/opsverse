export interface Incident {
  id: string;
  title: string;
  description: string;
  priority: "critical" | "high" | "medium" | "low";
  status: "open" | "in-progress" | "resolved" | "closed";
  assignedTeam: string;
  affectedSystem: string;
  aiSummary: string;
  createdAt: string;
  updatedAt: string;
  resolutionNotes?: string;
}

export interface ServiceRequest {
  id: string;
  requestType: string;
  description: string;
  requestor: string;
  department: string;
  approvalStatus: "pending" | "approved" | "rejected";
  workflowStage: "submitted" | "manager-approval" | "it-provisioning" | "completed" | "closed";
  assignedTeam: string;
  status: "open" | "in-progress" | "fulfilled" | "closed";
  createdAt: string;
  fulfillmentEta: string;
}

export interface Asset {
  id: string;
  assetType: string;
  owner: string;
  department: string;
  status: "active" | "maintenance" | "retired";
  complianceState: "compliant" | "non-compliant" | "warning" | "unknown";
  lifecycleStage: "deployed" | "provisioning" | "decommissioning" | "end-of-life";
  location: string;
  lastCheckIn: string;
}

export const incidents: Incident[] = [
  { id: "INC-001", title: "Azure AD Authentication Failures", description: "Multiple users unable to authenticate via Azure AD SSO. Failure rate increased 340% in last 2 hours across all regions.", priority: "critical", status: "open", assignedTeam: "Identity Operations", affectedSystem: "Azure AD / Entra ID", aiSummary: "Correlation detected with Azure AD token service degradation. 87% probability of upstream Microsoft identity platform issue. Recommend enabling fallback auth and opening Microsoft support ticket.", createdAt: "2026-03-07T08:15:00Z", updatedAt: "2026-03-07T09:30:00Z" },
  { id: "INC-002", title: "VPN Gateway Connectivity Loss", description: "Site-to-site VPN tunnel dropped between HQ and Azure East US. All remote workers in NA region affected.", priority: "critical", status: "in-progress", assignedTeam: "Network Operations", affectedSystem: "Azure VPN Gateway", aiSummary: "IKE phase 2 negotiation failing. Gateway health probe shows intermittent response. Similar pattern detected in INC-045 from Feb—resolved by resetting gateway instance.", createdAt: "2026-03-07T07:45:00Z", updatedAt: "2026-03-07T09:15:00Z", resolutionNotes: "Investigating IKE negotiation logs" },
  { id: "INC-003", title: "SharePoint Online Slow Performance", description: "SharePoint document libraries loading 10-15s for APAC region users. Large file uploads timing out.", priority: "high", status: "open", assignedTeam: "Cloud Services", affectedSystem: "SharePoint Online", aiSummary: "CDN edge node in Singapore showing 4x normal latency. Microsoft health dashboard confirms regional degradation. 12 users impacted based on telemetry.", createdAt: "2026-03-07T06:30:00Z", updatedAt: "2026-03-07T08:00:00Z" },
  { id: "INC-004", title: "Email Delivery Delays — Exchange Online", description: "Exchange Online intermittent delivery delays averaging 15-45 min for external recipients.", priority: "medium", status: "open", assignedTeam: "Messaging Operations", affectedSystem: "Exchange Online", aiSummary: "Transport rule 'External DLP Scan' added March 5 is queuing 23% of outbound mail. Recommend disabling rule for immediate relief while investigating.", createdAt: "2026-03-07T05:00:00Z", updatedAt: "2026-03-07T07:30:00Z" },
  { id: "INC-005", title: "MFA Push Notification Failures", description: "Microsoft Authenticator push notifications not received by ~30% of users. TOTP codes working normally.", priority: "high", status: "in-progress", assignedTeam: "Identity Operations", affectedSystem: "Azure MFA", aiSummary: "Apple Push Notification Service showing degradation. Correlates with APNS status page. Recommend enforcing SMS fallback for affected users via Conditional Access.", createdAt: "2026-03-06T22:00:00Z", updatedAt: "2026-03-07T08:45:00Z" },
  { id: "INC-006", title: "Azure SQL Database High DTU Usage", description: "Production CRM database consistently hitting 95% DTU utilization causing timeout errors for end users.", priority: "high", status: "open", assignedTeam: "Database Operations", affectedSystem: "Azure SQL", aiSummary: "Top 3 queries consuming 68% of DTU. Query #1 (report_generation SP) lacks index on transaction_date. Estimated 40% improvement with index addition.", createdAt: "2026-03-06T18:00:00Z", updatedAt: "2026-03-07T06:00:00Z" },
  { id: "INC-007", title: "Teams Meeting Recording Failures", description: "Meeting recordings not saving to OneDrive. Affects all users in Marketing department.", priority: "medium", status: "resolved", assignedTeam: "Cloud Services", affectedSystem: "Microsoft Teams", aiSummary: "OneDrive storage quota exceeded for Marketing OU. Expanded allocation from 5TB to 10TB resolved the issue.", createdAt: "2026-03-06T14:00:00Z", updatedAt: "2026-03-07T02:00:00Z", resolutionNotes: "Expanded OneDrive storage allocation for Marketing OU" },
  { id: "INC-008", title: "Defender Alert: Suspicious Sign-in Activity", description: "Multiple sign-in attempts from unusual locations (Eastern Europe) detected for 3 executive accounts.", priority: "critical", status: "open", assignedTeam: "Security Operations", affectedSystem: "Microsoft Defender", aiSummary: "Password spray attack pattern detected targeting C-suite accounts. IP addresses match known threat actor infrastructure. IMMEDIATE: Reset passwords, revoke sessions, enforce location-based CA policy.", createdAt: "2026-03-07T09:00:00Z", updatedAt: "2026-03-07T09:30:00Z" },
  { id: "INC-009", title: "Intune Device Compliance Drift", description: "52 Windows devices showing non-compliant status after March policy update. Blocking conditional access.", priority: "medium", status: "open", assignedTeam: "Endpoint Management", affectedSystem: "Microsoft Intune", aiSummary: "New BitLocker policy requires TPM 2.0. 52 devices have TPM 1.2. Recommend creating exception group or initiating hardware refresh for affected devices.", createdAt: "2026-03-06T16:00:00Z", updatedAt: "2026-03-07T04:00:00Z" },
  { id: "INC-010", title: "Power Automate Flow Failures", description: "Automated approval workflows failing silently. 15 purchase order approvals stuck in queue.", priority: "low", status: "open", assignedTeam: "Automation Team", affectedSystem: "Power Automate", aiSummary: "SharePoint connector OAuth token expired March 6. Re-authentication required. This is a recurring issue—recommend implementing token refresh automation.", createdAt: "2026-03-06T12:00:00Z", updatedAt: "2026-03-06T18:00:00Z" },
  { id: "INC-011", title: "Azure DevOps Pipeline Timeouts", description: "CI/CD pipelines timing out during build stage. Average build time increased from 8min to 45min.", priority: "medium", status: "resolved", assignedTeam: "DevOps Engineering", affectedSystem: "Azure DevOps", aiSummary: "Self-hosted agent pool exhausted. Build queue backed up to 23 jobs. Added 3 additional agents resolved backlog.", createdAt: "2026-03-05T20:00:00Z", updatedAt: "2026-03-06T10:00:00Z", resolutionNotes: "Added 3 additional build agents to pool" },
  { id: "INC-012", title: "Conditional Access Policy Blocking Legitimate Users", description: "New CA policy blocking VPN users from accessing M365 apps. 85 support tickets in last 4 hours.", priority: "high", status: "in-progress", assignedTeam: "Identity Operations", affectedSystem: "Azure AD / Entra ID", aiSummary: "CA policy 'Require Compliant Device' not excluding VPN IP ranges in named locations. Recommend adding corporate VPN exit IPs to trusted locations immediately.", createdAt: "2026-03-07T07:00:00Z", updatedAt: "2026-03-07T09:00:00Z" },
  { id: "INC-013", title: "Outlook Desktop Client Crashes", description: "Outlook 365 desktop client crashing on launch for users with shared mailboxes. Build 16.0.17328 affected.", priority: "medium", status: "open", assignedTeam: "Desktop Support", affectedSystem: "Microsoft 365", aiSummary: "Known issue with Outlook build 16.0.17328 and shared mailbox rendering. Microsoft KB5034567 patch available. Recommend pushing update via Intune.", createdAt: "2026-03-07T06:00:00Z", updatedAt: "2026-03-07T08:00:00Z" },
  { id: "INC-014", title: "Defender Endpoint Sensor Offline", description: "18 endpoint sensors reporting offline status in Defender for Endpoint. Last check-in 12+ hours ago.", priority: "high", status: "open", assignedTeam: "Security Operations", affectedSystem: "Microsoft Defender", aiSummary: "Affected endpoints are all running Windows 10 21H2 (EOL). Sensor version requires OS update. Critical security gap—these endpoints have no EDR coverage.", createdAt: "2026-03-07T05:00:00Z", updatedAt: "2026-03-07T07:00:00Z" },
];

export const serviceRequests: ServiceRequest[] = [
  { id: "SR-001", requestType: "Software Access", description: "Request access to Power BI Pro license for quarterly reporting", requestor: "Sarah Chen", department: "Finance", approvalStatus: "pending", workflowStage: "manager-approval", assignedTeam: "License Management", status: "open", createdAt: "2026-03-07T09:00:00Z", fulfillmentEta: "2026-03-08T17:00:00Z" },
  { id: "SR-002", requestType: "VPN Access", description: "Remote VPN access for contractor — Project Mercury", requestor: "James Wilson", department: "Engineering", approvalStatus: "approved", workflowStage: "it-provisioning", assignedTeam: "Network Operations", status: "in-progress", createdAt: "2026-03-06T15:00:00Z", fulfillmentEta: "2026-03-07T12:00:00Z" },
  { id: "SR-003", requestType: "New Employee Onboarding", description: "Onboard new hire — Marketing department. Start date March 10.", requestor: "HR Portal", department: "Human Resources", approvalStatus: "approved", workflowStage: "it-provisioning", assignedTeam: "Identity Operations", status: "in-progress", createdAt: "2026-03-06T10:00:00Z", fulfillmentEta: "2026-03-09T17:00:00Z" },
  { id: "SR-004", requestType: "Device Replacement", description: "Replace damaged laptop — Surface Pro 9. Screen cracked.", requestor: "Michael Torres", department: "Sales", approvalStatus: "pending", workflowStage: "manager-approval", assignedTeam: "Desktop Support", status: "open", createdAt: "2026-03-07T08:00:00Z", fulfillmentEta: "2026-03-10T17:00:00Z" },
  { id: "SR-005", requestType: "SharePoint / Teams Access", description: "SharePoint site collection access for Project Aurora team (8 users)", requestor: "Lisa Park", department: "Product", approvalStatus: "approved", workflowStage: "it-provisioning", assignedTeam: "Cloud Services", status: "in-progress", createdAt: "2026-03-06T11:00:00Z", fulfillmentEta: "2026-03-07T15:00:00Z" },
  { id: "SR-006", requestType: "Software Access", description: "Adobe Creative Suite license request for brand redesign project", requestor: "David Kim", department: "Marketing", approvalStatus: "rejected", workflowStage: "closed", assignedTeam: "License Management", status: "closed", createdAt: "2026-03-05T09:00:00Z", fulfillmentEta: "N/A" },
  { id: "SR-007", requestType: "VPN Access", description: "Always-on VPN configuration for new remote office in Austin", requestor: "Network Team", department: "IT", approvalStatus: "pending", workflowStage: "manager-approval", assignedTeam: "Network Operations", status: "open", createdAt: "2026-03-07T07:30:00Z", fulfillmentEta: "2026-03-12T17:00:00Z" },
  { id: "SR-008", requestType: "Account Provisioning", description: "Bulk provisioning of 15 contractor accounts for Q2 project", requestor: "PMO Office", department: "Operations", approvalStatus: "approved", workflowStage: "it-provisioning", assignedTeam: "Identity Operations", status: "in-progress", createdAt: "2026-03-06T14:00:00Z", fulfillmentEta: "2026-03-08T17:00:00Z" },
  { id: "SR-009", requestType: "SharePoint / Teams Access", description: "Create new Teams channel and SharePoint site for Legal review board", requestor: "Amy Rodriguez", department: "Legal", approvalStatus: "approved", workflowStage: "completed", assignedTeam: "Cloud Services", status: "fulfilled", createdAt: "2026-03-05T10:00:00Z", fulfillmentEta: "2026-03-06T12:00:00Z" },
  { id: "SR-010", requestType: "New Employee Onboarding", description: "Onboard 3 new hires for Engineering. Start date March 12.", requestor: "HR Portal", department: "Human Resources", approvalStatus: "pending", workflowStage: "submitted", assignedTeam: "Identity Operations", status: "open", createdAt: "2026-03-07T08:30:00Z", fulfillmentEta: "2026-03-11T17:00:00Z" },
];

export const assets: Asset[] = [
  { id: "AST-001", assetType: "Windows Laptop", owner: "Sarah Chen", department: "Finance", status: "active", complianceState: "compliant", lifecycleStage: "deployed", location: "HQ — Floor 3", lastCheckIn: "2026-03-07T08:30:00Z" },
  { id: "AST-002", assetType: "Azure VM", owner: "IT Operations", department: "IT", status: "active", complianceState: "compliant", lifecycleStage: "deployed", location: "Azure East US", lastCheckIn: "2026-03-07T09:00:00Z" },
  { id: "AST-003", assetType: "Windows Laptop", owner: "James Wilson", department: "Engineering", status: "active", complianceState: "compliant", lifecycleStage: "deployed", location: "HQ — Floor 2", lastCheckIn: "2026-03-07T07:45:00Z" },
  { id: "AST-004", assetType: "Azure VM", owner: "Network Ops", department: "IT", status: "maintenance", complianceState: "warning", lifecycleStage: "deployed", location: "Azure West US", lastCheckIn: "2026-03-06T22:00:00Z" },
  { id: "AST-005", assetType: "Azure VM", owner: "DevOps", department: "Engineering", status: "active", complianceState: "compliant", lifecycleStage: "deployed", location: "Azure Central US", lastCheckIn: "2026-03-07T09:15:00Z" },
  { id: "AST-006", assetType: "Windows Laptop", owner: "Michael Torres", department: "Sales", status: "maintenance", complianceState: "non-compliant", lifecycleStage: "deployed", location: "HQ — Floor 1", lastCheckIn: "2026-03-05T16:00:00Z" },
  { id: "AST-007", assetType: "Security Tool License", owner: "Security Ops", department: "Security", status: "active", complianceState: "compliant", lifecycleStage: "deployed", location: "Cloud", lastCheckIn: "2026-03-07T09:00:00Z" },
  { id: "AST-008", assetType: "Mobile Device", owner: "Lisa Park", department: "Product", status: "active", complianceState: "compliant", lifecycleStage: "deployed", location: "Remote — Seattle", lastCheckIn: "2026-03-07T08:00:00Z" },
  { id: "AST-009", assetType: "M365 License", owner: "HR Department", department: "HR", status: "active", complianceState: "compliant", lifecycleStage: "deployed", location: "Cloud", lastCheckIn: "2026-03-07T09:00:00Z" },
  { id: "AST-010", assetType: "Windows Laptop", owner: "David Kim", department: "Marketing", status: "active", complianceState: "warning", lifecycleStage: "deployed", location: "Remote — Chicago", lastCheckIn: "2026-03-06T14:00:00Z" },
  { id: "AST-011", assetType: "Azure VM", owner: "Database Team", department: "IT", status: "active", complianceState: "compliant", lifecycleStage: "deployed", location: "Azure East US 2", lastCheckIn: "2026-03-07T09:10:00Z" },
  { id: "AST-012", assetType: "Mobile Device", owner: "Amy Rodriguez", department: "Legal", status: "active", complianceState: "non-compliant", lifecycleStage: "deployed", location: "HQ — Floor 4", lastCheckIn: "2026-03-04T10:00:00Z" },
  { id: "AST-013", assetType: "Security Tool License", owner: "SOC Team", department: "Security", status: "active", complianceState: "compliant", lifecycleStage: "deployed", location: "Cloud", lastCheckIn: "2026-03-07T09:00:00Z" },
  { id: "AST-014", assetType: "Windows Laptop", owner: "Tom Bradley", department: "Engineering", status: "retired", complianceState: "unknown", lifecycleStage: "end-of-life", location: "Storage — B2", lastCheckIn: "2026-01-15T09:00:00Z" },
  { id: "AST-015", assetType: "M365 License", owner: "Finance Team", department: "Finance", status: "active", complianceState: "compliant", lifecycleStage: "deployed", location: "Cloud", lastCheckIn: "2026-03-07T09:00:00Z" },
];

export const aiInsights = [
  "Multiple incidents appear related to Azure authentication failures across Entra ID services — possible upstream issue.",
  "3 service requests are awaiting manager approval. Average approval wait time: 14 hours.",
  "Security alerts increased 18% over the last 24 hours. Suspicious sign-in activity detected for executive accounts.",
  "VPN connectivity issues correlate with Azure gateway maintenance window scheduled for tonight.",
  "52 devices non-compliant after March policy update. Recommend exception group for TPM 1.2 hardware.",
  "Recommend proactive capacity review for Azure SQL production databases — DTU consistently above 90%.",
];

export const dashboardStats = {
  openIncidents: 14,
  criticalIncidents: 3,
  pendingRequests: 10,
  securityAlerts: 5,
  trackedAssets: 312,
  slaCompliance: 96.8,
  systemHealth: 94.2,
};

export const operationsChartData = [
  { name: "Mon", incidents: 8, requests: 12, resolved: 6 },
  { name: "Tue", incidents: 12, requests: 9, resolved: 10 },
  { name: "Wed", incidents: 15, requests: 14, resolved: 11 },
  { name: "Thu", incidents: 10, requests: 11, resolved: 13 },
  { name: "Fri", incidents: 14, requests: 10, resolved: 9 },
  { name: "Sat", incidents: 5, requests: 3, resolved: 7 },
  { name: "Sun", incidents: 3, requests: 2, resolved: 4 },
];

export const systemHealthData = [
  { name: "Azure AD", health: 72, status: "degraded" as const },
  { name: "Exchange", health: 88, status: "operational" as const },
  { name: "SharePoint", health: 91, status: "operational" as const },
  { name: "Teams", health: 99, status: "operational" as const },
  { name: "Intune", health: 85, status: "operational" as const },
  { name: "Defender", health: 78, status: "degraded" as const },
  { name: "Azure VPN", health: 65, status: "degraded" as const },
  { name: "Power Platform", health: 95, status: "operational" as const },
];

export const alertsNotifications = [
  { id: 1, type: "critical" as const, message: "Suspicious sign-in activity detected — 3 executive accounts", time: "9 min ago" },
  { id: 2, type: "warning" as const, message: "Azure VPN Gateway health probe failing intermittently", time: "23 min ago" },
  { id: 3, type: "critical" as const, message: "Azure AD token service degradation — auth failures rising", time: "1h ago" },
  { id: 4, type: "info" as const, message: "Scheduled maintenance: Azure East US — tonight 2:00 AM", time: "2h ago" },
  { id: 5, type: "warning" as const, message: "52 devices non-compliant after Intune policy update", time: "3h ago" },
  { id: 6, type: "info" as const, message: "New security baseline published by Microsoft — review required", time: "5h ago" },
];

// ── Root Cause Clusters ──
export interface RootCauseCluster {
  id: string;
  category: string;
  severity: "critical" | "high" | "medium";
  incidentIds: string[];
  insights: string[];
  trend: "escalating" | "stable" | "declining";
  trendHistory: number[]; // Last 7 days incident count
  firstDetected: string;
  affectedUsers: number;
  affectedServices: string[];
}

export const rootCauseClusters: RootCauseCluster[] = [
  {
    id: "rc-1",
    category: "Authentication & Identity Failures",
    severity: "critical",
    incidentIds: ["INC-001", "INC-005", "INC-012"],
    insights: [
      "Azure AD token service degradation driving 87% of auth failures across 3 linked incidents.",
      "MFA push failures correlate with APNS degradation — SMS fallback recommended.",
      "Conditional Access policy blocking VPN users compounds identity-layer outage surface.",
    ],
    trend: "escalating",
    trendHistory: [1, 1, 2, 2, 3, 4, 5],
    firstDetected: "2026-03-05T08:15:00Z",
    affectedUsers: 2847,
    affectedServices: ["Azure AD", "Azure MFA", "Entra ID"],
  },
  {
    id: "rc-2",
    category: "Network & Connectivity",
    severity: "high",
    incidentIds: ["INC-002", "INC-003"],
    insights: [
      "VPN gateway IKE phase 2 failures match pattern from INC-045 last month.",
      "SharePoint CDN latency in APAC region may share root cause with Azure backbone saturation.",
    ],
    trend: "stable",
    trendHistory: [2, 2, 2, 1, 2, 2, 2],
    firstDetected: "2026-03-06T07:45:00Z",
    affectedUsers: 1250,
    affectedServices: ["Azure VPN Gateway", "SharePoint Online"],
  },
  {
    id: "rc-3",
    category: "Security Threat Activity",
    severity: "critical",
    incidentIds: ["INC-008", "INC-014"],
    insights: [
      "Password spray attack targeting C-suite accounts from known threat actor IPs.",
      "18 endpoints without EDR coverage create lateral movement risk if breach occurs.",
    ],
    trend: "escalating",
    trendHistory: [0, 0, 1, 1, 2, 3, 4],
    firstDetected: "2026-03-07T09:00:00Z",
    affectedUsers: 21,
    affectedServices: ["Microsoft Defender", "Entra ID"],
  },
  {
    id: "rc-4",
    category: "Compliance & Policy Drift",
    severity: "medium",
    incidentIds: ["INC-009", "INC-013"],
    insights: [
      "March policy update caused 52 device non-compliance — TPM 1.2 hardware gap.",
      "Outlook build crash affecting shared mailbox users — patch available via Intune.",
    ],
    trend: "declining",
    trendHistory: [5, 4, 4, 3, 2, 2, 1],
    firstDetected: "2026-03-04T16:00:00Z",
    affectedUsers: 124,
    affectedServices: ["Microsoft Intune", "Microsoft 365"],
  },
];

// ── Time to Burn Indicators ──
export interface TimeToBurnItem {
  incidentId: string;
  title: string;
  severity: "critical" | "high";
  slaBreach: { minutes: number; total: number };
  capacityExhaustion: { minutes: number; total: number };
  securityEscalation: { minutes: number; total: number };
}

export const timeToBurn: TimeToBurnItem[] = [
  {
    incidentId: "INC-001",
    title: "Azure AD Auth Failures",
    severity: "critical",
    slaBreach: { minutes: 47, total: 240 },
    capacityExhaustion: { minutes: 120, total: 480 },
    securityEscalation: { minutes: 15, total: 60 },
  },
  {
    incidentId: "INC-008",
    title: "Suspicious Sign-in Activity",
    severity: "critical",
    slaBreach: { minutes: 22, total: 120 },
    capacityExhaustion: { minutes: 360, total: 480 },
    securityEscalation: { minutes: 8, total: 30 },
  },
  {
    incidentId: "INC-002",
    title: "VPN Gateway Connectivity",
    severity: "critical",
    slaBreach: { minutes: 95, total: 240 },
    capacityExhaustion: { minutes: 200, total: 480 },
    securityEscalation: { minutes: 45, total: 60 },
  },
];

// ── Autopilot Preview Actions ──
export interface AutopilotPreviewAction {
  id: string;
  action: string;
  system: string;
  confidence: number;
  requiresApproval: boolean;
  approver: string;
  severity: "critical" | "high" | "medium" | "low";
  estimatedResolution: string;
  impact: {
    users: number;
    services: string[];
    downtime: string;
  };
  status: "pending" | "approved" | "executing" | "completed" | "failed";
}

export const autopilotPreviewActions: AutopilotPreviewAction[] = [
  { id: "INC-2001", action: "Restart VPN Gateway Instance", system: "Azure VPN Gateway", confidence: 94, requiresApproval: true, approver: "Network Ops Lead", severity: "critical", estimatedResolution: "12 min", impact: { users: 1250, services: ["VPN Gateway", "Remote Access"], downtime: "2-5 min" }, status: "pending" },
  { id: "INC-2002", action: "Revoke Sessions & Reset Passwords", system: "Microsoft Entra ID", confidence: 97, requiresApproval: true, approver: "Security Ops Lead", severity: "critical", estimatedResolution: "5 min", impact: { users: 3, services: ["Entra ID", "M365 Apps"], downtime: "None" }, status: "pending" },
  { id: "INC-2003", action: "Enable SMS MFA Fallback", system: "Azure MFA", confidence: 89, requiresApproval: false, approver: "Auto-approved", severity: "high", estimatedResolution: "3 min", impact: { users: 847, services: ["Azure MFA"], downtime: "None" }, status: "approved" },
  { id: "INC-2004", action: "Add Index to report_generation SP", system: "Azure SQL", confidence: 82, requiresApproval: true, approver: "DBA Lead", severity: "high", estimatedResolution: "20 min", impact: { users: 450, services: ["CRM Database", "Reporting"], downtime: "5-10 min" }, status: "pending" },
];

export interface AutopilotHistoryItem {
  id: string;
  action: string;
  system: string;
  executedAt: string;
  status: "success" | "failed";
  duration: string;
}

export const autopilotHistory: AutopilotHistoryItem[] = [
  { id: "APH-001", action: "Scale Azure SQL DTU", system: "Azure SQL", executedAt: "2026-03-07T06:15:00Z", status: "success", duration: "4m 22s" },
  { id: "APH-002", action: "Restart Exchange Transport Service", system: "Exchange Online", executedAt: "2026-03-07T03:45:00Z", status: "success", duration: "2m 15s" },
  { id: "APH-003", action: "Force Intune Policy Sync", system: "Microsoft Intune", executedAt: "2026-03-06T22:30:00Z", status: "failed", duration: "8m 45s" },
  { id: "APH-004", action: "Rotate Service Principal Credentials", system: "Azure AD", executedAt: "2026-03-06T18:00:00Z", status: "success", duration: "1m 30s" },
  { id: "APH-005", action: "Clear SharePoint Cache", system: "SharePoint Online", executedAt: "2026-03-06T14:20:00Z", status: "success", duration: "3m 10s" },
];

// ── Blast Radius Data ──
export interface BlastRadiusItem {
  incidentId: string;
  title: string;
  severity: "critical" | "high";
  affectedServices: { name: string; status: "impacted" | "degraded" | "at-risk" }[];
  affectedUsers: number;
  affectedRegions: string[];
  dependencyChain: string[];
  businessImpact: string;
}

export const blastRadiusData: BlastRadiusItem[] = [
  {
    incidentId: "INC-001",
    title: "Azure AD Auth Failures",
    severity: "critical",
    affectedServices: [
      { name: "Azure AD", status: "impacted" },
      { name: "M365 Apps", status: "degraded" },
      { name: "SharePoint", status: "degraded" },
      { name: "Teams", status: "at-risk" },
    ],
    affectedUsers: 2847,
    affectedRegions: ["US East", "US West", "EU West"],
    dependencyChain: ["Azure AD", "Conditional Access", "M365 Identity", "All M365 Apps"],
    businessImpact: "Core productivity blocked for ~3K users",
  },
  {
    incidentId: "INC-008",
    title: "Suspicious Sign-in Activity",
    severity: "critical",
    affectedServices: [
      { name: "Entra ID", status: "impacted" },
      { name: "Defender", status: "degraded" },
      { name: "Executive Apps", status: "at-risk" },
    ],
    affectedUsers: 21,
    affectedRegions: ["Global"],
    dependencyChain: ["Threat Actor IPs", "C-Suite Accounts", "Sensitive Data Access"],
    businessImpact: "Potential data breach — executive accounts targeted",
  },
  {
    incidentId: "INC-002",
    title: "VPN Gateway Connectivity",
    severity: "critical",
    affectedServices: [
      { name: "VPN Gateway", status: "impacted" },
      { name: "Remote Access", status: "impacted" },
      { name: "Internal Apps", status: "degraded" },
    ],
    affectedUsers: 1250,
    affectedRegions: ["NA Region"],
    dependencyChain: ["Azure VPN", "Site-to-Site Tunnel", "HQ Network", "Internal Resources"],
    businessImpact: "Remote workforce productivity halted",
  },
];

// ── Ops Rhythm Data ──
export interface OpsRhythmHour {
  hour: number;
  incidents: number;
  isChangeWindow: boolean;
  isDeployment: boolean;
}

export interface OpsRhythmDay {
  day: string;
  hours: OpsRhythmHour[];
  total: number;
}

export const opsRhythmData: OpsRhythmDay[] = [
  { day: "Mon", hours: Array.from({ length: 24 }, (_, h) => ({ hour: h, incidents: h >= 8 && h <= 10 ? 4 : h >= 14 && h <= 16 ? 2 : Math.random() > 0.7 ? 1 : 0, isChangeWindow: h >= 2 && h <= 4, isDeployment: h === 9 })), total: 12 },
  { day: "Tue", hours: Array.from({ length: 24 }, (_, h) => ({ hour: h, incidents: h >= 9 && h <= 11 ? 3 : Math.random() > 0.7 ? 1 : 0, isChangeWindow: h >= 2 && h <= 4, isDeployment: false })), total: 9 },
  { day: "Wed", hours: Array.from({ length: 24 }, (_, h) => ({ hour: h, incidents: h >= 8 && h <= 10 ? 5 : h >= 15 && h <= 17 ? 2 : Math.random() > 0.8 ? 1 : 0, isChangeWindow: h >= 2 && h <= 4, isDeployment: h === 15 })), total: 15 },
  { day: "Thu", hours: Array.from({ length: 24 }, (_, h) => ({ hour: h, incidents: h >= 9 && h <= 11 ? 2 : Math.random() > 0.7 ? 1 : 0, isChangeWindow: h >= 2 && h <= 4, isDeployment: false })), total: 8 },
  { day: "Fri", hours: Array.from({ length: 24 }, (_, h) => ({ hour: h, incidents: h >= 8 && h <= 10 ? 4 : h >= 16 && h <= 18 ? 3 : Math.random() > 0.7 ? 1 : 0, isChangeWindow: h >= 2 && h <= 4, isDeployment: h === 16 })), total: 14 },
  { day: "Sat", hours: Array.from({ length: 24 }, (_, h) => ({ hour: h, incidents: Math.random() > 0.85 ? 1 : 0, isChangeWindow: h >= 2 && h <= 6, isDeployment: false })), total: 3 },
  { day: "Sun", hours: Array.from({ length: 24 }, (_, h) => ({ hour: h, incidents: Math.random() > 0.9 ? 1 : 0, isChangeWindow: h >= 2 && h <= 6, isDeployment: false })), total: 2 },
];

export interface OpsRhythmPattern {
  id: string;
  pattern: string;
  confidence: number;
  recommendation: string;
}

export const opsRhythmPatterns: OpsRhythmPattern[] = [
  { id: "p1", pattern: "Monday 9AM spike", confidence: 87, recommendation: "Stagger deployments away from week-start peak" },
  { id: "p2", pattern: "Post-deployment incidents +40%", confidence: 92, recommendation: "Extend deployment validation window" },
  { id: "p3", pattern: "Friday EOD surge", confidence: 78, recommendation: "Freeze changes after 4PM Fridays" },
];
