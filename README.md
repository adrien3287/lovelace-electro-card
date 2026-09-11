# Lovelace Electro Card

**Version: 0.0.1**

A compact 2D Home Assistant Lovelace card for a residential backup / solar system.

## v0.0.1 scope

This first version is deliberately a **visual baseline only**. It contains the approved 2D drawing, equipment layout, arrows and electrical links. It does **not** yet bind Home Assistant entities or live sensor values. Dynamic data will be added incrementally in later versions without changing the validated geometry.

The diagram includes:

- public grid, meter and main house distribution,
- two independent south-facing PV arrays,
- two Victron-style SmartSolar MPPT 150/35 controllers,
- one Victron-style MultiPlus 48/2000/25-32,
- separate **Charges secourues** and **Charges critiques**,
- two compact Dyness batteries,
- one central SmartShunt block between the batteries and MultiPlus.

The complete drawing is inline SVG inside `lovelace-electro-card.js`; there are no external SVG files and no build step.

## Electrical topology

```text
PV Sud Toiture (30°) ──> MPPT 150/35 ──┐
                                         ├──> MultiPlus ──> Charges secourues
PV Sud Balcon (60°) ──> MPPT 150/35 ───┘              └─> Charges critiques

Réseau public <──> Compteur <──> Tableau général maison <──> MultiPlus

Batterie gauche <──> SmartShunt <──> Batterie droite
                         ⇅
                    MultiPlus DC
```

The two PV inputs are intentionally independent: **roof PV feeds the left MPPT only; balcony PV feeds the right MPPT only**.

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

Stable resource file:

```text
/hacsfiles/lovelace-electro-card/lovelace-electro-card.js
```

If HACS does not add the resource automatically, add it under **Settings → Dashboards → Resources** as a JavaScript module.

## Card type

```yaml
type: custom:lovelace-electro-card
```

No entity configuration is required in v0.0.1.

## Development roadmap

The next iterations can add live Home Assistant values in layers while keeping this v0.0.1 drawing as the visual baseline: PV/MPPT data, grid flows, MultiPlus AC/DC data, SmartShunt totals, individual Dyness values, then animated flow states.

## Release process

For v0.0.1:

1. review and merge the `release/v0.0.1` PR into `main`,
2. create tag `v0.0.1`,
3. create a GitHub release named `v0.0.1`,
4. add the repository as a HACS custom Dashboard repository.
