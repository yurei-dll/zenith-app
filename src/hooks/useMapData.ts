import { useEffect, useState } from "react";
import { QUEENSDALE_MAP } from "../data/queensdale";
import type { ZoneMap } from "../domain/types";

const API_ROOT = "http://127.0.0.1:38421";

interface MapDataState {
  map: ZoneMap;
  loading: boolean;
  error: string | null;
}

export function useMapData(mapId: number | null): MapDataState {
  const requestedMapId = mapId ?? QUEENSDALE_MAP.id;
  const [state, setState] = useState<MapDataState>({
    map: QUEENSDALE_MAP,
    loading: requestedMapId !== QUEENSDALE_MAP.id,
    error: null,
  });

  useEffect(() => {
    const controller = new AbortController();
    setState((current) => ({ ...current, loading: true, error: null }));

    void fetch(`${API_ROOT}/api/maps/${requestedMapId}`, {
      headers: { accept: "application/json" },
      signal: controller.signal,
    })
      .then(async (response) => {
        const body = (await response.json()) as ZoneMap | { error?: string };
        if (!response.ok) {
          throw new Error(
            "error" in body && body.error
              ? body.error
              : `Map service returned HTTP ${response.status}`,
          );
        }
        return body as ZoneMap;
      })
      .then((map) => setState({ map, loading: false, error: null }))
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        setState((current) => ({
          ...current,
          loading: false,
          error: error instanceof Error ? error.message : "Could not load map data",
        }));
      });

    return () => controller.abort();
  }, [requestedMapId]);

  return state;
}
