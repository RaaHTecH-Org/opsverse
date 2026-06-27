import { useState, useCallback, useSyncExternalStore } from "react";

export interface AuditEntry {
  id: string;
  timestamp: Date;
  action: "block_ip" | "geo_fence" | "escalate_soc";
  target: string;
  detail: string;
  actor: string;
}

type Listener = () => void;

let entries: AuditEntry[] = [];
const listeners = new Set<Listener>();

function emit() {
  listeners.forEach((l) => l());
}

export function addAuditEntry(action: AuditEntry["action"], target: string, detail: string) {
  entries = [
    {
      id: crypto.randomUUID(),
      timestamp: new Date(),
      action,
      target,
      detail,
      actor: "John Doe",
    },
    ...entries,
  ];
  emit();
}

export function clearAuditEntries() {
  entries = [];
  emit();
}

export function useSecurityAudit() {
  const snapshot = useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => entries,
  );
  return snapshot;
}
