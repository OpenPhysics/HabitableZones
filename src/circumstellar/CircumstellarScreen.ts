/**
 * CircumstellarScreen.ts
 *
 * The top-level Screen component. It wires together the model and view
 * factories and passes screen-level options (name, background color, tandem)
 * to the parent Screen class.
 *
 * For multi-screen simulations, duplicate this file (e.g. IntroScreen.ts,
 * LabScreen.ts) and add each screen to the screens array in src/main.ts.
 */
import { type EmptySelfOptions, optionize } from "scenerystack/phet-core";
import type { ScreenOptions } from "scenerystack/sim";
import { Screen } from "scenerystack/sim";
import type { Tandem } from "scenerystack/tandem";
import HabitableZonesColors from "../HabitableZonesColors.js";
import { CircumstellarModel } from "./model/CircumstellarModel.js";
import { CircumstellarKeyboardHelpContent } from "./view/CircumstellarKeyboardHelpContent.js";
import { CircumstellarScreenView } from "./view/CircumstellarScreenView.js";

// Require tandem to be explicit — accidental omission would break PhET-iO.
type CircumstellarScreenOptions = ScreenOptions & { tandem: Tandem };

export class CircumstellarScreen extends Screen<CircumstellarModel, CircumstellarScreenView> {
  public constructor(options: CircumstellarScreenOptions) {
    super(
      // Model factory — called once when the screen is first shown
      () => new CircumstellarModel(),
      // View factory — receives the model instance
      (model) =>
        new CircumstellarScreenView(model, {
          tandem: options.tandem.createTandem("view"),
        }),
      optionize<CircumstellarScreenOptions, EmptySelfOptions, ScreenOptions>()(
        {
          backgroundColorProperty: HabitableZonesColors.backgroundColorProperty,
          createKeyboardHelpNode: () => new CircumstellarKeyboardHelpContent(),
        },
        options,
      ),
    );
  }
}
