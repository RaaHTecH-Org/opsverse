import { useState, useMemo } from "react";
import { Globe, ArrowRight, ShieldAlert } from "lucide-react";
import { Link } from "react-router-dom";
import { continentPaths, hqTarget } from "./worldMapPaths";
import { useSimulation } from "@/hooks/use-simulation";
import { useThreatCounters } from "@/hooks/use-threat-counters";

interface RegionThreat {
  region: string;
  intensity: "high" | "medium" | "low";
  attempts: number;
  barPct: number;
  hotspot: { x: number; y: number };
  continentId: string;
}

const baseRegionThreats: RegionThreat[] = [
  { region: "Eastern Europe", intensity: "high", attempts: 85, barPct: 100, hotspot: { x: 530, y: 110 }, continentId: "europe" },
  { region: "South America", intensity: "high", attempts: 40, barPct: 47, hotspot: { x: 210, y: 310 }, continentId: "south-america" },
  { region: "West Africa", intensity: "high", attempts: 28, barPct: 33, hotspot: { x: 468, y: 210 }, continentId: "africa" },
  { region: "Southern Africa", intensity: "medium", attempts: 18, barPct: 21, hotspot: { x: 510, y: 305 }, continentId: "africa" },
  { region: "East Asia", intensity: "medium", attempts: 12, barPct: 14, hotspot: { x: 720, y: 120 }, continentId: "asia" },
  { region: "Western Europe", intensity: "low", attempts: 8, barPct: 9, hotspot: { x: 470, y: 100 }, continentId: "europe" },
  { region: "East Africa", intensity: "low", attempts: 6, barPct: 7, hotspot: { x: 540, y: 238 }, continentId: "africa" },
];

const intensityStyle = {
  high: { dot: "bg-critical", bar: "bg-critical/60", badge: "bg-critical/10 text-critical border-critical/20", svgFill: "hsl(var(--critical))" },
  medium: { dot: "bg-warning", bar: "bg-warning/60", badge: "bg-warning/10 text-warning border-warning/20", svgFill: "hsl(var(--warning))" },
  low: { dot: "bg-success", bar: "bg-success/50", badge: "bg-success/10 text-success border-success/20", svgFill: "hsl(var(--success))" },
};

export default function MiniThreatHeatmap() {
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null);
  const { isSimulating } = useSimulation();
  const regionKeys = useMemo(() => baseRegionThreats.map((r) => r.region), []);
  const deltas = useThreatCounters(regionKeys, isSimulating);

  const regionThreats = useMemo(() => {
    if (!isSimulating) return baseRegionThreats;
    const maxAttempts = Math.max(...baseRegionThreats.map((r) => r.attempts + (deltas.get(r.region) ?? 0)));
    return baseRegionThreats.map((r) => {
      const attempts = r.attempts + (deltas.get(r.region) ?? 0);
      return { ...r, attempts, barPct: Math.round((attempts / maxAttempts) * 100) };
    });
  }, [isSimulating, deltas]);

  const totalAttempts = regionThreats.reduce((sum, r) => sum + r.attempts, 0);

  return (
    <div className="bg-card border border-border rounded-lg">
      <div className="section-header">
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-critical" />
          <h2 className="section-title">Threat Activity</h2>
        </div>
        <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-medium transition-all duration-300 ${isSimulating ? "bg-critical/20 text-critical animate-pulse" : "bg-critical/10 text-critical"}`}>
          {totalAttempts} attempts
        </span>
      </div>

      <div className="p-4 space-y-4">
        {/* Real SVG World Map */}
        <div className="w-full overflow-hidden rounded-md bg-[hsl(var(--secondary)/0.15)] border border-border/20">
          <svg viewBox="0 0 1000 500" className="w-full h-auto" xmlns="http://www.w3.org/2000/svg">
            {/* Graticule grid */}
            {[100,200,300,400,500,600,700,800,900].map(x => (
              <line key={`v${x}`} x1={x} y1={0} x2={x} y2={500} stroke="hsl(var(--border))" strokeOpacity={0.06} strokeWidth={0.5} />
            ))}
            {[100,200,300,400].map(y => (
              <line key={`h${y}`} x1={0} y1={y} x2={1000} y2={y} stroke="hsl(var(--border))" strokeOpacity={0.06} strokeWidth={0.5} />
            ))}

            {/* Continent shapes */}
            {continentPaths.map((c) => {
              const threat = regionThreats.find(r => r.continentId === c.id);
              const isHovered = threat && hoveredRegion === threat.region;
              return (
                <path
                  key={c.id}
                  d={c.d}
                  fill={isHovered && threat ? intensityStyle[threat.intensity].svgFill : "hsl(var(--muted-foreground))"}
                  fillOpacity={isHovered ? 0.2 : 0.08}
                  stroke="hsl(var(--muted-foreground))"
                  strokeOpacity={isHovered ? 0.4 : 0.15}
                  strokeWidth={0.8}
                  className="transition-all duration-200"
                />
              );
            })}

            {/* Attack lines to HQ */}
            {regionThreats.map((r) => {
              const s = intensityStyle[r.intensity];
              return (
                <g key={`atk-${r.region}`}>
                  <line x1={r.hotspot.x} y1={r.hotspot.y} x2={hqTarget.x} y2={hqTarget.y} stroke={s.svgFill} strokeOpacity={0.15} strokeWidth={0.8} strokeDasharray="4 4" />
                  <circle r={2.5} fill={s.svgFill} opacity={0.8}>
                    <animateMotion dur={r.intensity === "high" ? "2s" : "3s"} repeatCount="indefinite" path={`M${r.hotspot.x},${r.hotspot.y} L${hqTarget.x},${hqTarget.y}`} />
                  </circle>
                </g>
              );
            })}

            {/* Threat hotspots */}
            {regionThreats.map((r) => {
              const s = intensityStyle[r.intensity];
              const isHovered = hoveredRegion === r.region;
              return (
                <g
                  key={`hs-${r.region}`}
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredRegion(r.region)}
                  onMouseLeave={() => setHoveredRegion(null)}
                >
                  <circle cx={r.hotspot.x} cy={r.hotspot.y} r={isHovered ? 8 : 6} fill={s.svgFill} fillOpacity={isHovered ? 0.5 : 0.35} stroke={s.svgFill} strokeWidth={1} className="transition-all duration-150" />
                  <circle cx={r.hotspot.x} cy={r.hotspot.y} r={3} fill={s.svgFill} opacity={0.9} />
                  <circle cx={r.hotspot.x} cy={r.hotspot.y} r={6} fill="none" stroke={s.svgFill} strokeWidth={0.8} opacity={0.3}>
                    <animate attributeName="r" values="6;14;6" dur="2.5s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.3;0;0.3" dur="2.5s" repeatCount="indefinite" />
                  </circle>
                  {/* Hover tooltip */}
                  {isHovered && (
                    <g className="pointer-events-none">
                      <rect x={r.hotspot.x - 50} y={r.hotspot.y - 38} width={100} height={28} rx={4} fill="hsl(var(--popover))" stroke="hsl(var(--border))" strokeWidth={0.5} />
                      <text x={r.hotspot.x} y={r.hotspot.y - 26} textAnchor="middle" fill="hsl(var(--foreground))" fontSize={9} fontWeight={600}>{r.region}</text>
                      <text x={r.hotspot.x} y={r.hotspot.y - 15} textAnchor="middle" fill="hsl(var(--muted-foreground))" fontSize={8}>{r.attempts} attempts</text>
                    </g>
                  )}
                </g>
              );
            })}

            {/* HQ marker */}
            <circle cx={hqTarget.x} cy={hqTarget.y} r={8} fill="hsl(var(--primary))" fillOpacity={0.15} stroke="hsl(var(--primary))" strokeWidth={1.5} />
            <circle cx={hqTarget.x} cy={hqTarget.y} r={3.5} fill="hsl(var(--primary))" />
            <circle cx={hqTarget.x} cy={hqTarget.y} r={8} fill="none" stroke="hsl(var(--primary))" strokeOpacity={0.3}>
              <animate attributeName="r" values="8;18;8" dur="3s" repeatCount="indefinite" />
              <animate attributeName="stroke-opacity" values="0.3;0;0.3" dur="3s" repeatCount="indefinite" />
            </circle>
            <text x={hqTarget.x} y={hqTarget.y - 14} textAnchor="middle" fill="hsl(var(--primary))" fontSize={10} fontWeight={600}>HQ</text>
          </svg>
        </div>

        {/* Threat origins — interactive bar layout */}
        <div className="space-y-2.5">
          {regionThreats.map((region) => {
            const s = intensityStyle[region.intensity];
            const isHovered = hoveredRegion === region.region;
            return (
              <div
                key={region.region}
                className={`space-y-1 p-1.5 -m-1.5 rounded-md cursor-pointer transition-colors ${isHovered ? "bg-muted/20" : "hover:bg-muted/10"}`}
                onMouseEnter={() => setHoveredRegion(region.region)}
                onMouseLeave={() => setHoveredRegion(null)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`w-1.5 h-1.5 rounded-full ${s.dot} ${isHovered ? "scale-150" : ""} transition-transform`} />
                    <span className="text-xs">{region.region}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[9px] px-1.5 py-0.5 rounded border font-medium capitalize ${s.badge}`}>{region.intensity}</span>
                    <span className={`text-[10px] font-mono w-6 text-right transition-colors duration-300 ${isSimulating && (deltas.get(region.region) ?? 0) > 0 ? "text-critical" : "text-muted-foreground"}`}>{region.attempts}</span>
                  </div>
                </div>
                <div className="h-1 bg-secondary/40 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${s.bar} transition-all`} style={{ width: `${region.barPct}%` }} />
                </div>
              </div>
            );
          })}
        </div>

        <Link
          to="/?persona=security"
          className="flex items-center justify-center gap-1.5 text-xs text-primary hover:text-primary/80 transition-colors pt-3 border-t border-border/30"
        >
          <ShieldAlert className="w-3 h-3" />
          <span>View Full Threat Map</span>
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );
}
