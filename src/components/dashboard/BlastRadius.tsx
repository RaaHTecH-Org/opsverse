import { Flame, Users, MapPin, GitBranch, AlertTriangle } from "lucide-react";
import { blastRadiusData } from "@/data/mock-data";

const statusColors = {
  impacted: "bg-critical text-critical",
  degraded: "bg-warning text-warning",
  "at-risk": "bg-info text-info",
};

export default function BlastRadius() {
  return (
    <div className="bg-card border border-border rounded-lg">
      <div className="section-header">
        <div className="flex items-center gap-2">
          <Flame className="w-4 h-4 text-critical" />
          <h2 className="section-title">Blast Radius</h2>
        </div>
        <span className="text-[10px] text-muted-foreground font-mono">Impact analysis</span>
      </div>

      <div className="divide-y divide-border/40">
        {blastRadiusData.map((item) => (
          <div key={item.incidentId} className="p-4 space-y-3">
            {/* Header */}
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-muted-foreground">{item.incidentId}</span>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium capitalize ${
                    item.severity === "critical" ? "bg-critical/15 text-critical" : "bg-warning/15 text-warning"
                  }`}>{item.severity}</span>
                </div>
                <p className="text-xs font-medium mt-0.5">{item.title}</p>
              </div>
            </div>

            {/* Impact metrics row */}
            <div className="grid grid-cols-3 gap-2">
              <div className="flex items-center gap-1.5 text-[10px]">
                <Users className="w-3 h-3 text-muted-foreground" />
                <span className="font-mono font-medium">{item.affectedUsers.toLocaleString()}</span>
                <span className="text-muted-foreground">users</span>
              </div>
              <div className="flex items-center gap-1.5 text-[10px]">
                <AlertTriangle className="w-3 h-3 text-muted-foreground" />
                <span className="font-mono font-medium">{item.affectedServices.length}</span>
                <span className="text-muted-foreground">services</span>
              </div>
              <div className="flex items-center gap-1.5 text-[10px]">
                <MapPin className="w-3 h-3 text-muted-foreground" />
                <span className="font-mono font-medium">{item.affectedRegions.length}</span>
                <span className="text-muted-foreground">regions</span>
              </div>
            </div>

            {/* Affected services */}
            <div className="flex flex-wrap gap-1.5">
              {item.affectedServices.map((svc) => (
                <span
                  key={svc.name}
                  className={`text-[9px] px-2 py-0.5 rounded-full font-medium bg-opacity-15 ${statusColors[svc.status]}`}
                >
                  {svc.name}
                </span>
              ))}
            </div>

            {/* Dependency chain */}
            <div className="flex items-center gap-1 text-[10px] text-muted-foreground overflow-x-auto pb-1">
              <GitBranch className="w-3 h-3 shrink-0" />
              {item.dependencyChain.map((dep, i) => (
                <span key={dep} className="flex items-center gap-1 shrink-0">
                  <span className="bg-secondary px-1.5 py-0.5 rounded text-[9px]">{dep}</span>
                  {i < item.dependencyChain.length - 1 && <span className="text-muted-foreground/50">→</span>}
                </span>
              ))}
            </div>

            {/* Business impact */}
            <p className="text-[10px] text-warning/90 bg-warning/10 px-2 py-1 rounded">
              {item.businessImpact}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
