import { useState } from "react";
import { Bot, ArrowRight, ChevronDown, TrendingUp, Minus, TrendingDown, Users, ExternalLink, X } from "lucide-react";
import { Link } from "react-router-dom";
import { rootCauseClusters, type RootCauseCluster } from "@/data/mock-data";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";

const trendIcon = {
  escalating: <TrendingUp className="w-3 h-3 text-critical" />,
  stable: <Minus className="w-3 h-3 text-warning" />,
  declining: <TrendingDown className="w-3 h-3 text-success" />,
};

const trendLabel = {
  escalating: "Escalating",
  stable: "Stable",
  declining: "Declining",
};

const severityDot: Record<string, string> = {
  critical: "bg-critical shadow-[0_0_6px_hsl(var(--critical)/0.5)]",
  high: "bg-warning shadow-[0_0_6px_hsl(var(--warning)/0.5)]",
  medium: "bg-info shadow-[0_0_6px_hsl(var(--info)/0.5)]",
};

function MiniSparkline({ data, trend }: { data: number[]; trend: string }) {
  const max = Math.max(...data, 1);
  const color = trend === "escalating" ? "hsl(var(--critical))" : trend === "declining" ? "hsl(var(--success))" : "hsl(var(--warning))";

  return (
    <svg width={42} height={16} className="shrink-0">
      {data.map((v, i) => (
        <rect
          key={i}
          x={i * 6}
          y={16 - (v / max) * 14}
          width={4}
          height={(v / max) * 14 || 1}
          fill={color}
          opacity={0.3 + (i / data.length) * 0.7}
          rx={1}
        />
      ))}
    </svg>
  );
}

export default function RootCauseClusters() {
  const [openId, setOpenId] = useState<string | null>(rootCauseClusters[0]?.id ?? null);
  const [modalCluster, setModalCluster] = useState<RootCauseCluster | null>(null);

  return (
    <>
      <div className="ai-panel flex flex-col">
        <div className="flex items-center gap-2 mb-4">
          <Bot className="w-4 h-4 text-primary animate-pulse-glow" />
          <h2 className="text-sm font-semibold">Root Cause Clusters</h2>
          <span className="text-[10px] bg-primary/15 text-primary px-2 py-0.5 rounded-full ml-auto font-medium">
            {rootCauseClusters.length} patterns
          </span>
        </div>
        <div className="space-y-2 flex-1">
          {rootCauseClusters.map((cluster) => (
            <Collapsible
              key={cluster.id}
              open={openId === cluster.id}
              onOpenChange={(open) => setOpenId(open ? cluster.id : null)}
            >
              <CollapsibleTrigger className="w-full flex items-center gap-2 px-3 py-2 rounded-md hover:bg-secondary/50 transition-colors text-left group">
                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${severityDot[cluster.severity]}`} />
                <span className="text-xs font-medium flex-1 truncate">{cluster.category}</span>
                <MiniSparkline data={cluster.trendHistory} trend={cluster.trend} />
                <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded font-mono">
                  {cluster.incidentIds.length}
                </span>
                {trendIcon[cluster.trend]}
                <ChevronDown className="w-3 h-3 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="pl-6 pr-3 pb-2 space-y-2">
                  {/* Affected users */}
                  <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {cluster.affectedUsers.toLocaleString()} users
                    </span>
                    <span>{cluster.affectedServices.length} services</span>
                    <span className="flex items-center gap-1">
                      {trendIcon[cluster.trend]}
                      {trendLabel[cluster.trend]}
                    </span>
                  </div>

                  {cluster.insights.slice(0, 2).map((insight, i) => (
                    <p key={i} className="text-[11px] text-muted-foreground leading-relaxed border-l-2 border-primary/30 pl-2.5 py-0.5">
                      {insight}
                    </p>
                  ))}
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] text-muted-foreground/70 font-mono">
                      Linked: {cluster.incidentIds.join(", ")}
                    </p>
                    <button
                      onClick={() => setModalCluster(cluster)}
                      className="text-[10px] text-primary hover:underline flex items-center gap-1"
                    >
                      Details <ExternalLink className="w-2.5 h-2.5" />
                    </button>
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>
          ))}
        </div>
        <Link to="/root-causes" className="mt-4 flex items-center gap-2 text-xs text-primary hover:underline font-medium">
          View All Clusters <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      {/* Drill-down Modal */}
      <Dialog open={!!modalCluster} onOpenChange={(open) => !open && setModalCluster(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <span className={`w-2 h-2 rounded-full ${severityDot[modalCluster?.severity || "medium"]}`} />
              {modalCluster?.category}
            </DialogTitle>
            <DialogClose className="absolute right-4 top-4">
              <X className="w-4 h-4" />
            </DialogClose>
          </DialogHeader>

          {modalCluster && (
            <div className="space-y-4">
              {/* Metrics */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-secondary/50 rounded-lg p-3 text-center">
                  <p className="text-lg font-semibold">{modalCluster.incidentIds.length}</p>
                  <p className="text-[10px] text-muted-foreground">Incidents</p>
                </div>
                <div className="bg-secondary/50 rounded-lg p-3 text-center">
                  <p className="text-lg font-semibold">{modalCluster.affectedUsers.toLocaleString()}</p>
                  <p className="text-[10px] text-muted-foreground">Users Affected</p>
                </div>
                <div className="bg-secondary/50 rounded-lg p-3 text-center">
                  <p className="text-lg font-semibold flex items-center justify-center gap-1">
                    {trendIcon[modalCluster.trend]}
                    {trendLabel[modalCluster.trend]}
                  </p>
                  <p className="text-[10px] text-muted-foreground">7-Day Trend</p>
                </div>
              </div>

              {/* Trend Chart */}
              <div>
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">7-Day Incident Trend</p>
                <div className="flex items-end gap-1 h-16">
                  {modalCluster.trendHistory.map((v, i) => {
                    const max = Math.max(...modalCluster.trendHistory, 1);
                    const color = modalCluster.trend === "escalating" ? "bg-critical" : modalCluster.trend === "declining" ? "bg-success" : "bg-warning";
                    return (
                      <div
                        key={i}
                        className={`flex-1 rounded-t ${color}`}
                        style={{ height: `${(v / max) * 100}%`, opacity: 0.4 + (i / 7) * 0.6 }}
                      />
                    );
                  })}
                </div>
                <div className="flex justify-between text-[9px] text-muted-foreground mt-1">
                  <span>7d ago</span>
                  <span>Today</span>
                </div>
              </div>

              {/* Affected Services */}
              <div>
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">Affected Services</p>
                <div className="flex flex-wrap gap-1.5">
                  {modalCluster.affectedServices.map((svc) => (
                    <span key={svc} className="text-[10px] bg-secondary px-2 py-1 rounded">{svc}</span>
                  ))}
                </div>
              </div>

              {/* All Insights */}
              <div>
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">AI Insights</p>
                <div className="space-y-2">
                  {modalCluster.insights.map((insight, i) => (
                    <p key={i} className="text-xs text-muted-foreground leading-relaxed border-l-2 border-primary/30 pl-3 py-1">
                      {insight}
                    </p>
                  ))}
                </div>
              </div>

              {/* Linked Incidents */}
              <div>
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">Linked Incidents</p>
                <div className="flex flex-wrap gap-2">
                  {modalCluster.incidentIds.map((id) => (
                    <Link
                      key={id}
                      to={`/incidents?id=${id}`}
                      className="text-[11px] font-mono bg-primary/10 text-primary px-2 py-1 rounded hover:bg-primary/20 transition-colors"
                    >
                      {id}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
