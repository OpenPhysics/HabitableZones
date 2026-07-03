/**
 * CircumstellarControlPanel.ts
 *
 * The "Star and Planet Settings and Properties" box from the original NAAP
 * layout: real-system preset, star selector, planet distance, diagram zoom,
 * habitable-zone mode, a live star-properties readout, and a status readout.
 */
import { DerivedProperty, type TReadOnlyProperty } from "scenerystack/axon";
import { StringUtils } from "scenerystack/phetcommon";
import { HBox, type Node, Text, VBox } from "scenerystack/scenery";
import { NumberControl, PhetFont } from "scenerystack/scenery-phet";
import type { ComboBoxItem, RectangularRadioButtonGroupItem } from "scenerystack/sun";
import { ComboBox, RectangularPushButton, RectangularRadioButtonGroup } from "scenerystack/sun";
import { HabitableZonesPanel } from "../../common/HabitableZonesPanel.js";
import HabitableZonesColors from "../../HabitableZonesColors.js";
import { PLANET_DISTANCE_RANGE_AU } from "../../HabitableZonesConstants.js";
import { StringManager } from "../../i18n/StringManager.js";
import type { CircumstellarModel, HzMode, RealSystemId } from "../model/CircumstellarModel.js";
import { NONE_REAL_SYSTEM_ID, REAL_SYSTEMS } from "../model/realSystems.js";
import { SHZ_STARS } from "../model/shzStars.js";

const TITLE_FONT = new PhetFont({ size: 14, weight: "bold" });
const LABEL_FONT = new PhetFont(12);
const READOUT_FONT = new PhetFont(12);
const READOUT_LABEL_FONT = new PhetFont({ size: 12, style: "italic" });
const STATUS_FONT = new PhetFont({ size: 14, weight: "bold" });

export class CircumstellarControlPanel extends HabitableZonesPanel {
  public readonly realSystemComboBox: ComboBox<RealSystemId>;
  public readonly starComboBox: ComboBox<number>;
  public readonly planetDistanceControl: NumberControl;
  public readonly hzModeRadioButtonGroup: RectangularRadioButtonGroup<HzMode>;
  public readonly zoomInButton: RectangularPushButton;
  public readonly zoomOutButton: RectangularPushButton;

  public constructor(model: CircumstellarModel, listParent: Node) {
    const strings = StringManager.getInstance().getCircumstellarStrings();
    const a11y = StringManager.getInstance().getCircumstellarA11yStrings();

    const labelText = (property: TReadOnlyProperty<string>): Text =>
      new Text(property, { font: LABEL_FONT, fill: HabitableZonesColors.textColorProperty });

    const realSystemItems: ComboBoxItem<RealSystemId>[] = [
      {
        value: NONE_REAL_SYSTEM_ID,
        createNode: () => new Text(strings.realSystemNoneStringProperty),
        accessibleName: strings.realSystemNoneStringProperty,
      },
      ...REAL_SYSTEMS.map((system) => ({
        value: system.id as RealSystemId,
        createNode: () => new Text(system.name),
        accessibleName: system.name,
      })),
    ];
    const realSystemComboBox = new ComboBox(model.selectedRealSystemIdProperty, realSystemItems, listParent, {
      accessibleName: a11y.controls.realSystemSelectorStringProperty,
    });

    const starItems: ComboBoxItem<number>[] = SHZ_STARS.map((star, index) => {
      const labelProperty = new DerivedProperty(
        [strings.unitsSolarMassesStringProperty],
        (unit) => `${star.mass} ${unit}`,
      );
      return {
        value: index,
        createNode: () => new Text(labelProperty),
        accessibleName: labelProperty,
      };
    });
    const starComboBox = new ComboBox(model.selectedStarIndexProperty, starItems, listParent, {
      accessibleName: a11y.controls.starSelectorStringProperty,
    });
    model.isStarMassLockedProperty.link((locked) => {
      starComboBox.enabled = !locked;
    });

    const planetDistanceControl = new NumberControl(
      strings.orbitalRadiusStringProperty,
      model.displayPlanetDistanceProperty,
      PLANET_DISTANCE_RANGE_AU,
      {
        accessibleName: a11y.controls.planetDistanceControlStringProperty,
        titleNodeOptions: { font: LABEL_FONT, fill: HabitableZonesColors.textColorProperty },
        numberDisplayOptions: {
          decimalPlaces: 3,
          valuePattern: new DerivedProperty([strings.unitsAuStringProperty], (unit) => `{{value}} ${unit}`),
        },
      },
    );

    const zoomOutButton = new RectangularPushButton({
      content: new Text(strings.zoomOutStringProperty),
      listener: () => model.zoomDiagramOut(),
      accessibleName: a11y.controls.zoomOutStringProperty,
    });
    const zoomInButton = new RectangularPushButton({
      content: new Text(strings.zoomInStringProperty),
      listener: () => model.zoomDiagramIn(),
      accessibleName: a11y.controls.zoomInStringProperty,
    });

    const hzModeItems: RectangularRadioButtonGroupItem<HzMode>[] = [
      { value: "optimistic", createNode: () => new Text(strings.hzOptimisticStringProperty) },
      { value: "conservative", createNode: () => new Text(strings.hzConservativeStringProperty) },
    ];
    const hzModeRadioButtonGroup = new RectangularRadioButtonGroup(model.hzModeProperty, hzModeItems, {
      orientation: "horizontal",
      accessibleName: a11y.controls.hzModeSelectorStringProperty,
    });

    const readout = (
      patternProperty: TReadOnlyProperty<string>,
      valueProperty: TReadOnlyProperty<number>,
      decimals: number,
    ): Text => {
      const textProperty = new DerivedProperty([patternProperty, valueProperty], (pattern, value) =>
        StringUtils.fillIn(pattern, { value: value.toFixed(decimals) }),
      );
      return new Text(textProperty, { font: READOUT_FONT, fill: HabitableZonesColors.textColorProperty });
    };

    const propertiesReadout = new VBox({
      align: "left",
      spacing: 2,
      children: [
        new Text(strings.starPropertiesNowStringProperty, {
          font: READOUT_LABEL_FONT,
          fill: HabitableZonesColors.textColorProperty,
        }),
        readout(strings.massReadoutPatternStringProperty, model.currentStarMassProperty, 2),
        readout(strings.luminosityReadoutPatternStringProperty, model.luminosityProperty, 3),
        readout(strings.temperatureReadoutPatternStringProperty, model.temperatureProperty, 0),
        readout(strings.radiusReadoutPatternStringProperty, model.radiusSolarProperty, 3),
      ],
    });

    const distanceNowProperty = new DerivedProperty(
      [strings.planetDistanceNowPatternStringProperty, model.effectivePlanetDistanceProperty],
      (pattern, distance) => StringUtils.fillIn(pattern, { value: distance.toFixed(3) }),
    );

    const statusTextProperty = new DerivedProperty(
      [
        strings.statusReadoutPatternStringProperty,
        model.planetStatusProperty,
        model.isPlanetDestroyedProperty,
        model.isPlanetTidallyLockedProperty,
        strings.status.tooHotStringProperty,
        strings.status.temperateStringProperty,
        strings.status.tooColdStringProperty,
        strings.status.destroyedStringProperty,
        strings.status.tidallyLockedStringProperty,
      ],
      (pattern, status, destroyed, locked, tooHot, temperate, tooCold, destroyedLabel, lockedLabel) => {
        let statusLabel = status === "tooHot" ? tooHot : status === "tooCold" ? tooCold : temperate;
        if (destroyed) {
          statusLabel = destroyedLabel;
        } else if (locked) {
          statusLabel = lockedLabel;
        }
        return StringUtils.fillIn(pattern, { status: statusLabel });
      },
    );

    const controlsColumnA = new VBox({
      align: "left",
      spacing: 8,
      children: [
        new VBox({
          align: "left",
          spacing: 3,
          children: [labelText(strings.realSystemLabelStringProperty), realSystemComboBox],
        }),
        new VBox({
          align: "left",
          spacing: 3,
          children: [labelText(strings.initialStarMassStringProperty), starComboBox],
        }),
        planetDistanceControl,
      ],
    });

    const controlsColumnB = new VBox({
      align: "left",
      spacing: 8,
      children: [
        new HBox({
          spacing: 6,
          align: "center",
          children: [labelText(strings.diagramZoomStringProperty), zoomInButton, zoomOutButton],
        }),
        new VBox({
          align: "left",
          spacing: 3,
          children: [labelText(strings.habitableZoneStringProperty), hzModeRadioButtonGroup],
        }),
      ],
    });

    const readoutsColumn = new VBox({
      align: "left",
      spacing: 8,
      children: [
        propertiesReadout,
        new Text(distanceNowProperty, { font: READOUT_FONT, fill: HabitableZonesColors.textColorProperty }),
        new Text(statusTextProperty, { font: STATUS_FONT, fill: HabitableZonesColors.textColorProperty }),
      ],
    });

    const content = new VBox({
      align: "left",
      spacing: 8,
      children: [
        new Text(strings.starPlanetSettingsTitleStringProperty, {
          font: TITLE_FONT,
          fill: HabitableZonesColors.textColorProperty,
          maxWidth: 520,
        }),
        new HBox({
          spacing: 18,
          align: "top",
          children: [controlsColumnA, controlsColumnB, readoutsColumn],
        }),
      ],
    });

    super(content, { align: "left" });

    this.realSystemComboBox = realSystemComboBox;
    this.starComboBox = starComboBox;
    this.planetDistanceControl = planetDistanceControl;
    this.hzModeRadioButtonGroup = hzModeRadioButtonGroup;
    this.zoomInButton = zoomInButton;
    this.zoomOutButton = zoomOutButton;
  }
}
