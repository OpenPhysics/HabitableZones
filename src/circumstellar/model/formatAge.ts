import { toFixed } from "scenerystack/dot";
/**
 * formatAge.ts
 *
 * Formats a stellar age in years for display (My / Gy labels). Mirrors
 * SHZTimeline.as:136-156.
 */
export function formatAgeYears(ageYears: number): string {
  const absAge = Math.abs(ageYears);
  if (absAge >= 1e9) {
    return `${toFixed(ageYears / 1e9, 1)} Gy`;
  }
  if (absAge >= 1e6) {
    return `${toFixed(ageYears / 1e6, 1)} My`;
  }
  return `${toFixed(ageYears, 0)} y`;
}
