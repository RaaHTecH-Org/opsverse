import { Activity, ShieldAlert, AlertTriangle, Bell, CheckCircle2, Radio } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useSimulation, SimNotification, keywordServiceMap } from "@/hooks/use-simulation";

const severityIcon: Record<SimNotification["type"], JSX.Element> = {
  critical: <ShieldAlert className="w-3.5 h-3.5 text-critical shrink-0" />,
  warning: <AlertTriangle className="w-3.5 h-3.5 text-warning shrink-0" />,
  info: <Bell className="w-3.5 h-3.5 text-info shrink-0" />,
  success: <CheckCircle2 className="w-3.5 h-3.5 text-success shrink-0" />,
};

function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  return `${Math.floor(minutes / 60)}h ago`;
}

/** Resolve a notification to a navigation target */
function resolveTarget(message: string): { path: string; label: string } | null {
  // Check for incident IDs (e.g. INC-2001)
  const incMatch = message.match(/INC-\d+/);
  if (incMatch) {
    return { path: `/autopilot?incident=${incMatch[0]}`, label: "Open in Autopilot" };
  }

  // Check keyword → service mapping for Digital Twin
  for (const mapping of keywordServiceMap) {
    if (mapping.keywords.some((kw) => message.includes(kw))) {
      return { path: `/digital-twin?node=${mapping.serviceId}`, label: "View in Digital Twin" };
    }
  }
  return null;
}

export default function LiveActivityFeed() {
  const { notifications, isSimulating } = useSimulation();
  const navigate = useNavigate();

  const handleClick = (n: SimNotification) => {
    const target = resolveTarget(n.message);
    if (target) navigate(target.path);
  };

  return (
    <div className="bg-card border border-border rounded-lg">
      <div className="section-header">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-primary" />
          <h2 className="section-title">Live Activity Feed</h2>
          {isSimulating && (
            <span className="flex items-center gap-1 text-[10px] bg-primary/15 text-primary px-2 py-0.5 rounded-full font-medium">
              <Radio className="w-2.5 h-2.5 animate-pulse" />
              Live
            </span>
          )}
        </div>
        <span className="text-[10px] text-muted-foreground font-mono">
          {notifications.length} events
        </span>
      </div>

      {notifications.length === 0 ? (
        <div className="px-5 py-10 text-center text-xs text-muted-foreground">
          Enable Live Demo Mode to see real-time events
        </div>
      ) : (
        <ScrollArea className="h-[250px]">
          <div className="divide-y divide-border/40">
            {notifications.map((n) => {
              const target = resolveTarget(n.message);
              return (
                <div
                  key={n.id}
                  onClick={() => handleClick(n)}
                  className={`px-4 py-2.5 flex items-start gap-3 transition-colors ${target ? "cursor-pointer hover:bg-primary/5" : "hover:bg-muted/20"}`}
                >
                  {severityIcon[n.type]}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs leading-relaxed">{n.message}</p>
                    {target && (
                      <p className="text-[10px] text-primary/70 mt-0.5">{target.label} →</p>
                    )}
                  </div>
                  <span className="text-[10px] text-muted-foreground font-mono shrink-0 mt-0.5">
                    {timeAgo(n.timestamp)}
                  </span>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}
