/**
 * HabitableZonesColors.ts
 *
 * Defines all dynamic colors for the simulation using ProfileColorProperty.
 *
 * Each color has two profiles:
 *   - "default"   — used in standard (dark) mode
 *   - "projector" — used when the user enables Projector Mode in Preferences
 *
 * SceneryStack switches profiles automatically; no manual toggling is needed.
 *
 * ── Usage ─────────────────────────────────────────────────────────────────────
 * Import HabitableZonesColors and pass properties directly to Node's fillProperty or
 * strokeProperty options:
 *
 *   import HabitableZonesColors from "../../HabitableZonesColors.js";
 *
 *   new Rectangle( 0, 0, 100, 50, {
 *     fillProperty: HabitableZonesColors.backgroundColorProperty,
 *   });
 *
 * ── How to add a color ────────────────────────────────────────────────────────
 * Add a new ProfileColorProperty entry to the HabitableZonesColors object below.
 * Always provide both "default" and "projector" values.
 */
import { ProfileColorProperty } from "scenerystack/scenery";
import HabitableZonesNamespace from "./HabitableZonesNamespace.js";

const HabitableZonesColors = {
  /**
   * Background color for the simulation screen.
   * Deep navy in default mode; white in projector mode.
   */
  backgroundColorProperty: new ProfileColorProperty(HabitableZonesNamespace, "background", {
    default: "#1a1a2e",
    projector: "#ffffff",
  }),

  /**
   * Primary accent color for highlights, selected items, and key UI elements.
   * Sky blue in default mode; dark navy in projector mode.
   */
  accentColorProperty: new ProfileColorProperty(HabitableZonesNamespace, "accent", {
    default: "#4fc3f7",
    projector: "#1a1a2e",
  }),

  /**
   * Background fill for control panels and dialogs.
   * Deep blue in default mode; light gray in projector mode.
   */
  panelBackgroundColorProperty: new ProfileColorProperty(HabitableZonesNamespace, "panelBackground", {
    default: "#16213e",
    projector: "#f5f5f5",
  }),

  /**
   * Border/stroke color for control panels and dialogs.
   * Teal-navy in default mode; medium gray in projector mode.
   */
  panelBorderColorProperty: new ProfileColorProperty(HabitableZonesNamespace, "panelBorder", {
    default: "#0f3460",
    projector: "#999999",
  }),

  /**
   * Text color for labels, readouts, and general UI text.
   * Near-white in default mode; near-black in projector mode.
   */
  textColorProperty: new ProfileColorProperty(HabitableZonesNamespace, "text", {
    default: "#e0e0e0",
    projector: "#1a1a1a",
  }),

  // ── Circumstellar screen ───────────────────────────────────────────────────

  /**
   * The star's rendered color.
   * Warm yellow default; deep amber in projector mode for contrast on white.
   */
  starColorProperty: new ProfileColorProperty(HabitableZonesNamespace, "star", {
    default: "#ffe066",
    projector: "#c87000",
  }),

  /**
   * Semi-transparent fill for the circumstellar habitable zone annulus.
   * Translucent green default; slightly darker green in projector mode.
   */
  habitableZoneFillColorProperty: new ProfileColorProperty(HabitableZonesNamespace, "habitableZoneFill", {
    default: "rgba(76, 175, 80, 0.25)",
    projector: "rgba(27, 94, 32, 0.20)",
  }),

  /**
   * Stroke color for the inner and outer edges of the habitable zone ring.
   * Bright green default; dark green in projector mode.
   */
  habitableZoneStrokeColorProperty: new ProfileColorProperty(HabitableZonesNamespace, "habitableZoneStroke", {
    default: "#66bb6a",
    projector: "#1b5e20",
  }),

  /**
   * Fill color for the orbiting planet.
   * Light sky-blue default; dark ocean-blue in projector mode.
   */
  planetColorProperty: new ProfileColorProperty(HabitableZonesNamespace, "planet", {
    default: "#64b5f6",
    projector: "#0d47a1",
  }),

  /**
   * Stroke color for the planet's orbital path ellipse.
   * Dim white default; medium gray in projector mode.
   */
  orbitStrokeColorProperty: new ProfileColorProperty(HabitableZonesNamespace, "orbitStroke", {
    default: "rgba(255, 255, 255, 0.35)",
    projector: "rgba(0, 0, 0, 0.25)",
  }),

  // ── Galactic screen ────────────────────────────────────────────────────────

  /**
   * Background fill for the Milky Way disk region.
   * Faint purple-blue default; light lavender in projector mode.
   */
  galacticDiskColorProperty: new ProfileColorProperty(HabitableZonesNamespace, "galacticDisk", {
    default: "rgba(63, 81, 181, 0.20)",
    projector: "rgba(63, 81, 181, 0.12)",
  }),

  /**
   * Semi-transparent fill for the galactic habitable zone band.
   * Translucent teal-green default; slightly darker in projector mode.
   */
  galacticHabitableZoneFillColorProperty: new ProfileColorProperty(
    HabitableZonesNamespace,
    "galacticHabitableZoneFill",
    {
      default: "rgba(0, 188, 212, 0.25)",
      projector: "rgba(0, 96, 100, 0.20)",
    },
  ),

  /**
   * Stroke color for the inner and outer edges of the galactic habitable zone.
   * Cyan default; dark teal in projector mode.
   */
  galacticHabitableZoneStrokeColorProperty: new ProfileColorProperty(
    HabitableZonesNamespace,
    "galacticHabitableZoneStroke",
    {
      default: "#00bcd4",
      projector: "#006064",
    },
  ),

  /**
   * Soft glow drawn behind the star disc.
   * Warm gold default; muted amber in projector mode.
   */
  starGlowColorProperty: new ProfileColorProperty(HabitableZonesNamespace, "starGlow", {
    default: "rgba(255, 224, 102, 0.35)",
    projector: "rgba(200, 112, 0, 0.25)",
  }),

  /**
   * Planet color when it is too close to its star (inside the HZ inner edge).
   * Bright red default; deep red in projector mode.
   */
  tooHotColorProperty: new ProfileColorProperty(HabitableZonesNamespace, "tooHot", {
    default: "#ef5350",
    projector: "#b71c1c",
  }),

  /**
   * Planet color when it sits within the habitable zone.
   * Bright green default; deep green in projector mode.
   */
  temperateColorProperty: new ProfileColorProperty(HabitableZonesNamespace, "temperate", {
    default: "#66bb6a",
    projector: "#1b5e20",
  }),

  /**
   * Planet color when it is too far from its star (outside the HZ outer edge).
   * Light blue default; deep blue in projector mode.
   */
  tooColdColorProperty: new ProfileColorProperty(HabitableZonesNamespace, "tooCold", {
    default: "#42a5f5",
    projector: "#0d47a1",
  }),

  /**
   * Curve color for the galactic metallicity-vs-radius plot.
   * Amber default; dark amber in projector mode.
   */
  metallicityCurveColorProperty: new ProfileColorProperty(HabitableZonesNamespace, "metallicityCurve", {
    default: "#ffca28",
    projector: "#c87000",
  }),

  /**
   * Curve color for the galactic catastrophic-risk-vs-radius plot.
   * Coral red default; deep red in projector mode.
   */
  riskCurveColorProperty: new ProfileColorProperty(HabitableZonesNamespace, "riskCurve", {
    default: "#ff7043",
    projector: "#bf360c",
  }),

  /**
   * Fill for the galactic habitable zone band shared by the disc + plots.
   * Translucent teal default; slightly darker in projector mode.
   */
  ghzBandColorProperty: new ProfileColorProperty(HabitableZonesNamespace, "ghzBand", {
    default: "rgba(0, 188, 212, 0.20)",
    projector: "rgba(0, 96, 100, 0.15)",
  }),

  /**
   * Gridline / axis color shared by bamboo-based charts.
   * Dim white default; medium gray in projector mode.
   */
  gridColorProperty: new ProfileColorProperty(HabitableZonesNamespace, "grid", {
    default: "rgba(255, 255, 255, 0.25)",
    projector: "rgba(0, 0, 0, 0.25)",
  }),
};

export default HabitableZonesColors;
