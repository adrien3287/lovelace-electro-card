# Changelog

## v0.0.2 — 2026-09-11

First entity-driven release.

- Added Home Assistant entity bindings for grid, balcony PV / MPPT, MultiPlus, loads and batteries.
- Added derived grid import/export handling from one signed power sensor.
- Added averaged display for three-phase grid voltage.
- Corrected oversized SVG arrowheads by using absolute user-space marker sizing.
- Corrected left/right battery arrow directions.
- Battery convention: positive = charge, negative = discharge.
- Individual Dyness power sensors drive left/right battery arrows when available, with total battery power as fallback.
- Kept the approved roof → left MPPT and balcony → right MPPT topology.
- Allows the roof / left MPPT side to remain unconfigured while not yet operational.
- HACS entry point is now `lovelace-electro-card-v0.0.2.js`, which imports the v0.0.1 visual baseline and applies the v0.0.2 overlays.

## v0.0.1 — 2026-09-11

Initial visual-baseline release.

- Static 2D single-SVG Lovelace electrical-system drawing.
- Public grid, meter and main house distribution board.
- Two independent PV inputs: south roof 30° → left MPPT; south balcony 60° → right MPPT.
- Two Victron-style SmartSolar MPPT 150/35 controllers.
- Victron-style MultiPlus 48/2000/25-32.
- Separate summary blocks for backup and critical loads.
- Two compact Dyness batteries flanking a central SmartShunt total block.
- Fixed arrows and electrical links matching the approved geometry.
- No Home Assistant entity bindings in v0.0.1; dynamic data intentionally deferred.
- HACS-compatible single-file baseline, no build step and no runtime dependencies.
