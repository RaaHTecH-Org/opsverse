import { useState, useEffect, useRef } from "react";
import { useSimulation } from "./use-simulation";

/**
 * Provides live-incrementing threat attempt deltas when simulation is active.
 * Returns a Map<key, delta> that increments randomly on a fast interval.
 */
export function useThreatCounters(keys: string[], enabled: boolean) {
  const [deltas, setDeltas] = useState<Map<string, number>>(new Map());
  const prevEnabled = useRef(enabled);

  // Reset deltas when simulation toggles off
  useEffect(() => {
    if (!enabled && prevEnabled.current) {
      setDeltas(new Map());
    }
    prevEnabled.current = enabled;
  }, [enabled]);

  useEffect(() => {
    if (!enabled || keys.length === 0) return;

    const interval = setInterval(() => {
      setDeltas((prev) => {
        const next = new Map(prev);
        // Pick 1-3 random keys to increment
        const count = 1 + Math.floor(Math.random() * Math.min(3, keys.length));
        const shuffled = [...keys].sort(() => Math.random() - 0.5);
        for (let i = 0; i < count; i++) {
          const key = shuffled[i];
          next.set(key, (next.get(key) ?? 0) + (1 + Math.floor(Math.random() * 3)));
        }
        return next;
      });
    }, 2000 + Math.random() * 1500);

    return () => clearInterval(interval);
  }, [enabled, keys.join(",")]);

  return deltas;
}
