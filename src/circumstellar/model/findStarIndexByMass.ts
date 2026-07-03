/**
 * findStarIndexByMass.ts
 *
 * Maps a nominal stellar mass (M☉) to the nearest entry in SHZ_STARS.
 */
import { SHZ_STARS } from "./shzStars.js";

export function findStarIndexByMass(massSolar: number): number {
  let bestIndex = 0;
  let bestDelta = Number.POSITIVE_INFINITY;
  for (let index = 0; index < SHZ_STARS.length; index++) {
    const star = SHZ_STARS[index];
    if (star === undefined) {
      continue;
    }
    const delta = Math.abs(star.mass - massSolar);
    if (delta < bestDelta) {
      bestDelta = delta;
      bestIndex = index;
    }
  }
  return bestIndex;
}
