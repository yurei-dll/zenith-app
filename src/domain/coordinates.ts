import type { ContinentPoint } from "./types";

export const TYRIA_MAX_ZOOM = 7;

export function continentToLeaflet(point: ContinentPoint): [number, number] {
  return [-point[1], point[0]];
}

export function mumbleMetersToMapInches(
  position: readonly [x: number, y: number, z: number],
): readonly [x: number, y: number] {
  const metersToInches = 39.3701;
  return [position[0] * metersToInches, position[2] * metersToInches];
}

export function eventToContinent(
  eventPoint: ContinentPoint,
  mapRect: readonly [ContinentPoint, ContinentPoint],
  continentRect: readonly [ContinentPoint, ContinentPoint],
): ContinentPoint {
  const mapWidth = mapRect[1][0] - mapRect[0][0];
  const mapHeight = mapRect[1][1] - mapRect[0][1];
  const continentWidth = continentRect[1][0] - continentRect[0][0];
  const continentHeight = continentRect[1][1] - continentRect[0][1];

  return [
    continentRect[0][0] +
      ((eventPoint[0] - mapRect[0][0]) / mapWidth) * continentWidth,
    continentRect[0][1] +
      (1 - (eventPoint[1] - mapRect[0][1]) / mapHeight) * continentHeight,
  ];
}
