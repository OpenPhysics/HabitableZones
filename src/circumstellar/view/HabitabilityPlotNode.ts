/**
 * HabitabilityPlotNode.ts
 *
 * Time-series plot showing, at the current planet distance, when the planet
 * would be too hot, temperate, or too cold as the star evolves. A vertical
 * cursor tracks the current age (aligned with the timeline).
 *
 * Model ref: SHZHabitabilityPlot.as, timeline.jsx.
 */
import { AxisLine, ChartRectangle, ChartTransform } from "scenerystack/bamboo";
import { Range } from "scenerystack/dot";
import { Shape } from "scenerystack/kite";
import { Orientation } from "scenerystack/phet-core";
import { Line, Node, Path, Text } from "scenerystack/scenery";
import { PhetFont } from "scenerystack/scenery-phet";
import HabitableZonesColors from "../../HabitableZonesColors.js";
import { HZ_CONSERVATIVE, HZ_OPTIMISTIC } from "../../HabitableZonesConstants.js";
import { StringManager } from "../../i18n/StringManager.js";
import { type CircumstellarModel, classifyPlanetDistance, type PlanetStatus } from "../model/CircumstellarModel.js";
import { effectivePlanetDistanceAU } from "../model/planetEvolution.js";
import { luminosity, sampleStar } from "../model/StarEvolution.js";
import { SHZ_STARS } from "../model/shzStars.js";

const PLOT_WIDTH = 220;
const PLOT_HEIGHT = 36;
const LEFT_INSET = 4;
const TOP_INSET = 22;
const TITLE_FONT = new PhetFont(11);

const HZ_COEFFICIENTS = {
  optimistic: HZ_OPTIMISTIC,
  conservative: HZ_CONSERVATIVE,
} as const;

const STATUS_COLORS: Record<PlanetStatus, typeof HabitableZonesColors.tooHotColorProperty> = {
  tooHot: HabitableZonesColors.tooHotColorProperty,
  temperate: HabitableZonesColors.temperateColorProperty,
  tooCold: HabitableZonesColors.tooColdColorProperty,
};

export class HabitabilityPlotNode extends Node {
  public constructor(model: CircumstellarModel) {
    super({ isDisposable: false });

    const strings = StringManager.getInstance().getCircumstellarStrings();

    const bandsLayer = new Node();
    const cursorLine = new Line(0, 0, 0, PLOT_HEIGHT, {
      stroke: HabitableZonesColors.accentColorProperty,
      lineWidth: 1.5,
    });

    const chartFrame = new Node({ x: LEFT_INSET, y: TOP_INSET });

    const rebuild = (): void => {
      chartFrame.removeAllChildren();
      bandsLayer.removeAllChildren();

      const star = SHZ_STARS[model.selectedStarIndexProperty.value];
      if (star === undefined) {
        return;
      }

      const chartTransform = new ChartTransform({
        viewWidth: PLOT_WIDTH,
        viewHeight: PLOT_HEIGHT,
        modelXRange: new Range(0, star.timespan),
        modelYRange: new Range(0, 1),
      });

      chartFrame.addChild(
        new ChartRectangle(chartTransform, {
          fill: HabitableZonesColors.panelBackgroundColorProperty,
          stroke: HabitableZonesColors.panelBorderColorProperty,
          lineWidth: 1,
        }),
      );
      chartFrame.addChild(
        new AxisLine(chartTransform, Orientation.HORIZONTAL, {
          stroke: HabitableZonesColors.textColorProperty,
          lineWidth: 1,
        }),
      );

      const initialDistance = model.planetDistanceProperty.value;
      const catalogMass = star.mass;
      const destroyTime = model.timePlanetDestroyedProperty.value;
      const coeffs = HZ_COEFFICIENTS[model.hzModeProperty.value];
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
        const midMass = sampleStar(star, midTime).mass;
        const distance = effectivePlanetDistanceAU(initialDistance, catalogMass, midMass);
        const lum = luminosity(sampleStar(star, midTime));
        const inner = Math.sqrt(lum) * coeffs.inner;
        const outer = Math.sqrt(lum) * coeffs.outer;
        const status = classifyPlanetDistance(distance, inner, outer);

        const x1 = chartTransform.modelToViewX(a.time);
        const x2 = chartTransform.modelToViewX(b.time);
        bandsLayer.addChild(
          new Path(new Shape().rect(x1, 0, Math.max(0, x2 - x1), PLOT_HEIGHT), {
            fill: STATUS_COLORS[status],
          }),
        );
      }

      const cursorX = chartTransform.modelToViewX(model.ageProperty.value);
      cursorLine.setPoint1(cursorX, 0);
      cursorLine.setPoint2(cursorX, PLOT_HEIGHT);
    };

    model.selectedStarIndexProperty.link(rebuild);
    model.ageProperty.link(rebuild);
    model.planetDistanceProperty.link(rebuild);
    model.hzModeProperty.link(rebuild);
    model.timePlanetDestroyedProperty.link(rebuild);

    const title = new Text(strings.habitabilityPlotTitleStringProperty, {
      font: TITLE_FONT,
      fill: HabitableZonesColors.textColorProperty,
      left: LEFT_INSET,
      top: 0,
    });

    const plotLayer = new Node({
      x: LEFT_INSET,
      y: TOP_INSET,
      clipArea: Shape.rectangle(0, 0, PLOT_WIDTH, PLOT_HEIGHT),
      children: [bandsLayer, cursorLine],
    });

    this.children = [title, chartFrame, plotLayer];
  }
}
