/**
 * GalacticScreenView.ts
 *
 * The top-level view for the Galactic screen: Milky Way disc, metallicity and
 * risk plots, and a control panel — all sharing one selected-radius Property.
 */

import { Rectangle, VBox } from "scenerystack/scenery";
import { ResetAllButton } from "scenerystack/scenery-phet";
import type { ScreenViewOptions } from "scenerystack/sim";
import { ScreenView } from "scenerystack/sim";
import HabitableZonesColors from "../../HabitableZonesColors.js";
import { SCREEN_VIEW_MARGIN } from "../../HabitableZonesConstants.js";
import { StringManager } from "../../i18n/StringManager.js";
import type { GalacticModel } from "../model/GalacticModel.js";
import { metallicity, risk } from "../model/galacticHabitability.js";
import { GalacticControlPanel } from "./GalacticControlPanel.js";
import { GalacticRadiusPlotNode } from "./GalacticRadiusPlotNode.js";
import { GalacticScreenSummaryContent } from "./GalacticScreenSummaryContent.js";
import { MilkyWayDiscNode } from "./MilkyWayDiscNode.js";

export class GalacticScreenView extends ScreenView {
  public constructor(model: GalacticModel, options?: ScreenViewOptions) {
    super({
      screenSummaryContent: new GalacticScreenSummaryContent(model),
      ...options,
    });

    const strings = StringManager.getInstance().getGalacticStrings();
    const a11y = StringManager.getInstance().getGalacticA11yStrings();

    const backgroundRect = new Rectangle(0, 0, this.layoutBounds.width, this.layoutBounds.height, {
      fill: HabitableZonesColors.backgroundColorProperty,
    });
    this.addChild(backgroundRect);

    const discNode = new MilkyWayDiscNode(model);
    discNode.left = this.layoutBounds.minX + SCREEN_VIEW_MARGIN + 20;
    discNode.centerY = this.layoutBounds.centerY - 30;
    this.addChild(discNode);

    const metallicityPlot = new GalacticRadiusPlotNode(model, {
      titleStringProperty: strings.plots.metallicityTitleStringProperty,
      curveColorProperty: HabitableZonesColors.metallicityCurveColorProperty,
      valueAtRadius: metallicity,
      accessibleNameProperty: a11y.controls.metallicityPlotCursorStringProperty,
    });

    const riskPlot = new GalacticRadiusPlotNode(model, {
      titleStringProperty: strings.plots.riskTitleStringProperty,
      curveColorProperty: HabitableZonesColors.riskCurveColorProperty,
      valueAtRadius: risk,
      accessibleNameProperty: a11y.controls.riskPlotCursorStringProperty,
    });

    const plotsColumn = new VBox({
      spacing: 16,
      align: "left",
      children: [metallicityPlot, riskPlot],
      left: discNode.right + 30,
      centerY: this.layoutBounds.centerY - 20,
    });
    this.addChild(plotsColumn);

    const controlPanel = new GalacticControlPanel(model);
    controlPanel.right = this.layoutBounds.maxX - SCREEN_VIEW_MARGIN;
    controlPanel.top = this.layoutBounds.minY + SCREEN_VIEW_MARGIN;
    this.addChild(controlPanel);

    const resetAllButton = new ResetAllButton({
      listener: () => {
        model.reset();
        this.reset();
      },
      right: this.layoutBounds.maxX - SCREEN_VIEW_MARGIN,
      bottom: this.layoutBounds.maxY - SCREEN_VIEW_MARGIN,
    });
    this.addChild(resetAllButton);

    this.pdomPlayAreaNode.pdomOrder = [discNode.radiusCursor, metallicityPlot.plotCursor, riskPlot.plotCursor];
    this.pdomControlAreaNode.pdomOrder = [controlPanel.radiusControl, resetAllButton];
  }

  public reset(): void {
    // No view-side state to reset yet.
  }

  public override step(_dt: number): void {
    // No animation on the galactic screen.
  }
}
