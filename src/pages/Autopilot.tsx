import { useState, useEffect, useCallback } from "react";
import SEO from "@/components/SEO";
import { useSearchParams } from "react-router-dom";
import { Cpu, AlertTriangle, AlertCircle, CheckCircle2, Clock, Play, Shield, Zap, Activity, ChevronRight, X, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useIsMobile } from "@/hooks/use-mobile";

type Severity = "critical" | "high" | "medium" | "low";
type PipelineStep = "detect" | "analyze" | "recommend" | "execute" | "verify";

interface AutopilotIncident {
  id: string;
  title: string;
  severity: Severity;
  system: string;
  confidence: number;
  status: "active" | "remediating" | "resolved";
  pipelineStep: PipelineStep;
  aiAnalysis: string;
  suggestedActions: string[];
  runbookSteps: string[];
  estimatedResolution: string;
}

const pipelineSteps: { key: PipelineStep; label: string; icon: typeof Zap }[] = [
  { key: "detect", label: "Detect", icon: AlertCircle },
  { key: "analyze", label: "Analyze", icon: Activity },
  { key: "recommend", label: "Recommend", icon: Zap },
  { key: "execute", label: "Execute", icon: Play },
  { key: "verify", label: "Verify", icon: CheckCircle2 },
];

const stepIndex = (s: PipelineStep) => pipelineSteps.findIndex(p => p.key === s);

const incidents: AutopilotIncident[] = [
  {
    id: "INC-2001", title: "Azure VPN Gateway Tunnel Failure", severity: "critical", system: "VPN Gateway",
    confidence: 94, status: "active", pipelineStep: "recommend",
    aiAnalysis: "Detected packet loss exceeding 15% on the west region tunnel. Root cause analysis indicates a misconfigured routing table after last maintenance window. AI confidence is high based on 47 similar historical incidents.",
    suggestedActions: ["Restart VPN Gateway service", "Revert routing table to last known good", "Verify tunnel health metrics"],
    runbookSteps: ["Stop VPN Gateway service", "Flush routing table cache", "Apply last-known-good configuration", "Restart VPN Gateway service", "Verify tunnel connectivity", "Run health check validation"],
    estimatedResolution: "12 min",
  },
  {
    id: "INC-2002", title: "Microsoft Entra ID Auth Latency", severity: "critical", system: "Entra ID",
    confidence: 91, status: "active", pipelineStep: "analyze",
    aiAnalysis: "Authentication latency spike detected across SSO services. Token issuance pipeline showing 3x normal latency. Pattern matches a known issue with conditional access policy evaluation under high load.",
    suggestedActions: ["Scale token issuance service", "Temporarily bypass non-critical conditional access policies", "Enable auth caching"],
    runbookSteps: ["Identify bottleneck in token pipeline", "Scale authentication service horizontally", "Adjust conditional access evaluation timeout", "Monitor auth latency metrics", "Validate SSO functionality"],
    estimatedResolution: "18 min",
  },
  {
    id: "INC-2003", title: "Exchange Online Delivery Delays", severity: "high", system: "Exchange Online",
    confidence: 87, status: "active", pipelineStep: "detect",
    aiAnalysis: "Mail delivery delays averaging 15 minutes detected. Transport rules processing queue is backed up. Similar pattern observed during last quarter's compliance rule update.",
    suggestedActions: ["Review transport rule queue", "Temporarily disable non-critical transport rules", "Scale mail transport agents"],
    runbookSteps: ["Check transport rule queue depth", "Identify slow transport rules", "Disable low-priority rules", "Restart transport agents", "Verify delivery latency"],
    estimatedResolution: "8 min",
  },
  {
    id: "INC-2004", title: "Azure SQL High DTU Utilization", severity: "high", system: "Azure SQL",
    confidence: 89, status: "active", pipelineStep: "recommend",
    aiAnalysis: "DTU consumption at 98% on primary database. Long-running analytical queries from reporting service identified as root cause. Recommend immediate scale-up and query optimization.",
    suggestedActions: ["Scale up DTU tier", "Kill long-running queries", "Move reporting queries to read replica"],
    runbookSteps: ["Identify top resource-consuming queries", "Terminate non-critical long-running queries", "Scale DTU from S3 to S4", "Redirect reporting to read replica", "Verify DTU stabilization"],
    estimatedResolution: "10 min",
  },
  {
    id: "INC-2005", title: "Defender Sensor Offline", severity: "medium", system: "Defender",
    confidence: 96, status: "active", pipelineStep: "execute",
    aiAnalysis: "Three endpoint sensors reporting offline status. Agent service crash detected on affected machines. Auto-restart failed due to corrupted service configuration.",
    suggestedActions: ["Reinstall sensor agent", "Push configuration update", "Verify endpoint connectivity"],
    runbookSteps: ["Stop Defender sensor service", "Clear sensor cache", "Reinstall sensor agent package", "Apply latest configuration", "Restart sensor service", "Verify sensor check-in"],
    estimatedResolution: "6 min",
  },
  {
    id: "INC-2006", title: "Azure Cache Connectivity Issue", severity: "medium", system: "Azure Cache",
    confidence: 82, status: "resolved", pipelineStep: "verify",
    aiAnalysis: "Intermittent connectivity failures to Azure Cache for Redis. Network security group rule was blocking cache port after recent security policy update. Auto-remediated by reverting NSG rule.",
    suggestedActions: ["Verify NSG rules", "Test cache connectivity", "Review security policy changes"],
    runbookSteps: ["Identify blocking NSG rule", "Revert NSG rule change", "Test Redis connectivity", "Validate application cache hits", "Document policy exception"],
    estimatedResolution: "4 min",
  },
];

const severityConfig: Record<Severity, { color: string; bg: string; border: string }> = {
  critical: { color: "text-critical", bg: "bg-critical/10", border: "border-critical/30" },
  high: { color: "text-warning", bg: "bg-warning/10", border: "border-warning/30" },
  medium: { color: "text-info", bg: "bg-info/10", border: "border-info/30" },
  low: { color: "text-muted-foreground", bg: "bg-muted/10", border: "border-muted/30" },
};

export default function Autopilot() {
  const [searchParams] = useSearchParams();
  const [selected, setSelected] = useState<AutopilotIncident | null>(null);
  const [runbookRunning, setRunbookRunning] = useState(false);
  const [runbookStep, setRunbookStep] = useState(-1);
  const isMobile = useIsMobile();

  // Auto-select from query param
  useEffect(() => {
    const incidentId = searchParams.get("incident");
    if (incidentId) {
      const found = incidents.find(i => i.id === incidentId);
      if (found) setSelected(found);
    }
  }, [searchParams]);

  const activeCount = incidents.filter(i => i.status === "active").length;
  const resolvedCount = incidents.filter(i => i.status === "resolved").length;
  const avgConfidence = Math.round(incidents.reduce((sum, i) => sum + i.confidence, 0) / incidents.length);

  const executeRunbook = useCallback(() => {
    if (!selected || runbookRunning) return;
    setRunbookRunning(true);
    setRunbookStep(0);
  }, [selected, runbookRunning]);

  useEffect(() => {
    if (!runbookRunning || runbookStep < 0 || !selected) return;
    if (runbookStep >= selected.runbookSteps.length) {
      setTimeout(() => { setRunbookRunning(false); }, 500);
      return;
    }
    const timer = setTimeout(() => setRunbookStep(s => s + 1), 1200);
    return () => clearTimeout(timer);
  }, [runbookRunning, runbookStep, selected]);

  return (
    <div className="space-y-6">
      <SEO title="AI Autopilot" description="Automated incident detection, AI analysis, and policy-driven remediation for enterprise operations." />
      {/* Header */}
      <div className="section-header !border-0 !px-0 !py-0 !mb-0">
        <div>
          <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Cpu className="w-5 h-5 text-primary" />
            AI Autopilot
          </h1>
          <p className="text-xs text-muted-foreground mt-1">Automated incident detection, analysis, and remediation</p>
        </div>
        <Badge variant="outline" className="text-[10px] border-primary/30 text-primary">
          <Zap className="w-3 h-3 mr-1" />
          AI Engine Active
        </Badge>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Active Incidents", value: activeCount, icon: AlertTriangle, color: "text-warning" },
          { label: "Auto-Resolved Today", value: resolvedCount, icon: CheckCircle2, color: "text-success" },
          { label: "Avg Resolution", value: "10 min", icon: Clock, color: "text-info" },
          { label: "AI Confidence", value: `${avgConfidence}%`, icon: Shield, color: "text-primary" },
        ].map(s => (
          <div key={s.label} className="stat-card group">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground">{s.label}</span>
              <s.icon className={`w-4 h-4 ${s.color}`} />
            </div>
            <p className="text-2xl font-bold text-foreground">{s.value}</p>
          </div>
        ))}
      </div>

      {/* AI Decision Pipeline */}
      <div className="bg-card border border-border rounded-lg p-4">
        <h2 className="section-title mb-4">AI Decision Pipeline</h2>
        <div className="flex items-center justify-between gap-1 overflow-x-auto pb-2">
          {pipelineSteps.map((step, i) => {
            const currentStep = selected ? stepIndex(selected.pipelineStep) : -1;
            const isCompleted = selected ? i < currentStep : false;
            const isActive = selected ? i === currentStep : false;
            const isPending = selected ? i > currentStep : true;
            const StepIcon = step.icon;

            return (
              <div key={step.key} className="flex items-center flex-1 min-w-0">
                <div className={`flex flex-col items-center gap-1.5 flex-1 ${isPending ? "opacity-40" : ""}`}>
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                    isCompleted ? "bg-success/15 border-success/50 text-success" :
                    isActive ? "bg-primary/15 border-primary/50 text-primary animate-pulse" :
                    "bg-muted/10 border-border text-muted-foreground"
                  }`}>
                    {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : <StepIcon className="w-4 h-4" />}
                  </div>
                  <span className={`text-[10px] font-medium ${isActive ? "text-primary" : isCompleted ? "text-success" : "text-muted-foreground"}`}>
                    {step.label}
                  </span>
                </div>
                {i < pipelineSteps.length - 1 && (
                  <ChevronRight className={`w-4 h-4 shrink-0 mx-1 ${isCompleted ? "text-success/50" : "text-border"}`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Incident Table + Detail */}
      <div className={`flex ${isMobile ? "flex-col" : "flex-row"} gap-4`}>
        {/* Table */}
        <div className="flex-1 bg-card border border-border rounded-lg overflow-hidden">
          <div className="section-header">
            <h2 className="section-title">Autopilot Incidents</h2>
            <span className="text-[10px] text-muted-foreground">{incidents.length} tracked</span>
          </div>
          <div className="overflow-x-auto">
            <table className="data-table w-full">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left text-[10px] uppercase tracking-widest text-muted-foreground font-medium">ID</th>
                  <th className="px-4 py-3 text-left text-[10px] uppercase tracking-widest text-muted-foreground font-medium">Title</th>
                  <th className="px-4 py-3 text-left text-[10px] uppercase tracking-widest text-muted-foreground font-medium hidden md:table-cell">Severity</th>
                  <th className="px-4 py-3 text-left text-[10px] uppercase tracking-widest text-muted-foreground font-medium hidden lg:table-cell">System</th>
                  <th className="px-4 py-3 text-left text-[10px] uppercase tracking-widest text-muted-foreground font-medium">Confidence</th>
                  <th className="px-4 py-3 text-left text-[10px] uppercase tracking-widest text-muted-foreground font-medium hidden md:table-cell">Status</th>
                </tr>
              </thead>
              <tbody>
                {incidents.map(inc => {
                  const sev = severityConfig[inc.severity];
                  const isSelected = selected?.id === inc.id;
                  return (
                    <tr
                      key={inc.id}
                      onClick={() => { setSelected(inc); setRunbookRunning(false); setRunbookStep(-1); }}
                      className={`cursor-pointer transition-colors border-b border-border/30 ${isSelected ? "bg-primary/5" : "hover:bg-muted/30"}`}
                    >
                      <td className="px-4 py-3 text-xs font-mono text-primary">{inc.id}</td>
                      <td className="px-4 py-3 text-xs font-medium text-foreground">{inc.title}</td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium ${sev.bg} ${sev.color} border ${sev.border}`}>
                          {inc.severity}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground hidden lg:table-cell">{inc.system}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Progress value={inc.confidence} className="h-1.5 w-16" />
                          <span className="text-[10px] text-muted-foreground font-mono">{inc.confidence}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium ${
                          inc.status === "resolved" ? "bg-success/10 text-success border border-success/30" :
                          inc.status === "remediating" ? "bg-info/10 text-info border border-info/30" :
                          "bg-warning/10 text-warning border border-warning/30"
                        }`}>
                          {inc.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Detail Panel */}
        {selected && (
          <div className={`${isMobile ? "w-full" : "w-96"} bg-card border border-border rounded-lg flex flex-col animate-slide-in`}>
            <div className="flex items-center justify-between p-4 border-b border-border/50">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-primary">{selected.id}</span>
                <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium ${severityConfig[selected.severity].bg} ${severityConfig[selected.severity].color} border ${severityConfig[selected.severity].border}`}>
                  {selected.severity}
                </span>
              </div>
              <button onClick={() => { setSelected(null); setRunbookRunning(false); setRunbookStep(-1); }} className="text-muted-foreground hover:text-foreground transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 space-y-4 flex-1 overflow-y-auto text-xs">
              <div>
                <h3 className="font-semibold text-sm text-foreground mb-1">{selected.title}</h3>
                <p className="text-muted-foreground">{selected.system} · Est. {selected.estimatedResolution}</p>
              </div>

              <div>
                <p className="text-muted-foreground mb-1.5 font-medium">AI Analysis</p>
                <div className="bg-primary/5 border border-primary/10 rounded-md p-3 text-[11px] text-foreground/80 leading-relaxed">
                  {selected.aiAnalysis}
                </div>
              </div>

              <div>
                <p className="text-muted-foreground mb-1.5 font-medium">Confidence</p>
                <div className="flex items-center gap-3">
                  <Progress value={selected.confidence} className="h-2 flex-1" />
                  <span className="font-mono font-bold text-primary">{selected.confidence}%</span>
                </div>
              </div>

              <div>
                <p className="text-muted-foreground mb-1.5 font-medium">Suggested Actions</p>
                <ul className="space-y-1.5">
                  {selected.suggestedActions.map((a, i) => (
                    <li key={i} className="flex items-start gap-2 text-foreground/80">
                      <Zap className="w-3 h-3 text-primary mt-0.5 shrink-0" />
                      {a}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Runbook Execution */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-muted-foreground font-medium">Runbook Steps</p>
                  {runbookRunning && (
                    <button onClick={() => { setRunbookRunning(false); setRunbookStep(-1); }} className="text-[10px] text-muted-foreground hover:text-foreground flex items-center gap-1">
                      <RotateCcw className="w-3 h-3" /> Reset
                    </button>
                  )}
                </div>
                <div className="space-y-2">
                  {selected.runbookSteps.map((step, i) => {
                    const completed = runbookRunning && i < runbookStep;
                    const active = runbookRunning && i === runbookStep;
                    return (
                      <div key={i} className={`flex items-center gap-2.5 p-2 rounded-md border transition-all duration-300 ${
                        completed ? "bg-success/5 border-success/20" :
                        active ? "bg-primary/5 border-primary/20" :
                        "border-border/30"
                      }`}>
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold ${
                          completed ? "bg-success/20 text-success" :
                          active ? "bg-primary/20 text-primary animate-pulse" :
                          "bg-muted/20 text-muted-foreground"
                        }`}>
                          {completed ? <CheckCircle2 className="w-3 h-3" /> : i + 1}
                        </div>
                        <span className={`text-[11px] ${completed ? "text-success line-through" : active ? "text-primary font-medium" : "text-muted-foreground"}`}>
                          {step}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {!runbookRunning && (
                <Button className="w-full" size="sm" onClick={executeRunbook}>
                  <Play className="w-3.5 h-3.5 mr-1.5" />
                  Execute Runbook
                </Button>
              )}

              {runbookRunning && runbookStep >= selected.runbookSteps.length && (
                <div className="flex items-center gap-2 p-3 rounded-md bg-success/10 border border-success/20 text-success text-[11px] font-medium">
                  <CheckCircle2 className="w-4 h-4" />
                  Runbook execution complete
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
