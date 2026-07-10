/**
 * CircumstellarKeyboardHelpContent.ts
 *
 * Keyboard Shortcuts dialog for the Circumstellar screen.
 */

import {
  BasicActionsKeyboardHelpSection,
  ComboBoxKeyboardHelpSection,
  KeyboardHelpSection,
  KeyboardHelpSectionRow,
  MoveDraggableItemsKeyboardHelpSection,
  SliderControlsKeyboardHelpSection,
  TimeControlsKeyboardHelpSection,
  TwoColumnKeyboardHelpContent,
} from "scenerystack/scenery-phet";
import HabitableZonesHotkeyData from "../../common/HabitableZonesHotkeyData.js";
import { StringManager } from "../../i18n/StringManager.js";

export class CircumstellarKeyboardHelpContent extends TwoColumnKeyboardHelpContent {
  public constructor() {
    const kb = StringManager.getInstance().getKeyboardHelpStrings();

    const timelineSection = new KeyboardHelpSection(kb.circumstellarStringProperty, [
      KeyboardHelpSectionRow.fromHotkeyData(HabitableZonesHotkeyData.ADJUST_STELLAR_AGE, {
        labelStringProperty: kb.adjustStellarAgeStringProperty,
        pdomLabelStringProperty: kb.adjustStellarAgeDescriptionStringProperty,
      }),
    ]);

    super(
      [
        new MoveDraggableItemsKeyboardHelpSection(),
        timelineSection,
        new SliderControlsKeyboardHelpSection(),
        new TimeControlsKeyboardHelpSection(),
      ],
      [new ComboBoxKeyboardHelpSection(), new BasicActionsKeyboardHelpSection()],
    );
  }
}
