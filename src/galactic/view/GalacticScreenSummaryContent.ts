/**
 * GalacticScreenSummaryContent.ts
 *
 * Accessible screen summary for the Galactic screen with live current-details
 * derived from GalacticModel state.
 */
import { DerivedProperty } from "scenerystack/axon";
import { StringUtils } from "scenerystack/phetcommon";
import { ScreenSummaryContent } from "scenerystack/sim";
import { StringManager } from "../../i18n/StringManager.js";
import type { GalacticModel } from "../model/GalacticModel.js";

export class GalacticScreenSummaryContent extends ScreenSummaryContent {
  public constructor(model: GalacticModel) {
    const strings = StringManager.getInstance().getGalacticStrings();
    const a11y = StringManager.getInstance().getGalacticA11yStrings();

    const currentDetailsProperty = new DerivedProperty(
      [
        a11y.currentDetailsPatternStringProperty,
        model.selectedRadiusProperty,
        model.metallicityAtSelectedProperty,
        model.riskAtSelectedProperty,
        model.habitabilityAtSelectedProperty,
        model.isInsideGhzProperty,
        strings.readoutInsideGhzStringProperty,
        strings.readoutOutsideGhzStringProperty,
      ],
      (pattern, radius, metallicity, riskValue, habitability, isInside, insideLabel, outsideLabel) =>
        StringUtils.fillIn(pattern, {
          radius: radius.toFixed(1),
          metallicity: metallicity.toFixed(2),
          risk: riskValue.toFixed(2),
          habitability: habitability.toFixed(2),
          ghzStatus: isInside ? insideLabel : outsideLabel,
        }),
    );

    super({
      playAreaContent: a11y.screenSummary.playAreaStringProperty,
      controlAreaContent: a11y.screenSummary.controlAreaStringProperty,
      currentDetailsContent: currentDetailsProperty,
      interactionHintContent: a11y.screenSummary.interactionHintStringProperty,
    });
  }
}
