import { useCallback, useEffect, useState } from "react";
import type { CompletionState } from "../domain/types";

const STORAGE_KEY = "zenith:completion:v1:map:15";

function loadCompletion(): Set<number> {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return new Set();
    const parsed = JSON.parse(stored) as CompletionState;
    return new Set(parsed.completedHeartIds);
  } catch {
    return new Set();
  }
}

export function useCompletion() {
  const [completed, setCompleted] = useState(loadCompletion);

  useEffect(() => {
    const state: CompletionState = {
      completedHeartIds: [...completed],
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [completed]);

  const toggle = useCallback((heartId: number) => {
    setCompleted((previous) => {
      const next = new Set(previous);
      if (next.has(heartId)) next.delete(heartId);
      else next.add(heartId);
      return next;
    });
  }, []);

  return { completed, toggle };
}
