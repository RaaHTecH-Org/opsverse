import { useState, useEffect } from "react";
import { Timer, Clock, ShieldAlert, Server } from "lucide-react";
import { timeToBurn, type TimeToBurnItem } from "@/data/mock-data";
import { useSimulation } from "@/hooks/use-simulation";

function burnColor(remaining: number, total: number): string {
  const pct = remaining / total;
  if (pct > 0.5) return "bg-success";
  if (pct > 0.2) return "bg-warning";
  return "bg-critical";
}

function burnTextColor(remaining: number, total: number): string {
  const pct = remaining / total;
  if (pct > 0.5) return "text-success";
  if (pct > 0.2) return "text-warning";
  return "text-critical";
}

function formatTime(minutes: number): string {
  if (minutes <= 0) return "0m";
  if (minutes >= 60) return `${Math.floor(minutes / 60)}h ${Math.round(minutes % 60)}m`;
  return `${Math.round(minutes)}m`;
}

const burnMetrics = [
  { key: "slaBreach" as const, label: "SLA Breach", icon: Clock },
  { key: "capacityExhaustion" as const, label: "Capacity", icon: Server },
  { key: "securityEscalation" as const, label: "Security Esc.", icon: ShieldAlert },
];

export default function TimeToBurn() {
  const { isSimulating } = useSimulation();
  const [liveData, setLiveData] = useState<TimeToBurnItem[]>(timeToBurn);

  // Reset when simulation stops
  useEffect(() => {
    if (!isSimulating) {
      setLiveData(timeToBurn);
    }
  }, [isSimulating]);

  // Countdown tick every 10s when simulating (decrement by 1 minute each tick)
  useEffect(() => {
    if (!isSimulating) return;

    const interval = setInterval(() => {
      setLiveData((prev) =>
        prev.map((item) => ({
          ...item,
          slaBreach: { ...item.slaBreach, minutes: Math.max(0, item.slaBreach.minutes - 1) },
          capacityExhaustion: { ...item.capacityExhaustion, minutes: Math.max(0, item.capacityExhaustion.minutes - 0.5) },
          securityEscalation: { ...item.securityEscalation, minutes: Math.max(0, item.securityEscalation.minutes - 1) },
        }))
      );
    }, 10000);

    return () => clearInterval(interval);
  }, [isSimulating]);

  return (
    <div className="bg-card border border-border rounded-lg">
      <div className="section-header">
        <div className="flex items-center gap-2">
          <Timer className="w-4 h-4 text-warning" />
          <h2 className="section-title">Time to Burn</h2>
        </div>
        <div className="flex items-center gap-2">
          {isSimulating && (
            <span className="text-[9px] bg-success/15 text-success px-2 py-0.5 rounded-full font-medium animate-pulse">
              LIVE
            </span>
          )}
          <span className="text-[10px] text-muted-foreground font-mono">Predictive countdown</span>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-border/40">
        {liveData.map((item) => (
          <div key={item.incidentId} className="p-4 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-xs font-medium truncate">{item.title}</p>
                <p className="text-[10px] text-muted-foreground font-mono">{item.incidentId}</p>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium capitalize shrink-0 ${
                item.severity === "critical" ? "bg-critical/15 text-critical" : "bg-warning/15 text-warning"
              }`}>{item.severity}</span>
            </div>
            <div className="space-y-2.5">
              {burnMetrics.map((metric) => {
                const data = item[metric.key];
                const pct = (data.minutes / data.total) * 100;
                return (
                  <div key={metric.key} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <metric.icon className={`w-3 h-3 ${burnTextColor(data.minutes, data.total)}`} />
                        <span className="text-[10px] text-muted-foreground">{metric.label}</span>
                      </div>
                      <span className={`text-[11px] font-mono font-medium ${burnTextColor(data.minutes, data.total)}`}>
                        {formatTime(data.minutes)}
                      </span>
                    </div>
                    <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${burnColor(data.minutes, data.total)}`}
                        style={{ width: `${Math.max(0, pct)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
