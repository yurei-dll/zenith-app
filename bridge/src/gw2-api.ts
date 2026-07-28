import type { MapRegistration } from "./types.js";

const API_ROOT = "https://api.guildwars2.com";
const CACHE_TTL_MS = 5 * 60 * 1000;
const REQUEST_TIMEOUT_MS = 8_000;

export const MAPS = new Map<number, MapRegistration>([
  [15, { id: 15, continentId: 1, floorId: 1, regionId: 4 }],
]);

interface CacheEntry {
  expiresAt: number;
  value: unknown;
}

interface ApiTask {
  id: number;
  objective: string;
  level: number;
  coord: [number, number];
}

interface ApiMap {
  id: number;
  name: string;
  min_level: number;
  max_level: number;
  map_rect: [[number, number], [number, number]];
  continent_rect: [[number, number], [number, number]];
  tasks: Record<string, ApiTask>;
}

export interface NormalizedMap {
  id: number;
  name: string;
  minLevel: number;
  maxLevel: number;
  mapRect: ApiMap["map_rect"];
  continentRect: ApiMap["continent_rect"];
  hearts: Array<{
    id: number;
    name: string;
    level: number;
    coordinate: [number, number];
  }>;
}

export class Gw2ApiClient {
  private readonly cache = new Map<string, CacheEntry>();
  private readonly inFlight = new Map<string, Promise<unknown>>();

  async getMap(mapId: number, forceRefresh = false): Promise<NormalizedMap> {
    const registration = MAPS.get(mapId);
    if (!registration) throw new RangeError(`Map ${mapId} is not registered`);
    const path =
      `/v2/continents/${registration.continentId}` +
      `/floors/${registration.floorId}` +
      `/regions/${registration.regionId}` +
      `/maps/${registration.id}?lang=en`;
    const map = await this.getJson<ApiMap>(path, forceRefresh);
    if (
      map.id !== mapId ||
      typeof map.name !== "string" ||
      typeof map.tasks !== "object"
    ) {
      throw new Error("Guild Wars 2 API returned an unexpected map payload");
    }

    return {
      id: map.id,
      name: map.name,
      minLevel: map.min_level,
      maxLevel: map.max_level,
      mapRect: map.map_rect,
      continentRect: map.continent_rect,
      hearts: Object.values(map.tasks)
        .map((task) => ({
          id: task.id,
          name: task.objective,
          level: task.level,
          coordinate: task.coord,
        }))
        .sort((a, b) => a.level - b.level || a.id - b.id),
    };
  }

  status() {
    return {
      registeredMaps: [...MAPS.keys()],
      cachedResponses: this.cache.size,
      inFlightRequests: this.inFlight.size,
    };
  }

  private async getJson<T>(path: string, forceRefresh: boolean): Promise<T> {
    const cached = this.cache.get(path);
    if (!forceRefresh && cached && cached.expiresAt > Date.now()) {
      return cached.value as T;
    }
    const existing = this.inFlight.get(path);
    if (existing) return existing as Promise<T>;

    const request = this.fetchJson<T>(path)
      .then((value) => {
        this.cache.set(path, {
          expiresAt: Date.now() + CACHE_TTL_MS,
          value,
        });
        return value;
      })
      .catch((error) => {
        // A stale map is better than no map during a transient API outage.
        if (cached) return cached.value as T;
        throw error;
      })
      .finally(() => this.inFlight.delete(path));
    this.inFlight.set(path, request);
    return request;
  }

  private async fetchJson<T>(path: string): Promise<T> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    try {
      const response = await fetch(`${API_ROOT}${path}`, {
        headers: {
          accept: "application/json",
          "user-agent": "Zenith-GW2-Companion/0.1",
        },
        signal: controller.signal,
      });
      if (!response.ok) {
        throw new Error(`Guild Wars 2 API returned HTTP ${response.status}`);
      }
      return (await response.json()) as T;
    } finally {
      clearTimeout(timeout);
    }
  }
}
