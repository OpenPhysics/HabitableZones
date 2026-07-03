# Port NAAP "Habitable Zones" from Flash to SceneryStack

## Context

This repository is a **scaffold-only** SceneryStack port of the NAAP *Habitable
Zones* lab (two screens). Today both screens are a placeholder label + Reset All —
no model or physics. The goal of this plan is to implement the actual simulations.

We have three reference sources:

- **Decompiled Flash ActionScript** (authoritative physics) under
  `NAAP/decompiled/stellarHabitableZone004/scripts/` (circumstellar) and
  `NAAP/decompiled/milkyWayHabitability001-B/scripts/` (galactic).
- **A modern React/JS port of the circumstellar sim only** under
  `NAAP/astro-simulations/circumstellar-habitable-zone-simulator/src/` — cleaner
  to read; use it to cross-check the Flash maths.
- **The existing SceneryStack scaffold** under `src/` — defines all the
  conventions this plan must follow.

**Key finding that shapes the plan:** the *galactic* sim's model (the
metallicity-vs-radius and supernova-risk-vs-radius curves) was **pre-rendered as
Flash graphics** — no formulas survived decompilation. Its code does only radius
selection (1.2–22 kpc, no time, no computed band). The *circumstellar* sim is
fully recoverable.

**Decisions already made by the project owner:**
1. **Galactic** → reconstruct the model **parametrically** (smooth declining
   metallicity & risk curves matching the Flash plot shapes; GHZ = overlap band).
   Radius-only, **no time dimension** (faithful to the original).
2. **Circumstellar** → **full port, staged** (MVP first, then HR diagram,
   timeline, habitability plot, real systems).
3. **Stellar data** → **convert the 17-star evolution catalog** into a typed data
   module.

This plan is written to be executed step by step. Run the gate after each stage:
`npm run check && npm run lint && npm run build && npm test`. Do `npm run dev` and
look at the screen in a browser after each visual stage.

---

## Ground rules (read before writing any code)

Follow the existing scaffold conventions exactly. Concrete patterns to copy:

- **Models** implement `TModel` (`scenerystack/joist`); expose `public readonly`
  axon Properties; provide `reset()` (reset every Property) and `step(dt)`.
  Example to copy: `src/circumstellar/model/CircumstellarModel.ts`.
- **Views** extend `ScreenView` (`scenerystack/sim`); pass `screenSummaryContent`
  to `super()`; position with `this.layoutBounds`; control keyboard order with a
  wrapper `new Node({ pdomOrder: [...] })` (never set `pdomOrder` on the
  ScreenView). Example: `src/circumstellar/view/CircumstellarScreenView.ts`.
- **Colors** → add `ProfileColorProperty` entries to
  `src/HabitableZonesColors.ts` with both `default` and `projector` values. Never
  hardcode color strings in views.
- **Constants** → named exports in `src/HabitableZonesConstants.ts`, registered
  with the namespace at the bottom of the file.
- **Strings** → add the same keys to all three locale files
  (`src/i18n/strings_en.json`, `_es.json`, `_fr.json`) and expose them through
  `src/i18n/StringManager.ts`. The TS `satisfies` check enforces key parity. All
  user-visible and `accessibleName` text must come from `StringManager`, never
  literals. A11y strings live under `a11y.circumstellar.*` / `a11y.galactic.*`.
- **Accessibility** → every interactive node needs an `accessibleName` from
  StringManager; make each screen's `currentDetailsContent` a live
  `DerivedProperty` over model state (edit
  `src/circumstellar/view/CircumstellarScreenSummaryContent.ts` and the galactic
  equivalent).
- **Reuse the helpers already present:** `src/common/TimeModel.ts`
  (play/pause + elapsed time), `src/common/HabitableZonesPanel.ts` (pre-themed
  Panel).

**SceneryStack libraries to reuse instead of hand-rolling** (verify each import
path once against `node_modules/scenerystack`; fall back to manual `Path`/`Line`
drawing only if an import is missing):
- `ModelViewTransform2` (`scenerystack/phetcommon`) — map model units (AU, kpc) to
  view pixels. Use this for both screens instead of magic pixel math.
- `ShadedSphereNode` (`scenerystack/scenery-phet`) — render the star and the planet.
- `Slider` / `HSlider`, `ComboBox`, `Checkbox` (`scenerystack/sun`) — controls.
- `NumberControl`, `TimeControlNode`, `GridNode`, `ArrowNode`, `PhetFont`
  (`scenerystack/scenery-phet`) — distance/mass controls, play-pause, grid.
- `scenerystack/bamboo` (ChartTransform, ChartRectangle, AxisLine, TickMarkSet,
  TickLabelSet, GridLineSet, LinePlot, ScatterPlot) — the HR diagram, the
  habitability-vs-time plot, and the galactic metallicity/risk plots.
- `DerivedProperty`, `NumberProperty`, `BooleanProperty`, `Property`
  (`scenerystack/axon`); `Range`, `Vector2`, `Utils` (`scenerystack/dot`).

---

## Stage 0 — Shared foundation (constants, colors, strings, transform)

**Goal:** put the cross-cutting pieces in place so later stages just consume them.

**Files to edit:**
- `src/HabitableZonesConstants.ts` — add a "Physics" section:
  - `SOLAR_TEMPERATURE = 5808` (K) — from `SHZDiagramStar.as:11`.
  - `AU_PER_SOLAR_RADIUS = 0.00465` — from `SHZDiagramStar.as:17`.
  - `SOLAR_RADIUS_KM = 695700`, `KM_PER_AU = 149597870.7`.
  - Circumstellar HZ coefficients (from `…/MainTimeline.as` lines ~40/58/96/130):
    `HZ_OPTIMISTIC = { inner: 0.8, outer: 1.5 }`,
    `HZ_CONSERVATIVE = { inner: 0.95, outer: 1.37 }`.
  - Planet distance range: `PLANET_DISTANCE_RANGE_AU = new Range(0.01, 500)`.
  - Galactic: `GALACTIC_RADIUS_RANGE_KPC = new Range(1.2, 22)`,
    `SUN_GALACTOCENTRIC_KPC = 8`.
- `src/HabitableZonesColors.ts` — add: `habitableZoneFillColorProperty`
  (translucent green band), `starGlowColorProperty`, `tooHotColorProperty`
  (red), `temperateColorProperty` (green), `tooColdColorProperty` (blue),
  `metallicityCurveColorProperty`, `riskCurveColorProperty`,
  `ghzBandColorProperty`, `gridColorProperty`. Provide default + projector hexes.
- `src/i18n/strings_en.json` (+ `_es`, `_fr`) — add the string keys each stage
  needs (listed per-stage below) under `a11y.circumstellar.*`,
  `a11y.galactic.*`, and a new `circumstellar.*` / `galactic.*` section for
  visible UI labels (units like "AU", "kpc", control labels).
- `src/i18n/StringManager.ts` — add getters mirroring the new JSON sections.

**Verify:** `npm run check && npm run lint` passes (no behavior change yet).

---

# PART A — CIRCUMSTELLAR SCREEN

Reference physics doc to consult throughout (file:line cited inline):
- `NAAP/decompiled/stellarHabitableZone004/scripts/SHZ*.as`
- `NAAP/astro-simulations/circumstellar-habitable-zone-simulator/src/{diagram,star-properties,timeline}.jsx`, `src/utils/utils.js`

## Stage A0 — Convert the star catalog (data module)

**Goal:** ship the 17-star, time-indexed evolution catalog as typed TS.

The decoded catalog already exists at
`NAAP/astro-simulations/circumstellar-habitable-zone-simulator/src/shzStars.js`
(2.67 MB, `export const shzStarData = [ … ]`). The `.dat` file is zlib+AMF and
does **not** need re-decoding; the `.js` is the decoded form. (`scripts/shz_loader.py`
documents the schema if needed.)

**Do:**
1. Create `src/circumstellar/model/shzStars.ts`:
   - Copy the `shzStarData` array from the `.js`.
   - Add and export interfaces:
     ```ts
     export type StarEpoch = { type: number; time: number };
     export type StarDataPoint = { time: number; mass: number; logLum: number; logRadius: number; logTemp: number };
     export type StarRecord = { mass: number; timespan: number; epochsList: StarEpoch[]; dataTable: StarDataPoint[] };
     export const SHZ_STARS: StarRecord[] = [ … ];
     ```
   - Units: `time` in **years**; `logLum/logRadius/logTemp` are log₁₀ in **solar
     units / Kelvin**; `mass` in **solar masses**. Stars span 0.3–2.0 M☉ (17 of them).
   - Epoch `type` codes (from `SHZSystemHistory.as` + MainTimeline): 0 = main
     sequence start, 2 = subgiant (leaves MS), 3 = red giant, 10–12 = white dwarf,
     13 = neutron star, 14 = black hole, 15 = supernova. Add this as a comment + a
     `STAR_EPOCH_LABELS` record for the timeline.
2. **Bundle-size note:** 2.67 MB raw. Acceptable but heavy. Optional optimization
   (do only if build size is a problem): round the log values to 4 decimals and/or
   move it to a `.json` asset imported lazily. Keep it simple first.

**Helper module** — create `src/circumstellar/model/StarEvolution.ts` with pure
functions used everywhere:
```ts
// interpolate a star's dataTable at a given age (years) -> { logLum, logTemp, logRadius, mass }
export function sampleStar(star: StarRecord, ageYears: number): StarDataPoint
// solar-unit getters
export const luminosity = (p: StarDataPoint) => 10 ** p.logLum;       // L☉
export const temperatureK = (p: StarDataPoint) => 10 ** p.logTemp;    // K
export const radiusSolar = (p: StarDataPoint) => 10 ** p.logRadius;   // R☉
```
`sampleStar` does linear interpolation between bracketing `dataTable` entries by
`time` (clamp at ends).

**Verify:** add `tests/StarEvolution.test.ts` (vitest) asserting `sampleStar` at
`time=0` for the 1.0 M☉ star returns `logLum≈0, logTemp≈log10(5772)` and that
interpolation is monotonic across a couple of points. `npm test` green.

## Stage A1 — MVP: star + habitable zone + draggable planet + status

**Goal:** the core interaction. A top-down star with its HZ band; a planet you
move in/out; readout of too hot / temperate / too cold.

**Model — `src/circumstellar/model/CircumstellarModel.ts`:**
- `selectedStarIndexProperty: NumberProperty` (index into `SHZ_STARS`; default the
  1.0 M☉ Sun entry).
- `planetDistanceProperty: NumberProperty` (AU, range `PLANET_DISTANCE_RANGE_AU`,
  default 1.0).
- `hzModeProperty: Property<'optimistic'|'conservative'>` (default `'optimistic'`).
- `showReferenceOrbitsProperty: BooleanProperty` (default true).
- For Stage A1, evaluate the star at age 0 (`sampleStar(star, 0)`); the timeline
  in Stage A3 will replace the fixed age with `timeModel.timeProperty`.
- **Derived Properties** (use `DerivedProperty`):
  - `luminosityProperty` → `luminosity(sampleStar(star, age))`.
  - `hzInnerProperty = Math.sqrt(L) * coeff.inner`,
    `hzOuterProperty = Math.sqrt(L) * coeff.outer`
    (formula from `MainTimeline.as:677-679`; coeff from `hzModeProperty`).
  - `planetStatusProperty: DerivedProperty<'tooHot'|'temperate'|'tooCold'>`:
    `d < hzInner → tooHot; d > hzOuter → tooCold; else temperate`.
- `reset()` resets all; `step(dt)` is a no-op until Stage A3.

**View — `src/circumstellar/view/CircumstellarScreenView.ts`** plus new node files
under `src/circumstellar/view/`:
- `SHZDiagramNode.ts` — the main top-down diagram (model ref: `SHZDiagram.as`,
  `diagram.jsx`):
  - Build a `ModelViewTransform2` mapping AU→px (start with a fixed scale; add zoom
    in Stage A5). Center = star.
  - **Star:** `ShadedSphereNode`; radius in view from `radiusSolar * AU_PER_SOLAR_RADIUS`
    in AU → px (clamp to a sensible min pixel size so tiny stars stay visible);
    color from temperature via a blackbody approximation — add
    `src/circumstellar/view/blackbodyColor.ts` (a temperature→`Color` function;
    cross-check the mapping in `scripts/temp_loader.as`).
  - **HZ band:** an annulus (two circles / a `Path` with even-odd fill) between
    `hzInnerProperty` and `hzOuterProperty`, filled with
    `habitableZoneFillColorProperty`. Link both Properties to redraw.
  - **Planet:** `ShadedSphereNode`, draggable along radius. Use a `DragListener`
    constrained to distance; write back to `planetDistanceProperty`. Color from
    `planetStatusProperty` (`tooHot/temperate/tooCold` colors). Make it
    keyboard-operable (`tagName`, `focusable`, `accessibleName`, arrow-key
    handler via `KeyboardDragListener`).
  - **Reference orbits:** when `showReferenceOrbitsProperty`, draw dashed circles
    at the solar-system planet distances (Mercury 0.39 … Neptune 30.1 AU); model
    ref `SHZDiagramRefOrbits.as`.
  - **Scalebar + grid:** optional in A1, add in A5 (`SHZDiagramScalebar.as`,
    `SHZDiagramGrid.as`).
- `CircumstellarControlPanel.ts` — a `HabitableZonesPanel` containing:
  - Star selector: `ComboBox` over `SHZ_STARS` labelled by mass (e.g. "1.0 M☉"),
    bound to `selectedStarIndexProperty`.
  - Planet distance: `NumberControl` (logarithmic feel — a plain linear control is
    fine for v1) bound to `planetDistanceProperty`, units "AU".
  - HZ mode: a 2-button `RectangularRadioButtonGroup` or `ComboBox` for
    optimistic/conservative.
  - Reference-orbits `Checkbox`.
  - A status readout `Text` driven by `planetStatusProperty`.
- Wire `pdomOrder`: [star selector, distance control, hz mode, orbits checkbox,
  planet, reset]. Add the ResetAllButton (already in scaffold pattern) and call
  `model.reset()` + view reset.

**Strings to add:** `circumstellar.units.au`, `circumstellar.controls.starMass`,
`circumstellar.controls.planetDistance`, `circumstellar.controls.hzOptimistic`,
`circumstellar.controls.hzConservative`, `circumstellar.controls.showOrbits`,
`circumstellar.status.{tooHot,temperate,tooCold}`, plus matching
`a11y.circumstellar.controls.*` accessibleNames and update
`a11y.circumstellar.currentDetails` to a `DerivedProperty` describing star mass,
planet distance, and status.

**Verify:** `npm run dev`; on the Circumstellar screen, dragging the planet
in/out flips the status and recolors the planet; changing star mass resizes the
star and moves the HZ band; toggling HZ mode widens/narrows the band; tab order
and screen-reader summary read sensibly. Run the gate.

## Stage A2 — HR diagram

**Goal:** an HR diagram showing where the current star sits and its track.

Model ref: `SHZHRDiagram.as` (axes lines 42-45), `star-properties.jsx:89-130`.

- New `src/circumstellar/view/HRDiagramNode.ts` using `scenerystack/bamboo`:
  - X = log₁₀(T), domain **reversed**, T from 50000→2500 K
    (`minLogTemp=log10(2500)≈3.398`, `maxLogTemp=log10(50000)≈4.699`).
  - Y = log₁₀(L), L from 1e-4 to 1e7 L☉ (`minLogLum=-4, maxLogLum=7`).
  - Draw a faint main-sequence reference curve (sample it from the catalog's
    age-0 points across the 17 stars, or the polynomial in `SHZHRDiagram.as:57-120`).
  - `ScatterPlot`/`LinePlot` of the selected star's `dataTable` up to the current
    age (full table in A2; clipped by time in A3), plus a highlighted marker at
    the current `(logTemp, logLum)`.
- Add to the ScreenView layout (e.g. a panel beside/below the diagram).

**Verify:** changing star mass moves the marker along the main sequence; the track
matches the catalog. Gate.

## Stage A3 — Evolution timeline (animated)

**Goal:** advance the star's age; everything (star size/color, HZ band, HR marker,
status) updates as the star evolves.

Model ref: `SHZTimeline.as` (time formatting 136-156), `SHZTimelineCursor.as`,
`timeline.jsx`.

- **Model:** compose `TimeModel` (`src/common/TimeModel.ts`) into
  `CircumstellarModel`. Add `ageProperty` (years) driven by the timeline; replace
  the fixed `age=0` in Stage A1's derived Properties with this age. Add a
  `timeSpeedProperty` (multiplier). In `step(dt)`: advance age while playing,
  scaled so the full `star.timespan` is traversable in a reasonable wall-clock
  time; clamp at `[0, timespan]`. Re-derive everything from `sampleStar(star, age)`.
- **View:** `src/circumstellar/view/SHZTimelineNode.ts`:
  - A horizontal axis 0…`timespan` with a **draggable cursor** bound to
    `ageProperty` (mirror `SHZTimelineCursor.as`).
  - `TimeControlNode` (play/pause + step) bound to `TimeModel.isPlayingProperty`;
    optional speed control.
  - Age readout formatted as My/Gy (divide years by 1e6 / 1e9; logic from
    `SHZTimeline.as:136-156`).
  - Tick marks for epoch events from `star.epochsList` (labelled via
    `STAR_EPOCH_LABELS`).

**Verify:** pressing play ages the star; a 1.0 M☉ star brightens and the HZ band
moves outward over time; dragging the cursor scrubs; epoch ticks line up. Gate.

## Stage A4 — Habitability-vs-time plot

**Goal:** show, for the current planet distance, the bands of time during which the
planet is too hot / temperate / too cold.

Model ref: `SHZHabitabilityPlot.as`, `timeline.jsx` (`getPlanetTemp` 64-70).

- New `src/circumstellar/view/HabitabilityPlotNode.ts`:
  - X axis = time (aligned with the timeline). For each `dataTable` entry compute
    HZ inner/outer and classify the **current planet distance** → colored band
    (too hot red / temperate green / too cold blue).
  - Optionally overlay planet equilibrium temperature using
    `T_eq = (R_star_m² · T_star⁴ / (4 d_m²))^0.25 − 273 °C`
    (from `timeline.jsx:64-70`; convert R☉→m with `SOLAR_RADIUS_KM`, AU→m with
    `KM_PER_AU`).
  - A cursor synced to `ageProperty`.

**Verify:** moving the planet changes the colored bands; the temperate band for
Earth-like distance around the Sun spans most of its main sequence. Gate.

## Stage A5 — Real systems, polish, tidal locking

**Goal:** finishing touches matching the original.

- **Real exoplanet systems** (`MainTimeline.as:507-595`): add a preset selector
  (Gliese 581, 55 Cancri A, 51 Pegasi, HD 40307, HD 189733, HD 93083) that sets
  star + planet distance(s) and overlays the real planets. Data → a small
  `src/circumstellar/model/realSystems.ts`.
- **Zoom + scalebar + grid** on `SHZDiagramNode` (`SHZDiagramScalebar.as`,
  `SHZDiagramGrid.as`, the 25 zoom levels in `diagram.jsx:71-97`).
- **Tidal locking / destruction** (`MainTimeline.as:745-799`): compute
  `timePlanetTidallyLocked` / `timePlanetDestroyed` and indicate on the planet /
  timeline. (Lowest priority — implement only if time allows; the constants and
  formulae are in those lines.)

**Verify:** presets load correctly; zoom + scalebar read correct AU; gate.

---

# PART B — GALACTIC SCREEN (parametric reconstruction)

The original (`milkyWayHabitability001-B`) is a presentation layer: a draggable
radius cursor (`DefineSprite_65/frame_1/DoAction.as`: `setRadius` clamps to
[1.2, 22] kpc, reset → 18) linked across a galaxy disc (`MilkyWayComponent.as`,
19 px/kpc) and two **pre-rendered** plots (`MetalsPlot.as`, `RiskPlot.as`, 14.7
px/kpc). The pedagogy (`NAAP/astroUNL/naap/habitablezones/ghz.html`): metallicity
**decreases outward** (favors planets inward); cosmic threats (supernovae, central
black-hole radiation, Oort perturbations) **increase inward**; the GHZ is the
intermediate **annulus** where both are acceptable. We reconstruct the two curves
parametrically (no time dimension, matching the original).

## Stage B1 — Galactic model

**Model — `src/galactic/model/GalacticModel.ts`:**
- `selectedRadiusProperty: NumberProperty` (kpc, range `GALACTIC_RADIUS_RANGE_KPC`
  = [1.2, 22]; default `SUN_GALACTOCENTRIC_KPC` = 8 — note the Flash reset value
  was 18; 8 kpc (the Sun) is the more meaningful default, but match the owner's
  preference if asked).
- Pure model functions (add to a `src/galactic/model/galacticHabitability.ts`):
  - `metallicity(r)`: normalized 0..1, **decreasing outward**. Use the Milky Way
    radial [Fe/H] gradient ≈ −0.07 dex/kpc:
    `Z(r) = 10 ** (-0.07 * (r - SUN_GALACTOCENTRIC_KPC))`, then normalize so the
    plotted curve runs ~1 near center → ~0 at the rim. Document the coefficient.
  - `risk(r)`: catastrophic-event probability, normalized 0..1, **decreasing
    outward** (supernova frequency ~1 Gyr⁻¹ at the Sun, much higher inward per
    `ghz.html`). Use an exponential, e.g.
    `risk(r) = exp(-(r - rMin) / RISK_SCALE_KPC)` normalized to 1 at center.
  - `habitability(r) = metallicity(r) * (1 - risk(r))` (smooth product; peaks at an
    intermediate radius — this is the teaching point).
- Derived Properties:
  - `metallicityAtSelectedProperty`, `riskAtSelectedProperty`,
    `habitabilityAtSelectedProperty` (sample the functions at `selectedRadius`).
  - `ghzInnerProperty` / `ghzOuterProperty`: the radii where `metallicity(r) ≥
    METALLICITY_THRESHOLD` **and** `risk(r) ≤ RISK_THRESHOLD` (solve/scan over the
    radius range). Pick thresholds so the band lands at a believable ~5–12 kpc
    (tune visually). Define the thresholds as named constants.
- `reset()` resets `selectedRadiusProperty`; `step` is a no-op (no time).

**Tests:** `tests/galacticHabitability.test.ts` — metallicity is monotonically
decreasing, risk decreasing, habitability has an interior maximum, and
`ghzInner < ghzOuter` within [1.2, 22].

## Stage B2 — Galactic view

**View — `src/galactic/view/GalacticScreenView.ts`** + node files:
- `MilkyWayDiscNode.ts` — top-down galaxy disc using a `ModelViewTransform2`
  (kpc→px). Draw: the disc out to 22 kpc, the **GHZ annulus**
  (`ghzInner..ghzOuter`, `ghzBandColorProperty`), the Sun marker at 8 kpc, and a
  draggable **selected-radius ring/cursor** bound to `selectedRadiusProperty`
  (mirror `MilkyWayComponent.setCircleRadius`). Optional decorative spiral arms.
- `MetallicityPlotNode.ts` and `RiskPlotNode.ts` using `scenerystack/bamboo`:
  X = radius (kpc), Y = normalized value; plot the curve + a shaded GHZ region +
  a draggable cursor synced to `selectedRadiusProperty` (mirrors
  `MetalsPlot.onCursorDragged` / `RiskPlot.onCursorDragged` writing back radius).
  Titles: "Heavy Elements Abundance" and "Catastrophic Event Probability".
- All three views **share one** `selectedRadiusProperty` — dragging any cursor
  moves the others (this is the core original behavior: `setRadius` fanned out to
  all three).
- A `HabitableZonesPanel` with a radius `NumberControl` (units "kpc") and a
  readout of metallicity / risk / habitability at the selected radius.
- `pdomOrder`, accessibleNames, and a live `currentDetails` DerivedProperty
  describing the selected radius and whether it falls inside the GHZ.

**Strings:** `galactic.units.kpc`, `galactic.controls.radius`,
`galactic.plots.{metallicity,risk}Title`, `galactic.readout.*`, and the
`a11y.galactic.*` set (update `GalacticScreenSummaryContent.ts`).

**Verify:** `npm run dev`; dragging the radius cursor on any of the disc / two
plots moves all three; the GHZ annulus highlights the intermediate band; readouts
update; tab order + summary sensible. Gate.

## Stage B3 — Polish

- Tune curve coefficients and thresholds so the visual matches the Flash plot
  shapes (open the original via the `.swf` or the conceptual figures in
  `NAAP/astroUNL/naap/habitablezones/` if a reference image helps).
- Projector-mode color pass; keyboard drag for the cursor; final a11y review.

---

## Cross-cutting verification (run after each stage)

1. **Gate:** `npm run check && npm run lint && npm run build && npm test`.
2. **Manual:** `npm run dev`, exercise the stage's interactions in a browser
   (drag planet/radius, change star, play timeline, toggle modes). The Playwright
   MCP browser tools can automate screenshots/clicks if desired.
3. **A11y:** tab through every control (each has a spoken name); the screen
   summary's *current details* reflects live state.
4. **Both profiles:** toggle projector mode (Preferences) and confirm contrast.

---

## File map (what gets created/edited)

**Shared:** `src/HabitableZonesConstants.ts`, `src/HabitableZonesColors.ts`,
`src/i18n/strings_{en,es,fr}.json`, `src/i18n/StringManager.ts`.

**Circumstellar (new):** `model/shzStars.ts`, `model/StarEvolution.ts`,
`model/realSystems.ts`, `view/SHZDiagramNode.ts`, `view/blackbodyColor.ts`,
`view/CircumstellarControlPanel.ts`, `view/HRDiagramNode.ts`,
`view/SHZTimelineNode.ts`, `view/HabitabilityPlotNode.ts`.
**Circumstellar (edit):** `model/CircumstellarModel.ts`,
`view/CircumstellarScreenView.ts`, `view/CircumstellarScreenSummaryContent.ts`.

**Galactic (new):** `model/galacticHabitability.ts`, `view/MilkyWayDiscNode.ts`,
`view/MetallicityPlotNode.ts`, `view/RiskPlotNode.ts`.
**Galactic (edit):** `model/GalacticModel.ts`, `view/GalacticScreenView.ts`,
`view/GalacticScreenSummaryContent.ts`.

**Tests:** `tests/StarEvolution.test.ts`, `tests/galacticHabitability.test.ts`.

## Reference index (where each formula/behavior lives)

| Topic | Authoritative source |
|---|---|
| HZ inner/outer = √L · coeff | `…/stellarHabitableZone004/…/MainTimeline.as:677-679`; coeffs ~40/58/96/130; cross-check `circumstellar…/src/utils/utils.js` `getHZone` |
| Star L/T/R vs age | catalog `shzStars.js`; schema in `circumstellar…/scripts/shz_loader.py` |
| HR diagram axes & fits | `SHZHRDiagram.as:42-45, 57-120`; `star-properties.jsx:89-130` |
| Timeline + time formatting | `SHZTimeline.as:136-156`, `SHZTimelineCursor.as`, `timeline.jsx` |
| Epoch event types | `SHZSystemHistory.as:32-42` |
| Planet temperature | `timeline.jsx:64-70` |
| Tidal locking / destruction | `MainTimeline.as:745-799` |
| Real systems | `MainTimeline.as:507-595` |
| Diagram scaling / zoom / scalebar / grid | `SHZDiagram.as`, `diagram.jsx:71-97`, `SHZDiagramScalebar.as`, `SHZDiagramGrid.as`, `SHZDiagramRefOrbits.as` |
| Galactic radius selection (1.2–22 kpc) | `milkyWayHabitability001-B/…/DefineSprite_65/frame_1/DoAction.as` |
| Galactic disc / plot scaling | `MilkyWayComponent.as` (19 px/kpc), `MetalsPlot.as`/`RiskPlot.as` (14.7 px/kpc) |
| Galactic concept (curve shapes) | `NAAP/astroUNL/naap/habitablezones/ghz.html` |

## Notes / risks

- **Galactic curves are reconstructed, not original** — exact pixel fidelity is
  impossible; tune coefficients/thresholds to match the plot *shapes* and land the
  GHZ band at a believable radius. Document chosen coefficients as named constants.
- **`shzStars.ts` is ~2.7 MB** — fine to start; optimize precision/lazy-load only
  if bundle size becomes a problem.
- **Verify SceneryStack import paths** (`bamboo`, `ShadedSphereNode`,
  `ModelViewTransform2`, `TimeControlNode`) against `node_modules/scenerystack`
  the first time each is used; fall back to manual drawing if any is absent.
- **Status classification:** use direct distance comparison (`d<inner→hot`,
  `d>outer→cold`) — clearer than the Flash `shzTemp = 1-(d-inner)/(outer-inner)`
  formulation, but equivalent.
