/**
 * SHZTimelineNode.ts
 *
 * Full-width "Timeline and Simulation Controls" region matching the original
 * NAAP / React layout: a time-since-formation readout, an animation-speed
 * slider and play/step controls, a planet-temperature curve bounded by
 * "Too hot" (top) and "Too cold" (bottom) axes, a habitability gradient strip,
 * a My/Gy time axis, epoch markers, and a draggable age cursor.
 *
 * Model ref: SHZTimeline.as, SHZTimelineCursor.as, SHZHabitabilityPlot.as,
 * timeline.jsx.
 */
import { DerivedProperty } from "scenerystack/axon";
import { Dimension2, Range } from "scenerystack/dot";
import { Shape } from "scenerystack/kite";
import { DragListener, HBox, Line, Node, Path, Rectangle, Text, VBox } from "scenerystack/scenery";
import { PhetFont, TimeControlNode } from "scenerystack/scenery-phet";
import { HSlider } from "scenerystack/sun";
import HabitableZonesColors from "../../HabitableZonesColors.js";
import { HZ_CONSERVATIVE, HZ_OPTIMISTIC, SHZ_TIMELINE_WIDTH_PX } from "../../HabitableZonesConstants.js";
import { StringManager } from "../../i18n/StringManager.js";
import { type CircumstellarModel, classifyPlanetDistance, type PlanetStatus } from "../model/CircumstellarModel.js";
import { formatAgeYears } from "../model/formatAge.js";
import { effectivePlanetDistanceAU } from "../model/planetEvolution.js";
import { luminosity, sampleStar } from "../model/StarEvolution.js";
import { SHZ_STARS, STAR_EPOCH_LABELS } from "../model/shzStars.js";

const TIMELINE_WIDTH = SHZ_TIMELINE_WIDTH_PX;
const HEADER_HEIGHT = 34;
const TEMP_CHART_TOP = HEADER_HEIGHT + 8;
const TEMP_CHART_HEIGHT = 60;
const STRIP_TOP = TEMP_CHART_TOP + TEMP_CHART_HEIGHT + 8;
const STRIP_HEIGHT = 14;
const AXIS_LABEL_Y = STRIP_TOP + STRIP_HEIGHT + 4;

const TITLE_FONT = new PhetFont({ size: 14, weight: "bold" });
const READOUT_FONT = new PhetFont(12);
const LABEL_FONT = new PhetFont(12);
const TICK_FONT = new PhetFont(9);

const HZ_COEFFICIENTS = {
  optimistic: HZ_OPTIMISTIC,
  conservative: HZ_CONSERVATIVE,
} as const;

const STATUS_COLORS: Record<PlanetStatus, typeof HabitableZonesColors.tooHotColorProperty> = {
  tooHot: HabitableZonesColors.tooHotColorProperty,
  temperate: HabitableZonesColors.temperateColorProperty,
  tooCold: HabitableZonesColors.tooColdColorProperty,
};

/** Planet equilibrium temperature (°C). Source: timeline.jsx getPlanetTemp. */
function planetTempC(logRadius: number, logTemp: number, planetDistanceAU: number): number {
  const rStarM = 10 ** logRadius * 6.96e8;
  const tStarK = 10 ** logTemp;
  const dM = planetDistanceAU * 1.495978707e11;
  return ((rStarM ** 2 * tStarK ** 4) / (4 * dM ** 2)) ** 0.25 - 273;
}

export class SHZTimelineNode extends Node {
  public readonly timelineCursor: Node;

  public constructor(model: CircumstellarModel) {
    super();

    const strings = StringManager.getInstance().getCircumstellarStrings();
    const a11y = StringManager.getInstance().getCircumstellarA11yStrings();

    const timeToX = (timeYears: number, timespan: number): number =>
      timespan === 0 ? 0 : (timeYears / timespan) * TIMELINE_WIDTH;
    const xToTime = (x: number, timespan: number): number => (x / TIMELINE_WIDTH) * timespan;

    // ── Header: title, readout, animation-speed slider, play/step ──────────────
    const title = new Text(strings.timelineControlsTitleStringProperty, {
      font: TITLE_FONT,
      fill: HabitableZonesColors.textColorProperty,
      left: 0,
      top: 0,
    });

    const readoutProperty = new DerivedProperty(
      [strings.timeSinceFormationPatternStringProperty, model.ageProperty],
      (pattern, age) => pattern.replace("{{value}}", formatAgeYears(age)),
    );
    const readout = new Text(readoutProperty, {
      font: READOUT_FONT,
      fill: HabitableZonesColors.textColorProperty,
    });

    const rateSlider = new HSlider(model.animationRateProperty, new Range(0.1, 2), {
      trackSize: new Dimension2(90, 3),
    });
    const rateControl = new HBox({
      spacing: 6,
      align: "center",
      children: [
        new Text(strings.rateStringProperty, { font: LABEL_FONT, fill: HabitableZonesColors.textColorProperty }),
        rateSlider,
      ],
    });

    const timeControl = new TimeControlNode(model.timer.isPlayingProperty, {
      playPauseStepButtonOptions: {
        stepForwardButtonOptions: {
          listener: () => model.stepTimeline(),
        },
      },
    });

    const header = new HBox({
      spacing: 24,
      align: "center",
      children: [new VBox({ align: "left", spacing: 3, children: [title, readout] }), rateControl, timeControl],
    });
    header.left = 0;
    header.top = 0;

    // ── Temperature curve chart (too hot / too cold) ───────────────────────────
    const tempChartRect = new Rectangle(0, TEMP_CHART_TOP, TIMELINE_WIDTH, TEMP_CHART_HEIGHT, {
      fill: HabitableZonesColors.panelBackgroundColorProperty,
    });
    const tooHotLine = new Line(0, TEMP_CHART_TOP, TIMELINE_WIDTH, TEMP_CHART_TOP, {
      stroke: HabitableZonesColors.tooHotColorProperty,
      lineWidth: 1.5,
    });
    const tooColdLine = new Line(
      0,
      TEMP_CHART_TOP + TEMP_CHART_HEIGHT,
      TIMELINE_WIDTH,
      TEMP_CHART_TOP + TEMP_CHART_HEIGHT,
      {
        stroke: HabitableZonesColors.tooColdColorProperty,
        lineWidth: 1.5,
      },
    );
    const tooHotLabel = new Text(strings.tooHotStripStringProperty, {
      font: TICK_FONT,
      fill: HabitableZonesColors.tooHotColorProperty,
      right: TIMELINE_WIDTH,
      bottom: TEMP_CHART_TOP - 1,
    });
    const tooColdLabel = new Text(strings.tooColdStripStringProperty, {
      font: TICK_FONT,
      fill: HabitableZonesColors.tooColdColorProperty,
      right: TIMELINE_WIDTH,
      top: TEMP_CHART_TOP + TEMP_CHART_HEIGHT + 1,
    });
    const tempCurve = new Path(null, {
      stroke: HabitableZonesColors.textColorProperty,
      lineWidth: 1.5,
    });
    const tempCurveClip = new Node({
      clipArea: Shape.rectangle(0, TEMP_CHART_TOP, TIMELINE_WIDTH, TEMP_CHART_HEIGHT),
      children: [tempCurve],
    });

    // ── Habitability gradient strip ────────────────────────────────────────────
    const stripBands = new Node();
    const stripClip = new Node({
      clipArea: Shape.rectangle(0, STRIP_TOP, TIMELINE_WIDTH, STRIP_HEIGHT),
      children: [stripBands],
    });

    // ── Axis, ticks, epoch markers ─────────────────────────────────────────────
    const axisTicksLayer = new Node();
    const epochTicksLayer = new Node();
    const eventMarkersLayer = new Node();

    const rebuild = (): void => {
      const star = SHZ_STARS[model.selectedStarIndexProperty.value];
      if (star === undefined) {
        return;
      }
      const timespan = star.timespan;
      const initialDistance = model.planetDistanceProperty.value;

      // Temperature curve (clamped y-domain 0..100 °C like the React port).
      const tempShape = new Shape();
      let started = false;
      for (const point of star.dataTable) {
        const tempC = planetTempC(point.logRadius, point.logTemp, initialDistance);
        const clamped = Math.max(0, Math.min(100, tempC));
        const x = timeToX(point.time, timespan);
        const y = TEMP_CHART_TOP + TEMP_CHART_HEIGHT - (clamped / 100) * TEMP_CHART_HEIGHT;
        if (!started) {
          tempShape.moveTo(x, y);
          started = true;
        } else {
          tempShape.lineTo(x, y);
        }
      }
      tempCurve.shape = tempShape;

      // Habitability bands.
      stripBands.removeAllChildren();
      const coeffs = HZ_COEFFICIENTS[model.hzModeProperty.value];
      const catalogMass = star.mass;
      const destroyTime = model.timePlanetDestroyedProperty.value;
      const table = star.dataTable;
      for (let i = 0; i < table.length - 1; i++) {
        const a = table[i];
        const b = table[i + 1];
        if (a === undefined || b === undefined) {
          continue;
        }
        if (Number.isFinite(destroyTime) && a.time >= destroyTime) {
          break;
        }
        const midTime = (a.time + b.time) / 2;
        const sample = sampleStar(star, midTime);
        const distance = effectivePlanetDistanceAU(initialDistance, catalogMass, sample.mass);
        const lum = luminosity(sample);
        const inner = Math.sqrt(lum) * coeffs.inner;
        const outer = Math.sqrt(lum) * coeffs.outer;
        const status = classifyPlanetDistance(distance, inner, outer);
        const x1 = timeToX(a.time, timespan);
        const x2 = timeToX(b.time, timespan);
        stripBands.addChild(
          new Rectangle(x1, STRIP_TOP, Math.max(0.5, x2 - x1), STRIP_HEIGHT, {
            fill: STATUS_COLORS[status],
          }),
        );
      }

      // Axis tick labels (My / Gy).
      axisTicksLayer.removeAllChildren();
      const tickCount = 8;
      for (let i = 0; i <= tickCount; i++) {
        const timeYears = (i / tickCount) * timespan;
        const x = timeToX(timeYears, timespan);
        axisTicksLayer.addChild(
          new Line(x, STRIP_TOP + STRIP_HEIGHT, x, STRIP_TOP + STRIP_HEIGHT + 4, {
            stroke: HabitableZonesColors.textColorProperty,
            lineWidth: 1,
          }),
        );
        axisTicksLayer.addChild(
          new Text(formatAgeYears(timeYears), {
            font: TICK_FONT,
            fill: HabitableZonesColors.textColorProperty,
            centerX: x,
            top: AXIS_LABEL_Y,
            maxWidth: 90,
          }),
        );
      }

      // Epoch markers (subgiant, red giant, white dwarf, …).
      epochTicksLayer.removeAllChildren();
      for (const epoch of star.epochsList) {
        const x = timeToX(epoch.time, timespan);
        epochTicksLayer.addChild(
          new Line(x, TEMP_CHART_TOP, x, STRIP_TOP + STRIP_HEIGHT, {
            stroke: HabitableZonesColors.gridColorProperty,
            lineWidth: 1,
          }),
        );
        const label = STAR_EPOCH_LABELS[epoch.type] ?? `Type ${epoch.type}`;
        epochTicksLayer.addChild(
          new Text(label, {
            font: TICK_FONT,
            fill: HabitableZonesColors.textColorProperty,
            maxWidth: 70,
            centerX: x,
            top: TEMP_CHART_TOP - 12,
          }),
        );
      }
    };

    // Event markers (tidal lock, destruction).
    const updateEventMarkers = (): void => {
      eventMarkersLayer.removeAllChildren();
      const star = SHZ_STARS[model.selectedStarIndexProperty.value];
      if (star === undefined) {
        return;
      }
      const addMarker = (timeYears: number, color: typeof HabitableZonesColors.tooHotColorProperty): void => {
        if (!Number.isFinite(timeYears)) {
          return;
        }
        const x = timeToX(timeYears, star.timespan);
        eventMarkersLayer.addChild(
          new Line(x, TEMP_CHART_TOP, x, STRIP_TOP + STRIP_HEIGHT, {
            stroke: color,
            lineWidth: 2,
            lineDash: [3, 3],
          }),
        );
      };
      addMarker(model.timePlanetDestroyedProperty.value, HabitableZonesColors.tooHotColorProperty);
    };

    // ── Draggable cursor ───────────────────────────────────────────────────────
    const cursorLine = new Line(0, TEMP_CHART_TOP, 0, STRIP_TOP + STRIP_HEIGHT, {
      stroke: HabitableZonesColors.accentColorProperty,
      lineWidth: 2,
      cursor: "ew-resize",
      tagName: "div",
      focusable: true,
      accessibleName: a11y.controls.timelineCursorStringProperty,
    });
    const updateCursor = (): void => {
      const star = SHZ_STARS[model.selectedStarIndexProperty.value];
      if (star === undefined) {
        return;
      }
      cursorLine.x = timeToX(model.ageProperty.value, star.timespan);
    };
    cursorLine.addInputListener(
      new DragListener({
        drag: (event) => {
          const star = SHZ_STARS[model.selectedStarIndexProperty.value];
          if (star === undefined) {
            return;
          }
          const localPoint = cursorLine.globalToParentPoint(event.pointer.point);
          const x = Math.max(0, Math.min(TIMELINE_WIDTH, localPoint.x));
          model.ageProperty.value = xToTime(x, star.timespan);
        },
      }),
    );

    model.selectedStarIndexProperty.link(rebuild);
    model.planetDistanceProperty.link(rebuild);
    model.hzModeProperty.link(rebuild);
    model.timePlanetDestroyedProperty.link(rebuild);
    model.selectedStarIndexProperty.link(updateEventMarkers);
    model.planetDistanceProperty.link(updateEventMarkers);
    model.timePlanetDestroyedProperty.link(updateEventMarkers);
    model.ageProperty.link(updateCursor);
    model.selectedStarIndexProperty.link(updateCursor);

    this.children = [
      header,
      tempChartRect,
      stripClip,
      tempCurveClip,
      tooHotLine,
      tooColdLine,
      tooHotLabel,
      tooColdLabel,
      axisTicksLayer,
      epochTicksLayer,
      eventMarkersLayer,
      cursorLine,
    ];
    this.timelineCursor = cursorLine;

    rebuild();
    updateEventMarkers();
    updateCursor();
  }
}
