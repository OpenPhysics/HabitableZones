/**
 * CircumstellarModel.test.ts
 *
 * Guards the planet-distance round trip: the displayed (mass-scaled) range max
 * inverts to a zero-age distance that floating-point can push just above 500 AU.
 */
import { describe, expect, it } from "vitest";
import { CircumstellarModel } from "../../../src/circumstellar/model/CircumstellarModel.js";
import { PLANET_DISTANCE_RANGE_AU } from "../../../src/HabitableZonesConstants.js";

describe("CircumstellarModel planet distance", () => {
  it("clamps a round-trip of the display-range max into the zero-age range", () => {
    const model = new CircumstellarModel();
    // 0.3 M☉ track loses mass, so the display max exceeds 500 AU at late times.
    model.selectedStarIndexProperty.value = 0;
    model.ageProperty.value = model.starTimespanProperty.value;

    const displayRange = model.getEffectivePlanetDistanceRange();
    expect(() => model.setEffectivePlanetDistanceAU(displayRange.max)).not.toThrow();
    expect(() => model.setEffectivePlanetDistanceAU(displayRange.max + 1)).not.toThrow();
    expect(model.planetDistanceProperty.value).toBeLessThanOrEqual(PLANET_DISTANCE_RANGE_AU.max);
    expect(model.planetDistanceProperty.value).toBeGreaterThanOrEqual(PLANET_DISTANCE_RANGE_AU.min);
  });

  it("scrubs age at max zero-age distance without axon reentry", () => {
    const model = new CircumstellarModel();
    model.selectedStarIndexProperty.value = 0;
    model.planetDistanceProperty.value = PLANET_DISTANCE_RANGE_AU.max;
    const timespan = model.starTimespanProperty.value;
    const steps = 40;
    expect(() => {
      for (let i = 0; i <= steps; i++) {
        model.ageProperty.value = (timespan * i) / steps;
        model.displayPlanetDistanceProperty.value = model.displayPlanetDistanceProperty.range.max;
      }
    }).not.toThrow();
    expect(model.planetDistanceProperty.value).toBeLessThanOrEqual(PLANET_DISTANCE_RANGE_AU.max);
    expect(model.displayPlanetDistanceProperty.range.contains(model.displayPlanetDistanceProperty.value)).toBe(true);
  });
});
