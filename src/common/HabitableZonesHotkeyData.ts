/**
 * HabitableZonesHotkeyData.ts
 *
 * Single source of truth for Habitable Zones keyboard shortcuts. Listeners and
 * the Keyboard Shortcuts dialog both derive from these HotkeyData instances.
 */

import { HotkeyData } from "scenerystack/scenery";

const HORIZONTAL_ARROW_KEYS = ["arrowLeft", "arrowRight"] as const;

const HabitableZonesHotkeyData = {
  HORIZONTAL_ARROW_KEYS,

  /**
   * Adjust stellar age on the Circumstellar timeline cursor (left/right).
   */
  ADJUST_STELLAR_AGE: new HotkeyData({
    keys: [...HORIZONTAL_ARROW_KEYS],
    repoName: "habitable-zones",
    binderName: "Adjust Stellar Age",
  }),

  /**
   * Adjust galactocentric radius on the Milky Way disc / plot cursors.
   */
  ADJUST_GALACTIC_RADIUS: new HotkeyData({
    keys: [...HORIZONTAL_ARROW_KEYS],
    repoName: "habitable-zones",
    binderName: "Adjust Galactic Radius",
  }),
} as const;

export default HabitableZonesHotkeyData;
