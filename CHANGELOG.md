# Changelog

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
- No Home Assistant entity bindings in v0.0.1; dynamic data is intentionally deferred.
- HACS-compatible single-file package, no build step and no runtime dependencies.
