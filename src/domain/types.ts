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
}

export interface Heart {
  id: number;
  name: string;
  level: number;
  coordinate: ContinentPoint;
}

export interface CompletionState {
  completedHeartIds: number[];
  updatedAt: string;
}
