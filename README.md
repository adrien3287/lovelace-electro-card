# Lovelace Electro Card

**Version: 0.0.2**

A compact 2D Home Assistant Lovelace card for a residential backup / solar system.

## v0.0.2

Version 0.0.2 keeps the approved v0.0.1 geometry and adds live Home Assistant values plus corrected flow arrows.

Changes in this version:

- grid import/export derived from one signed power sensor,
- average voltage from the three grid phases,
- live balcony PV / MPPT values,
- live backup and critical-load values,
- live Dyness left/right battery values,
- live SmartShunt total battery values,
- battery flow convention: **positive = charge, negative = discharge**,
- corrected SVG arrow sizing using `markerUnits="userSpaceOnUse"`, so arrowheads no longer scale with line width,
- corrected left/right battery arrow directions,
- roof PV / left MPPT may remain unconfigured until commissioned.

The topology remains:

```text
PV Sud Toiture (30°) ──> MPPT gauche ──┐
                                        ├──> MultiPlus ──> Charges secourues
PV Sud Balcon (60°) ──> MPPT droit ─────┘              └─> Charges critiques

Réseau public <──> Compteur <──> Tableau général maison <──> MultiPlus

Batterie gauche <──> SmartShunt <──> Batterie droite
                         ⇅
                    MultiPlus DC
```

## Installation with HACS

Repository:

```text
https://github.com/adrien3287/lovelace-electro-card
```

In HACS:

1. Open **HACS**.
2. Open **Custom repositories**.
3. Add the repository URL above.
4. Select **Dashboard** as repository type.
5. Install **Lovelace Electro Card**.

HACS v0.0.2 entry point:

```text
/hacsfiles/lovelace-electro-card/lovelace-electro-card-v0.0.2.js
```

The v0.0.2 entry point imports the validated `lovelace-electro-card.js` v0.0.1 visual baseline and applies live-value and flow overlays.

## Card type

```yaml
type: custom:lovelace-electro-card
```

## Configuration used for this installation

```yaml
type: custom:lovelace-electro-card

# Réseau public
# Positive = import, negative = export
grid_import_power: sensor.compteur_general_puissance
grid_export_power: none
grid_voltage:
  - sensor.shellypro3em_fce8c0d97e64_phase_a_tension
  - sensor.shellypro3em_fce8c0d97e64_phase_b_tension
  - sensor.shellypro3em_fce8c0d97e64_phase_c_tension
grid_frequency: sensor.shellypro3em_fce8c0d97e64_phase_a_frequence

# Tableau général / autres charges
house_main_power: none
other_house_loads_power: none

# PV toiture / MPPT gauche - pas encore opérationnel
pv_roof_power: none
pv_roof_energy: none
pv_roof_voltage: none
mppt_left_power: none
mppt_left_current: none
mppt_left_voltage: none

# PV balcon / MPPT droit
pv_balcony_power: sensor.victron_over_mqtt_solar_power_dc_yield
pv_balcony_energy: sensor.victron_over_mqtt_solar_power_energy
pv_balcony_voltage: sensor.victron_over_mqtt_solar_voltage_dc
mppt_right_power: sensor.victron_over_mqtt_solar_power_dc
mppt_right_current: none
mppt_right_voltage: none

# MultiPlus
multiplus_ac_in_power: sensor.mosquitto_mqtt_broker_multiplus_power_ac_in
multiplus_ac_out_power: sensor.mosquitto_mqtt_broker_multiplus_power_ac_out
multiplus_mode: none
multiplus_status: none

# Charges
backup_loads_power: sensor.shellyproem50_841fe891afc0_energy_meter_1_puissance
critical_loads_power: sensor.shellyproem50_841fe891afc0_energy_meter_0_puissance

# Batterie gauche
battery_left_soc: sensor.dyness_module_0603002506100009_etat_de_charge
battery_left_voltage: sensor.dyness_module_0603002506100009_tension
battery_left_power: sensor.dyness_module_0603002506100009_power
battery_left_temperature: sensor.dyness_module_0603002506100009_temperature_cellules_1

# Batterie droite
battery_right_soc: sensor.dyness_module_l300250703156306_etat_de_charge
battery_right_voltage: sensor.dyness_module_l300250703156306_tension
battery_right_power: sensor.dyness_module_l300250703156306_power
battery_right_temperature: sensor.dyness_module_l300250703156306_temperature_cellules_1

# SmartShunt / batterie totale
battery_total_soc: sensor.victron_over_mqtt_battery_soc
battery_total_voltage: sensor.victron_over_mqtt_battery_voltage_dc
battery_total_current: sensor.victron_over_mqtt_battery_current_dc
battery_total_power: sensor.victron_over_mqtt_battery_power_dc

# Convention de signe batterie
battery_power_sign: positive=charge negative=discharge
```

Any unavailable sensor may be set to `none` or omitted.

## Notes

- `grid_import_power` is treated as a signed net-grid sensor: positive means import and negative means export.
- `grid_voltage` accepts one entity, an array of entities, or a space/comma separated list. With three entities, the displayed voltage is their average.
- Individual Dyness power sensors are used to determine left/right battery arrow direction. If unavailable, the total battery power is used as fallback.
- The left MPPT and roof PV are intentionally allowed to show `—` while they are not yet operational.
