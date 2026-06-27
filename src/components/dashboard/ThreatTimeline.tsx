import { useState, useEffect, useRef, useMemo } from "react";
import { Activity, Download } from "lucide-react";
import { useSimulation } from "@/hooks/use-simulation";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface TimePoint {
  time: string;
  critical: number;
  warning: number;
  info: number;
  total: number;
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

export default function ThreatTimeline() {
  const { notifications, isSimulating } = useSimulation();
  const [timeline, setTimeline] = useState<TimePoint[]>([]);
  const cumulativeRef = useRef({ critical: 0, warning: 0, info: 0 });

  // Reset when simulation stops
  useEffect(() => {
    if (!isSimulating) {
      setTimeline([]);
      cumulativeRef.current = { critical: 0, warning: 0, info: 0 };
    }
  }, [isSimulating]);

  // Sample cumulative counts every 3 seconds while simulating
  useEffect(() => {
    if (!isSimulating) return;

    const tick = () => {
      const now = new Date();
      // Count notification types from all notifications
      const counts = { critical: 0, warning: 0, info: 0 };
      for (const n of notifications) {
        if (n.type === "critical") counts.critical++;
        else if (n.type === "warning") counts.warning++;
        else counts.info++;
      }

      const point: TimePoint = {
        time: formatTime(now),
        critical: counts.critical,
        warning: counts.warning,
        info: counts.info,
        total: counts.critical + counts.warning + counts.info,
      };

      setTimeline((prev) => [...prev.slice(-39), point]); // keep last 40 points
    };

    tick(); // initial point
    const interval = setInterval(tick, 3000);
    return () => clearInterval(interval);
  }, [isSimulating, notifications]);

  const exportCSV = () => {
    const header = "Time,Critical,Warning,Info,Total";
    const rows = timeline.map((t) => `"${t.time}",${t.critical},${t.warning},${t.info},${t.total}`);
    const blob = new Blob([header + "\n" + rows.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `threat-timeline-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Timeline exported", { description: `${timeline.length} data points saved as CSV` });
  };

  const maxTotal = useMemo(
    () => Math.max(10, ...timeline.map((t) => t.total)),
    [timeline],
  );

  if (!isSimulating && timeline.length === 0) {
    return (
      <div className="bg-card border border-border rounded-lg">
        <div className="section-header">
          <h2 className="section-title flex items-center gap-2">
            <Activity className="w-4 h-4 text-primary" />
            Threat Timeline
          </h2>
        </div>
        <div className="p-6 flex items-center justify-center h-48 text-xs text-muted-foreground">
          Enable Live Demo Mode to visualize cumulative attack volume
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-lg">
      <div className="section-header">
        <h2 className="section-title flex items-center gap-2">
          <Activity className="w-4 h-4 text-critical" />
          Threat Timeline
        </h2>
        <div className="flex items-center gap-2">
          {timeline.length > 0 && (
            <Button variant="ghost" size="sm" className="h-6 px-2 text-[10px] gap-1" onClick={exportCSV}>
              <Download className="w-3 h-3" /> Export
            </Button>
          )}
          {isSimulating && (
            <span className="text-[10px] bg-critical/15 text-critical px-2 py-0.5 rounded-full font-medium animate-pulse">
              Recording
            </span>
          )}
          <span className="text-[10px] text-muted-foreground font-mono">
            {timeline.length} samples
          </span>
        </div>
      </div>
      <div className="p-3 sm:p-5 h-56 sm:h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={timeline}>
            <defs>
              <linearGradient id="ttCritGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(0 84% 60%)" stopOpacity={0.4} />
                <stop offset="95%" stopColor="hsl(0 84% 60%)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="ttWarnGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(38 92% 50%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(38 92% 50%)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="ttInfoGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(199 89% 48%)" stopOpacity={0.2} />
                <stop offset="95%" stopColor="hsl(199 89% 48%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(222 18% 16%)" />
            <XAxis
              dataKey="time"
              tick={{ fill: "hsl(215 20% 50%)", fontSize: 9 }}
              axisLine={false}
              tickLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              tick={{ fill: "hsl(215 20% 50%)", fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              domain={[0, maxTotal + 2]}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(222 41% 8%)",
                border: "1px solid hsl(222 18% 16%)",
                borderRadius: "8px",
                fontSize: "11px",
                color: "hsl(210 40% 93%)",
                boxShadow: "0 8px 32px hsl(222 47% 2% / 0.8)",
              }}
            />
            <Area
              type="monotone"
              dataKey="critical"
              stackId="1"
              stroke="hsl(0 84% 60%)"
              fill="url(#ttCritGrad)"
              strokeWidth={2}
              name="Critical"
            />
            <Area
              type="monotone"
              dataKey="warning"
              stackId="1"
              stroke="hsl(38 92% 50%)"
              fill="url(#ttWarnGrad)"
              strokeWidth={1.5}
              name="Warning"
            />
            <Area
              type="monotone"
              dataKey="info"
              stackId="1"
              stroke="hsl(199 89% 48%)"
              fill="url(#ttInfoGrad)"
              strokeWidth={1.5}
              name="Info / Success"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      {/* Legend */}
      <div className="px-4 pb-3 flex items-center gap-4 text-[10px] text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-critical" /> Critical
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-warning" /> Warning
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-info" /> Info / Success
        </span>
      </div>
    </div>
  );
}
