import { describe, expect, it } from "vitest";
import {
  continentBoundsToTileRange,
  eventToContinent,
  mumbleHeadingToScreenRadians,
  mumbleMetersToMapInches,
} from "./coordinates";
import { QUEENSDALE } from "../data/queensdale";

describe("coordinate transforms", () => {
  it("flips world heading and accounts for the marker artwork's opposite zero", () => {
    expect(mumbleHeadingToScreenRadians(0)).toBe(Math.PI);
    expect(mumbleHeadingToScreenRadians(Math.PI / 2)).toBe(Math.PI / 2);
    expect(mumbleHeadingToScreenRadians(-Math.PI / 2)).toBe(3 * Math.PI / 2);
  });

  it("limits Queensdale to a small, predictable tile range", () => {
    expect(continentBoundsToTileRange(QUEENSDALE.bounds, 4)).toEqual({
      minX: 20,
      maxX: 22,
      minY: 13,
      maxY: 14,
      count: 6,
    });
    expect(continentBoundsToTileRange(QUEENSDALE.bounds, 7)).toEqual({
      minX: 166,
      maxX: 180,
      minY: 109,
      maxY: 118,
      count: 150,
    });
  });

  it("rejects zoom levels outside the tile service contract", () => {
    expect(() => continentBoundsToTileRange(QUEENSDALE.bounds, 8)).toThrow(RangeError);
  });

  it("converts Mumble meters to the game's event-coordinate inches", () => {
    expect(mumbleMetersToMapInches([1, 2, 3])).toEqual([39.3701, 118.1103]);
  });

  it("maps event coordinates into a continent rectangle and flips y", () => {
    expect(
      eventToContinent(
        [25, 75],
        [[0, 0], [100, 100]],
        [[1000, 2000], [1200, 2400]],
      ),
    ).toEqual([1050, 2100]);
  });
});
