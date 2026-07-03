/**
 * realSystems.ts
 *
 * Known exoplanet system presets from MainTimeline.as:507-595. Selecting a
 * preset locks the star mass and offers discrete planet pericenter distances.
 */
export type RealSystemPlanet = {
  readonly label: string;
  readonly semiMajorAxisAU: number;
  readonly eccentricity: number;
};

export type RealSystemRecord = {
  readonly id: string;
  readonly name: string;
  /** Nominal stellar mass, solar units (M☉). */
  readonly massSolar: number;
  readonly planets: readonly RealSystemPlanet[];
};

/** Pericenter distance a(1 − e), AU. */
export const planetPericenterAU = (planet: RealSystemPlanet): number =>
  planet.semiMajorAxisAU * (1 - planet.eccentricity);

export const NONE_REAL_SYSTEM_ID = "none";

export const REAL_SYSTEMS: readonly RealSystemRecord[] = [
  {
    id: "gliese581",
    name: "Gliese 581",
    massSolar: 0.31,
    planets: [
      { label: "e", semiMajorAxisAU: 0.03, eccentricity: 0 },
      { label: "b", semiMajorAxisAU: 0.041, eccentricity: 0 },
      { label: "c", semiMajorAxisAU: 0.073, eccentricity: 0.16 },
      { label: "d", semiMajorAxisAU: 0.22, eccentricity: 0.2 },
    ],
  },
  {
    id: "55cancriA",
    name: "55 Cancri A",
    massSolar: 0.95,
    planets: [
      { label: "e", semiMajorAxisAU: 0.038, eccentricity: 0.2637 },
      { label: "b", semiMajorAxisAU: 0.115, eccentricity: 0.0159 },
      { label: "c", semiMajorAxisAU: 0.241, eccentricity: 0.053 },
      { label: "f", semiMajorAxisAU: 0.785, eccentricity: 0.0002 },
      { label: "d", semiMajorAxisAU: 5.901, eccentricity: 0.0633 },
    ],
  },
  {
    id: "51pegasi",
    name: "51 Pegasi",
    massSolar: 1.06,
    planets: [{ label: "b", semiMajorAxisAU: 0.052, eccentricity: 0 }],
  },
  {
    id: "hd40307",
    name: "HD 40307",
    massSolar: 0.75,
    planets: [
      { label: "c", semiMajorAxisAU: 0.081, eccentricity: 0 },
      { label: "d", semiMajorAxisAU: 0.134, eccentricity: 0 },
      { label: "b", semiMajorAxisAU: 0.47, eccentricity: 0 },
    ],
  },
  {
    id: "hd189733",
    name: "HD 189733",
    massSolar: 0.8,
    planets: [{ label: "b", semiMajorAxisAU: 0.03099, eccentricity: 0 }],
  },
  {
    id: "hd93083",
    name: "HD 93083",
    massSolar: 0.7,
    planets: [{ label: "b", semiMajorAxisAU: 0.477, eccentricity: 0.14 }],
  },
];

export function findRealSystem(id: string): RealSystemRecord | null {
  if (id === NONE_REAL_SYSTEM_ID) {
    return null;
  }
  return REAL_SYSTEMS.find((system) => system.id === id) ?? null;
}
