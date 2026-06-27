import { useState } from "react";
import SEO from "@/components/SEO";
import { Bot, TrendingUp, Minus, TrendingDown, Users, Filter, ArrowRight, ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";
import { rootCauseClusters, incidents } from "@/data/mock-data";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

const trendIcon = {
  escalating: <TrendingUp className="w-3.5 h-3.5 text-critical" />,
  stable: <Minus className="w-3.5 h-3.5 text-warning" />,
  declining: <TrendingDown className="w-3.5 h-3.5 text-success" />,
};

const trendLabel = {
  escalating: "Escalating",
  stable: "Stable",
  declining: "Declining",
};

const severityConfig: Record<string, { dot: string; badge: string }> = {
  critical: { dot: "bg-critical shadow-[0_0_8px_hsl(var(--critical)/0.5)]", badge: "bg-critical/15 text-critical" },
  high: { dot: "bg-warning shadow-[0_0_8px_hsl(var(--warning)/0.5)]", badge: "bg-warning/15 text-warning" },
  medium: { dot: "bg-info shadow-[0_0_8px_hsl(var(--info)/0.5)]", badge: "bg-info/15 text-info" },
};

type SeverityFilter = "all" | "critical" | "high" | "medium";

export default function RootCauses() {
  const [filter, setFilter] = useState<SeverityFilter>("all");
  const [expandedId, setExpandedId] = useState<string | null>(rootCauseClusters[0]?.id ?? null);

  const filtered = filter === "all"
    ? rootCauseClusters
    : rootCauseClusters.filter((c) => c.severity === filter);

  const totalIncidents = rootCauseClusters.reduce((sum, c) => sum + c.incidentIds.length, 0);
  const totalUsers = rootCauseClusters.reduce((sum, c) => sum + c.affectedUsers, 0);

  return (
    <div className="space-y-6 animate-slide-in">
      <SEO title="Root Causes" description="AI-detected systemic patterns and recurring failure clusters across enterprise incidents." />
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight flex items-center gap-2">
            <Bot className="w-6 h-6 text-primary" />
            Root Cause Analysis
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            AI-detected systemic patterns across incidents
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          {(["all", "critical", "high", "medium"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`text-[11px] px-3 py-1.5 rounded-md capitalize transition-colors ${
                filter === f ? "bg-primary/15 text-primary" : "bg-secondary hover:bg-secondary/80 text-muted-foreground"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="stat-card-glow">
          <p className="text-2xl font-semibold">{rootCauseClusters.length}</p>
          <p className="text-[11px] text-muted-foreground">Active Clusters</p>
        </div>
        <div className="stat-card-glow">
          <p className="text-2xl font-semibold">{totalIncidents}</p>
          <p className="text-[11px] text-muted-foreground">Linked Incidents</p>
        </div>
        <div className="stat-card-glow">
          <p className="text-2xl font-semibold">{totalUsers.toLocaleString()}</p>
          <p className="text-[11px] text-muted-foreground">Affected Users</p>
        </div>
        <div className="stat-card-glow">
          <p className="text-2xl font-semibold text-critical">{rootCauseClusters.filter((c) => c.trend === "escalating").length}</p>
          <p className="text-[11px] text-muted-foreground">Escalating</p>
        </div>
      </div>

      {/* Cluster List */}
      <div className="space-y-4">
        {filtered.map((cluster) => {
          const cfg = severityConfig[cluster.severity];
          const linkedIncidents = incidents.filter((i) => cluster.incidentIds.includes(i.id));

          return (
            <Collapsible
              key={cluster.id}
              open={expandedId === cluster.id}
              onOpenChange={(open) => setExpandedId(open ? cluster.id : null)}
            >
              <div className="bg-card border border-border rounded-lg">
                <CollapsibleTrigger className="w-full p-4 flex items-center gap-4 text-left hover:bg-secondary/30 transition-colors rounded-lg">
                  <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${cfg.dot}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{cluster.category}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      First detected {new Date(cluster.firstDetected).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="hidden sm:flex items-center gap-4">
                    <div className="text-center">
                      <p className="text-sm font-semibold">{cluster.incidentIds.length}</p>
                      <p className="text-[9px] text-muted-foreground">Incidents</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-semibold">{cluster.affectedUsers.toLocaleString()}</p>
                      <p className="text-[9px] text-muted-foreground">Users</p>
                    </div>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium capitalize ${cfg.badge}`}>
                    {cluster.severity}
                  </span>
                  <div className="flex items-center gap-1 text-[10px]">
                    {trendIcon[cluster.trend]}
                    <span className="hidden sm:inline text-muted-foreground">{trendLabel[cluster.trend]}</span>
                  </div>
                  <ChevronDown className="w-4 h-4 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />
                </CollapsibleTrigger>

                <CollapsibleContent>
                  <div className="px-4 pb-4 border-t border-border/40 pt-4 space-y-4">
                    {/* Trend History */}
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">7-Day Trend</p>
                      <div className="flex items-end gap-1 h-12">
                        {cluster.trendHistory.map((v, i) => {
                          const max = Math.max(...cluster.trendHistory, 1);
                          const color = cluster.trend === "escalating" ? "bg-critical" : cluster.trend === "declining" ? "bg-success" : "bg-warning";
                          return (
                            <div
                              key={i}
                              className={`flex-1 max-w-8 rounded-t ${color}`}
                              style={{ height: `${Math.max((v / max) * 100, 8)}%`, opacity: 0.4 + (i / 7) * 0.6 }}
                            />
                          );
                        })}
                      </div>
                    </div>

                    {/* AI Insights */}
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">AI Insights</p>
                      <div className="space-y-2">
                        {cluster.insights.map((insight, i) => (
                          <p key={i} className="text-xs text-muted-foreground leading-relaxed border-l-2 border-primary/30 pl-3 py-1">
                            {insight}
                          </p>
                        ))}
                      </div>
                    </div>

                    {/* Affected Services */}
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">Affected Services</p>
                      <div className="flex flex-wrap gap-1.5">
                        {cluster.affectedServices.map((svc) => (
                          <span key={svc} className="text-[10px] bg-secondary px-2 py-1 rounded">{svc}</span>
                        ))}
                      </div>
                    </div>

                    {/* Linked Incidents Table */}
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">Linked Incidents</p>
                      <div className="bg-secondary/30 rounded-lg divide-y divide-border/40">
                        {linkedIncidents.map((inc) => (
                          <div key={inc.id} className="px-3 py-2 flex items-center gap-3">
                            <span className="text-[10px] font-mono text-muted-foreground w-16">{inc.id}</span>
                            <span className="text-xs flex-1 truncate">{inc.title}</span>
                            <span className={`status-badge status-${inc.status}`}>{inc.status}</span>
                            <span className={`text-[10px] priority-${inc.priority} capitalize`}>{inc.priority}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <Link
                      to="/copilot"
                      className="inline-flex items-center gap-2 text-xs text-primary hover:underline font-medium"
                    >
                      Analyze in AI Copilot <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </CollapsibleContent>
              </div>
            </Collapsible>
          );
        })}
      </div>
    </div>
  );
}
