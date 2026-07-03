/**
 * planetEvolution.ts
 *
 * Orbital-distance scaling, tidal-locking time, and stellar-engulfment time
 * for a planet orbiting an evolving star. Formulae from MainTimeline.as:745-799.
 */
import { Range } from "scenerystack/dot";
import {
  AU_PER_SOLAR_RADIUS,
  KM_PER_AU,
  PLANET_DISTANCE_RANGE_AU,
  SOLAR_RADIUS_KM,
} from "../../HabitableZonesConstants.js";
import { sampleStar } from "./StarEvolution.js";
import type { StarRecord } from "./shzStars.js";

/** Minimum Roche-limit helper distance, AU (MainTimeline.as minPlanetDistance). */
const MIN_ROCHE_HELPER_AU = 1.5;

const SOLAR_RADIUS_M = SOLAR_RADIUS_KM * 1000;
const SOLAR_MASS_KG = 1.99e30;
const EARTH_MASS_KG = 6.0e24;
const EARTH_RADIUS_M = 6_370_000;
const G_NEWTON = 6.67e-11;
const AU_METERS = KM_PER_AU * 1000;
const SECONDS_PER_YEAR = 60 * 60 * 24 * 365.25;

/**
 * Effective orbital distance as the star loses mass: d_eff = d₀ · (M₀ / M(t)).
 * Source: MainTimeline.as completeDataTable2 (_loc4_ / mass).
 */
export function effectivePlanetDistanceAU(
  initialDistanceAU: number,
  catalogMassSolar: number,
  currentMassSolar: number,
): number {
  if (currentMassSolar === 0) {
    return initialDistanceAU;
  }
  return (initialDistanceAU * catalogMassSolar) / currentMassSolar;
}

/** Back-compute the zero-age distance from a displayed distance at the current mass. */
export function initialPlanetDistanceAU(
  effectiveDistanceAU: number,
  catalogMassSolar: number,
  currentMassSolar: number,
): number {
  if (catalogMassSolar === 0) {
    return effectiveDistanceAU;
  }
  return (effectiveDistanceAU * currentMassSolar) / catalogMassSolar;
}

/**
 * Allowed range for the mass-scaled (display) orbital distance at the current
 * epoch. Flash scales initDistanceSlider limits by M₀/M(t) (MainTimeline.as
 * update/setPlanetDragLimits).
 */
export function effectivePlanetDistanceRangeAU(catalogMassSolar: number, currentMassSolar: number): Range {
  if (currentMassSolar === 0) {
    return PLANET_DISTANCE_RANGE_AU;
  }
  const massRatio = catalogMassSolar / currentMassSolar;
  return new Range(PLANET_DISTANCE_RANGE_AU.min * massRatio, PLANET_DISTANCE_RANGE_AU.max * massRatio);
}

/** Roche / tidal-disruption threshold in AU at a given evolutionary epoch. */
export function rocheLimitAU(starMassSolar: number, logRadius: number): number {
  const starRadiusM = SOLAR_RADIUS_M * 10 ** logRadius;
  const densityKgPerM3 = (SOLAR_MASS_KG * starMassSolar) / ((4 / 3) * Math.PI * starRadiusM ** 3);
  let rocheHelperAu = 2.44 * (densityKgPerM3 / 5500) ** (1 / 3);
  rocheHelperAu = Math.max(rocheHelperAu, MIN_ROCHE_HELPER_AU);
  return (starRadiusM / AU_METERS) * rocheHelperAu;
}

/**
 * First time (years) the planet is engulfed / destroyed as the star expands.
 * Returns Infinity if the planet survives the entire track.
 */
export function computePlanetDestructionTimeYears(star: StarRecord, initialDistanceAU: number): number {
  const distanceMassProduct = initialDistanceAU * star.mass;

  for (const point of star.dataTable) {
    const effectiveDistance = distanceMassProduct / point.mass;
    const limit = rocheLimitAU(point.mass, point.logRadius);
    if (effectiveDistance <= limit) {
      return point.time;
    }
  }
  return Number.POSITIVE_INFINITY;
}

/**
 * Tidal-locking time in years from initial conditions (MainTimeline.as:757-766).
 * Returns Infinity when locking would not occur on human-relevant timescales.
 */
export function computeTidalLockTimeYears(starMassSolar: number, initialDistanceAU: number): number {
  const earthRotationRadPerSec = (2 * Math.PI) / (24 * 60 * 60);
  const massTerm = 2e30 * 2e30 * starMassSolar * starMassSolar;
  const distanceTerm = (AU_METERS * initialDistanceAU) ** 6;
  const lockTimeSeconds =
    (100 * earthRotationRadPerSec * EARTH_MASS_KG * distanceTerm) / (G_NEWTON * massTerm * EARTH_RADIUS_M ** 3);
  const lockTimeMegayears = lockTimeSeconds / (SECONDS_PER_YEAR * 1e6);
  return lockTimeMegayears * 1e6;
}

/** Whether tidal-lock marker would be too small to render (Flash threshold). */
export function isTidalLockMarkerVisible(
  lockTimeYears: number,
  starTimespanYears: number,
  timelineWidthPx: number,
): boolean {
  if (!Number.isFinite(lockTimeYears)) {
    return false;
  }
  return (lockTimeYears * timelineWidthPx) / starTimespanYears >= 4;
}

/** Star radius in AU at a given age. */
export function starRadiusAU(star: StarRecord, ageYears: number): number {
  const point = sampleStar(star, ageYears);
  return 10 ** point.logRadius * AU_PER_SOLAR_RADIUS;
}
