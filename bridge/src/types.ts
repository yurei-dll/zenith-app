export type ContinentPoint = readonly [x: number, y: number];

export interface PlayerSnapshot {
  type: "player";
  sequence: number;
  connected: boolean;
  mapId: number | null;
  position: ContinentPoint | null;
  heading: number | null;
  characterName: string | null;
  timestamp: string;
  source: "mumblelink" | "mock";
  gameBuild?: number;
  inCombat?: boolean;
}

export interface TelemetrySource {
  readonly kind: PlayerSnapshot["source"];
  read(): Omit<PlayerSnapshot, "type" | "sequence" | "timestamp" | "source">;
  close(): void;
}

export interface MapRegistration {
  id: number;
  continentId: number;
  floorId: number;
  regionId: number;
}
