import { useCallback, useEffect, useState } from "react";
import type { CompletionState } from "../domain/types";

const STORAGE_KEY = "zenith:completion:v1:map:15";

function loadCompletion(): {
  hearts: Set<number>;
  pois: Set<number>;
} {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return { hearts: new Set(), pois: new Set() };
    const parsed = JSON.parse(stored) as CompletionState;
    return {
      hearts: new Set(parsed.completedHeartIds),
      pois: new Set(parsed.completedPoiIds ?? []),
    };
  } catch {
    return { hearts: new Set(), pois: new Set() };
  }
}

function toggleId(setter: React.Dispatch<React.SetStateAction<Set<number>>>, id: number) {
  setter((previous) => {
    const next = new Set(previous);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    return next;
  });
}

export function useCompletion() {
  const [initial] = useState(loadCompletion);
  const [completedHearts, setCompletedHearts] = useState(initial.hearts);
  const [completedPois, setCompletedPois] = useState(initial.pois);

  useEffect(() => {
    const state: CompletionState = {
      completedHeartIds: [...completedHearts],
      completedPoiIds: [...completedPois],
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [completedHearts, completedPois]);

  const toggleHeart = useCallback(
    (heartId: number) => toggleId(setCompletedHearts, heartId),
    [],
  );
  const togglePoi = useCallback(
    (poiId: number) => toggleId(setCompletedPois, poiId),
    [],
  );

  return { completedHearts, completedPois, toggleHeart, togglePoi };
}
