/**
 * SHZDiagramNode.ts
 *
 * Top-down circumstellar diagram rendered as a wide rectangular "box" (matching
 * the original NAAP / React port): the star is anchored near the left edge and
 * the habitable-zone annulus, reference orbits, and planet fan out to the right.
 * Contains the star, habitable-zone band, reference orbits, real-system planet
 * overlays, draggable planet, an optional AU grid, and a scale bar.
 *
 * Model ref: SHZDiagram.as, SHZDiagramGrid.as, SHZDiagramScalebar.as,
 * diagram.jsx (STAR_ORIGIN_POINT ≈ [100, 150], AU_PIXELS = 100, HZONE fill).
 */
import { DerivedProperty } from "scenerystack/axon";
import { Vector2 } from "scenerystack/dot";
import { Shape } from "scenerystack/kite";
import { ModelViewTransform2 } from "scenerystack/phetcommon";
import { Circle, DragListener, KeyboardDragListener, Node, Path, Rectangle, Text } from "scenerystack/scenery";
import { PhetFont, ShadedSphereNode } from "scenerystack/scenery-phet";
import HabitableZonesColors from "../../HabitableZonesColors.js";
import {
  AU_PER_SOLAR_RADIUS,
  REFERENCE_ORBITS_AU,
  SHZ_DIAGRAM_VIEW_HEIGHT,
  SHZ_DIAGRAM_VIEW_WIDTH,
  SHZ_PLANET_VIEW_RADIUS,
  SHZ_STAR_MIN_VIEW_RADIUS,
  SHZ_STAR_ORIGIN_X,
  shzDiagramGridSpacingAU,
  shzDiagramPixelsPerAU,
  shzDiagramScaleBarAU,
} from "../../HabitableZonesConstants.js";
import { StringManager } from "../../i18n/StringManager.js";
import type { CircumstellarModel, PlanetStatus } from "../model/CircumstellarModel.js";
import { findRealSystem, NONE_REAL_SYSTEM_ID } from "../model/realSystems.js";
import { sampleStar } from "../model/StarEvolution.js";
import { SHZ_STARS } from "../model/shzStars.js";
import { blackbodyColor } from "./blackbodyColor.js";

const STATUS_COLOR_PROPERTIES: Record<PlanetStatus, typeof HabitableZonesColors.tooHotColorProperty> = {
  tooHot: HabitableZonesColors.tooHotColorProperty,
  temperate: HabitableZonesColors.temperateColorProperty,
  tooCold: HabitableZonesColors.tooColdColorProperty,
};

const LABEL_FONT = new PhetFont(10);
const SCALEBAR_FONT = new PhetFont(11);
const HZ_LABEL_FONT = new PhetFont({ size: 12, weight: "bold" });

const REFERENCE_ORBIT_LABELS = ["Mercury", "Venus", "Earth", "Mars", "Jupiter", "Saturn", "Uranus", "Neptune"];

export type SHZDiagramNodeOptions = {
  viewWidth?: number;
  viewHeight?: number;
  starOriginX?: number;
};

export class SHZDiagramNode extends Node {
  public readonly planetNode: Node;

  public constructor(model: CircumstellarModel, options?: SHZDiagramNodeOptions) {
    super();

    const viewWidth = options?.viewWidth ?? SHZ_DIAGRAM_VIEW_WIDTH;
    const viewHeight = options?.viewHeight ?? SHZ_DIAGRAM_VIEW_HEIGHT;
    const originX = options?.starOriginX ?? SHZ_STAR_ORIGIN_X;
    const originView = new Vector2(originX, viewHeight / 2);

    const strings = StringManager.getInstance().getCircumstellarStrings();
    const a11y = StringManager.getInstance().getCircumstellarA11yStrings();

    // Framed black "space" box.
    const boxNode = new Rectangle(0, 0, viewWidth, viewHeight, {
      fill: HabitableZonesColors.backgroundColorProperty,
      stroke: HabitableZonesColors.panelBorderColorProperty,
      lineWidth: 1,
    });
    this.addChild(boxNode);

    // Everything inside the box is clipped to its rectangle.
    const contentLayer = new Node({
      clipArea: Shape.rectangle(0, 0, viewWidth, viewHeight),
    });
    this.addChild(contentLayer);

    let modelViewTransform = ModelViewTransform2.createSinglePointScaleMapping(
      Vector2.ZERO,
      originView,
      shzDiagramPixelsPerAU(model.diagramZoomLevelProperty.value),
    );

    const gridNode = new Path(null, { stroke: HabitableZonesColors.gridColorProperty, lineWidth: 0.5 });
    contentLayer.addChild(gridNode);

    const referenceOrbitsNode = new Node();
    contentLayer.addChild(referenceOrbitsNode);

    const realSystemOrbitsNode = new Node();
    contentLayer.addChild(realSystemOrbitsNode);

    // Habitable-zone annulus, drawn as a thick stroked ring centered on the star
    // (stroke color = band fill, stroke width = outer − inner radius in px).
    const hzBandNode = new Circle(1, {
      stroke: HabitableZonesColors.habitableZoneFillColorProperty,
      center: originView,
    });
    contentLayer.addChild(hzBandNode);

    const hzLabel = new Text(strings.habitableZoneStringProperty, {
      font: HZ_LABEL_FONT,
      fill: HabitableZonesColors.habitableZoneStrokeColorProperty,
    });
    contentLayer.addChild(hzLabel);

    const starColorProperty = new DerivedProperty([model.temperatureProperty], (temperature) =>
      blackbodyColor(temperature),
    );
    const starNode = new ShadedSphereNode(2 * SHZ_STAR_MIN_VIEW_RADIUS, {
      mainColor: starColorProperty,
    });
    contentLayer.addChild(starNode);

    const realPlanetMarkersNode = new Node();
    contentLayer.addChild(realPlanetMarkersNode);

    const planetColorProperty = new DerivedProperty(
      [
        model.planetStatusProperty,
        model.isPlanetDestroyedProperty,
        model.isPlanetTidallyLockedProperty,
        HabitableZonesColors.tooHotColorProperty,
        HabitableZonesColors.temperateColorProperty,
        HabitableZonesColors.tooColdColorProperty,
      ],
      (status, destroyed, locked) => {
        if (destroyed) {
          return HabitableZonesColors.tooHotColorProperty.value;
        }
        if (locked) {
          return HabitableZonesColors.orbitStrokeColorProperty.value;
        }
        return STATUS_COLOR_PROPERTIES[status].value;
      },
    );

    const planetNode = new ShadedSphereNode(2 * SHZ_PLANET_VIEW_RADIUS, {
      mainColor: planetColorProperty,
      cursor: "pointer",
      tagName: "div",
      focusable: true,
      accessibleName: a11y.controls.planetDraggableStringProperty,
    });
    contentLayer.addChild(planetNode);

    const destroyedIndicator = new Text("×", {
      font: new PhetFont(28),
      fill: HabitableZonesColors.tooHotColorProperty,
      center: planetNode.center,
      visible: false,
    });
    contentLayer.addChild(destroyedIndicator);

    const lockedIndicator = new Text(strings.planetTidallyLockedStringProperty, {
      font: LABEL_FONT,
      fill: HabitableZonesColors.textColorProperty,
      top: SHZ_PLANET_VIEW_RADIUS + 4,
      centerX: 0,
      visible: false,
    });
    planetNode.addChild(lockedIndicator);

    // Scale bar, top-right of the box.
    const scaleBarLabel = new Text("", {
      font: SCALEBAR_FONT,
      fill: HabitableZonesColors.textColorProperty,
    });
    const scaleBarRect = new Rectangle(0, 0, 10, 5, {
      fill: HabitableZonesColors.textColorProperty,
      stroke: HabitableZonesColors.textColorProperty,
      lineWidth: 1,
    });
    const scaleBarNode = new Node({ children: [scaleBarLabel, scaleBarRect] });
    this.addChild(scaleBarNode);

    const updateScaleBar = (): void => {
      const zoom = model.diagramZoomLevelProperty.value;
      const barAU = shzDiagramScaleBarAU(zoom);
      const barPx = barAU * shzDiagramPixelsPerAU(zoom);
      scaleBarRect.setRect(0, 12, barPx, 6);
      scaleBarLabel.string = `${barAU} AU`;
      scaleBarLabel.centerX = barPx / 2;
      scaleBarNode.right = viewWidth - 14;
      scaleBarNode.top = 12;
    };

    const updateGrid = (): void => {
      const zoom = model.diagramZoomLevelProperty.value;
      const pixelsPerAU = shzDiagramPixelsPerAU(zoom);
      const { major, minor } = shzDiagramGridSpacingAU(zoom);
      const majorEvery = Math.max(1, Math.round(major / minor));
      const spacingPx = minor * pixelsPerAU;
      const shape = new Shape();

      const leftCount = Math.ceil(originView.x / spacingPx);
      const rightCount = Math.ceil((viewWidth - originView.x) / spacingPx);
      for (let i = -leftCount; i <= rightCount; i++) {
        if (i % majorEvery !== 0) {
          continue;
        }
        const px = originView.x + i * spacingPx;
        shape.moveTo(px, 0);
        shape.lineTo(px, viewHeight);
      }
      const upCount = Math.ceil(originView.y / spacingPx);
      const downCount = Math.ceil((viewHeight - originView.y) / spacingPx);
      for (let j = -upCount; j <= downCount; j++) {
        if (j % majorEvery !== 0) {
          continue;
        }
        const py = originView.y + j * spacingPx;
        shape.moveTo(0, py);
        shape.lineTo(viewWidth, py);
      }
      gridNode.shape = shape;
    };

    const updateReferenceOrbits = (): void => {
      referenceOrbitsNode.removeAllChildren();
      REFERENCE_ORBITS_AU.forEach((distanceAU, index) => {
        const radiusPx = modelViewTransform.modelToViewDeltaX(distanceAU);
        referenceOrbitsNode.addChild(
          new Circle(radiusPx, {
            center: originView,
            stroke: HabitableZonesColors.orbitStrokeColorProperty,
            lineDash: [4, 4],
          }),
        );
        const label = REFERENCE_ORBIT_LABELS[index];
        if (label !== undefined) {
          const angle = Math.PI / 4;
          referenceOrbitsNode.addChild(
            new Text(label, {
              font: LABEL_FONT,
              fill: HabitableZonesColors.textColorProperty,
              left: originView.x + radiusPx * Math.cos(angle) + 2,
              centerY: Math.min(viewHeight - 8, originView.y + radiusPx * Math.sin(angle)),
            }),
          );
        }
      });
    };

    const updateRealSystemOrbits = (): void => {
      realSystemOrbitsNode.removeAllChildren();
      realPlanetMarkersNode.removeAllChildren();

      const system = findRealSystem(model.selectedRealSystemIdProperty.value);
      if (system === null) {
        return;
      }

      const star = SHZ_STARS[model.selectedStarIndexProperty.value];
      if (star === undefined) {
        return;
      }

      const massRatio = star.mass / sampleStar(star, model.ageProperty.value).mass;
      const selectedEffective = model.effectivePlanetDistanceProperty.value;

      for (const planet of system.planets) {
        const scaledAU = planet.semiMajorAxisAU * massRatio;
        const orbitRadiusPx = modelViewTransform.modelToViewDeltaX(scaledAU);
        const isHighlighted = Math.abs(scaledAU - selectedEffective) < 0.002;

        realSystemOrbitsNode.addChild(
          new Circle(orbitRadiusPx, {
            center: originView,
            stroke: isHighlighted
              ? HabitableZonesColors.accentColorProperty
              : HabitableZonesColors.orbitStrokeColorProperty,
            lineWidth: isHighlighted ? 2 : 1,
            lineDash: isHighlighted ? [] : [3, 3],
          }),
        );

        const marker = new Circle(3, {
          fill: HabitableZonesColors.planetColorProperty,
          x: originView.x + orbitRadiusPx,
          y: originView.y,
        });
        realPlanetMarkersNode.addChild(marker);

        realPlanetMarkersNode.addChild(
          new Text(planet.label, {
            font: LABEL_FONT,
            fill: HabitableZonesColors.textColorProperty,
            left: originView.x + orbitRadiusPx + 6,
            centerY: originView.y,
          }),
        );
      }
    };

    const updateHzBand = (): void => {
      const innerPx = modelViewTransform.modelToViewDeltaX(model.hzInnerProperty.value);
      const outerPx = modelViewTransform.modelToViewDeltaX(model.hzOuterProperty.value);
      const midPx = (innerPx + outerPx) / 2;
      hzBandNode.radius = Math.max(0.5, midPx);
      hzBandNode.lineWidth = Math.max(0, outerPx - innerPx);
      hzBandNode.center = originView;

      // Place the "Habitable Zone" label just above the band arc, clamped inside the box.
      hzLabel.centerX = Math.min(viewWidth - hzLabel.width / 2 - 4, originView.x + midPx);
      hzLabel.centerY = Math.max(hzLabel.height / 2 + 4, originView.y - midPx);
    };

    const updateAllGeometry = (): void => {
      updateGrid();
      updateScaleBar();
      updateReferenceOrbits();
      updateHzBand();

      const radiusAU = model.radiusSolarProperty.value * AU_PER_SOLAR_RADIUS;
      starNode.radius = Math.max(SHZ_STAR_MIN_VIEW_RADIUS, modelViewTransform.modelToViewDeltaX(radiusAU));
      starNode.center = originView;

      const effectiveDistance = model.effectivePlanetDistanceProperty.value;
      planetNode.x = originView.x + modelViewTransform.modelToViewDeltaX(effectiveDistance);
      planetNode.y = originView.y;

      updateRealSystemOrbits();

      const destroyed = model.isPlanetDestroyedProperty.value;
      planetNode.visible = !destroyed;
      destroyedIndicator.visible = destroyed;
      destroyedIndicator.center = new Vector2(planetNode.x, originView.y);
      lockedIndicator.visible = model.isPlanetTidallyLockedProperty.value && !destroyed;
    };

    const updateTransform = (): void => {
      modelViewTransform = ModelViewTransform2.createSinglePointScaleMapping(
        Vector2.ZERO,
        originView,
        shzDiagramPixelsPerAU(model.diagramZoomLevelProperty.value),
      );
      updateAllGeometry();
    };

    const updateGridVisibility = (): void => {
      gridNode.visible = model.showGridProperty.value;
    };
    model.showGridProperty.link(updateGridVisibility);

    const updateOrbitVisibility = (): void => {
      const noRealSystem = model.selectedRealSystemIdProperty.value === NONE_REAL_SYSTEM_ID;
      referenceOrbitsNode.visible = model.showReferenceOrbitsProperty.value && noRealSystem;
      realSystemOrbitsNode.visible = !noRealSystem;
      realPlanetMarkersNode.visible = !noRealSystem;
    };
    model.showReferenceOrbitsProperty.link(updateOrbitVisibility);
    model.selectedRealSystemIdProperty.link(updateOrbitVisibility);

    model.diagramZoomLevelProperty.link(updateTransform);
    model.hzInnerProperty.link(updateAllGeometry);
    model.hzOuterProperty.link(updateAllGeometry);
    model.radiusSolarProperty.link(updateAllGeometry);
    model.effectivePlanetDistanceProperty.link(updateAllGeometry);
    model.selectedStarIndexProperty.link(updateAllGeometry);
    model.ageProperty.link(updateAllGeometry);
    model.selectedRealSystemIdProperty.link(updateAllGeometry);
    model.isPlanetDestroyedProperty.link(updateAllGeometry);
    model.isPlanetTidallyLockedProperty.link(updateAllGeometry);

    const planetPositionProperty = {
      get value(): Vector2 {
        return new Vector2(model.effectivePlanetDistanceProperty.value, 0);
      },
      set value(newValue: Vector2) {
        model.setEffectivePlanetDistanceAU(Math.abs(newValue.x));
      },
    };

    planetNode.addInputListener(
      new DragListener({
        drag: (event) => {
          const local = contentLayer.globalToParentPoint(event.pointer.point);
          const distanceAU = (local.x - originView.x) / shzDiagramPixelsPerAU(model.diagramZoomLevelProperty.value);
          model.setEffectivePlanetDistanceAU(Math.max(0, distanceAU));
        },
      }),
    );

    const keyboardDragDelta = shzDiagramScaleBarAU(model.diagramZoomLevelProperty.value) / 10;
    planetNode.addInputListener(
      new KeyboardDragListener({
        positionProperty: planetPositionProperty,
        transform: modelViewTransform,
        dragDelta: keyboardDragDelta,
        shiftDragDelta: keyboardDragDelta / 2,
      }),
    );

    updateTransform();
    this.planetNode = planetNode;
  }
}
