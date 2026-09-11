/* Lovelace Electro Card v0.0.2
 * Entity wiring + corrected SVG arrow sizing/directions.
 * Builds on the validated v0.0.1 visual baseline.
 */
import "./lovelace-electro-card.js";

const VERSION = "0.0.2";
const Card = customElements.get("lovelace-electro-card");
if (!Card) throw new Error("lovelace-electro-card: v0.0.1 base did not register the card");

const baseRender = Card.prototype._render;
const baseSetConfig = Card.prototype.setConfig;

function entityId(value) {
  if (!value || typeof value !== "string") return null;
  const valueTrimmed = value.trim();
  return !valueTrimmed || valueTrimmed.toLowerCase() === "none" ? null : valueTrimmed;
}

function entityList(value) {
  if (Array.isArray(value)) return value.map(entityId).filter(Boolean);
  if (typeof value === "string") return value.split(/[\s,]+/).map(entityId).filter(Boolean);
  return [];
}

function num(entity, fallback = null) {
  const id = entityId(entity);
  const state = id && this._hass?.states?.[id];
  if (!state) return fallback;
  const result = Number(state.state);
  return Number.isFinite(result) ? result : fallback;
}

function average(entities, fallback = null) {
  const values = entityList(entities).map((id) => num.call(this, id, null)).filter(Number.isFinite);
  return values.length ? values.reduce((a, b) => a + b, 0) / values.length : fallback;
}

function fmt(value, unit = "", digits = 0) {
  if (!Number.isFinite(value)) return "—";
  const number = new Intl.NumberFormat("fr-FR", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value);
  return `${number}${unit ? ` ${unit}` : ""}`;
}

function setText(root, x, y, value) {
  const node = root.querySelector(`text[x="${x}"][y="${y}"]`);
  if (node) node.textContent = value;
}

function findPath(root, d) {
  return [...root.querySelectorAll("path")].find((path) => path.getAttribute("d") === d) || null;
}

function clearMarkers(path) {
  if (!path) return;
  path.removeAttribute("marker-start");
  path.removeAttribute("marker-end");
}

function setDirection(path, direction, marker) {
  if (!path) return;
  clearMarkers(path);
  if (direction === "forward") path.setAttribute("marker-end", `url(#${marker})`);
  if (direction === "reverse") path.setAttribute("marker-start", `url(#${marker})`);
}

function setBidirectionalBySign(path, value, marker) {
  if (!Number.isFinite(value) || value === 0) {
    clearMarkers(path);
    return;
  }
  setDirection(path, value > 0 ? "forward" : "reverse", marker);
}

function fixMarker(root, id, color) {
  const marker = root.getElementById(id);
  if (!marker) return;
  marker.setAttribute("markerUnits", "userSpaceOnUse");
  marker.setAttribute("markerWidth", "14");
  marker.setAttribute("markerHeight", "14");
  marker.setAttribute("refX", "11");
  marker.setAttribute("refY", "6");
  const path = marker.querySelector("path");
  if (path) {
    path.setAttribute("d", "M0 0 L0 12 L12 6 z");
    path.setAttribute("fill", color);
  }
}

function computeData() {
  const cfg = this._config || {};
  const gridNet = num.call(this, cfg.grid_import_power, null);
  const explicitExport = num.call(this, cfg.grid_export_power, null);
  const gridImport = Number.isFinite(gridNet) ? Math.max(gridNet, 0) : null;
  const gridExport = Number.isFinite(explicitExport)
    ? Math.max(explicitExport, 0)
    : Number.isFinite(gridNet) ? Math.max(-gridNet, 0) : null;

  const batteryTotalPower = num.call(this, cfg.battery_total_power, null);
  const batteryLeftPower = num.call(this, cfg.battery_left_power, null);
  const batteryRightPower = num.call(this, cfg.battery_right_power, null);
  const positiveMeansCharge = String(cfg.battery_power_sign || "positive=charge negative=discharge")
    .toLowerCase().includes("positive=charge");

  const chargeSign = (power) => {
    if (!Number.isFinite(power) || power === 0) return 0;
    const charging = positiveMeansCharge ? power > 0 : power < 0;
    return charging ? 1 : -1;
  };

  return {
    gridNet,
    gridImport,
    gridExport,
    gridVoltage: average.call(this, cfg.grid_voltage, null),
    gridFrequency: num.call(this, cfg.grid_frequency, null),
    houseMainPower: num.call(this, cfg.house_main_power, null),
    otherHouseLoadsPower: num.call(this, cfg.other_house_loads_power, null),
    pvRoofPower: num.call(this, cfg.pv_roof_power, null),
    pvRoofEnergy: num.call(this, cfg.pv_roof_energy, null),
    pvRoofVoltage: num.call(this, cfg.pv_roof_voltage, null),
    pvBalconyPower: num.call(this, cfg.pv_balcony_power, null),
    pvBalconyEnergy: num.call(this, cfg.pv_balcony_energy, null),
    pvBalconyVoltage: num.call(this, cfg.pv_balcony_voltage, null),
    mpptLeftPower: num.call(this, cfg.mppt_left_power, num.call(this, cfg.pv_roof_power, null)),
    mpptLeftCurrent: num.call(this, cfg.mppt_left_current, null),
    mpptLeftVoltage: num.call(this, cfg.mppt_left_voltage, num.call(this, cfg.pv_roof_voltage, null)),
    mpptRightPower: num.call(this, cfg.mppt_right_power, num.call(this, cfg.pv_balcony_power, null)),
    mpptRightCurrent: num.call(this, cfg.mppt_right_current, null),
    mpptRightVoltage: num.call(this, cfg.mppt_right_voltage, num.call(this, cfg.pv_balcony_voltage, null)),
    multiplusAcInPower: num.call(this, cfg.multiplus_ac_in_power, null),
    multiplusAcOutPower: num.call(this, cfg.multiplus_ac_out_power, null),
    backupLoadsPower: num.call(this, cfg.backup_loads_power, null),
    criticalLoadsPower: num.call(this, cfg.critical_loads_power, null),
    batteryLeftSoc: num.call(this, cfg.battery_left_soc, null),
    batteryLeftVoltage: num.call(this, cfg.battery_left_voltage, null),
    batteryRightSoc: num.call(this, cfg.battery_right_soc, null),
    batteryRightVoltage: num.call(this, cfg.battery_right_voltage, null),
    batteryTotalSoc: num.call(this, cfg.battery_total_soc, null),
    batteryTotalVoltage: num.call(this, cfg.battery_total_voltage, null),
    batteryTotalCurrent: num.call(this, cfg.battery_total_current, null),
    batteryTotalPower,
    batteryTotalDirection: chargeSign(batteryTotalPower),
    batteryLeftDirection: chargeSign(Number.isFinite(batteryLeftPower) ? batteryLeftPower : batteryTotalPower),
    batteryRightDirection: chargeSign(Number.isFinite(batteryRightPower) ? batteryRightPower : batteryTotalPower),
  };
}

function applyV002() {
  const root = this.shadowRoot;
  if (!root || !this._config) return;
  const data = computeData.call(this);

  // Absolute-size arrows: fixes the oversized marker problem from v0.0.1.
  fixMarker(root, "aBlue", "#11a7ff");
  fixMarker(root, "aYellow", "#ffd400");
  fixMarker(root, "aWhite", "#edf1f3");

  // Grid values. A positive signed meter value is import; a negative value is export.
  setText(root, 176, 174, fmt(data.gridExport, "W", 0));
  setText(root, 176, 212, fmt(data.gridImport, "W", 0));
  setText(root, 184, 247, fmt(data.gridVoltage, "V", 1));
  setText(root, 184, 275, fmt(data.gridFrequency, "Hz", 1));

  // House board: unknown sensors remain intentionally blank/unknown.
  setText(root, 475, 566, fmt(data.houseMainPower, "W", 0));
  const otherLoads = root.querySelector('text[x="462"][y="588"]');
  if (otherLoads) otherLoads.textContent = Number.isFinite(data.otherHouseLoadsPower)
    ? `Autres charges maison ${fmt(data.otherHouseLoadsPower, "W", 0)}`
    : "Autres charges maison";

  // Roof PV / left MPPT (may be unconfigured until commissioned).
  setText(root, 1220, 95, fmt(data.pvRoofPower, "W", 0));
  setText(root, 1220, 130, fmt(data.pvRoofEnergy, "kWh", 1));
  setText(root, 1220, 153, fmt(data.pvRoofVoltage, "V", 1));
  setText(root, 655, 307, fmt(data.mpptLeftPower, "W", 0));
  setText(root, 655, 339, fmt(data.mpptLeftCurrent, "A", 1));
  setText(root, 655, 365, fmt(data.mpptLeftVoltage, "V", 1));

  // Balcony PV / right MPPT.
  setText(root, 1450, 249, fmt(data.pvBalconyPower, "W", 0));
  setText(root, 1450, 282, fmt(data.pvBalconyEnergy, "kWh", 1));
  setText(root, 1450, 305, fmt(data.pvBalconyVoltage, "V", 1));
  setText(root, 925, 307, fmt(data.mpptRightPower, "W", 0));
  setText(root, 925, 339, fmt(data.mpptRightCurrent, "A", 1));
  setText(root, 925, 365, fmt(data.mpptRightVoltage, "V", 1));

  // Loads.
  setText(root, 1144, 580, fmt(data.backupLoadsPower, "W", 0));
  setText(root, 1395, 580, fmt(data.criticalLoadsPower, "W", 0));

  // Dyness modules and total battery block.
  setText(root, 468, 798, fmt(data.batteryLeftSoc, "%", 0));
  setText(root, 468, 827, fmt(data.batteryLeftVoltage, "V", 2));
  setText(root, 1113, 798, fmt(data.batteryRightSoc, "%", 0));
  setText(root, 1113, 827, fmt(data.batteryRightVoltage, "V", 2));
  setText(root, 670, 795, `SoC : ${fmt(data.batteryTotalSoc, "%", 0)}`);
  setText(root, 845, 795, fmt(data.batteryTotalVoltage, "V", 2));
  setText(root, 670, 827, fmt(data.batteryTotalCurrent, "A", 2));
  setText(root, 845, 827, fmt(data.batteryTotalPower, "W", 0));

  // Flow arrows. Marker direction is separate from line colour.
  setBidirectionalBySign(findPath(root, "M338 190 H365 V355 H180 V427"), data.gridNet, "aWhite");
  setBidirectionalBySign(findPath(root, "M260 500 H335"), data.gridNet, "aYellow");

  const boardMulti = findPath(root, "M590 500 H705");
  if (Number.isFinite(data.gridNet) && data.gridNet < 0) setDirection(boardMulti, "reverse", "aYellow");
  else if (Number.isFinite(data.multiplusAcInPower) && data.multiplusAcInPower > 0) setDirection(boardMulti, "forward", "aYellow");
  else clearMarkers(boardMulti);

  setDirection(findPath(root, "M955 98 H650 V162"), Number.isFinite(data.pvRoofPower) && data.pvRoofPower > 0 ? "forward" : null, "aBlue");
  setDirection(findPath(root, "M1276 262 H1082 V208 H1012"), Number.isFinite(data.pvBalconyPower) && data.pvBalconyPower > 0 ? "forward" : null, "aBlue");
  setDirection(findPath(root, "M752 250 H780 V397"), Number.isFinite(data.mpptLeftPower) && data.mpptLeftPower > 0 ? "forward" : null, "aBlue");
  setDirection(findPath(root, "M858 250 H832 V397"), Number.isFinite(data.mpptRightPower) && data.mpptRightPower > 0 ? "forward" : null, "aBlue");
  setDirection(findPath(root, "M1115 445 V475"), Number.isFinite(data.backupLoadsPower) && data.backupLoadsPower > 0 ? "forward" : null, "aYellow");
  setDirection(findPath(root, "M1370 445 V475"), Number.isFinite(data.criticalLoadsPower) && data.criticalLoadsPower > 0 ? "forward" : null, "aYellow");

  // Battery sign convention: positive = charge, negative = discharge.
  const shuntVertical = findPath(root, "M805 610 V690");
  if (data.batteryTotalDirection > 0) setDirection(shuntVertical, "forward", "aBlue");
  else if (data.batteryTotalDirection < 0) setDirection(shuntVertical, "reverse", "aBlue");
  else clearMarkers(shuntVertical);

  const leftBattery = findPath(root, "M605 772 H645");
  if (data.batteryLeftDirection > 0) setDirection(leftBattery, "reverse", "aBlue");
  else if (data.batteryLeftDirection < 0) setDirection(leftBattery, "forward", "aBlue");
  else clearMarkers(leftBattery);

  const rightBattery = findPath(root, "M965 772 H1005");
  if (data.batteryRightDirection > 0) setDirection(rightBattery, "forward", "aBlue");
  else if (data.batteryRightDirection < 0) setDirection(rightBattery, "reverse", "aBlue");
  else clearMarkers(rightBattery);
}

Card.prototype._render = function () {
  baseRender.call(this);
  applyV002.call(this);
};

Card.prototype.setConfig = function (config) {
  baseSetConfig.call(this, config);
  applyV002.call(this);
};

Object.defineProperty(Card.prototype, "hass", {
  configurable: true,
  set(hass) {
    this._hass = hass;
    if (!this.shadowRoot?.innerHTML) baseRender.call(this);
    applyV002.call(this);
  },
});

if (Array.isArray(window.customCards)) {
  const entry = window.customCards.find((card) => card.type === "lovelace-electro-card");
  if (entry) entry.description = `2D electrical-system card v${VERSION} — live entities + corrected arrows`;
}

console.info(`%c LOVELACE-ELECTRO-CARD %c v${VERSION} `,
  "color:#fff;background:#0b8df0;font-weight:700;padding:2px 4px",
  "color:#0b8df0;background:#111;padding:2px 4px");
