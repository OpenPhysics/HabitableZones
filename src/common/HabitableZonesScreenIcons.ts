/**
 * HabitableZonesScreenIcons.ts
 *
 * Programmatic home-screen / navigation-bar icons for both Habitable Zones
 * screens. Drawn on the standard PhET 548 × 373 canvas using HabitableZonesColors.
 *
 *   Circumstellar — star with green HZ annulus and an orbiting planet.
 *   Galactic      — Milky Way disk with a teal galactic habitable-zone band.
 */
import { Shape } from "scenerystack/kite";
import { Circle, Node, Path, Rectangle } from "scenerystack/scenery";
import { ScreenIcon } from "scenerystack/sim";
import HabitableZonesColors from "../HabitableZonesColors.js";

const W = 548;
const H = 373;
const CX = W / 2;
const CY = H / 2;

function background(): Rectangle {
  return new Rectangle(0, 0, W, H, { fill: HabitableZonesColors.backgroundColorProperty });
}

function iconFrom(content: Node): ScreenIcon {
  return new ScreenIcon(content, {
    maxIconWidthProportion: 1,
    maxIconHeightProportion: 1,
    fill: HabitableZonesColors.backgroundColorProperty,
  });
}

export function createCircumstellarIcon(): ScreenIcon {
  const glow = new Circle(70, {
    fill: HabitableZonesColors.starGlowColorProperty,
    centerX: CX,
    centerY: CY,
  });
  // Ring as circle difference — kite asserts on anticlockwise arc(0, 2π).
  const hzShape = Shape.circle(CX, CY, 150).shapeDifference(Shape.circle(CX, CY, 95));
  const hz = new Path(hzShape, {
    fill: HabitableZonesColors.habitableZoneFillColorProperty,
    stroke: HabitableZonesColors.habitableZoneStrokeColorProperty,
    lineWidth: 3,
  });
  const orbit = new Path(Shape.ellipse(CX, CY, 122, 122, 0), {
    stroke: HabitableZonesColors.orbitStrokeColorProperty,
    lineWidth: 3,
  });
  const star = new Circle(38, {
    fill: HabitableZonesColors.starColorProperty,
    centerX: CX,
    centerY: CY,
  });
  const planet = new Circle(16, {
    fill: HabitableZonesColors.temperateColorProperty,
    centerX: CX + 122,
    centerY: CY,
  });

  return iconFrom(new Node({ children: [background(), glow, hz, orbit, star, planet] }));
}

export function createGalacticIcon(): ScreenIcon {
  const disk = new Path(Shape.ellipse(CX, CY, 220, 90, 0), {
    fill: HabitableZonesColors.galacticDiskColorProperty,
    stroke: HabitableZonesColors.panelBorderColorProperty,
    lineWidth: 2,
  });
  // Galactic habitable zone as concentric elliptical rings (fill + edges).
  const ghzFill = new Path(Shape.ellipse(CX, CY, 160, 62, 0), {
    fill: HabitableZonesColors.galacticHabitableZoneFillColorProperty,
  });
  const ghzHole = new Path(Shape.ellipse(CX, CY, 95, 36, 0), {
    fill: HabitableZonesColors.galacticDiskColorProperty,
  });
  const ghzOuter = new Path(Shape.ellipse(CX, CY, 160, 62, 0), {
    stroke: HabitableZonesColors.galacticHabitableZoneStrokeColorProperty,
    lineWidth: 3,
  });
  const ghzInner = new Path(Shape.ellipse(CX, CY, 95, 36, 0), {
    stroke: HabitableZonesColors.galacticHabitableZoneStrokeColorProperty,
    lineWidth: 3,
  });
  const bulge = new Circle(28, {
    fill: HabitableZonesColors.starColorProperty,
    centerX: CX,
    centerY: CY,
  });
  const sun = new Circle(10, {
    fill: HabitableZonesColors.accentColorProperty,
    centerX: CX + 120,
    centerY: CY - 8,
  });

  return iconFrom(new Node({ children: [background(), disk, ghzFill, ghzHole, ghzOuter, ghzInner, bulge, sun] }));
}
