/**
 * StarEvolution.test.ts
 *
 * Exercises sampleStar() and the solar-unit getters in
 * src/circumstellar/model/StarEvolution.ts against the real star catalog.
 */

import { describe, expect, it } from "vitest";
import { luminosity, radiusSolar, sampleStar, temperatureK } from "../src/circumstellar/model/StarEvolution.js";
import type { StarRecord } from "../src/circumstellar/model/shzStars.js";
import { SHZ_STARS } from "../src/circumstellar/model/shzStars.js";

function findSunStar(): StarRecord {
  const star = SHZ_STARS.find((s) => s.mass === 1);
  if (star === undefined) {
    throw new Error("test fixture: expected a 1.0 solar-mass star in the catalog");
  }
  return star;
}

describe("StarEvolution", () => {
  it("has a 1.0 solar-mass star in the catalog", () => {
    expect(findSunStar()).toBeDefined();
  });

  it("sampleStar at time=0 returns the catalog's zero-age main-sequence point", () => {
    const sunStar = findSunStar();
    const zeroAgePoint = sunStar.dataTable[0];
    if (zeroAgePoint === undefined) {
      throw new Error("test fixture: expected a non-empty dataTable");
    }

    const point = sampleStar(sunStar, 0);
    expect(point).toEqual(zeroAgePoint);
    // Zero-age main-sequence Sun is dimmer and cooler than the present-day Sun.
    expect(luminosity(point)).toBeCloseTo(10 ** zeroAgePoint.logLum, 6);
    expect(temperatureK(point)).toBeCloseTo(10 ** zeroAgePoint.logTemp, 6);
    expect(radiusSolar(point)).toBeCloseTo(10 ** zeroAgePoint.logRadius, 6);
  });

  it("clamps ages below the first entry and above the last entry", () => {
    const sunStar = findSunStar();
    const firstPoint = sunStar.dataTable[0];
    const lastPoint = sunStar.dataTable[sunStar.dataTable.length - 1];
    if (firstPoint === undefined || lastPoint === undefined) {
      throw new Error("test fixture: expected a non-empty dataTable");
    }

    expect(sampleStar(sunStar, -1000)).toEqual(firstPoint);
    expect(sampleStar(sunStar, sunStar.timespan + 1e9)).toEqual(lastPoint);
  });

  it("interpolates linearly between two bracketing entries", () => {
    const sunStar = findSunStar();
    const a = sunStar.dataTable[10];
    const b = sunStar.dataTable[11];
    if (a === undefined || b === undefined) {
      throw new Error("test fixture: expected at least 12 dataTable entries");
    }
    const midTime = (a.time + b.time) / 2;

    const mid = sampleStar(sunStar, midTime);
    expect(mid.logLum).toBeCloseTo((a.logLum + b.logLum) / 2, 6);
    expect(mid.logTemp).toBeCloseTo((a.logTemp + b.logTemp) / 2, 6);
    expect(mid.logRadius).toBeCloseTo((a.logRadius + b.logRadius) / 2, 6);
  });

  it("luminosity increases monotonically as a main-sequence star approaches its main-sequence exit", () => {
    const sunStar = findSunStar();
    const endOfMainSequenceEpoch = sunStar.epochsList[1];
    if (endOfMainSequenceEpoch === undefined) {
      throw new Error("test fixture: expected at least 2 epochsList entries");
    }

    // Sample a handful of increasing ages within the main-sequence lifetime
    // (before the first non-main-sequence epoch) and confirm luminosity rises.
    const endOfMainSequenceTime = endOfMainSequenceEpoch.time;
    const ages = [0, endOfMainSequenceTime * 0.25, endOfMainSequenceTime * 0.5, endOfMainSequenceTime * 0.75];
    const luminosities = ages.map((age) => luminosity(sampleStar(sunStar, age)));

    for (let i = 1; i < luminosities.length; i++) {
      const current = luminosities[i];
      const previous = luminosities[i - 1];
      if (current === undefined || previous === undefined) {
        throw new Error("test fixture: expected luminosity samples at each age");
      }
      expect(current).toBeGreaterThan(previous);
    }
  });

  it("every star in the catalog has a non-empty, time-ordered dataTable", () => {
    for (const star of SHZ_STARS) {
      expect(star.dataTable.length).toBeGreaterThan(0);
      for (let i = 1; i < star.dataTable.length; i++) {
        const previous = star.dataTable[i - 1];
        const current = star.dataTable[i];
        if (previous === undefined || current === undefined) {
          throw new Error("unreachable: index within bounds");
        }
        expect(current.time).toBeGreaterThanOrEqual(previous.time);
      }
    }
  });
});
