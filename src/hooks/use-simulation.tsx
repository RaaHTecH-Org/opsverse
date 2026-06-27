import { createContext, useContext, useState, useEffect, useCallback, useMemo, ReactNode, useRef } from "react";
import { toast } from "sonner";

export interface SimNotification {
  id: string;
  type: "critical" | "warning" | "info" | "success";
  message: string;
  timestamp: Date;
  read: boolean;
}

type HealthStatus = "healthy" | "degraded" | "incident";

interface SimulationContextType {
  notifications: SimNotification[];
  unreadCount: number;
  isSimulating: boolean;
  serviceOverrides: Record<string, HealthStatus>;
  toggleSimulation: () => void;
  markAllRead: () => void;
  clearNotifications: () => void;
}

const SimulationContext = createContext<SimulationContextType | null>(null);

const simulationEvents: { type: SimNotification["type"]; message: string }[] = [
  { type: "critical", message: "VPN Gateway tunnel down — failover initiated" },
  { type: "warning", message: "Entra ID authentication latency spike detected (>2s)" },
  { type: "critical", message: "Exchange Online message queue backlog exceeding threshold" },
  { type: "warning", message: "Azure SQL DTU utilization at 92%" },
  { type: "critical", message: "Defender sensor offline on 3 endpoints" },
  { type: "info", message: "SharePoint Online sync completed — 0 conflicts" },
  { type: "warning", message: "Azure Cache connectivity intermittent — retrying" },
  { type: "success", message: "INC-2001 auto-resolved — VPN tunnel restored" },
  { type: "info", message: "Scheduled maintenance window starting in 30 minutes" },
  { type: "warning", message: "Internal Apps response time degraded (p95 > 1.2s)" },
  { type: "critical", message: "Storage cluster IOPS exceeding provisioned capacity" },
  { type: "success", message: "AI Autopilot completed runbook for INC-2003" },
  { type: "info", message: "Certificate renewal completed for *.contoso.com" },
  { type: "warning", message: "Azure East US region — elevated error rates" },
  { type: "success", message: "Defender threat remediation completed — 0 remaining" },
];

const seedNotifications: SimNotification[] = [
  { id: "seed-1", type: "warning", message: "Azure VPN Gateway — packet loss detected (2.3%)", timestamp: new Date(Date.now() - 300000), read: false },
  { id: "seed-2", type: "info", message: "System health check completed — 8/9 services healthy", timestamp: new Date(Date.now() - 600000), read: false },
  { id: "seed-3", type: "critical", message: "Entra ID — authentication failures above baseline", timestamp: new Date(Date.now() - 900000), read: true },
];

// Keyword → serviceId mapping for Digital Twin overrides (exported for reuse)
export const keywordServiceMap: { keywords: string[]; serviceId: string }[] = [
  { keywords: ["VPN"], serviceId: "vpn-gw" },
  { keywords: ["Entra"], serviceId: "entra-id" },
  { keywords: ["Exchange"], serviceId: "exchange" },
  { keywords: ["SQL", "DTU"], serviceId: "db-cluster" },
  { keywords: ["Defender"], serviceId: "defender" },
  { keywords: ["SharePoint"], serviceId: "sharepoint" },
  { keywords: ["Storage", "Cache"], serviceId: "azure-east" },
  { keywords: ["Internal Apps"], serviceId: "internal-apps" },
  { keywords: ["Azure East"], serviceId: "azure-east" },
];

function deriveServiceOverrides(notifications: SimNotification[]): Record<string, HealthStatus> {
  const overrides: Record<string, HealthStatus> = {};
  // Only consider recent unresolved notifications (last 10)
  const recent = notifications.slice(0, 15);

  for (const notif of recent) {
    if (notif.type === "success" || notif.type === "info") continue;

    for (const mapping of keywordServiceMap) {
      if (mapping.keywords.some((kw) => notif.message.includes(kw))) {
        const status: HealthStatus = notif.type === "critical" ? "incident" : "degraded";
        // Don't downgrade an existing incident to degraded
        if (!overrides[mapping.serviceId] || status === "incident") {
          overrides[mapping.serviceId] = status;
        }
      }
    }
  }

  return overrides;
}

export function SimulationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<SimNotification[]>(seedNotifications);
  const [isSimulating, setIsSimulating] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const serviceOverrides = useMemo(
    () => (isSimulating ? deriveServiceOverrides(notifications) : {}),
    [notifications, isSimulating],
  );

  const toggleSimulation = useCallback(() => setIsSimulating((p) => !p), []);
  const markAllRead = useCallback(() => setNotifications((prev) => prev.map((n) => ({ ...n, read: true }))), []);
  const clearNotifications = useCallback(() => setNotifications([]), []);

  useEffect(() => {
    if (!isSimulating) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    const tick = () => {
      const event = simulationEvents[Math.floor(Math.random() * simulationEvents.length)];
      const notif: SimNotification = {
        id: crypto.randomUUID(),
        type: event.type,
        message: event.message,
        timestamp: new Date(),
        read: false,
      };

      setNotifications((prev) => [notif, ...prev].slice(0, 50));

      if (event.type === "critical") {
        toast.error(event.message, { duration: 4000 });
      } else if (event.type === "warning") {
        toast.warning(event.message, { duration: 3000 });
      }
    };

    const delay = () => 5000 + Math.random() * 3000;
    let timeout: ReturnType<typeof setTimeout>;

    const schedule = () => {
      timeout = setTimeout(() => {
        tick();
        schedule();
      }, delay());
    };
    schedule();

    return () => clearTimeout(timeout);
  }, [isSimulating]);

  return (
    <SimulationContext.Provider value={{ notifications, unreadCount, isSimulating, serviceOverrides, toggleSimulation, markAllRead, clearNotifications }}>
      {children}
    </SimulationContext.Provider>
  );
}

export function useSimulation() {
  const ctx = useContext(SimulationContext);
  if (!ctx) throw new Error("useSimulation must be used within SimulationProvider");
  return ctx;
}
