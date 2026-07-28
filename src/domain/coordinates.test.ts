import { describe, expect, it } from "vitest";
import { continentToLeaflet, eventToContinent, mumbleMetersToMapInches } from "./coordinates";

describe("coordinate transforms", () => {
  it("uses Leaflet's north-up Simple CRS convention", () => {
    expect(continentToLeaflet([100, 200])).toEqual([-200, 100]);
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
