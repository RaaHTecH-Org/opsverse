import { useState, useMemo } from "react";
import { Globe, ShieldAlert, MapPin, Shield, Clock, Server, Ban, AlertTriangle, ExternalLink, Filter } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { continentPaths, hqTarget } from "./worldMapPaths";
import { addAuditEntry } from "@/hooks/use-security-audit";
import { useSimulation } from "@/hooks/use-simulation";
import { useThreatCounters } from "@/hooks/use-threat-counters";

interface RelatedAlert {
  id: string;
  title: string;
  severity: "critical" | "high" | "medium";
}

interface ThreatActor {
  ip: string;
  location: string;
  country: string;
  x: number;
  y: number;
  attempts: number;
  risk: "critical" | "high" | "medium";
  isp: string;
  asn: string;
  firstSeen: string;
  lastAttempt: string;
  relatedAlerts: RelatedAlert[];
}

const threatActors: ThreatActor[] = [
  {
    ip: "185.220.101.xx", location: "Moscow, Russia", country: "RU",
    x: 580, y: 105, attempts: 47, risk: "critical",
    isp: "Selectel Ltd", asn: "AS49505",
    firstSeen: "2024-01-15 03:42 UTC", lastAttempt: "2 min ago",
    relatedAlerts: [
      { id: "DEF-1001", title: "Brute force attack detected", severity: "critical" },
      { id: "DEF-1002", title: "Multiple failed auth attempts", severity: "high" },
    ],
  },
  {
    ip: "91.240.118.xx", location: "Kyiv, Ukraine", country: "UA",
    x: 540, y: 118, attempts: 23, risk: "high",
    isp: "Datagroup JSC", asn: "AS21497",
    firstSeen: "2024-01-16 11:20 UTC", lastAttempt: "8 min ago",
    relatedAlerts: [{ id: "DEF-1003", title: "Suspicious login pattern", severity: "high" }],
  },
  {
    ip: "194.36.189.xx", location: "Bucharest, Romania", country: "RO",
    x: 520, y: 128, attempts: 15, risk: "high",
    isp: "M247 Ltd", asn: "AS9009",
    firstSeen: "2024-01-17 08:15 UTC", lastAttempt: "15 min ago",
    relatedAlerts: [{ id: "DEF-1004", title: "Password spray attempt", severity: "high" }],
  },
  {
    ip: "45.155.205.xx", location: "Amsterdam, Netherlands", country: "NL",
    x: 475, y: 100, attempts: 8, risk: "medium",
    isp: "IPXO Limited", asn: "AS206092",
    firstSeen: "2024-01-18 14:30 UTC", lastAttempt: "32 min ago",
    relatedAlerts: [],
  },
  {
    ip: "103.75.201.xx", location: "Beijing, China", country: "CN",
    x: 715, y: 130, attempts: 12, risk: "high",
    isp: "Alibaba Cloud", asn: "AS37963",
    firstSeen: "2024-01-16 22:45 UTC", lastAttempt: "5 min ago",
    relatedAlerts: [{ id: "DEF-1005", title: "Credential stuffing detected", severity: "high" }],
  },
  {
    ip: "200.68.112.xx", location: "São Paulo, Brazil", country: "BR",
    x: 215, y: 305, attempts: 31, risk: "critical",
    isp: "Locaweb Serviços", asn: "AS27715",
    firstSeen: "2024-01-14 18:10 UTC", lastAttempt: "1 min ago",
    relatedAlerts: [
      { id: "DEF-1006", title: "Botnet C2 callback detected", severity: "critical" },
      { id: "DEF-1007", title: "Automated exploit scanner", severity: "high" },
    ],
  },
  {
    ip: "190.14.233.xx", location: "Buenos Aires, Argentina", country: "AR",
    x: 198, y: 345, attempts: 9, risk: "medium",
    isp: "Telecom Argentina", asn: "AS7303",
    firstSeen: "2024-01-19 09:55 UTC", lastAttempt: "45 min ago",
    relatedAlerts: [],
  },
  {
    ip: "41.222.196.xx", location: "Lagos, Nigeria", country: "NG",
    x: 468, y: 210, attempts: 28, risk: "high",
    isp: "MainOne Cable", asn: "AS37282",
    firstSeen: "2024-01-15 14:30 UTC", lastAttempt: "4 min ago",
    relatedAlerts: [{ id: "DEF-1008", title: "Phishing relay detected", severity: "high" }],
  },
  {
    ip: "102.89.47.xx", location: "Johannesburg, South Africa", country: "ZA",
    x: 510, y: 305, attempts: 18, risk: "high",
    isp: "Afrihost", asn: "AS37611",
    firstSeen: "2024-01-17 21:15 UTC", lastAttempt: "12 min ago",
    relatedAlerts: [{ id: "DEF-1009", title: "SSH brute force attempt", severity: "high" }],
  },
  {
    ip: "196.216.65.xx", location: "Nairobi, Kenya", country: "KE",
    x: 540, y: 238, attempts: 6, risk: "medium",
    isp: "Safaricom PLC", asn: "AS33771",
    firstSeen: "2024-01-20 06:40 UTC", lastAttempt: "1 hr ago",
    relatedAlerts: [],
  },
];

const riskConfig = {
  critical: { color: "text-critical", bg: "bg-critical", pulse: "animate-pulse", stroke: "hsl(var(--critical))" },
  high: { color: "text-warning", bg: "bg-warning", pulse: "", stroke: "hsl(var(--warning))" },
  medium: { color: "text-info", bg: "bg-info", pulse: "", stroke: "hsl(var(--info))" },
};

type RiskLevel = "critical" | "high" | "medium";

export default function ThreatMap() {
  const { isSimulating } = useSimulation();
  const actorKeys = useMemo(() => threatActors.map((a) => a.ip), []);
  const deltas = useThreatCounters(actorKeys, isSimulating);

  const liveActors = useMemo(() => {
    if (!isSimulating) return threatActors;
    return threatActors.map((a) => ({
      ...a,
      attempts: a.attempts + (deltas.get(a.ip) ?? 0),
    }));
  }, [isSimulating, deltas]);

  const [selectedActor, setSelectedActor] = useState<ThreatActor | null>(null);
  const [hoveredActor, setHoveredActor] = useState<ThreatActor | null>(null);
  const [visibleSeverities, setVisibleSeverities] = useState<Set<RiskLevel>>(new Set(["critical", "high", "medium"]));

  const toggleSeverity = (level: RiskLevel) => {
    setVisibleSeverities((prev) => {
      const next = new Set(prev);
      if (next.has(level)) {
        if (next.size > 1) next.delete(level);
      } else {
        next.add(level);
      }
      return next;
    });
  };

  const filteredActors = liveActors.filter((a) => visibleSeverities.has(a.risk));

  const handleBlockIP = (ip: string) => {
    toast.success(`Blocked IP range ${ip.replace('xx', '0/24')}`, { description: "Firewall rule created successfully" });
    addAuditEntry("block_ip", ip.replace('xx', '0/24'), "Firewall rule created — blocked entire /24 range");
    setSelectedActor(null);
  };
  const handleEnableGeoFencing = (country: string) => {
    toast.success(`Geo-fencing enabled for ${country}`, { description: "All traffic from this region will be blocked" });
    addAuditEntry("geo_fence", country, `Geo-fencing enabled — all traffic from ${country} blocked`);
  };
  const handleEscalateToSOC = (ip: string) => {
    toast.info(`Escalated to SOC team`, { description: `Ticket created for IP ${ip}` });
    addAuditEntry("escalate_soc", ip, `SOC ticket created for threat investigation`);
  };

  return (
    <div className="bg-card border border-border rounded-lg">
      <div className="section-header">
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-critical" />
          <h2 className="section-title">Threat Origin Map</h2>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Severity Filters */}
          <div className="flex items-center gap-1">
            <Filter className="w-3 h-3 text-muted-foreground" />
            {(["critical", "high", "medium"] as RiskLevel[]).map((level) => {
              const active = visibleSeverities.has(level);
              const colors = {
                critical: active ? "bg-critical/20 text-critical border-critical/40" : "bg-muted/20 text-muted-foreground border-border",
                high: active ? "bg-warning/20 text-warning border-warning/40" : "bg-muted/20 text-muted-foreground border-border",
                medium: active ? "bg-info/20 text-info border-info/40" : "bg-muted/20 text-muted-foreground border-border",
              };
              return (
                <button
                  key={level}
                  onClick={() => toggleSeverity(level)}
                  className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium capitalize border transition-colors cursor-pointer ${colors[level]}`}
                >
                  {level}
                </button>
              );
            })}
          </div>
          <span className="text-[10px] text-muted-foreground font-mono">
            {filteredActors.reduce((s, a) => s + a.attempts, 0)} total attempts
          </span>
          <span className="text-[10px] bg-critical/15 text-critical px-2 py-0.5 rounded-full font-medium">
            INC-008 — Active Threat
          </span>
        </div>
      </div>

      <div className="p-4">
        {/* SVG World Map with real continent outlines */}
        <div className="relative w-full overflow-hidden rounded-lg bg-[hsl(var(--secondary)/0.15)] border border-border/20">
          <svg viewBox="0 0 1000 500" className="w-full h-auto" xmlns="http://www.w3.org/2000/svg">
            {/* Graticule */}
            {[100,200,300,400,500,600,700,800,900].map(x => (
              <line key={`v${x}`} x1={x} y1={0} x2={x} y2={500} stroke="hsl(var(--border))" strokeOpacity={0.06} strokeWidth={0.5} />
            ))}
            {[100,200,300,400].map(y => (
              <line key={`h${y}`} x1={0} y1={y} x2={1000} y2={y} stroke="hsl(var(--border))" strokeOpacity={0.06} strokeWidth={0.5} />
            ))}

            {/* Continent shapes */}
            {continentPaths.map((c) => (
              <path
                key={c.id}
                d={c.d}
                fill="hsl(var(--muted-foreground))"
                fillOpacity={0.08}
                stroke="hsl(var(--muted-foreground))"
                strokeOpacity={0.18}
                strokeWidth={0.8}
                strokeLinejoin="round"
              />
            ))}

            {/* Attack lines */}
            {filteredActors.map((actor) => {
              const cfg = riskConfig[actor.risk];
              const isHovered = hoveredActor?.ip === actor.ip;
              return (
                <line
                  key={`line-${actor.ip}`}
                  x1={actor.x} y1={actor.y} x2={hqTarget.x} y2={hqTarget.y}
                  stroke={cfg.stroke}
                  strokeOpacity={isHovered ? 0.5 : 0.18}
                  strokeWidth={isHovered ? 1.5 : 0.8}
                  strokeDasharray="5 4"
                  className="transition-all duration-200"
                />
              );
            })}

            {/* Animated bullets */}
            {filteredActors.map((actor, idx) => {
              const cfg = riskConfig[actor.risk];
              const dur = actor.risk === "critical" ? "1.5s" : actor.risk === "high" ? "2s" : "2.5s";
              const delay = `${idx * 0.4}s`;
              const path = `M${actor.x},${actor.y} L${hqTarget.x},${hqTarget.y}`;
              return (
                <g key={`bullet-${actor.ip}`}>
                  <circle r={actor.risk === "critical" ? 4 : 3} fill={cfg.stroke}>
                    <animateMotion dur={dur} repeatCount="indefinite" path={path} begin={delay} />
                    <animate attributeName="opacity" values="1;0.6;1" dur={dur} repeatCount="indefinite" begin={delay} />
                  </circle>
                  {actor.risk === "critical" && (
                    <circle r={7} fill={cfg.stroke} opacity={0.15}>
                      <animateMotion dur={dur} repeatCount="indefinite" path={path} begin={delay} />
                      <animate attributeName="opacity" values="0.15;0.03;0.15" dur={dur} repeatCount="indefinite" begin={delay} />
                    </circle>
                  )}
                </g>
              );
            })}

            {/* HQ target */}
            <circle cx={hqTarget.x} cy={hqTarget.y} r={12} fill="hsl(var(--primary))" fillOpacity={0.12} stroke="hsl(var(--primary))" strokeWidth={1.5} />
            <circle cx={hqTarget.x} cy={hqTarget.y} r={5} fill="hsl(var(--primary))" />
            <circle cx={hqTarget.x} cy={hqTarget.y} r={12} fill="none" stroke="hsl(var(--primary))" strokeOpacity={0.3}>
              <animate attributeName="r" values="12;24;12" dur="3s" repeatCount="indefinite" />
              <animate attributeName="stroke-opacity" values="0.3;0;0.3" dur="3s" repeatCount="indefinite" />
            </circle>
            <text x={hqTarget.x} y={hqTarget.y - 18} textAnchor="middle" fill="hsl(var(--primary))" fontSize={11} fontWeight={600}>HQ</text>

            {/* Threat actor points — interactive */}
            {filteredActors.map((actor) => {
              const cfg = riskConfig[actor.risk];
              const isHovered = hoveredActor?.ip === actor.ip;
              return (
                <g
                  key={actor.ip}
                  className="cursor-pointer"
                  onClick={() => setSelectedActor(actor)}
                  onMouseEnter={() => setHoveredActor(actor)}
                  onMouseLeave={() => setHoveredActor(null)}
                >
                  <circle cx={actor.x} cy={actor.y} r={isHovered ? 14 : 10} fill={cfg.stroke} fillOpacity={isHovered ? 0.3 : 0.15} stroke={cfg.stroke} strokeWidth={1.5} className="transition-all duration-150" />
                  <circle cx={actor.x} cy={actor.y} r={4} fill={cfg.stroke} />
                  {actor.risk === "critical" && (
                    <circle cx={actor.x} cy={actor.y} r={10} fill="none" stroke={cfg.stroke} strokeOpacity={0.3}>
                      <animate attributeName="r" values="8;18;8" dur="2s" repeatCount="indefinite" />
                      <animate attributeName="stroke-opacity" values="0.4;0;0.4" dur="2s" repeatCount="indefinite" />
                    </circle>
                  )}
                </g>
              );
            })}

            {/* Hover tooltip */}
            {hoveredActor && (() => {
              const tooltipW = 120;
              const tooltipH = 36;
              const tx = Math.min(Math.max(hoveredActor.x - tooltipW / 2, 4), 1000 - tooltipW - 4);
              const ty = hoveredActor.y - 24 - tooltipH;
              return (
                <g className="pointer-events-none">
                  <rect x={tx} y={ty} width={tooltipW} height={tooltipH} rx={5} fill="hsl(var(--popover))" stroke="hsl(var(--border))" strokeWidth={0.5} />
                  <text x={tx + tooltipW / 2} y={ty + 14} textAnchor="middle" fill="hsl(var(--foreground))" fontSize={9} fontWeight={600} fontFamily="monospace">{hoveredActor.ip}</text>
                  <text x={tx + tooltipW / 2} y={ty + 26} textAnchor="middle" fill="hsl(var(--muted-foreground))" fontSize={7.5}>{hoveredActor.location} — {hoveredActor.attempts} attempts</text>
                </g>
              );
            })()}
          </svg>
        </div>

        {/* Legend */}
        <div className="mt-3 flex flex-wrap items-center gap-3 sm:gap-4 text-[10px] text-muted-foreground">
          <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-primary" /><span>HQ Target</span></div>
          <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-critical" /><span>Critical</span></div>
          <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-warning" /><span>High</span></div>
          <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-info" /><span>Medium</span></div>
        </div>

        {/* Threat Actor Table */}
        <div className="mt-4 space-y-2">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium flex items-center gap-1.5">
            <ShieldAlert className="w-3 h-3" />
            Threat Actor IPs — Password Spray Campaign
          </p>
          <div className="divide-y divide-border/40">
            {filteredActors.map((actor) => {
              const cfg = riskConfig[actor.risk];
              const isHovered = hoveredActor?.ip === actor.ip;
              return (
                <div
                  key={actor.ip}
                  className={`flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 py-3 cursor-pointer rounded-md px-2 -mx-2 transition-colors ${isHovered ? "bg-muted/30" : "hover:bg-muted/20"}`}
                  onClick={() => setSelectedActor(actor)}
                  onMouseEnter={() => setHoveredActor(actor)}
                  onMouseLeave={() => setHoveredActor(null)}
                >
                  <div className="flex items-center gap-2 sm:gap-3">
                    <MapPin className={`w-3.5 h-3.5 ${cfg.color} shrink-0 ${cfg.pulse}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-mono">{actor.ip}</span>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium capitalize ${
                          actor.risk === "critical" ? "bg-critical/15 text-critical" :
                          actor.risk === "high" ? "bg-warning/15 text-warning" : "bg-info/15 text-info"
                        }`}>{actor.risk}</span>
                      </div>
                      <p className="text-[10px] text-muted-foreground">{actor.location}</p>
                    </div>
                  </div>
                  <span className="text-[11px] font-mono text-muted-foreground sm:ml-auto">{actor.attempts} attempts</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Detail Dialog */}
      <Dialog open={!!selectedActor} onOpenChange={() => setSelectedActor(null)}>
        <DialogContent className="max-w-lg sm:max-w-xl max-h-[90vh] overflow-y-auto">
          {selectedActor && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2">
                  <Shield className={`w-5 h-5 ${riskConfig[selectedActor.risk].color}`} />
                  <DialogTitle className="text-base">Threat Actor Details</DialogTitle>
                </div>
                <DialogDescription className="sr-only">
                  Detailed information about threat actor {selectedActor.ip}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 mt-2">
                <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                  <div>
                    <p className="text-sm font-mono font-medium">{selectedActor.ip}</p>
                    <p className="text-xs text-muted-foreground">{selectedActor.location}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium capitalize ${
                    selectedActor.risk === "critical" ? "bg-critical/15 text-critical" :
                    selectedActor.risk === "high" ? "bg-warning/15 text-warning" : "bg-info/15 text-info"
                  }`}>{selectedActor.risk} risk</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-muted/20 rounded-lg">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">ISP</p>
                    <p className="text-xs font-medium">{selectedActor.isp}</p>
                  </div>
                  <div className="p-3 bg-muted/20 rounded-lg">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">ASN</p>
                    <p className="text-xs font-mono">{selectedActor.asn}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <Clock className="w-3 h-3" /> Attack Timeline
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                    <div className="p-2 bg-muted/20 rounded">
                      <p className="text-muted-foreground text-[10px]">First Seen</p>
                      <p className="font-mono">{selectedActor.firstSeen}</p>
                    </div>
                    <div className="p-2 bg-muted/20 rounded">
                      <p className="text-muted-foreground text-[10px]">Last Attempt</p>
                      <p className="font-mono text-critical">{selectedActor.lastAttempt}</p>
                    </div>
                    <div className="p-2 bg-muted/20 rounded">
                      <p className="text-muted-foreground text-[10px]">Total Attempts</p>
                      <p className="font-mono font-semibold">{selectedActor.attempts}</p>
                    </div>
                  </div>
                </div>
                {selectedActor.relatedAlerts.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                      <AlertTriangle className="w-3 h-3" /> Related Defender Alerts
                    </p>
                    <div className="space-y-2">
                      {selectedActor.relatedAlerts.map((alert) => (
                        <div key={alert.id} className="flex items-center gap-3 p-2 bg-muted/20 rounded-lg">
                          <ShieldAlert className={`w-4 h-4 shrink-0 ${
                            alert.severity === "critical" ? "text-critical" :
                            alert.severity === "high" ? "text-warning" : "text-info"
                          }`} />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs truncate">{alert.title}</p>
                            <p className="text-[10px] text-muted-foreground font-mono">{alert.id}</p>
                          </div>
                          <ExternalLink className="w-3 h-3 text-muted-foreground" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <div className="space-y-2">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <Server className="w-3 h-3" /> Recommended Actions
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" variant="destructive" className="h-8 text-xs" onClick={() => handleBlockIP(selectedActor.ip)}>
                      <Ban className="w-3 h-3 mr-1" /> Block IP Range
                    </Button>
                    <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => handleEnableGeoFencing(selectedActor.country)}>
                      <Globe className="w-3 h-3 mr-1" /> Enable Geo-fencing
                    </Button>
                    <Button size="sm" variant="secondary" className="h-8 text-xs" onClick={() => handleEscalateToSOC(selectedActor.ip)}>
                      <AlertTriangle className="w-3 h-3 mr-1" /> Escalate to SOC
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
