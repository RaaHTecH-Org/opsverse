import { useState } from "react";
import { X, AlertTriangle, CheckCircle2, AlertCircle, HelpCircle } from "lucide-react";

type HealthStatus = "healthy" | "degraded" | "incident" | "unknown";

interface ServiceNode {
  id: string;
  name: string;
  category: string;
  status: HealthStatus;
  region?: string;
  x: number; // percentage position
  y: number;
  activeIncident?: string;
  affectedSystems?: string[];
  recommendedActions?: string[];
}

const serviceNodes: ServiceNode[] = [
  {
    id: "azure-east",
    name: "Azure East US",
    category: "Cloud Region",
    status: "healthy",
    region: "East US",
    x: 28,
    y: 38,
    affectedSystems: [],
    recommendedActions: ["No action required"],
  },
  {
    id: "azure-west",
    name: "Azure West US",
    category: "Cloud Region",
    status: "degraded",
    region: "West US",
    x: 12,
    y: 42,
    activeIncident: "Intermittent latency on compute services",
    affectedSystems: ["Azure VMs", "App Services"],
    recommendedActions: ["Monitor latency metrics", "Prepare failover to East US"],
  },
  {
    id: "entra-id",
    name: "Microsoft Entra ID",
    category: "Identity",
    status: "incident",
    region: "Global",
    x: 50,
    y: 22,
    activeIncident: "Authentication latency spike",
    affectedSystems: ["Azure AD", "SSO Services", "Conditional Access"],
    recommendedActions: [
      "Investigate authentication service logs",
      "Review identity infrastructure metrics",
      "Check token issuance pipeline",
    ],
  },
  {
    id: "defender",
    name: "Microsoft Defender",
    category: "Security",
    status: "healthy",
    region: "Global",
    x: 72,
    y: 30,
    affectedSystems: [],
    recommendedActions: ["No action required"],
  },
  {
    id: "vpn-gateway",
    name: "VPN Gateway Cluster",
    category: "Network",
    status: "degraded",
    region: "Multi-region",
    x: 35,
    y: 65,
    activeIncident: "Packet loss on west region tunnel",
    affectedSystems: ["Remote Access VPN", "Site-to-Site VPN"],
    recommendedActions: ["Restart VPN Gateway", "Check tunnel health metrics"],
  },
  {
    id: "exchange",
    name: "Exchange Online",
    category: "M365 Service",
    status: "healthy",
    region: "Global",
    x: 62,
    y: 58,
    affectedSystems: [],
    recommendedActions: ["No action required"],
  },
  {
    id: "sharepoint",
    name: "SharePoint Online",
    category: "M365 Service",
    status: "healthy",
    region: "Global",
    x: 82,
    y: 55,
    affectedSystems: [],
    recommendedActions: ["No action required"],
  },
];

const connections: [string, string][] = [
  ["azure-east", "entra-id"],
  ["azure-west", "entra-id"],
  ["entra-id", "defender"],
  ["azure-east", "vpn-gateway"],
  ["azure-west", "vpn-gateway"],
  ["entra-id", "exchange"],
  ["entra-id", "sharepoint"],
  ["exchange", "sharepoint"],
  ["defender", "sharepoint"],
];

const statusConfig: Record<HealthStatus, { color: string; bg: string; border: string; pulse: boolean; label: string; icon: typeof CheckCircle2 }> = {
  healthy: { color: "text-success", bg: "bg-success/15", border: "border-success/40", pulse: false, label: "Healthy", icon: CheckCircle2 },
  degraded: { color: "text-warning", bg: "bg-warning/15", border: "border-warning/40", pulse: true, label: "Degraded", icon: AlertTriangle },
  incident: { color: "text-critical", bg: "bg-critical/15", border: "border-critical/40", pulse: true, label: "Incident", icon: AlertCircle },
  unknown: { color: "text-muted-foreground", bg: "bg-muted/15", border: "border-muted/40", pulse: false, label: "Unknown", icon: HelpCircle },
};

function getNodePos(id: string) {
  const node = serviceNodes.find((n) => n.id === id);
  return node ? { x: node.x, y: node.y } : { x: 0, y: 0 };
}

export default function ServiceHealthMap() {
  const [selected, setSelected] = useState<ServiceNode | null>(null);

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      <div className="section-header">
        <h2 className="section-title">Service Health Map</h2>
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

      <div className="relative w-full" style={{ paddingBottom: "45%" }}>
        {/* Grid background */}
        <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="healthGrid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="hsl(222 18% 14%)" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#healthGrid)" />

          {/* Connection lines */}
          {connections.map(([from, to]) => {
            const a = getNodePos(from);
            const b = getNodePos(to);
            const fromNode = serviceNodes.find((n) => n.id === from);
            const toNode = serviceNodes.find((n) => n.id === to);
            const hasIssue =
              fromNode && toNode &&
              (fromNode.status !== "healthy" || toNode.status !== "healthy");
            return (
              <line
                key={`${from}-${to}`}
                x1={`${a.x}%`}
                y1={`${a.y}%`}
                x2={`${b.x}%`}
                y2={`${b.y}%`}
                stroke={hasIssue ? "hsl(var(--warning) / 0.2)" : "hsl(var(--primary) / 0.12)"}
                strokeWidth="1"
                strokeDasharray={hasIssue ? "4 4" : "none"}
              />
            );
          })}
        </svg>

        {/* Nodes */}
        {serviceNodes.map((node) => {
          const cfg = statusConfig[node.status];
          const isSelected = selected?.id === node.id;
          return (
            <button
              key={node.id}
              onClick={() => setSelected(isSelected ? null : node)}
              className={`absolute -translate-x-1/2 -translate-y-1/2 z-10 group cursor-pointer transition-all duration-200 ${isSelected ? "scale-110" : "hover:scale-105"}`}
              style={{ left: `${node.x}%`, top: `${node.y}%` }}
            >
              {/* Pulse ring for degraded/incident */}
              {cfg.pulse && (
                <span
                  className={`absolute inset-0 rounded-full ${cfg.bg} animate-ping`}
                  style={{ animationDuration: node.status === "incident" ? "1.5s" : "2.5s" }}
                />
              )}
              {/* Glow */}
              <span className={`absolute -inset-2 rounded-full ${cfg.bg} opacity-50 blur-sm`} />
              {/* Dot */}
              <span className={`relative block w-3.5 h-3.5 rounded-full border-2 ${cfg.border} ${cfg.bg}`}>
                <span className={`absolute inset-0.5 rounded-full ${cfg.color.replace("text-", "bg-")}`} />
              </span>
              {/* Label */}
              <span className={`absolute left-1/2 -translate-x-1/2 top-full mt-1.5 whitespace-nowrap text-[10px] font-medium ${isSelected ? "text-foreground" : "text-muted-foreground"} group-hover:text-foreground transition-colors`}>
                {node.name}
              </span>
            </button>
          );
        })}

        {/* Detail Panel */}
        {selected && (
          <div className="absolute right-3 top-3 bottom-3 w-72 bg-background/95 backdrop-blur-md border border-border rounded-lg shadow-2xl z-20 flex flex-col animate-slide-in">
            <div className="flex items-center justify-between p-4 border-b border-border/50">
              <div className="flex items-center gap-2">
                {(() => {
                  const Icon = statusConfig[selected.status].icon;
                  return <Icon className={`w-4 h-4 ${statusConfig[selected.status].color}`} />;
                })()}
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
              </div>

              {selected.activeIncident && (
                <div>
                  <p className="text-muted-foreground mb-1.5">Active Incident</p>
                  <div className="bg-critical/5 border border-critical/20 rounded-md p-2.5 text-critical">
                    {selected.activeIncident}
                  </div>
                </div>
              )}

              {selected.affectedSystems && selected.affectedSystems.length > 0 && (
                <div>
                  <p className="text-muted-foreground mb-1.5">Affected Systems</p>
                  <div className="flex flex-wrap gap-1.5">
                    {selected.affectedSystems.map((sys) => (
                      <span key={sys} className="px-2 py-0.5 rounded-full bg-secondary text-[10px] text-muted-foreground border border-border/50">
                        {sys}
                      </span>
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
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
