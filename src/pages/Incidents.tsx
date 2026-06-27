import { useState } from "react";
import SEO from "@/components/SEO";
import { incidents, type Incident } from "@/data/mock-data";
import { Bot, Search, Plus, X, Calendar, Users, Server, AlertTriangle, ShieldAlert, Clock, ArrowUpRight } from "lucide-react";

const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
const allStatuses = ["all", "open", "in-progress", "resolved", "closed"];
const allPriorities = ["all", "critical", "high", "medium", "low"];
const allTeams = ["all", ...Array.from(new Set(incidents.map((i) => i.assignedTeam)))];
const allSystems = ["all", ...Array.from(new Set(incidents.map((i) => i.affectedSystem)))];

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

export default function Incidents() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [teamFilter, setTeamFilter] = useState("all");
  const [systemFilter, setSystemFilter] = useState("all");
  const [selected, setSelected] = useState<Incident | null>(null);

  const filtered = incidents
    .filter((i) => statusFilter === "all" || i.status === statusFilter)
    .filter((i) => priorityFilter === "all" || i.priority === priorityFilter)
    .filter((i) => teamFilter === "all" || i.assignedTeam === teamFilter)
    .filter((i) => systemFilter === "all" || i.affectedSystem === systemFilter)
    .filter(
      (i) =>
        i.title.toLowerCase().includes(search.toLowerCase()) ||
        i.id.toLowerCase().includes(search.toLowerCase()) ||
        i.description.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  const counts = {
    total: incidents.length,
    critical: incidents.filter((i) => i.priority === "critical").length,
    open: incidents.filter((i) => i.status === "open").length,
    inProgress: incidents.filter((i) => i.status === "in-progress").length,
  };

  return (
    <div className="space-y-5 animate-slide-in">
      <SEO title="Incidents" description="Triage, track, and resolve enterprise incidents with AI-assisted analysis and team routing." />
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Incident Management</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Enterprise incident tracking and AI-assisted resolution
          </p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors text-primary-foreground" style={{ background: 'var(--gradient-primary)' }}>
          <Plus className="w-4 h-4" /> New Incident
        </button>
      </div>

      {/* Summary strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="stat-card flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-warning" />
          <div>
            <p className="text-lg font-semibold">{counts.total}</p>
            <p className="text-[11px] text-muted-foreground">Total Incidents</p>
          </div>
        </div>
        <div className="stat-card flex items-center gap-3">
          <ShieldAlert className="w-5 h-5 text-critical" />
          <div>
            <p className="text-lg font-semibold text-critical">{counts.critical}</p>
            <p className="text-[11px] text-muted-foreground">Critical</p>
          </div>
        </div>
        <div className="stat-card flex items-center gap-3">
          <ArrowUpRight className="w-5 h-5 text-info" />
          <div>
            <p className="text-lg font-semibold">{counts.open}</p>
            <p className="text-[11px] text-muted-foreground">Open</p>
          </div>
        </div>
        <div className="stat-card flex items-center gap-3">
          <Clock className="w-5 h-5 text-cyan" />
          <div>
            <p className="text-lg font-semibold">{counts.inProgress}</p>
            <p className="text-[11px] text-muted-foreground">In Progress</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search incidents..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-secondary border border-border rounded-md pl-9 pr-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
        <div className="flex items-center gap-1 bg-secondary rounded-md p-1">
          {allStatuses.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded text-[11px] font-medium transition-colors capitalize ${
                statusFilter === s ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {s === "all" ? "All Status" : s}
            </button>
          ))}
        </div>
        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="bg-secondary border border-border rounded-md px-3 py-2 text-[11px] text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
        >
          {allPriorities.map((p) => (
            <option key={p} value={p}>{p === "all" ? "All Priority" : p}</option>
          ))}
        </select>
        <select
          value={teamFilter}
          onChange={(e) => setTeamFilter(e.target.value)}
          className="bg-secondary border border-border rounded-md px-3 py-2 text-[11px] text-foreground focus:outline-none focus:ring-1 focus:ring-ring hidden lg:block"
        >
          {allTeams.map((t) => (
            <option key={t} value={t}>{t === "all" ? "All Teams" : t}</option>
          ))}
        </select>
        <select
          value={systemFilter}
          onChange={(e) => setSystemFilter(e.target.value)}
          className="bg-secondary border border-border rounded-md px-3 py-2 text-[11px] text-foreground focus:outline-none focus:ring-1 focus:ring-ring hidden lg:block"
        >
          {allSystems.map((s) => (
            <option key={s} value={s}>{s === "all" ? "All Systems" : s}</option>
          ))}
        </select>
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Table */}
        <div className={`${selected ? 'lg:col-span-3' : 'lg:col-span-5'} bg-card border border-border rounded-lg overflow-hidden`}>
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Title</th>
                  <th>System</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Team</th>
                  <th>Updated</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((inc) => (
                  <tr
                    key={inc.id}
                    className={`cursor-pointer ${selected?.id === inc.id ? "!bg-primary/5" : ""}`}
                    onClick={() => setSelected(inc)}
                  >
                    <td className="font-mono text-[11px] text-muted-foreground">{inc.id}</td>
                    <td className="font-medium text-sm max-w-[200px] truncate">{inc.title}</td>
                    <td className="text-[11px] text-muted-foreground">{inc.affectedSystem}</td>
                    <td>
                      <span className={`priority-${inc.priority} text-[11px] capitalize`}>{inc.priority}</span>
                    </td>
                    <td>
                      <span className={`status-badge status-${inc.status}`}>{inc.status}</span>
                    </td>
                    <td className="text-[11px] text-muted-foreground">{inc.assignedTeam}</td>
                    <td className="text-[11px] text-muted-foreground">{formatDate(inc.updatedAt)}</td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={7} className="text-center py-8 text-muted-foreground">No incidents match filters</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Detail Panel */}
        {selected && (
          <div className="lg:col-span-2 bg-card border border-border rounded-lg">
            <div className="section-header">
              <span className="text-xs font-mono text-muted-foreground">{selected.id}</span>
              <button onClick={() => setSelected(null)} className="text-muted-foreground hover:text-foreground transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <h3 className="text-base font-semibold leading-snug">{selected.title}</h3>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-[11px] text-muted-foreground mb-1">Priority</p>
                  <span className={`priority-${selected.priority} capitalize`}>{selected.priority}</span>
                </div>
                <div>
                  <p className="text-[11px] text-muted-foreground mb-1">Status</p>
                  <span className={`status-badge status-${selected.status}`}>{selected.status}</span>
                </div>
                <div>
                  <p className="text-[11px] text-muted-foreground mb-1 flex items-center gap-1"><Server className="w-3 h-3" />System</p>
                  <span className="text-sm">{selected.affectedSystem}</span>
                </div>
                <div>
                  <p className="text-[11px] text-muted-foreground mb-1 flex items-center gap-1"><Users className="w-3 h-3" />Team</p>
                  <span className="text-sm">{selected.assignedTeam}</span>
                </div>
                <div>
                  <p className="text-[11px] text-muted-foreground mb-1 flex items-center gap-1"><Calendar className="w-3 h-3" />Created</p>
                  <span className="text-sm">{formatDate(selected.createdAt)}</span>
                </div>
                <div>
                  <p className="text-[11px] text-muted-foreground mb-1 flex items-center gap-1"><Calendar className="w-3 h-3" />Updated</p>
                  <span className="text-sm">{formatDate(selected.updatedAt)}</span>
                </div>
              </div>

              <div>
                <p className="text-[11px] text-muted-foreground mb-1">Description</p>
                <p className="text-sm leading-relaxed">{selected.description}</p>
              </div>

              {selected.resolutionNotes && (
                <div className="bg-success/5 border border-success/20 rounded-md p-3">
                  <p className="text-[11px] text-success font-medium mb-1">Resolution Notes</p>
                  <p className="text-sm text-success/90">{selected.resolutionNotes}</p>
                </div>
              )}

              <div className="ai-panel">
                <div className="flex items-center gap-2 mb-2">
                  <Bot className="w-3.5 h-3.5 text-primary" />
                  <span className="text-[11px] font-semibold text-primary">AI Analysis & Routing Recommendation</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed italic">
                  "{selected.aiSummary}"
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
