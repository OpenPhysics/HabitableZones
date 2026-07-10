# CLAUDE.md — Habitable Zones

Sim-specific context for AI assistants. General SceneryStack guidance: [OpenPhysics/.github/CLAUDE.md](https://github.com/OpenPhysics/.github/blob/main/CLAUDE.md).

## Project

A two-screen SceneryStack simulation porting the NAAP **Habitable Zones** lab,
scaffolded from `TemplateSingleSim`. Both screens are implemented: Circumstellar
has a full star-evolution / HZ model; Galactic uses parametric habitability curves
at a selected galactic radius.

- **Circumstellar** (`src/circumstellar/`) — port of the NAAP *Circumstellar Habitable Zone Simulator* (`stellarHabitableZone.swf`): a star with its circumstellar habitable zone and an orbiting planet.
- **Galactic** (`src/galactic/`) — port of the NAAP *Galactic / Milky Way Habitability Simulator* (`milkyWayHabitability.swf`): the band of the Milky Way that forms the galactic habitable zone.

Shared code keeps the `HabitableZones` prefix; per-screen code uses the
`Circumstellar` / `Galactic` prefixes. Concept-named folders, no `-screen` suffix.

## Key files

| File | Purpose |
|---|---|
| `src/HabitableZonesColors.ts` | All `ProfileColorProperty` instances (default + projector) |
| `src/HabitableZonesConstants.ts` | Named numeric constants (layout px, physics SI units) |
| `src/HabitableZonesNamespace.ts` | Namespace used by `.register()` |
| `src/common/HabitableZonesPanel.ts` | Pre-themed `Panel` wrapper (uses `HabitableZonesColors`) |
| `src/common/TimeModel.ts` | Composable play/pause + elapsed-time model for animated sims |
| `src/i18n/StringManager.ts` | Singleton localized string accessor; per-screen name + a11y getters |
| `src/main.ts` | Entry point; registers both screens with the Sim |
| `src/circumstellar/CircumstellarScreen.ts` | `Screen<CircumstellarModel, CircumstellarScreenView>` wrapper |
| `src/circumstellar/model/CircumstellarModel.ts` | Circumstellar screen state (star catalog, HZ, timeline) |
| `src/circumstellar/view/CircumstellarScreenView.ts` | Circumstellar visuals, `screenSummaryContent` + `pdomOrder` |
| `src/galactic/GalacticScreen.ts` | `Screen<GalacticModel, GalacticScreenView>` wrapper |
| `src/galactic/model/GalacticModel.ts` | Galactic screen state (radius → metallicity/risk/habitability) |
| `src/galactic/view/GalacticScreenView.ts` | Galactic visuals, `screenSummaryContent` + `pdomOrder` |
| `src/preferences/habitableZonesQueryParameters.ts` | `QueryStringMachine` parameters |
| `scripts/decompile-flash.ts` | Extract ActionScript from the NAAP Flash `.swf` sources via JPEXS FFDec (→ `NAAP/decompiled/`) |

## Screens

Two screens registered in `src/main.ts`, in this order:

1. **Circumstellar** (`src/circumstellar/`) — Circumstellar Habitable Zone Simulator
2. **Galactic** (`src/galactic/`) — Galactic / Milky Way Habitability Simulator

When implementing: put shared physics in `src/common/`, per-screen state in each
`*Model.ts`. Per-screen a11y lives under `a11y.<screenKey>` in each locale JSON,
exposed via `StringManager.getCircumstellarA11yStrings()` /
`getGalacticA11yStrings()`. Make each `currentDetailsContent` a live
`DerivedProperty` over model state and add `accessibleName`s to every interactive node.

## Decompiling the Flash sources

`npm run decompile` (script: `scripts/decompile-flash.ts`) extracts readable
ActionScript from the NAAP Flash movies so the port can be diffed against the
originals. The `.fla` files are old binary projects no tool reads directly, so the
script decompiles their sibling compiled `.swf` via **JPEXS FFDec** (needs Java).

```sh
npm run decompile                 # the two HZ simulators → NAAP/decompiled/<name>/scripts/*.as
npm run decompile -- --all        # the two simulators + the rotation-curve concept demo
npm run decompile -- --list       # dry run: print what would be decompiled
npm run decompile -- --setup      # one-time: download FFDec into tools/ffdec/
```

By default the two primary simulators decompile (one per screen):
`stellarHabitableZone004` (Circumstellar) and `milkyWayHabitability001-B`
(Galactic). Output goes to `NAAP/decompiled/` (git-ignored, along with `tools/ffdec/`).
The decompiled AS is a **read-only reference** — transcribe the maths into typed
TS in `src/`; don't vendor it.

## npm scripts

`start`/`dev` (vite) · `build` · `build:single` · `check` (tsc) · `lint`/`fix` (biome) ·
`test` (vitest) · `icons` · `decompile` · `rename`. Gate: `npm run check && npm run lint && npm run build && npm test`.

## PWA

After `npm run build`, the sim is installable offline via Workbox (`dist/manifest.webmanifest`).
