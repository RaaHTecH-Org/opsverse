import { assets } from "@/data/mock-data";
import SEO from "@/components/SEO";
import { Monitor, Server, Smartphone, HardDrive, Search, Shield, Key, CheckCircle2, AlertTriangle, XCircle } from "lucide-react";
import { useState } from "react";

const assetIcons: Record<string, typeof Monitor> = {
  "Windows Laptop": Monitor,
  "Azure VM": Server,
  "Mobile Device": Smartphone,
  "M365 License": Key,
  "Security Tool License": Shield,
};

const categories = ["All", ...Array.from(new Set(assets.map((a) => a.assetType)))];

function formatCheckIn(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const hours = Math.floor(diff / 3600000);
  if (hours < 1) return "Just now";
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default function Assets() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  const filtered = assets
    .filter((a) => category === "All" || a.assetType === category)
    .filter(
      (a) =>
        a.assetType.toLowerCase().includes(search.toLowerCase()) ||
        a.owner.toLowerCase().includes(search.toLowerCase()) ||
        a.id.toLowerCase().includes(search.toLowerCase()) ||
        a.department.toLowerCase().includes(search.toLowerCase())
    );

  const complianceStats = {
    compliant: assets.filter((a) => a.complianceState === "compliant").length,
    nonCompliant: assets.filter((a) => a.complianceState === "non-compliant").length,
    warning: assets.filter((a) => a.complianceState === "warning").length,
  };

  const typeBreakdown = categories.slice(1).map((type) => ({
    type,
    count: assets.filter((a) => a.assetType === type).length,
    icon: assetIcons[type] || HardDrive,
  }));

  return (
    <div className="space-y-6 animate-slide-in">
      <SEO title="Assets" description="Enterprise asset inventory, compliance posture, and lifecycle management across endpoints and cloud." />
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Asset Management</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Enterprise asset inventory, compliance tracking, and lifecycle management
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="stat-card-glow">
          <div className="flex items-center justify-between mb-3">
            <Monitor className="w-4 h-4 text-foreground" />
          </div>
          <p className="text-2xl font-semibold">{assets.length}</p>
          <p className="text-[11px] text-muted-foreground mt-1">Total Assets</p>
        </div>
        <div className="stat-card-glow">
          <div className="flex items-center justify-between mb-3">
            <CheckCircle2 className="w-4 h-4 text-success" />
          </div>
          <p className="text-2xl font-semibold text-success">{complianceStats.compliant}</p>
          <p className="text-[11px] text-muted-foreground mt-1">Compliant</p>
        </div>
        <div className="stat-card-glow">
          <div className="flex items-center justify-between mb-3">
            <XCircle className="w-4 h-4 text-critical" />
          </div>
          <p className="text-2xl font-semibold text-critical">{complianceStats.nonCompliant}</p>
          <p className="text-[11px] text-muted-foreground mt-1">Non-Compliant</p>
        </div>
        <div className="stat-card-glow">
          <div className="flex items-center justify-between mb-3">
            <AlertTriangle className="w-4 h-4 text-warning" />
          </div>
          <p className="text-2xl font-semibold text-warning">{complianceStats.warning}</p>
          <p className="text-[11px] text-muted-foreground mt-1">Warning</p>
        </div>
      </div>

      {/* Device type breakdown */}
      <div className="flex items-center gap-4 flex-wrap">
        {typeBreakdown.map((t) => (
          <button
            key={t.type}
            onClick={() => setCategory(t.type === category ? "All" : t.type)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-all ${
              category === t.type
                ? "border-primary/40 bg-primary/10 text-primary"
                : "border-border/50 bg-secondary/30 text-muted-foreground hover:border-primary/20 hover:text-foreground"
            }`}
          >
            <t.icon className="w-3.5 h-3.5" />
            <span className="font-medium">{t.type}</span>
            <span className="text-[10px] font-mono bg-background/50 px-1.5 py-0.5 rounded">{t.count}</span>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search assets..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-secondary border border-border rounded-md pl-9 pr-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
        />
      </div>

      {/* Assets table */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="section-header">
          <h2 className="section-title">Asset Inventory</h2>
          <span className="text-[10px] text-muted-foreground font-mono">{filtered.length} assets</span>
        </div>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Asset ID</th>
                <th>Type</th>
                <th>Owner</th>
                <th>Department</th>
                <th>Status</th>
                <th>Compliance</th>
                <th>Lifecycle</th>
                <th>Location</th>
                <th>Last Check-in</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((asset) => {
                const Icon = assetIcons[asset.assetType] || HardDrive;
                return (
                  <tr key={asset.id} className="cursor-pointer">
                    <td className="font-mono text-[11px] text-muted-foreground">{asset.id}</td>
                    <td>
                      <div className="flex items-center gap-2">
                        <Icon className="w-3.5 h-3.5 text-primary shrink-0" />
                        <span className="text-sm">{asset.assetType}</span>
                      </div>
                    </td>
                    <td className="text-sm">{asset.owner}</td>
                    <td className="text-[11px] text-muted-foreground">{asset.department}</td>
                    <td>
                      <span className={`status-badge ${
                        asset.status === "active" ? "status-resolved" : asset.status === "maintenance" ? "status-pending" : "status-closed"
                      }`}>
                        {asset.status}
                      </span>
                    </td>
                    <td>
                      <span className={`status-badge status-${asset.complianceState === "unknown" ? "closed" : asset.complianceState}`}>
                        {asset.complianceState}
                      </span>
                    </td>
                    <td className="text-[11px] text-muted-foreground capitalize">{asset.lifecycleStage.replace('-', ' ')}</td>
                    <td className="text-[11px] text-muted-foreground">{asset.location}</td>
                    <td className="text-[11px] text-muted-foreground">{formatCheckIn(asset.lastCheckIn)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
