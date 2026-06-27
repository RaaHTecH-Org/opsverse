import { serviceRequests } from "@/data/mock-data";
import SEO from "@/components/SEO";
import { useState } from "react";
import { Plus, CheckCircle, Clock, XCircle, FileText, Wifi, Monitor, UserPlus, Key, Users, Search, Filter } from "lucide-react";

const approvalIcon = {
  pending: <Clock className="w-3.5 h-3.5 text-warning" />,
  approved: <CheckCircle className="w-3.5 h-3.5 text-success" />,
  rejected: <XCircle className="w-3.5 h-3.5 text-critical" />,
};

const workflowStages = ["submitted", "manager-approval", "it-provisioning", "completed"] as const;
const stageLabels: Record<string, string> = {
  "submitted": "Submitted",
  "manager-approval": "Manager Approval",
  "it-provisioning": "IT Provisioning",
  "completed": "Completed",
  "closed": "Closed",
};

const catalogItems = [
  { type: "Software Access", icon: FileText, desc: "License & app access", count: 2 },
  { type: "VPN Access", icon: Wifi, desc: "Remote connectivity", count: 2 },
  { type: "Device Replacement", icon: Monitor, desc: "Hardware refresh", count: 1 },
  { type: "New Employee Onboarding", icon: UserPlus, desc: "Full onboarding", count: 2 },
  { type: "Account Provisioning", icon: Key, desc: "Account setup", count: 1 },
  { type: "SharePoint / Teams Access", icon: Users, desc: "Collaboration access", count: 2 },
];

function WorkflowProgress({ currentStage }: { currentStage: string }) {
  const currentIdx = workflowStages.indexOf(currentStage as any);
  const isClosed = currentStage === "closed";
  return (
    <div className="flex items-center gap-0.5">
      <SEO title="Service Requests" description="Submit, approve, and fulfill IT service requests across the enterprise with end-to-end workflow visibility." />
      {workflowStages.map((stage, idx) => {
        const isDone = isClosed || idx < currentIdx;
        const isCurrent = !isClosed && idx === currentIdx;
        return (
          <div key={stage} className="flex items-center gap-0.5">
            <div
              className={`w-2.5 h-2.5 rounded-full border-2 transition-colors ${
                isDone
                  ? "bg-success border-success"
                  : isCurrent
                  ? "bg-primary border-primary shadow-[0_0_6px_hsl(var(--primary)/0.5)]"
                  : "bg-transparent border-muted-foreground/30"
              }`}
            />
            {idx < workflowStages.length - 1 && (
              <div className={`w-5 h-0.5 rounded ${isDone ? "bg-success/50" : "bg-muted"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function ServiceRequests() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  const filtered = serviceRequests
    .filter((r) => typeFilter === "all" || r.requestType === typeFilter)
    .filter(
      (r) =>
        r.requestor.toLowerCase().includes(search.toLowerCase()) ||
        r.id.toLowerCase().includes(search.toLowerCase()) ||
        r.requestType.toLowerCase().includes(search.toLowerCase()) ||
        r.department.toLowerCase().includes(search.toLowerCase())
    );

  const stats = {
    total: serviceRequests.length,
    pending: serviceRequests.filter((r) => r.approvalStatus === "pending").length,
    inProgress: serviceRequests.filter((r) => r.status === "in-progress").length,
    fulfilled: serviceRequests.filter((r) => r.status === "fulfilled").length,
  };

  return (
    <div className="space-y-6 animate-slide-in">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Service Request Portal</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Submit and track IT service requests across the enterprise
          </p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors text-primary-foreground" style={{ background: 'var(--gradient-primary)' }}>
          <Plus className="w-4 h-4" /> New Request
        </button>
      </div>

      {/* Service Catalog */}
      <div>
        <p className="text-[11px] uppercase tracking-widest text-muted-foreground font-medium mb-3">Service Catalog</p>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {catalogItems.map((item) => (
            <button key={item.type} className="stat-card text-left group">
              <div className="flex items-center justify-between mb-2">
                <item.icon className="w-5 h-5 text-primary" />
                <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-mono">{item.count}</span>
              </div>
              <p className="text-sm font-medium leading-tight">{item.type}</p>
              <p className="text-[11px] text-muted-foreground mt-1">{item.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Summary strip */}
      <div className="flex items-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-info" />
          <span className="text-muted-foreground">{stats.total} Total</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-warning" />
          <span className="text-muted-foreground">{stats.pending} Pending Approval</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan" />
          <span className="text-muted-foreground">{stats.inProgress} In Progress</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-success" />
          <span className="text-muted-foreground">{stats.fulfilled} Fulfilled</span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search requests..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-secondary border border-border rounded-md pl-9 pr-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="bg-secondary border border-border rounded-md px-3 py-2 text-[11px] text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
        >
          <option value="all">All Types</option>
          {catalogItems.map((c) => (
            <option key={c.type} value={c.type}>{c.type}</option>
          ))}
        </select>
      </div>

      {/* Workflow legend */}
      <div className="flex items-center gap-4 text-[11px] text-muted-foreground bg-secondary/50 rounded-lg px-4 py-2.5 border border-border/50">
        <span className="font-medium text-foreground">Workflow:</span>
        {workflowStages.map((stage, idx) => (
          <div key={stage} className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-primary/60" />
            <span>{stageLabels[stage]}</span>
            {idx < workflowStages.length - 1 && <span className="text-muted-foreground/40 ml-1">→</span>}
          </div>
        ))}
      </div>

      {/* Requests table */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Type</th>
                <th>Requestor</th>
                <th>Department</th>
                <th>Approval</th>
                <th>Workflow Progress</th>
                <th>Team</th>
                <th>Status</th>
                <th>ETA</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((req) => (
                <tr key={req.id} className="cursor-pointer">
                  <td className="font-mono text-[11px] text-muted-foreground">{req.id}</td>
                  <td className="font-medium text-sm">{req.requestType}</td>
                  <td className="text-sm">{req.requestor}</td>
                  <td className="text-[11px] text-muted-foreground">{req.department}</td>
                  <td>
                    <div className="flex items-center gap-1.5">
                      {approvalIcon[req.approvalStatus]}
                      <span className="text-[11px] capitalize">{req.approvalStatus}</span>
                    </div>
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <WorkflowProgress currentStage={req.workflowStage} />
                      <span className="text-[10px] text-muted-foreground whitespace-nowrap">{stageLabels[req.workflowStage]}</span>
                    </div>
                  </td>
                  <td className="text-[11px] text-muted-foreground">{req.assignedTeam}</td>
                  <td>
                    <span className={`status-badge status-${req.status}`}>{req.status}</span>
                  </td>
                  <td className="text-[11px] text-muted-foreground">
                    {req.fulfillmentEta === "N/A" ? "—" : new Date(req.fulfillmentEta).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
