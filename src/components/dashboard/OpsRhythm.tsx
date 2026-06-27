import { Calendar, Zap, AlertTriangle, Wrench } from "lucide-react";
import { opsRhythmData, opsRhythmPatterns } from "@/data/mock-data";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

function getHeatColor(incidents: number): string {
  if (incidents === 0) return "bg-secondary/30";
  if (incidents === 1) return "bg-info/30";
  if (incidents === 2) return "bg-warning/40";
  if (incidents === 3) return "bg-warning/60";
  if (incidents >= 4) return "bg-critical/60";
  return "bg-secondary/30";
}

const hours = [0, 3, 6, 9, 12, 15, 18, 21];

export default function OpsRhythm() {
  return (
    <div className="bg-card border border-border rounded-lg">
      <div className="section-header">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-info" />
          <h2 className="section-title">Ops Rhythm</h2>
        </div>
        <span className="text-[10px] text-muted-foreground font-mono">Weekly pattern</span>
      </div>

      <div className="p-4 space-y-4">
        {/* Weekly Heatmap */}
        <div className="space-y-1">
          {/* Hour labels */}
          <div className="flex items-center gap-1 ml-10">
            {hours.map((h) => (
              <span key={h} className="text-[8px] text-muted-foreground w-[calc((100%-2.5rem)/8)] text-center">
                {h === 0 ? "12a" : h === 12 ? "12p" : h < 12 ? `${h}a` : `${h - 12}p`}
              </span>
            ))}
          </div>

          {/* Day rows */}
          {opsRhythmData.map((day) => (
            <div key={day.day} className="flex items-center gap-1">
              <span className="text-[10px] text-muted-foreground w-8 shrink-0">{day.day}</span>
              <div className="flex-1 flex gap-px">
                {day.hours.map((hour) => (
                  <Tooltip key={hour.hour}>
                    <TooltipTrigger asChild>
                      <div
                        className={`h-4 flex-1 rounded-sm relative cursor-default ${getHeatColor(hour.incidents)} ${
                          hour.isChangeWindow ? "ring-1 ring-inset ring-cyan/40" : ""
                        }`}
                      >
                        {hour.isDeployment && (
                          <span className="absolute inset-0 flex items-center justify-center">
                            <Zap className="w-2 h-2 text-warning" />
                          </span>
                        )}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="text-[10px]">
                      <p>
                        {day.day} {hour.hour}:00 — {hour.incidents} incident{hour.incidents !== 1 ? "s" : ""}
                        {hour.isChangeWindow && " • Change window"}
                        {hour.isDeployment && " • Deployment"}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                ))}
              </div>
              <span className="text-[10px] font-mono text-muted-foreground w-6 text-right">{day.total}</span>
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-[9px] text-muted-foreground flex-wrap">
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-sm bg-secondary/30" />
            <span>0</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-sm bg-info/30" />
            <span>1</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-sm bg-warning/40" />
            <span>2-3</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-sm bg-critical/60" />
            <span>4+</span>
          </div>
          <div className="flex items-center gap-1 ml-2">
            <span className="w-3 h-3 rounded-sm ring-1 ring-inset ring-cyan/40 bg-secondary/30" />
            <span>Change window</span>
          </div>
          <div className="flex items-center gap-1">
            <Zap className="w-2.5 h-2.5 text-warning" />
            <span>Deployment</span>
          </div>
        </div>

        {/* Pattern Detection */}
        <div className="border-t border-border/40 pt-3 space-y-2">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium flex items-center gap-1.5">
            <AlertTriangle className="w-3 h-3" />
            AI-Detected Patterns
          </p>
          {opsRhythmPatterns.map((p) => (
            <div key={p.id} className="flex items-start gap-2 text-[11px]">
              <Wrench className="w-3 h-3 text-info mt-0.5 shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{p.pattern}</span>
                  <span className="text-[9px] text-primary font-mono">{p.confidence}% conf</span>
                </div>
                <p className="text-muted-foreground text-[10px]">{p.recommendation}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
