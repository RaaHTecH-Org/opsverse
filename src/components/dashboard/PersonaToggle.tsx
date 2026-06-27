import { useEffect } from "react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Users, Shield, Wrench, LayoutGrid, RotateCcw } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export type Persona = "all" | "ops" | "security" | "engineering";

const STORAGE_KEY = "rcc-persona";

interface PersonaToggleProps {
  value: Persona;
  onChange: (value: Persona) => void;
}

const personas = [
  { value: "all" as const, label: "All", icon: LayoutGrid },
  { value: "ops" as const, label: "Ops", icon: Users },
  { value: "security" as const, label: "Security", icon: Shield },
  { value: "engineering" as const, label: "Eng", icon: Wrench },
];

export function getPersistedPersona(): Persona {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && ["all", "ops", "security", "engineering"].includes(stored)) {
      return stored as Persona;
    }
  } catch {}
  return "all";
}

export default function PersonaToggle({ value, onChange }: PersonaToggleProps) {
  // Persist on change
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, value); } catch {}
  }, [value]);

  const handleReset = () => {
    onChange("all");
    try { localStorage.removeItem(STORAGE_KEY); } catch {}
  };

  return (
    <div className="flex items-center gap-1.5">
      <ToggleGroup
        type="single"
        value={value}
        onValueChange={(v) => v && onChange(v as Persona)}
        className="bg-secondary/50 border border-border rounded-lg p-1 gap-0.5 flex-wrap"
      >
        {personas.map((p) => (
          <ToggleGroupItem
            key={p.value}
            value={p.value}
            className="text-[11px] sm:text-xs px-2 sm:px-3 py-1.5 gap-1 sm:gap-1.5 data-[state=on]:bg-primary/15 data-[state=on]:text-primary rounded-md"
          >
            <p.icon className="w-3 h-3" />
            <span className="hidden xs:inline sm:inline">{p.label}</span>
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
      {value !== "all" && (
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={handleReset}
              aria-label="Reset persona filter to all"
              className="p-1.5 rounded-md hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p className="text-xs">Reset to All</p>
          </TooltipContent>
        </Tooltip>
      )}
    </div>
  );
}
