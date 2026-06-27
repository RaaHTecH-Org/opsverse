import { ReactNode, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  AlertTriangle,
  FileText,
  Monitor,
  Bot,
  Network,
  Cpu,
  Settings,
  Menu,
  X,
  Activity,
  Bell,
  Search,
  ChevronRight,
  Zap,
  Radio,
  CheckCheck,
  Trash2,
  Info,
  ShieldAlert,
  CircleCheck,
} from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useSimulation, SimNotification } from "@/hooks/use-simulation";

const navItems = [
  { path: "/", label: "Dashboard", icon: LayoutDashboard },
  { path: "/incidents", label: "Incidents", icon: AlertTriangle },
  { path: "/requests", label: "Service Requests", icon: FileText },
  { path: "/assets", label: "Assets", icon: Monitor },
  { path: "/copilot", label: "AI Copilot", icon: Bot },
  { path: "/digital-twin", label: "Digital Twin", icon: Network },
  { path: "/autopilot", label: "AI Autopilot", icon: Cpu },
  { path: "/root-causes", label: "Root Causes", icon: Activity },
  { path: "/admin", label: "Admin", icon: Settings },
];

export default function AppLayout({ children }: { children: ReactNode }) {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { notifications, unreadCount, isSimulating, toggleSimulation, markAllRead, clearNotifications } = useSimulation();

  const currentPage = navItems.find((n) => n.path === location.pathname);

  const severityIcon = (type: SimNotification["type"]) => {
    switch (type) {
      case "critical": return <ShieldAlert className="w-3.5 h-3.5 text-critical shrink-0" />;
      case "warning": return <AlertTriangle className="w-3.5 h-3.5 text-warning shrink-0" />;
      case "success": return <CircleCheck className="w-3.5 h-3.5 text-success shrink-0" />;
      default: return <Info className="w-3.5 h-3.5 text-info shrink-0" />;
    }
  };

  const timeAgo = (date: Date) => {
    const s = Math.floor((Date.now() - date.getTime()) / 1000);
    if (s < 60) return `${s}s ago`;
    if (s < 3600) return `${Math.floor(s / 60)}m ago`;
    return `${Math.floor(s / 3600)}h ago`;
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-60 bg-sidebar border-r border-sidebar-border flex flex-col transition-transform duration-200 lg:relative lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center gap-2.5 px-5 py-5 border-b border-sidebar-border">
          <div className="w-8 h-8 rounded-md flex items-center justify-center" style={{ background: 'var(--gradient-primary)' }}>
            <Activity className="w-4 h-4 text-primary-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-sidebar-accent-foreground leading-none tracking-tight">
              Raahtech Command
            </div>
            <p className="text-[10px] text-sidebar-foreground mt-0.5 uppercase tracking-widest">
              Center
            </p>
          </div>
          <button
            className="ml-auto lg:hidden text-sidebar-foreground"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground px-3 mb-3 font-medium">
            Operations
          </p>
          {navItems.slice(0, 4).map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              className={`nav-item ${location.pathname === item.path ? "active" : ""}`}
            >
              <item.icon className="w-4 h-4 shrink-0" />
              {item.label}
            </Link>
          ))}
          <div className="pt-4 pb-2">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground px-3 mb-3 font-medium">
              Intelligence
            </p>
          </div>
          {navItems.slice(4).map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              className={`nav-item ${location.pathname === item.path ? "active" : ""}`}
            >
              <item.icon className="w-4 h-4 shrink-0" />
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Architecture card */}
        <div className="mx-3 mb-3 p-3 rounded-lg border border-primary/10 bg-primary/5">
          <p className="text-[10px] uppercase tracking-widest text-primary/80 font-medium mb-2 flex items-center gap-1.5">
            <Zap className="w-3 h-3" />
            Platform Architecture
          </p>
          <div className="space-y-1.5">
            <div className="text-[11px] text-muted-foreground flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-info shrink-0" />
              Microsoft Enterprise
            </div>
            <div className="flex justify-center">
              <ChevronRight className="w-3 h-3 text-primary/40 rotate-90" />
            </div>
            <div className="text-[11px] text-primary flex items-center gap-1.5 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
              Raahtech Command Center
            </div>
            <div className="flex justify-center">
              <ChevronRight className="w-3 h-3 text-primary/40 rotate-90" />
            </div>
            <div className="text-[11px] text-muted-foreground flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan shrink-0" />
              AI Insights & Automation
            </div>
          </div>
        </div>

        <div className="px-4 py-4 border-t border-sidebar-border">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold text-primary-foreground" style={{ background: 'var(--gradient-primary)' }}>
              JD
            </div>
            <div>
              <p className="text-xs font-medium text-sidebar-accent-foreground">
                John Doe
              </p>
              <p className="text-[11px] text-sidebar-foreground">
                IT Operations Lead
              </p>
            </div>
          </div>
          <p className="text-[9px] text-muted-foreground/70 mt-2.5 text-center tracking-wide">© {new Date().getFullYear()} Raahtech. All rights reserved.</p>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="flex items-center gap-3 px-6 h-14 border-b border-border bg-card/50 backdrop-blur-sm shrink-0">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden" aria-label="Open menu">
            <Menu className="w-5 h-5 text-muted-foreground" />
          </button>
          <div className="flex-1 flex items-center gap-3">
            <div className="hidden lg:flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Raahtech</span>
              <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/50" />
              <span className="font-medium">{currentPage?.label || "Dashboard"}</span>
            </div>
            <span className="lg:hidden text-sm font-medium">Raahtech Command Center</span>
          </div>
          <div className="hidden md:flex items-center gap-1.5 text-[11px] text-muted-foreground mr-2">
            <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
            AI-Assisted Enterprise Operations Platform
          </div>
          <div className="flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={toggleSimulation}
                  aria-label={isSimulating ? "Stop live simulation" : "Start live simulation"}
                  className={`p-2 rounded-md transition-colors ${isSimulating ? "text-success" : "text-muted-foreground hover:text-foreground hover:bg-secondary"}`}
                >
                  <Radio className={`w-4 h-4 ${isSimulating ? "animate-pulse" : ""}`} />
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p className="text-xs">{isSimulating ? "Simulation active" : "Start live demo"}</p>
              </TooltipContent>
            </Tooltip>
            <button className="p-2 rounded-md hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground" aria-label="Search">
              <Search className="w-4 h-4" />
            </button>
            <Popover>
              <PopoverTrigger asChild>
                <button aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ""}`} className="p-2 rounded-md hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground relative">
                  <Bell className="w-4 h-4" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 min-w-[16px] h-4 rounded-full bg-critical text-critical-foreground text-[10px] font-bold flex items-center justify-center px-1">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-0" align="end" sideOffset={8}>
                <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                  <h4 className="text-sm font-semibold">Notifications</h4>
                  <div className="flex gap-1">
                    <button onClick={markAllRead} className="p-1 rounded hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors" title="Mark all read" aria-label="Mark all read">
                      <CheckCheck className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={clearNotifications} className="p-1 rounded hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors" title="Clear all" aria-label="Clear all">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <ScrollArea className="max-h-72">
                  {notifications.length === 0 ? (
                    <p className="text-xs text-muted-foreground text-center py-8">No notifications</p>
                  ) : (
                    notifications.map((n) => (
                      <div key={n.id} className={`flex items-start gap-2.5 px-4 py-2.5 border-b border-border/50 last:border-0 ${!n.read ? "bg-primary/5" : ""}`}>
                        {severityIcon(n.type)}
                        <div className="flex-1 min-w-0">
                          <p className="text-xs leading-relaxed">{n.message}</p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">{timeAgo(n.timestamp)}</p>
                        </div>
                      </div>
                    ))
                  )}
                </ScrollArea>
              </PopoverContent>
            </Popover>
          </div>
        </header>
        <div className="flex-1 overflow-auto p-6">{children}</div>
      </main>
    </div>
  );
}
