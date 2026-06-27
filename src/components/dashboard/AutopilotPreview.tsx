import { useState } from "react";
import { Zap, ArrowRight, ShieldCheck, Lock, Users, Clock, CheckCircle2, XCircle, History } from "lucide-react";
import { Link } from "react-router-dom";
import { autopilotPreviewActions, autopilotHistory } from "@/data/mock-data";
import { toast } from "sonner";

export default function AutopilotPreview() {
  const [actions, setActions] = useState(autopilotPreviewActions);

  const handleApprove = (id: string) => {
    setActions((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: "approved" as const } : a))
    );
    toast.success(`Action approved — executing shortly`, { duration: 3000 });
  };

  const timeAgo = (dateStr: string) => {
    const mins = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000);
    if (mins < 60) return `${mins}m ago`;
    if (mins < 1440) return `${Math.floor(mins / 60)}h ago`;
    return `${Math.floor(mins / 1440)}d ago`;
  };

  return (
    <div className="ai-panel">
      <div className="flex items-center gap-2 mb-4">
        <Zap className="w-4 h-4 text-primary" />
        <h2 className="text-sm font-semibold">Autopilot Actions</h2>
        <span className="text-[10px] bg-primary/15 text-primary px-2 py-0.5 rounded-full ml-auto font-medium">
          {actions.filter((a) => a.status === "pending").length} pending
        </span>
      </div>

      {/* Action Cards */}
      <div className="grid sm:grid-cols-2 gap-3">
        {actions.map((item) => (
          <div
            key={item.id}
            className="bg-secondary/50 border border-border/50 rounded-lg p-4 hover:border-primary/20 hover:bg-secondary transition-all group"
          >
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/15 transition-colors">
                <Zap className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium leading-tight">{item.action}</p>
                <p className="text-[11px] text-muted-foreground mt-1">{item.system}</p>

                {/* Confidence bar */}
                <div className="mt-2.5 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-muted-foreground">Confidence</span>
                    <span className="text-[11px] font-mono font-medium text-primary">{item.confidence}%</span>
                  </div>
                  <div className="h-1 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary transition-all"
                      style={{ width: `${item.confidence}%` }}
                    />
                  </div>
                </div>

                {/* Estimated Impact */}
                <div className="mt-2.5 p-2 bg-muted/30 rounded-md space-y-1">
                  <p className="text-[9px] uppercase tracking-widest text-muted-foreground font-medium">Impact</p>
                  <div className="flex items-center gap-3 text-[10px]">
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3 text-muted-foreground" />
                      {item.impact.users.toLocaleString()} users
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-muted-foreground" />
                      {item.impact.downtime}
                    </span>
                  </div>
                  <p className="text-[9px] text-muted-foreground truncate">
                    {item.impact.services.join(", ")}
                  </p>
                </div>

                {/* Meta row */}
                <div className="flex items-center gap-2 mt-2.5 flex-wrap">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium capitalize ${
                    item.severity === "critical" ? "bg-critical/15 text-critical" :
                    item.severity === "high" ? "bg-warning/15 text-warning" :
                    item.severity === "medium" ? "bg-info/15 text-info" :
                    "bg-muted text-muted-foreground"
                  }`}>{item.severity}</span>
                  <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                    {item.status === "approved" || !item.requiresApproval
                      ? <><ShieldCheck className="w-2.5 h-2.5 text-success" /> {item.status === "approved" ? "Approved" : "Auto"}</>
                      : <><Lock className="w-2.5 h-2.5" /> {item.approver}</>
                    }
                  </span>
                  <span className="text-[10px] text-muted-foreground ml-auto font-mono">~{item.estimatedResolution}</span>
                </div>

                {/* Approve button */}
                {item.requiresApproval && item.status === "pending" && (
                  <button
                    onClick={() => handleApprove(item.id)}
                    className="mt-3 w-full text-[11px] font-medium py-1.5 rounded-md bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                  >
                    Approve Action
                  </button>
                )}

                {item.status === "approved" && (
                  <div className="mt-3 w-full text-[11px] font-medium py-1.5 rounded-md bg-success/10 text-success text-center">
                    ✓ Approved — Executing
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Execution History */}
      <div className="mt-4 border-t border-border/40 pt-4">
        <div className="flex items-center gap-2 mb-3">
          <History className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">Recent Executions</span>
        </div>
        <div className="space-y-1.5">
          {autopilotHistory.slice(0, 4).map((h) => (
            <div key={h.id} className="flex items-center gap-2 text-[11px] py-1">
              {h.status === "success" ? (
                <CheckCircle2 className="w-3 h-3 text-success shrink-0" />
              ) : (
                <XCircle className="w-3 h-3 text-critical shrink-0" />
              )}
              <span className="flex-1 truncate">{h.action}</span>
              <span className="text-[9px] text-muted-foreground font-mono">{h.duration}</span>
              <span className="text-[9px] text-muted-foreground">{timeAgo(h.executedAt)}</span>
            </div>
          ))}
        </div>
      </div>

      <Link to="/autopilot" className="mt-4 flex items-center gap-2 text-xs text-primary hover:underline font-medium">
        Open Autopilot Console <ArrowRight className="w-3 h-3" />
      </Link>
    </div>
  );
}
