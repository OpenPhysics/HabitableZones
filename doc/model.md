# Model - Habitable Zones

This document describes the model (the underlying physics, math, and behavior) for the simulation, in
terms appropriate for an educator. It is the companion to
[implementation-notes.md](./implementation-notes.md), which targets developers.

## Overview

This sim ports the NAAP *Habitable Zones* lab and has two screens that ask where liquid-water
conditions can persist — around a single star, and across the Milky Way.

- **Circumstellar** follows a star through its evolutionary track. As luminosity changes, the
  circumstellar habitable zone (HZ) moves. Students place a planet at a chosen distance, scrub or play
  the stellar timeline, switch between optimistic and conservative HZ limits, overlay solar-system
  reference orbits, and load real exoplanet systems. Markers show when the planet would become
  tidally locked or be destroyed as the star expands and loses mass.
- **Galactic** lets students pick a galactocentric radius and read off normalized metallicity,
  catastrophic-event risk, and a combined habitability score. The galactic habitable zone (GHZ) is the
  annular band where metallicity is high enough and risk low enough. Those radial curves are a
  **parametric reconstruction** of the NAAP pedagogy, not a byte-for-byte port of unpublished Flash
  formulae.

Together the screens connect “is this orbit temperate?” with “is this neighborhood of the Galaxy
favorable for rocky planets and long-term stability?”

## Quantities and units

| Quantity | Symbol | Units | Range / notes |
|---|---|---|---|
| Stellar mass (catalog) | M₀ | M☉ | 0.3–30 (17-star evolution catalog) |
| Stellar age | t | years since ZAMS | 0 – star’s timespan |
| Luminosity / radius / Teff | L, R, T | L☉, R☉, K | sampled from the track |
| Planet distance (zero-age) | d₀ | AU | ~0.01–500 |
| Effective planet distance | d_eff | AU | scales as M₀/M(t) |
| HZ inner / outer | d_in, d_out | AU | √(L/L☉) × coefficients |
| Galactocentric radius | R | kiloparsecs (kpc) | 1.2–22 (Sun ≈ 8 kpc) |
| Metallicity / risk / habitability | — | normalized 0–1 | Galactic screen |

## Governing equations

### Circumstellar habitable zone

At each age the star’s luminosity *L* (in solar units) sets the HZ edges:

```
d_in  = √(L / L☉) · c_in
d_out = √(L / L☉) · c_out
```

Optimistic limits use `c_in = 0.8`, `c_out = 1.5` (AU for a solar twin). Conservative limits use
`0.95` and `1.37`. The planet is classified too hot / temperate / too cold by comparing its
**effective** distance to those edges.

### Orbital distance while the star evolves

As the star loses mass, specific angular momentum conservation in the NAAP model stretches the orbit:

```
d_eff(t) = d₀ · (M₀ / M(t))
```

Destruction occurs when `d_eff` falls inside a Roche-like limit based on the star’s instantaneous
radius and density. Tidal-locking time is estimated from an Earth-like spin-down formula that depends
strongly on distance (∝ d⁶) and stellar mass.

### Stellar tracks

Seventeen tabulated stars (0.3–30 M☉) store mass, log luminosity, log radius, and log temperature
versus age. Values at intermediate ages are linearly interpolated. Epoch markers follow Hurley–Pols–Tout
stellar-type codes for main-sequence end and final remnant.

### Galactic habitability (reconstructed)

Relative to the Sun’s radius (~8 kpc), metallicity follows a radial [Fe/H] gradient
(~−0.07 dex/kpc), then is normalized across the plotted range. Catastrophic risk falls off
exponentially with radius (more events toward the center). Combined habitability is

```
H(R) = Z(R) · (1 − Risk(R))
```

The GHZ is the contiguous annulus where normalized metallicity exceeds a threshold and risk stays
below another (tuned so the band sits roughly in the mid-disk, consistent with the lab narrative).

## Simplifications and assumptions

- Circumstellar HZ uses **insolation-only** scaling with luminosity; no climate, atmosphere, or
  greenhouse modeling beyond the optimistic/conservative coefficient pairs.
- Planet is a test particle: no feedback on the star; tidal lock and destruction are diagnostic
  markers, not full dynamical integrations.
- Reference solar-system orbits are circular and fixed in AU.
- Galactic curves are **pedagogical reconstructions**, not the original Flash plot data or a full
  chemical-evolution / supernova-rate model of the Milky Way.
- Real exoplanet presets lock the host to catalog parameters and place planets at listed pericenters.

## References

- NAAP *Habitable Zones* lab: circumstellar and galactic simulators / student guide under
  `NAAP/astroUNL/naap/`.
- Circumstellar evolution catalog transcribed from the NAAP circumstellar habitable-zone simulator
  (`shzStars` data; Hurley, Pols & Tout 2000 stellar-type codes).
- Galactic metallicity gradient scale consistent with published Milky Way [Fe/H] gradients (e.g. Lin
  et al. 2017); risk/habitability thresholds chosen for classroom GHZ geometry.
