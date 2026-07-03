/**
 * GeneralSettingsPanel.ts
 *
 * The "General Settings" box from the original NAAP layout: diagram display
 * options (scale grid + solar-system reference orbits).
 */
import { Text, VBox } from "scenerystack/scenery";
import { PhetFont } from "scenerystack/scenery-phet";
import { Checkbox } from "scenerystack/sun";
import { HabitableZonesPanel } from "../../common/HabitableZonesPanel.js";
import HabitableZonesColors from "../../HabitableZonesColors.js";
import { StringManager } from "../../i18n/StringManager.js";
import type { CircumstellarModel } from "../model/CircumstellarModel.js";

const TITLE_FONT = new PhetFont({ size: 14, weight: "bold" });
const LABEL_FONT = new PhetFont({ size: 12, style: "italic" });
const CHECKBOX_FONT = new PhetFont(12);

export class GeneralSettingsPanel extends HabitableZonesPanel {
  public readonly showGridCheckbox: Checkbox;
  public readonly showOrbitsCheckbox: Checkbox;

  public constructor(model: CircumstellarModel) {
    const strings = StringManager.getInstance().getCircumstellarStrings();
    const a11y = StringManager.getInstance().getCircumstellarA11yStrings();

    const showGridCheckbox = new Checkbox(
      model.showGridProperty,
      new Text(strings.showScaleGridStringProperty, {
        font: CHECKBOX_FONT,
        fill: HabitableZonesColors.textColorProperty,
      }),
      { accessibleName: strings.showScaleGridStringProperty },
    );

    const showOrbitsCheckbox = new Checkbox(
      model.showReferenceOrbitsProperty,
      new Text(strings.showSolarSystemOrbitsStringProperty, {
        font: CHECKBOX_FONT,
        fill: HabitableZonesColors.textColorProperty,
      }),
      { accessibleName: a11y.controls.showOrbitsCheckboxStringProperty },
    );

    const content = new VBox({
      align: "left",
      spacing: 10,
      children: [
        new Text(strings.generalSettingsTitleStringProperty, {
          font: TITLE_FONT,
          fill: HabitableZonesColors.textColorProperty,
        }),
        new Text(strings.diagramOptionsStringProperty, {
          font: LABEL_FONT,
          fill: HabitableZonesColors.textColorProperty,
        }),
        showGridCheckbox,
        showOrbitsCheckbox,
      ],
    });

    super(content, { align: "left" });

    this.showGridCheckbox = showGridCheckbox;
    this.showOrbitsCheckbox = showOrbitsCheckbox;
  }
}
