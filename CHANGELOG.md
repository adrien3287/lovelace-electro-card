# Changelog

## v0.0.7 — 2026-09-12

Battery forecast panel and power alignment.

- Aligned house, backup-load and critical-load power values on the same baseline.
- Added a three-row battery forecast panel in the former meter area.
- Added time-to-target-SOC, remaining-autonomy and charge/discharge-rate values.
- Uses the requested three Home Assistant sensors as defaults.
- Added all three forecast sensors to the graphical editor.
- Preserves sensor units from Home Assistant.
- HACS entry point is now `lovelace-electro-card-v0.0.7.js`.

## v0.0.6 — 2026-09-12

Visual alignment and labelling polish.

- Changed all DC connection lines and DC badge outlines from blue to red.
- Reduced and moved the grid pylon beside the grid title and signed power.
- Increased grid phase measurements to the standard card value size.
- Renamed battery headers to `Batterie gauche` and `Batterie droite`.
- Renamed both battery product rows to `Dyness PowerHaus 5,12 kWh`.
- Removed the house icon and `Autres charges maison` label from the main board.
- Raised both load icons by 5 px and reduced the critical-load icon to 90%.
- Standardised PV and MPPT value-row spacing to 29 SVG units.
- HACS entry point is now `lovelace-electro-card-v0.0.6.js`.

## v0.0.5 — 2026-09-12

Simplified, measurement-first grid display.

- Removed the separate electricity meter block.
- Connected the public grid directly to the main house distribution board.
- Replaced import/export rows with one signed grid-power value.
- The grid indicator is green when power is positive and red when negative.
- Added voltage, current and power columns for L1, L2 and L3.
- Added six phase-current/phase-power selectors to the graphical editor.
- Removed every directional arrowhead from system flow lines.
- Retained colour-coded AC, DC and grid connections.
- HACS entry point is now `lovelace-electro-card-v0.0.5.js`.

## v0.0.4 — 2026-09-11

Urgent live-value regression fix.

- Restored updates for grid import/export, PV, MPPT, loads, Dyness and SmartShunt values.
- Fixed the v0.0.3 `hass` lifecycle override that refreshed only the L1/L2/L3 overlay.
- Re-renders only when a configured entity changes, avoiding unnecessary redraws.
- Keeps the larger arrows, separate phase voltages and graphical editor from v0.0.3.
- HACS entry point is now `lovelace-electro-card-v0.0.4.js`.

## v0.0.3 — 2026-09-11

Visual polish and graphical configuration release.

- Enlarged all SVG flow arrowheads from 14 to 20 user-space units.
- Preserved absolute marker sizing so line width cannot distort arrowheads.
- Replaced the averaged grid voltage with separate L1, L2 and L3 values.
- Realigned the grid voltage/frequency rows and their electrical icon.
- Added a native Home Assistant graphical card editor.
- Added grouped entity pickers for every supported sensor.
- Added explicit `grid_voltage_l1`, `grid_voltage_l2` and `grid_voltage_l3` options.
- Kept backward compatibility with the v0.0.2 `grid_voltage` array.
- HACS entry point is now `lovelace-electro-card-v0.0.3.js`.

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
