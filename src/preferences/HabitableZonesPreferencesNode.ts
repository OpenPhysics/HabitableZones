/**
 * HabitableZonesPreferencesNode.ts
 *
 * Custom preferences UI shown in Preferences → Simulation. Controls are bound
 * to HabitableZonesPreferencesModel Properties (whose initial values come from
 * habitableZonesQueryParameters).
 */

import { Text, VBox } from "scenerystack/scenery";
import { PhetFont } from "scenerystack/scenery-phet";
import { Checkbox } from "scenerystack/sun";
import type { Tandem } from "scenerystack/tandem";
import HabitableZonesColors from "../HabitableZonesColors.js";
import HabitableZonesNamespace from "../HabitableZonesNamespace.js";
import { StringManager } from "../i18n/StringManager.js";
import type { HabitableZonesPreferencesModel } from "./HabitableZonesPreferencesModel.js";

export class HabitableZonesPreferencesNode extends VBox {
  public constructor(preferencesModel: HabitableZonesPreferencesModel, tandem?: Tandem) {
    const prefStrings = StringManager.getInstance().getPreferences();

    const header = new Text(prefStrings.titleStringProperty, {
      font: new PhetFont({ size: 18, weight: "bold" }),
      fill: HabitableZonesColors.textColorProperty,
    });

    const exampleToggleCheckbox = new Checkbox(
      preferencesModel.exampleToggleProperty,
      new Text(prefStrings.exampleToggleStringProperty, {
        font: new PhetFont(14),
        fill: HabitableZonesColors.textColorProperty,
      }),
      {
        checkboxColor: HabitableZonesColors.textColorProperty,
        checkboxColorBackground: HabitableZonesColors.panelBackgroundColorProperty,
        spacing: 8,
        ...(tandem && { tandem: tandem.createTandem("exampleToggleCheckbox") }),
      },
    );

    super({
      align: "left",
      spacing: 12,
      children: [header, exampleToggleCheckbox],
    });
  }
}

HabitableZonesNamespace.register("HabitableZonesPreferencesNode", HabitableZonesPreferencesNode);
