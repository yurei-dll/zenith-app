import type { ContinentPoint } from "./types";

export const TYRIA_MAX_ZOOM = 7;

export function mumbleHeadingToScreenRadians(heading: number): number {
  return Math.PI - heading;
}

export interface TileRange {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  count: number;
}

export function continentBoundsToTileRange(
  bounds: readonly [ContinentPoint, ContinentPoint],
  zoom: number,
  maxZoom = TYRIA_MAX_ZOOM,
): TileRange {
  if (!Number.isInteger(zoom) || zoom < 0 || zoom > maxZoom) {
    throw new RangeError(`Zoom must be an integer from 0 to ${maxZoom}`);
  }

  const continentUnitsPerTile = 256 * 2 ** (maxZoom - zoom);
  const minX = Math.floor(bounds[0][0] / continentUnitsPerTile);
  const maxX = Math.ceil(bounds[1][0] / continentUnitsPerTile) - 1;
  const minY = Math.floor(bounds[0][1] / continentUnitsPerTile);
  const maxY = Math.ceil(bounds[1][1] / continentUnitsPerTile) - 1;

  return {
    minX,
    maxX,
    minY,
    maxY,
    count: (maxX - minX + 1) * (maxY - minY + 1),
  };
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
