import {
  Settings,
  Users,
  Shield,
  Server,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  FileText,
  Clock,
  Zap,
  ChevronRight,
} from "lucide-react";
import SEO from "@/components/SEO";

const connectors = [
  { name: "Microsoft Entra ID", status: "connected" as const, version: "v2.0", lastSync: "2 min ago", desc: "Identity & access management" },
  { name: "Microsoft Graph API", status: "connected" as const, version: "v1.0", lastSync: "5 min ago", desc: "Unified API gateway" },
  { name: "Azure OpenAI", status: "connected" as const, version: "GPT-4o", lastSync: "Real-time", desc: "AI intelligence layer" },
  { name: "Microsoft 365", status: "connected" as const, version: "v1.0", lastSync: "10 min ago", desc: "Productivity suite" },
  { name: "Microsoft Defender", status: "degraded" as const, version: "v2.0", lastSync: "45 min ago", desc: "Security operations" },
  { name: "ServiceNow", status: "disconnected" as const, version: "—", lastSync: "Not configured", desc: "ITSM bridge (optional)" },
];

const statusIcon = {
  connected: <CheckCircle2 className="w-4 h-4 text-success" />,
  degraded: <AlertTriangle className="w-4 h-4 text-warning" />,
  disconnected: <XCircle className="w-4 h-4 text-muted-foreground" />,
};

const roles = [
  { role: "Administrator", users: 3, permissions: "Full system access, configuration, audit" },
  { role: "IT Operations", users: 12, permissions: "Incident & request management, asset tracking" },
  { role: "Security Operations", users: 5, permissions: "Security alerts, investigations, threat response" },
  { role: "Service Desk", users: 8, permissions: "Triage, assign incidents, first-line support" },
  { role: "Employee", users: 284, permissions: "Submit requests, view own status" },
];

const auditLog = [
  { time: "09:28 AM", user: "John Doe", action: "Updated incident INC-002 status to in-progress", type: "incident" },
  { time: "09:15 AM", user: "System", action: "Azure Defender connector health degraded", type: "system" },
  { time: "09:00 AM", user: "Sarah Chen", action: "Submitted service request SR-001", type: "request" },
  { time: "08:45 AM", user: "Admin", action: "Updated Conditional Access policy CA-007", type: "security" },
  { time: "08:30 AM", user: "System", action: "Daily compliance scan completed — 52 non-compliant devices", type: "system" },
  { time: "08:15 AM", user: "System", action: "AI model retrained on latest incident data", type: "ai" },
  { time: "07:45 AM", user: "James Wilson", action: "Escalated INC-008 to Security Operations", type: "incident" },
  { time: "07:00 AM", user: "System", action: "Scheduled maintenance window opened — Azure East US", type: "system" },
];

const workflowSettings = [
  { name: "Auto-assign critical incidents", enabled: true },
  { name: "AI-powered incident categorization", enabled: true },
  { name: "Manager auto-escalation (>8h)", enabled: true },
  { name: "Self-service password reset", enabled: true },
  { name: "Auto-close resolved incidents (72h)", enabled: false },
  { name: "ServiceNow bidirectional sync", enabled: false },
];

export default function Admin() {
  return (
    <div className="space-y-6 animate-slide-in">
      <SEO title="Administration" description="Configure connectors, integrations, policies, and audit trails for the Raahtech Command Center." />
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Administration</h1>
        <p className="text-sm text-muted-foreground mt-1">System configuration, integrations, and audit trail</p>
      </div>

      {/* Architecture Overview */}
      <div className="ai-panel">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-semibold">Platform Architecture</h2>
          </div>
          <span className="text-[10px] text-muted-foreground/60 tracking-wide">Developed by Raahtech</span>
        </div>
        <div className="flex items-center justify-center gap-3 flex-wrap">
          <div className="bg-info/10 border border-info/20 rounded-lg px-4 py-2.5 text-center">
            <p className="text-xs font-medium text-info">Microsoft Enterprise</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">Azure · M365 · Entra · Defender</p>
          </div>
          <ChevronRight className="w-4 h-4 text-primary/50" />
          <div className="bg-primary/10 border border-primary/20 rounded-lg px-4 py-2.5 text-center">
            <p className="text-xs font-semibold text-primary">Raahtech Command Center</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">Incidents · Requests · Assets</p>
          </div>
          <ChevronRight className="w-4 h-4 text-primary/50" />
          <div className="bg-cyan/10 border border-cyan/20 rounded-lg px-4 py-2.5 text-center">
            <p className="text-xs font-medium text-cyan">AI Intelligence</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">Azure OpenAI · Copilot</p>
          </div>
        </div>
      </div>

      {/* Integration Status */}
      <div>
        <h2 className="text-sm font-semibold mb-3 flex items-center gap-2">
          <Server className="w-4 h-4 text-primary" />
          Integration Status
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {connectors.map((c) => (
            <div key={c.name} className="connector-card">
              <div className={`connector-dot-${c.status}`} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{c.name}</p>
                <p className="text-[10px] text-muted-foreground">{c.desc}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{c.version} · {c.lastSync}</p>
              </div>
              {statusIcon[c.status]}
            </div>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Roles */}
        <div className="bg-card border border-border rounded-lg">
          <div className="section-header">
            <h2 className="section-title flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" />
              User Roles
            </h2>
            <span className="text-[10px] text-muted-foreground">{roles.reduce((sum, r) => sum + r.users, 0)} total users</span>
          </div>
          <div className="divide-y divide-border/40">
            {roles.map((r) => (
              <div key={r.role} className="px-5 py-3 flex items-center gap-4 hover:bg-muted/20 transition-colors">
                <div className="flex-1">
                  <p className="text-sm font-medium">{r.role}</p>
                  <p className="text-[11px] text-muted-foreground">{r.permissions}</p>
                </div>
                <span className="text-xs text-muted-foreground bg-secondary px-2 py-1 rounded-md font-mono">{r.users}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Workflow Settings */}
        <div className="bg-card border border-border rounded-lg">
          <div className="section-header">
            <h2 className="section-title flex items-center gap-2">
              <Settings className="w-4 h-4 text-primary" />
              Workflow Automation
            </h2>
          </div>
          <div className="divide-y divide-border/40">
            {workflowSettings.map((s) => (
              <div key={s.name} className="px-5 py-3 flex items-center justify-between hover:bg-muted/20 transition-colors">
                <span className="text-sm">{s.name}</span>
                <div className={`w-9 h-5 rounded-full relative transition-colors cursor-pointer ${s.enabled ? "bg-success" : "bg-muted"}`}>
                  <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${s.enabled ? "left-[18px]" : "left-0.5"}`} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Audit Log */}
      <div className="bg-card border border-border rounded-lg">
        <div className="section-header">
          <h2 className="section-title flex items-center gap-2">
            <FileText className="w-4 h-4 text-primary" />
            Audit Log
          </h2>
          <span className="text-[11px] text-muted-foreground">Today — {auditLog.length} events</span>
        </div>
        <div className="divide-y divide-border/40">
          {auditLog.map((entry, i) => (
            <div key={i} className="px-5 py-3 flex items-start gap-4 hover:bg-muted/20 transition-colors">
              <span className="text-[11px] font-mono text-muted-foreground w-20 shrink-0 pt-0.5">{entry.time}</span>
              <Clock className="w-3.5 h-3.5 text-muted-foreground shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-sm">{entry.action}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">{entry.user}</p>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded-full capitalize font-medium ${
                entry.type === "incident" ? "bg-warning/15 text-warning" :
                entry.type === "security" ? "bg-critical/15 text-critical" :
                entry.type === "ai" ? "bg-primary/15 text-primary" :
                entry.type === "request" ? "bg-info/15 text-info" :
                "bg-muted text-muted-foreground"
              }`}>
                {entry.type}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
