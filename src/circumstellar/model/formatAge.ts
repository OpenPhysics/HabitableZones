/**
 * formatAge.ts
 *
 * Formats a stellar age in years for display (My / Gy labels). Mirrors
 * SHZTimeline.as:136-156.
 */
export function formatAgeYears(ageYears: number): string {
  const absAge = Math.abs(ageYears);
  if (absAge >= 1e9) {
    return `${(ageYears / 1e9).toFixed(1)} Gy`;
  }
  if (absAge >= 1e6) {
    return `${(ageYears / 1e6).toFixed(1)} My`;
  }
  return `${ageYears.toFixed(0)} y`;
}
