/**
 * HRDiagramNode.ts
 *
 * Hertzsprung-Russell diagram for the selected star: a faint main-sequence
 * reference curve, the star's evolutionary track, and a highlighted marker at
 * the current age. Model ref: SHZHRDiagram.as, star-properties.jsx.
 *
 * Matching the React port, the chart shows no numeric tick labels — only the
 * framed plot with reversed temperature (x) and luminosity (y) axes and short
 * arrow-annotated axis titles.
 */
import { ChartRectangle, ChartTransform, GridLineSet, LinePlot, ScatterPlot } from "scenerystack/bamboo";
import { Range, Vector2 } from "scenerystack/dot";
import { Shape } from "scenerystack/kite";
import { Orientation } from "scenerystack/phet-core";
import { Node, Text } from "scenerystack/scenery";
import { PhetFont } from "scenerystack/scenery-phet";
import HabitableZonesColors from "../../HabitableZonesColors.js";
import { StringManager } from "../../i18n/StringManager.js";
import type { CircumstellarModel } from "../model/CircumstellarModel.js";
import { SHZ_STARS } from "../model/shzStars.js";

const PLOT_WIDTH = 150;
const PLOT_HEIGHT = 150;
const LEFT_INSET = 18;
const TOP_INSET = 20;

const MIN_LOG_TEMP = Math.log10(2500);
const MAX_LOG_TEMP = Math.log10(50000);
const MIN_LOG_LUM = -4;
const MAX_LOG_LUM = 7;

const AXIS_LABEL_FONT = new PhetFont(10);
const TITLE_FONT = new PhetFont(11);

/** Main-sequence reference from zero-age points across the catalog. */
const MAIN_SEQUENCE_POINTS: Vector2[] = [...SHZ_STARS]
  .sort((a, b) => a.mass - b.mass)
  .map((star) => {
    const point = star.dataTable[0];
    if (point === undefined) {
      throw new Error("HRDiagramNode: star missing zero-age dataTable entry");
    }
    return new Vector2(point.logTemp, point.logLum);
  });

export class HRDiagramNode extends Node {
  public constructor(model: CircumstellarModel) {
    super({ isDisposable: false });

    const strings = StringManager.getInstance().getCircumstellarStrings();

    const chartTransform = new ChartTransform({
      viewWidth: PLOT_WIDTH,
      viewHeight: PLOT_HEIGHT,
      modelXRange: new Range(MIN_LOG_TEMP, MAX_LOG_TEMP),
      modelYRange: new Range(MIN_LOG_LUM, MAX_LOG_LUM),
      modelXRangeInverted: true,
      modelYRangeInverted: false,
    });

    const chartRectangle = new ChartRectangle(chartTransform, {
      fill: HabitableZonesColors.panelBackgroundColorProperty,
      stroke: HabitableZonesColors.panelBorderColorProperty,
      lineWidth: 1,
    });

    const gridX = new GridLineSet(chartTransform, Orientation.HORIZONTAL, 0.5, {
      stroke: HabitableZonesColors.gridColorProperty,
      lineWidth: 0.5,
    });
    const gridY = new GridLineSet(chartTransform, Orientation.VERTICAL, 1, {
      stroke: HabitableZonesColors.gridColorProperty,
      lineWidth: 0.5,
    });

    const mainSequencePlot = new LinePlot(chartTransform, MAIN_SEQUENCE_POINTS, {
      stroke: HabitableZonesColors.gridColorProperty,
      lineWidth: 1,
      lineDash: [4, 4],
    });

    const trackData: Vector2[] = [];
    const trackPlot = new LinePlot(chartTransform, trackData, {
      stroke: HabitableZonesColors.accentColorProperty,
      lineWidth: 2,
    });

    const markerData: Vector2[] = [Vector2.ZERO];
    const markerPlot = new ScatterPlot(chartTransform, markerData, {
      fill: HabitableZonesColors.starColorProperty,
      radius: 4,
    });

    const updateTrackAndMarker = (): void => {
      const star = SHZ_STARS[model.selectedStarIndexProperty.value];
      if (star === undefined) {
        return;
      }
      const age = model.ageProperty.value;
      trackData.length = 0;
      for (const point of star.dataTable) {
        if (point.time <= age) {
          trackData.push(new Vector2(point.logTemp, point.logLum));
        }
      }
      trackPlot.setDataSet(trackData);

      const current = trackData[trackData.length - 1];
      if (current !== undefined) {
        markerData[0] = current;
        markerPlot.setDataSet(markerData);
      }
    };

    model.selectedStarIndexProperty.link(updateTrackAndMarker);
    model.ageProperty.link(updateTrackAndMarker);

    const plotContainer = new Node({
      x: LEFT_INSET,
      y: TOP_INSET,
      children: [
        chartRectangle,
        gridX,
        gridY,
        new Node({
          clipArea: Shape.rectangle(0, 0, PLOT_WIDTH, PLOT_HEIGHT),
          children: [mainSequencePlot, trackPlot, markerPlot],
        }),
      ],
    });

    const title = new Text(strings.hrDiagramTitleStringProperty, {
      font: TITLE_FONT,
      fill: HabitableZonesColors.textColorProperty,
      centerX: LEFT_INSET + PLOT_WIDTH / 2,
      top: 0,
    });

    const xLabel = new Text(strings.hrDiagramTemperatureAxisStringProperty, {
      font: AXIS_LABEL_FONT,
      fill: HabitableZonesColors.textColorProperty,
      centerX: LEFT_INSET + PLOT_WIDTH / 2,
      top: TOP_INSET + PLOT_HEIGHT + 2,
    });

    const yLabel = new Text(strings.hrDiagramLuminosityAxisStringProperty, {
      font: AXIS_LABEL_FONT,
      fill: HabitableZonesColors.textColorProperty,
      rotation: -Math.PI / 2,
      right: LEFT_INSET - 4,
      centerY: TOP_INSET + PLOT_HEIGHT / 2,
    });

    this.children = [title, plotContainer, xLabel, yLabel];
  }
}
