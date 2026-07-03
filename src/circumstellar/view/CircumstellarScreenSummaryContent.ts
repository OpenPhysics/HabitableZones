/**
 * CircumstellarScreenSummaryContent.ts
 *
 * The accessible screen summary read by screen readers (SceneryStack's
 * Interactive Description). currentDetailsContent is a live DerivedProperty
 * built from CircumstellarModel state via StringUtils.fillIn, so it always
 * describes the star, its habitable zone, and the planet's current status.
 */
import { DerivedProperty } from "scenerystack/axon";
import { StringUtils } from "scenerystack/phetcommon";
import { ScreenSummaryContent } from "scenerystack/sim";
import { StringManager } from "../../i18n/StringManager.js";
import type { CircumstellarModel } from "../model/CircumstellarModel.js";
import { SHZ_STARS } from "../model/shzStars.js";

export class CircumstellarScreenSummaryContent extends ScreenSummaryContent {
  public constructor(model: CircumstellarModel) {
    const strings = StringManager.getInstance().getCircumstellarStrings();
    const a11y = StringManager.getInstance().getCircumstellarA11yStrings();

    const currentDetailsProperty = new DerivedProperty(
      [
        a11y.currentDetailsPatternStringProperty,
        model.selectedStarIndexProperty,
        model.ageProperty,
        model.temperatureProperty,
        model.hzInnerProperty,
        model.hzOuterProperty,
        model.effectivePlanetDistanceProperty,
        model.planetStatusProperty,
        model.isPlanetDestroyedProperty,
        model.isPlanetTidallyLockedProperty,
        strings.status.tooHotStringProperty,
        strings.status.temperateStringProperty,
        strings.status.tooColdStringProperty,
        strings.status.destroyedStringProperty,
        strings.status.tidallyLockedStringProperty,
      ],
      (
        pattern,
        starIndex,
        age,
        temperature,
        hzInner,
        hzOuter,
        distance,
        status,
        destroyed,
        locked,
        tooHot,
        temperate,
        tooCold,
        destroyedLabel,
        lockedLabel,
      ) => {
        const star = SHZ_STARS[starIndex];
        const mass = star === undefined ? 0 : star.mass;
        const ageLabel =
          age >= 1e9 ? `${(age / 1e9).toFixed(1)} billion years` : `${(age / 1e6).toFixed(1)} million years`;
        let statusLabel = status === "tooHot" ? tooHot : status === "tooCold" ? tooCold : temperate;
        if (destroyed) {
          statusLabel = destroyedLabel;
        } else if (locked) {
          statusLabel = lockedLabel;
        }
        return StringUtils.fillIn(pattern, {
          mass: mass.toFixed(1),
          age: ageLabel,
          temperature: temperature.toFixed(0),
          hzInner: hzInner.toFixed(2),
          hzOuter: hzOuter.toFixed(2),
          distance: distance.toFixed(2),
          status: statusLabel,
        });
      },
    );

    super({
      playAreaContent: a11y.screenSummary.playAreaStringProperty,
      controlAreaContent: a11y.screenSummary.controlAreaStringProperty,
      currentDetailsContent: currentDetailsProperty,
      interactionHintContent: a11y.screenSummary.interactionHintStringProperty,
    });
  }
}
