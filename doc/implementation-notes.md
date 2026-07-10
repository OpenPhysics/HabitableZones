# Implementation Notes - Habitable Zones

## Architecture overview

Two independent screens. Circumstellar owns a rich evolution + HZ model; Galactic is a thin parametric
radius → metallicity / risk / habitability layer. Shared chrome lives in `src/common/`.

```
main.ts
  ├─ CircumstellarScreen     (Screen<CircumstellarModel, CircumstellarScreenView>)
  │    ├─ circumstellar/model/   CircumstellarModel, StarEvolution, planetEvolution,
  │    │                         shzStars, realSystems, …
  │    └─ circumstellar/view/    SHZ diagram, timeline, HR / habitability plots, panels
  └─ GalacticScreen          (Screen<GalacticModel, GalacticScreenView>)
       ├─ galactic/model/        GalacticModel, galacticHabitability
       └─ galactic/view/         Milky Way disc, radius plot, control panel

src/common/
  ├─ TimeModel.ts              play/pause (used by Circumstellar timeline)
  └─ HabitableZonesPanel.ts    pre-themed Panel (HabitableZonesColors)

src/preferences/
  ├─ HabitableZonesPreferencesModel   empty scaffold
  ├─ HabitableZonesPreferencesNode
  └─ habitableZonesQueryParameters
```

Model → View via AXON Properties. Educator-facing math: [model.md](./model.md).

## Model components

### CircumstellarModel (`circumstellar/model/`)

Rich coordinator: selected star index into `SHZ_STARS`, age, zero-age planet distance, HZ mode
(optimistic / conservative), real-system preset, diagram zoom, reference-orbit / grid toggles, and
timeline `animationRateProperty`. Composes `TimeModel`; `step(dt)` advances stellar age when playing.

Derived state includes current mass / L / T / R (via `StarEvolution.sampleStar`), mass-scaled
`effectivePlanetDistance`, HZ edges `√L · coeff`, planet status, tidal-lock and destruction times
(`planetEvolution`), and real-system pericenter lists (`realSystems`).

### shzStars

Large vendored catalog: **17** evolutionary tracks (0.3–30 M☉), time-indexed `dataTable` + epoch list.
Do not hand-edit; regenerate from the NAAP source if the data change.

### GalacticModel (`galactic/model/`)

Thin: one `selectedRadiusProperty` (kpc) and derived metallicity, risk, habitability, GHZ bounds, and
inside-GHZ flag. `galacticHabitability.ts` holds the parametric curves and `findGhzBounds()` scan.
`step` is a no-op (no time dimension).

## View components

Circumstellar view is diagram-heavy (top-down SHZ, timeline scrubber, optional HR / habitability
plots, general settings). Galactic view shows a disc + radius plot and readouts. Both use
`HabitableZonesPanel` and projector-aware colors.

## Preferences

Empty scaffold (same pattern as Extrasolar Planets) — tandem reserved; no sim-specific prefs yet.

## Disposal

Screen-lifetime architecture: models/views persist for the sim session. No mid-run dispose of the
main Property graphs; dynamic UI should follow SceneryStack norms if short-lived nodes are added later.

## Tests

`tests/`: `StarEvolution`, `planetEvolution`, `galacticHabitability`, `TimeModel`.

## Multi-screen

Independent-state pattern — see [multi-screen.md](./multi-screen.md). Circumstellar and Galactic labs
do not share model state.
