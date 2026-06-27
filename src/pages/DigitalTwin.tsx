import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import SEO from "@/components/SEO";
import { useNavigate, useSearchParams } from "react-router-dom";
import { X, AlertTriangle, CheckCircle2, AlertCircle, HelpCircle, Play, Pause, Clock, Network, Shield, Server, Activity, Radio, Keyboard, ShieldAlert, Bell } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useIsMobile } from "@/hooks/use-mobile";
import { useSimulation, keywordServiceMap, SimNotification } from "@/hooks/use-simulation";

type HealthStatus = "healthy" | "degraded" | "incident" | "unknown";

interface ServiceNode {
  id: string;
  name: string;
  category: string;
  status: HealthStatus;
  region?: string;
  x: number;
  y: number;
  activeIncident?: string;
  incidentId?: string;
  affectedSystems?: string[];
  recommendedActions?: string[];
}

const baseNodes: ServiceNode[] = [
  { id: "azure-east", name: "Azure East US", category: "Cloud Region", status: "healthy", region: "East US", x: 20, y: 30, affectedSystems: [], recommendedActions: ["No action required"] },
  { id: "azure-west", name: "Azure West US", category: "Cloud Region", status: "healthy", region: "West US", x: 10, y: 55, affectedSystems: [], recommendedActions: ["No action required"] },
  { id: "entra-id", name: "Microsoft Entra ID", category: "Identity", status: "healthy", region: "Global", x: 50, y: 18, affectedSystems: [], recommendedActions: ["No action required"] },
  { id: "vpn-gw", name: "VPN Gateway", category: "Network", status: "healthy", region: "Multi-region", x: 30, y: 65, incidentId: "INC-2001", affectedSystems: [], recommendedActions: ["No action required"] },
  { id: "exchange", name: "Exchange Online", category: "M365 Service", status: "healthy", region: "Global", x: 55, y: 50, incidentId: "INC-2003", affectedSystems: [], recommendedActions: ["No action required"] },
  { id: "sharepoint", name: "SharePoint Online", category: "M365 Service", status: "healthy", region: "Global", x: 78, y: 45, affectedSystems: [], recommendedActions: ["No action required"] },
  { id: "defender", name: "Microsoft Defender", category: "Security", status: "healthy", region: "Global", x: 75, y: 22, incidentId: "INC-2005", affectedSystems: [], recommendedActions: ["No action required"] },
  { id: "db-cluster", name: "Azure SQL", category: "Database", status: "healthy", region: "East US", x: 40, y: 80, incidentId: "INC-2004", affectedSystems: [], recommendedActions: ["No action required"] },
  { id: "internal-apps", name: "Internal Apps", category: "Applications", status: "healthy", region: "On-premises", x: 65, y: 75, affectedSystems: [], recommendedActions: ["No action required"] },
];

const connections: [string, string][] = [
  ["azure-east", "entra-id"],
  ["azure-west", "entra-id"],
  ["entra-id", "defender"],
  ["azure-east", "vpn-gw"],
  ["azure-west", "vpn-gw"],
  ["entra-id", "exchange"],
  ["entra-id", "sharepoint"],
  ["exchange", "sharepoint"],
  ["defender", "sharepoint"],
  ["azure-east", "db-cluster"],
  ["db-cluster", "internal-apps"],
  ["exchange", "internal-apps"],
  ["vpn-gw", "internal-apps"],
];

// Parent-child for health propagation
const dependencies: Record<string, string[]> = {
  "entra-id": ["exchange", "sharepoint", "defender"],
  "azure-east": ["db-cluster", "vpn-gw"],
  "azure-west": ["vpn-gw"],
  "vpn-gw": ["internal-apps"],
  "db-cluster": ["internal-apps"],
};

type Snapshot = Record<string, { status: HealthStatus; activeIncident?: string; affectedSystems?: string[]; recommendedActions?: string[] }>;

const timeSnapshots: Record<number, Snapshot> = {
  0: {},
  6: {
    "vpn-gw": { status: "degraded", activeIncident: "Packet loss on west region tunnel", affectedSystems: ["Remote Access VPN", "Site-to-Site VPN"], recommendedActions: ["Restart VPN Gateway", "Check tunnel health metrics"] },
  },
  8: {
    "vpn-gw": { status: "degraded", activeIncident: "Packet loss on west region tunnel", affectedSystems: ["Remote Access VPN", "Site-to-Site VPN"], recommendedActions: ["Restart VPN Gateway"] },
    "entra-id": { status: "incident", activeIncident: "Authentication latency spike — SSO failures", affectedSystems: ["Azure AD", "SSO Services", "Conditional Access"], recommendedActions: ["Investigate auth logs", "Check token pipeline", "Prepare failover"] },
  },
  12: {
    "entra-id": { status: "incident", activeIncident: "Authentication latency spike — SSO failures", affectedSystems: ["Azure AD", "SSO Services"], recommendedActions: ["Investigate auth logs"] },
    "exchange": { status: "degraded", activeIncident: "Mail delivery delays up to 15 min", affectedSystems: ["SMTP Relay", "Transport Rules"], recommendedActions: ["Monitor mail queues", "Check transport agents"] },
    "db-cluster": { status: "degraded", activeIncident: "High DTU consumption on primary", affectedSystems: ["Azure SQL Primary", "Read Replicas"], recommendedActions: ["Scale up DTU", "Review query performance"] },
  },
  18: {
    "entra-id": { status: "degraded", activeIncident: "Auth latency recovering", affectedSystems: ["Azure AD"], recommendedActions: ["Continue monitoring"] },
    "defender": { status: "incident", activeIncident: "Sensor offline on 3 endpoints", affectedSystems: ["Endpoint Detection", "Threat Analytics"], recommendedActions: ["Restart sensor service", "Check agent health"] },
    "db-cluster": { status: "incident", activeIncident: "Azure SQL DTU critical — 98% utilization", affectedSystems: ["Azure SQL Primary", "Read Replicas", "Internal Apps"], recommendedActions: ["Emergency scale-up", "Kill long-running queries"] },
  },
};

const statusConfig: Record<HealthStatus, { color: string; bg: string; border: string; pulse: boolean; label: string; icon: typeof CheckCircle2 }> = {
  healthy: { color: "text-success", bg: "bg-success/15", border: "border-success/40", pulse: false, label: "Healthy", icon: CheckCircle2 },
  degraded: { color: "text-warning", bg: "bg-warning/15", border: "border-warning/40", pulse: true, label: "Degraded", icon: AlertTriangle },
  incident: { color: "text-critical", bg: "bg-critical/15", border: "border-critical/40", pulse: true, label: "Incident", icon: AlertCircle },
  unknown: { color: "text-muted-foreground", bg: "bg-muted/15", border: "border-muted/40", pulse: false, label: "Unknown", icon: HelpCircle },
};

function getNodesAtHour(hour: number): ServiceNode[] {
  // Collect all snapshots up to current hour
  let merged: Snapshot = {};
  const hours = Object.keys(timeSnapshots).map(Number).sort((a, b) => a - b);
  for (const h of hours) {
    if (h <= hour) merged = { ...merged, ...timeSnapshots[h] };
  }

  return baseNodes.map((node) => {
    const override = merged[node.id];
    let status = override?.status ?? "healthy";
    let activeIncident = override?.activeIncident;
    let affectedSystems = override?.affectedSystems ?? [];
    let recommendedActions = override?.recommendedActions ?? ["No action required"];

    // Health propagation: if a parent is incident, children get warning border
    if (status === "healthy") {
      for (const [parent, children] of Object.entries(dependencies)) {
        if (children.includes(node.id)) {
          const parentOverride = merged[parent];
          if (parentOverride?.status === "incident") {
            status = "degraded";
            activeIncident = `Affected by upstream: ${baseNodes.find(n => n.id === parent)?.name}`;
            recommendedActions = ["Monitor — upstream dependency incident"];
            break;
          }
        }
      }
    }

    return { ...node, status, activeIncident, affectedSystems, recommendedActions };
  });
}

export default function DigitalTwin() {
  const [hour, setHour] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [selected, setSelected] = useState<ServiceNode | null>(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isMobile = useIsMobile();
  const containerRef = useRef<HTMLDivElement>(null);

  const { isSimulating, serviceOverrides, notifications } = useSimulation();

  // Auto-select node from URL query param
  useEffect(() => {
    const nodeId = searchParams.get("node");
    if (nodeId) {
      const node = baseNodes.find(n => n.id === nodeId);
      if (node) setSelected(node);
    }
  }, [searchParams]);

  const nodes = useMemo(() => {
    const base = getNodesAtHour(hour);
    if (!isSimulating || Object.keys(serviceOverrides).length === 0) return base;
    // Merge simulation overrides into nodes
    return base.map((node) => {
      const override = serviceOverrides[node.id];
      if (!override) return node;
      // Don't downgrade a time-travel incident to sim degraded
      if (node.status === "incident" && override === "degraded") return node;
      return {
        ...node,
        status: override,
        activeIncident: override === "incident"
          ? "Live simulation — active incident detected"
          : override === "degraded"
            ? "Live simulation — performance degradation"
            : node.activeIncident,
      };
    });
  }, [hour, isSimulating, serviceOverrides]);

  const stats = useMemo(() => {
    const total = nodes.length;
    const healthy = nodes.filter(n => n.status === "healthy").length;
    const degraded = nodes.filter(n => n.status === "degraded").length;
    const incidents = nodes.filter(n => n.status === "incident").length;
    return { total, healthy, degraded, incidents };
  }, [nodes]);

  useEffect(() => {
    if (!playing) return;
    const interval = setInterval(() => {
      setHour(h => (h >= 23 ? (setPlaying(false), 23) : h + 1));
    }, 800);
    return () => clearInterval(interval);
  }, [playing]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      switch (e.key) {
        case "ArrowRight":
          e.preventDefault();
          setHour(h => Math.min(23, h + 1));
          setPlaying(false);
          break;
        case "ArrowLeft":
          e.preventDefault();
          setHour(h => Math.max(0, h - 1));
          setPlaying(false);
          break;
        case " ":
          e.preventDefault();
          setPlaying(p => !p);
          break;
        case "Escape":
          setSelected(null);
          break;
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // Get recent notifications affecting the selected node
  const nodeEvents = useMemo(() => {
    if (!selected) return [];
    return notifications
      .filter((n) => {
        for (const mapping of keywordServiceMap) {
          if (mapping.serviceId === selected.id && mapping.keywords.some((kw) => n.message.includes(kw))) {
            return true;
          }
        }
        return false;
      })
      .slice(0, 5);
  }, [selected, notifications]);

  const getNodePos = useCallback((id: string) => {
    const node = nodes.find(n => n.id === id);
    return node ? { x: node.x, y: node.y } : { x: 0, y: 0 };
  }, [nodes]);

  const formatHour = (h: number) => {
    const ampm = h >= 12 ? "PM" : "AM";
    const hr = h === 0 ? 12 : h > 12 ? h - 12 : h;
    return `${hr}:00 ${ampm}`;
  };

  return (
    <div className="space-y-6">
      <SEO title="Digital Twin" description="Interactive infrastructure topology and time-travel analysis for enterprise services and dependencies." />
      {/* Header */}
      <div className="section-header !border-0 !px-0 !py-0 !mb-0">
        <div>
          <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Network className="w-5 h-5 text-primary" />
            Operational Digital Twin
          </h1>
          <p className="text-xs text-muted-foreground mt-1">Interactive infrastructure topology with time-travel analysis</p>
        </div>
        <div className="flex items-center gap-3">
          {isSimulating && (
            <span className="flex items-center gap-1.5 text-[10px] bg-primary/15 text-primary px-2.5 py-1 rounded-full font-medium">
              <Radio className="w-2.5 h-2.5 animate-pulse" />
              Live Mode
            </span>
          )}
          <span className="flex items-center gap-2 text-[11px] text-muted-foreground">
            <Clock className="w-3.5 h-3.5" />
            {formatHour(hour)}
          </span>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Total Services", value: stats.total, icon: Server, color: "text-primary" },
          { label: "Healthy", value: stats.healthy, icon: CheckCircle2, color: "text-success" },
          { label: "Degraded", value: stats.degraded, icon: AlertTriangle, color: "text-warning" },
          { label: "Incidents", value: stats.incidents, icon: AlertCircle, color: "text-critical" },
        ].map((s) => (
          <div key={s.label} className="stat-card group">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground">{s.label}</span>
              <s.icon className={`w-4 h-4 ${s.color}`} />
            </div>
            <p className="text-2xl font-bold text-foreground">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Topology + Detail */}
      <div className={`flex ${isMobile ? "flex-col" : "flex-row"} gap-4`}>
        {/* Topology Map */}
        <div className="flex-1 bg-card border border-border rounded-lg overflow-hidden">
          <div className="section-header">
            <h2 className="section-title">Infrastructure Topology</h2>
            <div className="flex items-center gap-3">
              {(["healthy", "degraded", "incident"] as HealthStatus[]).map((s) => {
                const cfg = statusConfig[s];
                return (
                  <span key={s} className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                    <span className={`w-2 h-2 rounded-full ${cfg.bg} border ${cfg.border}`} />
                    {cfg.label}
                  </span>
                );
              })}
            </div>
          </div>

          <div className="relative w-full" style={{ paddingBottom: isMobile ? "70%" : "50%" }}>
            <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="dtGrid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="hsl(var(--border) / 0.3)" strokeWidth="0.5" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#dtGrid)" />

              {connections.map(([from, to]) => {
                const a = getNodePos(from);
                const b = getNodePos(to);
                const fromNode = nodes.find(n => n.id === from);
                const toNode = nodes.find(n => n.id === to);
                const hasIssue = fromNode && toNode && (fromNode.status !== "healthy" || toNode.status !== "healthy");
                const hasIncident = fromNode && toNode && (fromNode.status === "incident" || toNode.status === "incident");
                return (
                  <line
                    key={`${from}-${to}`}
                    x1={`${a.x}%`} y1={`${a.y}%`} x2={`${b.x}%`} y2={`${b.y}%`}
                    stroke={hasIncident ? "hsl(var(--critical) / 0.3)" : hasIssue ? "hsl(var(--warning) / 0.25)" : "hsl(var(--primary) / 0.12)"}
                    strokeWidth={hasIncident ? "1.5" : "1"}
                    strokeDasharray={hasIssue ? "4 4" : "none"}
                  />
                );
              })}
            </svg>

            {nodes.map((node) => {
              const cfg = statusConfig[node.status];
              const isSelected = selected?.id === node.id;
              return (
                <button
                  key={node.id}
                  onClick={() => setSelected(isSelected ? null : node)}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 z-10 group cursor-pointer transition-all duration-200 ${isSelected ? "scale-125" : "hover:scale-110"}`}
                  style={{ left: `${node.x}%`, top: `${node.y}%` }}
                >
                  {cfg.pulse && (
                    <span
                      className={`absolute inset-0 rounded-full ${cfg.bg} animate-ping`}
                      style={{ animationDuration: node.status === "incident" ? "1.5s" : "2.5s" }}
                    />
                  )}
                  <span className={`absolute -inset-2 rounded-full ${cfg.bg} opacity-50 blur-sm`} />
                  <span className={`relative block w-3.5 h-3.5 rounded-full border-2 ${cfg.border} ${cfg.bg}`}>
                    <span className={`absolute inset-0.5 rounded-full ${cfg.color.replace("text-", "bg-")}`} />
                  </span>
                  <span className={`absolute left-1/2 -translate-x-1/2 top-full mt-1.5 whitespace-nowrap text-[10px] font-medium ${isSelected ? "text-foreground" : "text-muted-foreground"} group-hover:text-foreground transition-colors`}>
                    {node.name}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Time-Travel Slider */}
          <div className="p-4 border-t border-border bg-background/50">
            <div className="flex items-center gap-3 mb-3">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 shrink-0"
                onClick={() => { if (hour >= 23) setHour(0); setPlaying(!playing); }}
              >
                {playing ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              </Button>
              <Slider
                value={[hour]}
                onValueChange={([v]) => { setHour(v); setPlaying(false); }}
                min={0} max={23} step={1}
                className="flex-1"
              />
              <span className="text-xs font-mono text-muted-foreground w-20 text-right shrink-0">{formatHour(hour)}</span>
            </div>
            <div className="flex items-center justify-between text-[9px] text-muted-foreground/60 px-1">
              <div className="flex justify-between flex-1">
                {[0, 6, 8, 12, 18, 23].map(h => (
                  <button key={h} onClick={() => { setHour(h); setPlaying(false); }} className="hover:text-foreground transition-colors cursor-pointer">
                    {formatHour(h)}
                  </button>
                ))}
              </div>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="ml-3 p-1 rounded hover:bg-secondary text-muted-foreground/40 hover:text-muted-foreground transition-colors">
                    <Keyboard className="w-3.5 h-3.5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top" className="text-[11px] leading-relaxed">
                  <p><kbd className="px-1 py-0.5 bg-secondary rounded text-[10px] font-mono">←</kbd> <kbd className="px-1 py-0.5 bg-secondary rounded text-[10px] font-mono">→</kbd> Step hours</p>
                  <p><kbd className="px-1 py-0.5 bg-secondary rounded text-[10px] font-mono">Space</kbd> Play/pause</p>
                  <p><kbd className="px-1 py-0.5 bg-secondary rounded text-[10px] font-mono">Esc</kbd> Deselect node</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
        </div>

        {/* Detail Panel */}
        {selected && (
          <div className={`${isMobile ? "w-full" : "w-80"} bg-card border border-border rounded-lg flex flex-col animate-slide-in`}>
            <div className="flex items-center justify-between p-4 border-b border-border/50">
              <div className="flex items-center gap-2">
                {(() => { const Icon = statusConfig[selected.status].icon; return <Icon className={`w-4 h-4 ${statusConfig[selected.status].color}`} />; })()}
                <span className="text-sm font-semibold">{selected.name}</span>
              </div>
              <button onClick={() => setSelected(null)} className="text-muted-foreground hover:text-foreground transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 space-y-4 flex-1 overflow-y-auto text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-muted-foreground mb-1">Status</p>
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${statusConfig[selected.status].bg} ${statusConfig[selected.status].color} border ${statusConfig[selected.status].border}`}>
                    {statusConfig[selected.status].label}
                  </span>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1">Region</p>
                  <p className="font-medium">{selected.region}</p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1">Category</p>
                  <p className="font-medium">{selected.category}</p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1">Time</p>
                  <p className="font-medium font-mono">{formatHour(hour)}</p>
                </div>
              </div>

              {selected.activeIncident && (
                <div>
                  <p className="text-muted-foreground mb-1.5">Active Incident</p>
                  <div className="bg-critical/5 border border-critical/20 rounded-md p-2.5 text-critical text-[11px]">
                    {selected.activeIncident}
                  </div>
                </div>
              )}

              {selected.affectedSystems && selected.affectedSystems.length > 0 && (
                <div>
                  <p className="text-muted-foreground mb-1.5">Affected Systems</p>
                  <div className="flex flex-wrap gap-1.5">
                    {selected.affectedSystems.map(sys => (
                      <span key={sys} className="px-2 py-0.5 rounded-full bg-secondary text-[10px] text-muted-foreground border border-border/50">{sys}</span>
                    ))}
                  </div>
                </div>
              )}

              {selected.recommendedActions && (
                <div>
                  <p className="text-muted-foreground mb-1.5">Recommended Actions</p>
                  <ul className="space-y-1.5">
                    {selected.recommendedActions.map((action, i) => (
                      <li key={i} className="flex items-start gap-2 text-foreground/80">
                        <span className="w-1 h-1 rounded-full bg-primary mt-1.5 shrink-0" />
                        {action}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Mini Event Log */}
              {nodeEvents.length > 0 && (
                <div>
                  <p className="text-muted-foreground mb-1.5">Recent Events</p>
                  <div className="space-y-1.5">
                    {nodeEvents.map((evt) => {
                      const icon = evt.type === "critical"
                        ? <ShieldAlert className="w-3 h-3 text-critical shrink-0" />
                        : evt.type === "warning"
                          ? <AlertTriangle className="w-3 h-3 text-warning shrink-0" />
                          : evt.type === "success"
                            ? <CheckCircle2 className="w-3 h-3 text-success shrink-0" />
                            : <Bell className="w-3 h-3 text-info shrink-0" />;
                      const secs = Math.floor((Date.now() - evt.timestamp.getTime()) / 1000);
                      const ago = secs < 60 ? `${secs}s` : `${Math.floor(secs / 60)}m`;
                      return (
                        <div key={evt.id} className="flex items-start gap-2 text-[10px] text-foreground/70">
                          {icon}
                          <span className="flex-1 leading-relaxed">{evt.message}</span>
                          <span className="text-muted-foreground/60 font-mono shrink-0">{ago}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {selected.incidentId && selected.status !== "healthy" && (
                <Button
                  className="w-full mt-2"
                  size="sm"
                  onClick={() => navigate(`/autopilot?incident=${selected.incidentId}`)}
                >
                  <Activity className="w-3.5 h-3.5 mr-1.5" />
                  Run Diagnostics
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
