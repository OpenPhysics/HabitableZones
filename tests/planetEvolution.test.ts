/**
 * planetEvolution.test.ts
 */
import { describe, expect, it } from "vitest";
import {
  computePlanetDestructionTimeYears,
  computeTidalLockTimeYears,
  effectivePlanetDistanceAU,
  effectivePlanetDistanceRangeAU,
} from "../src/circumstellar/model/planetEvolution.js";
import { SHZ_STARS } from "../src/circumstellar/model/shzStars.js";

describe("planetEvolution", () => {
  it("scales effective distance outward as stellar mass decreases", () => {
    expect(effectivePlanetDistanceAU(1, 1, 0.5)).toBeCloseTo(2, 6);
  });

  it("scales the display-distance range with stellar mass loss", () => {
    const range = effectivePlanetDistanceRangeAU(1, 0.5);
    expect(range.min).toBeCloseTo(0.02, 6);
    expect(range.max).toBeCloseTo(1000, 6);
  });

  it("computes a finite tidal-lock time for a close-in hot Jupiter", () => {
    const lockTime = computeTidalLockTimeYears(1.06, 0.052);
    expect(lockTime).toBeGreaterThan(0);
    expect(Number.isFinite(lockTime)).toBe(true);
  });

  it("finds destruction time when a planet starts close to a low-mass star", () => {
    const star = SHZ_STARS.find((entry) => entry.mass === 0.3);
    if (star === undefined) {
      throw new Error("expected 0.3 solar-mass star");
    }
    const destroyTime = computePlanetDestructionTimeYears(star, 0.03);
    expect(destroyTime).toBeLessThan(star.timespan);
  });
});
