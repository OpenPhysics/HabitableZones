/**
 * GalacticScreen.ts
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
import { createGalacticIcon } from "../common/HabitableZonesScreenIcons.js";
import HabitableZonesColors from "../HabitableZonesColors.js";
import { GalacticModel } from "./model/GalacticModel.js";
import { GalacticKeyboardHelpContent } from "./view/GalacticKeyboardHelpContent.js";
import { GalacticScreenView } from "./view/GalacticScreenView.js";

// Require tandem to be explicit — accidental omission would break PhET-iO.
type GalacticScreenOptions = ScreenOptions & { tandem: Tandem };

export class GalacticScreen extends Screen<GalacticModel, GalacticScreenView> {
  public constructor(options: GalacticScreenOptions) {
    super(
      // Model factory — called once when the screen is first shown
      () => new GalacticModel(),
      // View factory — receives the model instance
      (model) =>
        new GalacticScreenView(model, {
          tandem: options.tandem.createTandem("view"),
        }),
      optionize<GalacticScreenOptions, EmptySelfOptions, ScreenOptions>()(
        {
          backgroundColorProperty: HabitableZonesColors.backgroundColorProperty,
          createKeyboardHelpNode: () => new GalacticKeyboardHelpContent(),
          homeScreenIcon: createGalacticIcon(),
          navigationBarIcon: createGalacticIcon(),
        },
        options,
      ),
    );
  }
}
