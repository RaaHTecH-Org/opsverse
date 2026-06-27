import { useState } from "react";
import SEO from "@/components/SEO";
import {
  AlertTriangle,
  ShieldAlert,
  FileText,
  Monitor,
  Shield,
  Activity,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  Bell,
  Timer,
} from "lucide-react";
import { Link } from "react-router-dom";
import {
  dashboardStats,
  incidents,
  serviceRequests,
  operationsChartData,
  systemHealthData,
  alertsNotifications,
} from "@/data/mock-data";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import ServiceHealthMap from "@/components/ServiceHealthMap";
import LiveActivityFeed from "@/components/LiveActivityFeed";
import PersonaToggle, { type Persona, getPersistedPersona } from "@/components/dashboard/PersonaToggle";
import TimeToBurn from "@/components/dashboard/TimeToBurn";
import RootCauseClusters from "@/components/dashboard/RootCauseClusters";
import AutopilotPreview from "@/components/dashboard/AutopilotPreview";
import ThreatMap from "@/components/dashboard/ThreatMap";
import MiniThreatHeatmap from "@/components/dashboard/MiniThreatHeatmap";
import BlastRadius from "@/components/dashboard/BlastRadius";
import OpsRhythm from "@/components/dashboard/OpsRhythm";
import SecurityAuditLog from "@/components/dashboard/SecurityAuditLog";
import ThreatTimeline from "@/components/dashboard/ThreatTimeline";

const statCards = [
  { label: "Open Incidents", value: dashboardStats.openIncidents, icon: AlertTriangle, color: "text-warning", trend: "+3", up: true, personas: ["all", "ops", "security", "engineering"] },
  { label: "Critical Incidents", value: dashboardStats.criticalIncidents, icon: ShieldAlert, color: "text-critical", trend: "+1", up: true, personas: ["all", "ops", "security"] },
  { label: "Pending Requests", value: dashboardStats.pendingRequests, icon: FileText, color: "text-info", trend: "-2", up: false, personas: ["all", "ops"] },
  { label: "Security Alerts", value: dashboardStats.securityAlerts, icon: Shield, color: "text-critical", trend: "+2", up: true, personas: ["all", "security"] },
  { label: "Assets Tracked", value: dashboardStats.trackedAssets, icon: Monitor, color: "text-foreground", trend: "+5", up: true, personas: ["all", "ops", "engineering"] },
  { label: "SLA Compliance", value: `${dashboardStats.slaCompliance}%`, icon: CheckCircle2, color: "text-success", trend: "-0.4%", up: false, personas: ["all", "ops"] },
  { label: "System Health", value: `${dashboardStats.systemHealth}%`, icon: Activity, color: "text-success", trend: "+1.2%", up: true, personas: ["all", "engineering"] },
];

const alertIcon = {
  critical: <ShieldAlert className="w-3.5 h-3.5 text-critical shrink-0" />,
  warning: <AlertTriangle className="w-3.5 h-3.5 text-warning shrink-0" />,
  info: <Bell className="w-3.5 h-3.5 text-info shrink-0" />,
};

// Persona visibility config
const sectionVisibility: Record<string, Persona[]> = {
  timeToBurn: ["all", "ops", "security"],
  miniThreatHeatmap: ["all", "security"],
  serviceHealthMap: ["all", "ops", "engineering"],
  threatMap: ["security"],
  incidentTrend: ["all", "ops", "engineering"],
  rootCauseClusters: ["all", "security", "ops"],
  blastRadius: ["all", "ops", "security"],
  opsRhythm: ["all", "ops", "engineering"],
  alerts: ["all", "security"],
  requestVolume: ["all", "ops"],
  systemHealth: ["all", "engineering"],
  autopilotPreview: ["all", "ops", "security"],
  activityFeed: ["all", "ops"],
  recentIncidents: ["all", "ops", "security"],
  activeRequests: ["all", "ops"],
  securityAudit: ["security"],
  threatTimeline: ["security"],
};

function isVisible(section: string, persona: Persona): boolean {
  return sectionVisibility[section]?.includes(persona) ?? true;
}

export default function Dashboard() {
  const [persona, setPersona] = useState<Persona>(getPersistedPersona);
  const recentIncidents = incidents.filter((i) => i.status !== "resolved" && i.status !== "closed").slice(0, 6);
  const activeRequests = serviceRequests.filter((r) => r.status === "open" || r.status === "in-progress").slice(0, 5);
  const filteredStats = statCards.filter((s) => s.personas.includes(persona));

  return (
    <div className="space-y-6 animate-slide-in">
      <SEO title="Operations Dashboard" description="Real-time enterprise operations dashboard with service health, incidents, and AI-driven ops intelligence." />
      {/* Header + Persona Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">Operations Dashboard</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">Real-time enterprise operations overview</p>
        </div>
        <PersonaToggle value={persona} onChange={setPersona} />
      </div>

      {/* Stats Grid — responsive: 2 cols mobile, 4 md, 7 lg */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2 sm:gap-3">
        {filteredStats.map((stat) => (
          <div key={stat.label} className="stat-card-glow">
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <stat.icon className={`w-3.5 sm:w-4 h-3.5 sm:h-4 ${stat.color}`} />
              <span className={`text-[9px] sm:text-[10px] font-mono flex items-center gap-0.5 ${stat.up ? 'text-warning' : 'text-success'}`}>
                {stat.up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {stat.trend}
              </span>
            </div>
            <p className="text-xl sm:text-2xl font-semibold tracking-tight truncate">{stat.value}</p>
            <p className="text-[10px] sm:text-[11px] text-muted-foreground mt-1 truncate">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Time to Burn */}
      {isVisible("timeToBurn", persona) && <TimeToBurn />}

      {/* Mini Threat Heatmap — All and Security */}
      {isVisible("miniThreatHeatmap", persona) && (
        <div className="grid lg:grid-cols-3 gap-4 sm:gap-6">
          <MiniThreatHeatmap />
          {/* Placeholder for balance on desktop when not security persona */}
          {!isVisible("threatMap", persona) && (
            <div className="lg:col-span-2">
              <ServiceHealthMap />
            </div>
          )}
        </div>
      )}

      {/* Threat Map — Security Lead only */}
      {isVisible("threatMap", persona) && <ThreatMap />}

      {/* Threat Timeline — Security Lead only */}
      {isVisible("threatTimeline", persona) && <ThreatTimeline />}

      {/* Security Audit Log — Security Lead only */}
      {isVisible("securityAudit", persona) && <SecurityAuditLog />}

      {/* Service Health Map — shown separately if not combined with mini heatmap */}
      {isVisible("serviceHealthMap", persona) && !isVisible("miniThreatHeatmap", persona) && <ServiceHealthMap />}
      {isVisible("serviceHealthMap", persona) && isVisible("threatMap", persona) && <ServiceHealthMap />}

      <div className="grid lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Incident Trend Chart */}
        {isVisible("incidentTrend", persona) && (
          <div className="lg:col-span-2 bg-card border border-border rounded-lg">
            <div className="section-header">
              <h2 className="section-title">Incident Trend — Last 7 Days</h2>
              <span className="text-[10px] text-muted-foreground font-mono">Updated 2 min ago</span>
            </div>
            <div className="p-3 sm:p-5 h-56 sm:h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={operationsChartData}>
                  <defs>
                    <linearGradient id="incGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(199 89% 48%)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(199 89% 48%)" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="reqGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(185 80% 50%)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(185 80% 50%)" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="resGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(152 69% 40%)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(152 69% 40%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(222 18% 16%)" />
                  <XAxis dataKey="name" tick={{ fill: 'hsl(215 20% 50%)', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: 'hsl(215 20% 50%)', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(222 41% 8%)',
                      border: '1px solid hsl(222 18% 16%)',
                      borderRadius: '8px',
                      fontSize: '12px',
                      color: 'hsl(210 40% 93%)',
                      boxShadow: '0 8px 32px hsl(222 47% 2% / 0.8)',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', color: 'hsl(215 20% 50%)' }} />
                  <Area type="monotone" dataKey="incidents" stroke="hsl(199 89% 48%)" fill="url(#incGrad)" strokeWidth={2} />
                  <Area type="monotone" dataKey="requests" stroke="hsl(185 80% 50%)" fill="url(#reqGrad)" strokeWidth={2} />
                  <Area type="monotone" dataKey="resolved" stroke="hsl(152 69% 40%)" fill="url(#resGrad)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Root Cause Clusters (replaces AI Insights) */}
        {isVisible("rootCauseClusters", persona) && <RootCauseClusters />}
      </div>

      <div className="grid lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Alerts & Notifications */}
        {isVisible("alerts", persona) && (
          <div className="bg-card border border-border rounded-lg">
            <div className="section-header">
              <h2 className="section-title">Alerts & Notifications</h2>
              <span className="text-[10px] bg-critical/15 text-critical px-2 py-0.5 rounded-full font-medium">
                {alertsNotifications.filter((a) => a.type === "critical").length} critical
              </span>
            </div>
            <div className="divide-y divide-border/40">
              {alertsNotifications.map((alert) => (
                <div key={alert.id} className="px-4 py-3 flex items-start gap-3 hover:bg-muted/30 transition-colors">
                  {alertIcon[alert.type]}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs leading-relaxed">{alert.message}</p>
                    <p className="text-[10px] text-muted-foreground mt-1">{alert.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Service Request Volume */}
        {isVisible("requestVolume", persona) && (
          <div className="bg-card border border-border rounded-lg">
            <div className="section-header">
              <h2 className="section-title">Service Request Volume</h2>
            </div>
            <div className="p-3 sm:p-5 h-48 sm:h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={operationsChartData} barSize={18}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(222 18% 16%)" />
                  <XAxis dataKey="name" tick={{ fill: 'hsl(215 20% 50%)', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: 'hsl(215 20% 50%)', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(222 41% 8%)',
                      border: '1px solid hsl(222 18% 16%)',
                      borderRadius: '8px',
                      fontSize: '11px',
                      color: 'hsl(210 40% 93%)',
                    }}
                  />
                  <Bar dataKey="requests" fill="hsl(185 80% 50%)" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="resolved" fill="hsl(152 69% 40%)" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* System Health Status */}
        {isVisible("systemHealth", persona) && (
          <div className="bg-card border border-border rounded-lg">
            <div className="section-header">
              <h2 className="section-title">System Health Status</h2>
              <span className="text-[10px] text-muted-foreground">Microsoft Environment</span>
            </div>
            <div className="p-4 sm:p-5 space-y-3">
              {systemHealthData.map((sys) => (
                <div key={sys.name} className="flex items-center gap-3">
                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                    sys.health >= 90 ? "bg-success" : sys.health >= 75 ? "bg-warning" : "bg-critical"
                  }`} />
                  <span className="text-xs w-20 sm:w-28 shrink-0 truncate">{sys.name}</span>
                  <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        sys.health >= 90 ? "bg-success" : sys.health >= 75 ? "bg-warning" : "bg-critical"
                      }`}
                      style={{ width: `${sys.health}%` }}
                    />
                  </div>
                  <span className={`text-[11px] font-mono w-10 text-right ${
                    sys.health >= 90 ? "text-success" : sys.health >= 75 ? "text-warning" : "text-critical"
                  }`}>
                    {sys.health}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Blast Radius + Ops Rhythm */}
      {(isVisible("blastRadius", persona) || isVisible("opsRhythm", persona)) && (
        <div className="grid lg:grid-cols-2 gap-4 sm:gap-6">
          {isVisible("blastRadius", persona) && <BlastRadius />}
          {isVisible("opsRhythm", persona) && <OpsRhythm />}
        </div>
      )}

      {/* Autopilot Actions Preview */}
      {isVisible("autopilotPreview", persona) && <AutopilotPreview />}

      {/* Live Activity Feed */}
      {isVisible("activityFeed", persona) && <LiveActivityFeed />}


      <div className="grid lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Recent Incidents */}
        {isVisible("recentIncidents", persona) && (
          <div className="bg-card border border-border rounded-lg">
            <div className="section-header">
              <h2 className="section-title">Recent Incidents</h2>
              <Link to="/incidents" className="text-xs text-primary hover:underline flex items-center gap-1 font-medium">
                View all <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="divide-y divide-border/40">
              {recentIncidents.map((inc) => (
                <div key={inc.id} className="px-3 sm:px-5 py-3 flex items-center gap-2 sm:gap-4 hover:bg-muted/20 transition-colors">
                  <span className="text-[10px] sm:text-[11px] font-mono text-muted-foreground w-14 sm:w-16 shrink-0">{inc.id}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm truncate">{inc.title}</p>
                    <p className="text-[10px] sm:text-[11px] text-muted-foreground truncate">{inc.affectedSystem}</p>
                  </div>
                  <span className={`status-badge status-${inc.status} hidden sm:inline-flex`}>{inc.status}</span>
                  <span className={`text-[10px] sm:text-[11px] priority-${inc.priority} w-12 sm:w-14 text-right capitalize`}>{inc.priority}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Active Requests */}
        {isVisible("activeRequests", persona) && (
          <div className="bg-card border border-border rounded-lg">
            <div className="section-header">
              <h2 className="section-title">Active Service Requests</h2>
              <Link to="/requests" className="text-xs text-primary hover:underline flex items-center gap-1 font-medium">
                View all <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="divide-y divide-border/40">
              {activeRequests.map((req) => (
                <div key={req.id} className="px-3 sm:px-5 py-3 flex items-center gap-2 sm:gap-4 hover:bg-muted/20 transition-colors">
                  <span className="text-[10px] sm:text-[11px] font-mono text-muted-foreground w-12 sm:w-14 shrink-0">{req.id}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm truncate">{req.requestType}</p>
                    <p className="text-[10px] sm:text-[11px] text-muted-foreground truncate">{req.requestor} — {req.department}</p>
                  </div>
                  <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-muted-foreground">
                    <Timer className="w-3 h-3" />
                    <span className="capitalize">{req.workflowStage.replace('-', ' ')}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
