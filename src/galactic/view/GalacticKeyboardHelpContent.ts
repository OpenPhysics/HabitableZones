/**
 * GalacticKeyboardHelpContent.ts
 *
 * Keyboard Shortcuts dialog for the Galactic screen.
 */

import {
  BasicActionsKeyboardHelpSection,
  KeyboardHelpSection,
  KeyboardHelpSectionRow,
  SliderControlsKeyboardHelpSection,
  TwoColumnKeyboardHelpContent,
} from "scenerystack/scenery-phet";
import HabitableZonesHotkeyData from "../../common/HabitableZonesHotkeyData.js";
import { StringManager } from "../../i18n/StringManager.js";

export class GalacticKeyboardHelpContent extends TwoColumnKeyboardHelpContent {
  public constructor() {
    const kb = StringManager.getInstance().getKeyboardHelpStrings();

    const radiusSection = new KeyboardHelpSection(kb.galacticStringProperty, [
      KeyboardHelpSectionRow.fromHotkeyData(HabitableZonesHotkeyData.ADJUST_GALACTIC_RADIUS, {
        labelStringProperty: kb.adjustGalacticRadiusStringProperty,
        pdomLabelStringProperty: kb.adjustGalacticRadiusDescriptionStringProperty,
      }),
    ]);

    super([radiusSection, new SliderControlsKeyboardHelpSection()], [new BasicActionsKeyboardHelpSection()]);
  }
}
