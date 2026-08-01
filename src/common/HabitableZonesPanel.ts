/**
 * HabitableZonesPanel.ts
 *
 * A pre-themed Panel that automatically uses HabitableZonesColors for background and
 * border. Use this for all control panels and info boxes in the sim so that
 * default / projector mode switching is handled automatically.
 *
 * ── Basic usage ───────────────────────────────────────────────────────────────
 *
 *   import { HabitableZonesPanel } from "../../common/HabitableZonesPanel.js";
 *   import { VBox, Text } from "scenerystack/scenery";
 *
 *   const content = new VBox({
 *     children: [ new Text("label"), slider ],
 *     spacing: 8,
 *   });
 *   const panel = new HabitableZonesPanel(content);
 *
 * ── Overriding defaults ───────────────────────────────────────────────────────
 *
 *   // Wider margins, sharper corners, custom stroke
 *   const panel = new HabitableZonesPanel(content, { xMargin: 20, cornerRadius: 0 });
 *
 *   // Transparent background (decorative border only)
 *   const panel = new HabitableZonesPanel(content, { fill: "transparent" });
 */

import { type EmptySelfOptions, optionize } from "scenerystack/phet-core";
import type { Node } from "scenerystack/scenery";
import { Panel, type PanelOptions } from "scenerystack/sun";
import HabitableZonesColors from "../HabitableZonesColors.js";
import { PANEL_CORNER_RADIUS } from "../HabitableZonesConstants.js";

export type HabitableZonesPanelOptions = PanelOptions;

export class HabitableZonesPanel extends Panel {
  public constructor(content: Node, providedOptions?: HabitableZonesPanelOptions) {
    const options = optionize<HabitableZonesPanelOptions, EmptySelfOptions, PanelOptions>()(
      {
        fill: HabitableZonesColors.panelBackgroundColorProperty,
        stroke: HabitableZonesColors.panelBorderColorProperty,
        cornerRadius: PANEL_CORNER_RADIUS,
        xMargin: 12,
        yMargin: 10,
      },
      providedOptions,
    );
    super(content, options);
  }
}
