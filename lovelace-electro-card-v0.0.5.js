/* Lovelace Electro Card v0.0.5
 * Simplified grid topology, per-phase V/A/W, and no flow arrows.
 */
import "./lovelace-electro-card-v0.0.4.js";

const VERSION = "0.0.5";
const Card = customElements.get("lovelace-electro-card");
if (!Card) throw new Error("lovelace-electro-card: v0.0.4 did not register the card");

const previousRender = Card.prototype._render;

function entityId(value) {
  if (!value || typeof value !== "string") return null;
  const trimmed = value.trim();
  return !trimmed || trimmed.toLowerCase() === "none" ? null : trimmed;
}

function entityList(value) {
  if (Array.isArray(value)) return value.map(entityId).filter(Boolean);
  if (typeof value === "string") return value.split(/[\s,]+/).map(entityId).filter(Boolean);
  return [];
}

function numericState(card, entity) {
  const id = entityId(entity);
  const value = id && card._hass?.states?.[id]?.state;
  if (value === null || value === undefined || value === "" || value === "unknown" || value === "unavailable") {
    return null;
  }
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function formatted(value, digits = 1) {
  if (!Number.isFinite(value)) return "—";
  return new Intl.NumberFormat("fr-FR", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value);
}

function svgElement(name, attributes = {}) {
  const node = document.createElementNS("http://www.w3.org/2000/svg", name);
  Object.entries(attributes).forEach(([key, value]) => node.setAttribute(key, value));
  return node;
}

function addText(group, key, x, y, value, className = "grid-v005") {
  let text = group.querySelector(`[data-v005="${key}"]`);
  if (!text) {
    text = svgElement("text", { x, y, class: className, "data-v005": key });
    group.appendChild(text);
  }
  text.textContent = value;
  return text;
}

function findPath(root, d) {
  return [...root.querySelectorAll("path")].find((path) => path.getAttribute("d") === d);
}

function applyV005() {
  const root = this.shadowRoot;
  if (!root || !this._config) return;

  // Flow lines remain colour-coded, but every directional marker is removed.
  root.querySelectorAll("[marker-start],[marker-end]").forEach((node) => {
    node.removeAttribute("marker-start");
    node.removeAttribute("marker-end");
  });

  // Remove the separate meter and its AC link.
  const meterLabel = [...root.querySelectorAll("text")].find((text) => text.textContent.trim() === "Compteur");
  meterLabel?.parentElement?.remove();
  findPath(root, "M260 500 H335")?.remove();

  // Connect the public grid directly to the top of the main house board.
  const oldGridPath = findPath(root, "M338 190 H365 V355 H180 V427");
  if (oldGridPath) {
    oldGridPath.setAttribute("d", "M338 190 H365 V355 H462 V392");
    oldGridPath.removeAttribute("marker-start");
    oldGridPath.removeAttribute("marker-end");
  }

  const panel = root.querySelector('rect[x="28"][y="90"]');
  const gridGroup = panel?.parentElement;
  if (!panel || !gridGroup) return;
  panel.setAttribute("height", "232");

  // Hide the old import/export rows, averaged voltage, v0.0.3 rows and bolt.
  [
    gridGroup.querySelector('text[x="176"][y="174"]'),
    gridGroup.querySelector('text[x="176"][y="212"]'),
    gridGroup.querySelector('text[x="184"][y="247"]'),
    gridGroup.querySelector('text[x="184"][y="275"]'),
    ...gridGroup.querySelectorAll('[data-v003^="grid-"]'),
  ].filter(Boolean).forEach((node) => node.setAttribute("display", "none"));

  [
    "M153 160 h-18 v-7 l-18 14 18 14 v-7 h18z",
    "M118 198 h18 v-7 l18 14-18 14v-7h-18z",
    "M149 226 l-12 23h13l-7 25 28-35h-15l8-13z",
    "M145 229 l-10 18 h10 l-6 17 20-24 h-11 l7-11z",
  ].forEach((d) => {
    const node = findPath(gridGroup, d);
    if (node) node.setAttribute("display", "none");
  });

  if (!gridGroup.querySelector('[data-v005="style"]')) {
    const style = svgElement("style", { "data-v005": "style" });
    style.textContent = `
      .grid-v005{fill:#f5f6f7;font-size:14px;font-weight:650}
      .grid-v005-head{fill:#aeb7bc;font-size:12px;font-weight:700}
      .grid-v005-phase{fill:#dce2e5;font-size:13px;font-weight:650}
    `;
    gridGroup.appendChild(style);
  }

  const netPower = numericState(this, this._config.grid_import_power);
  const powerColor = netPower > 0 ? "#20e65d" : netPower < 0 ? "#ff3b45" : "#aeb7bc";
  let powerArrow = gridGroup.querySelector('[data-v005="power-arrow"]');
  if (!powerArrow) {
    powerArrow = svgElement("path", { "data-v005": "power-arrow" });
    gridGroup.appendChild(powerArrow);
  }
  powerArrow.setAttribute("fill", powerColor);
  powerArrow.setAttribute(
    "d",
    netPower < 0
      ? "M185 160 H163 V153 L143 167 L163 181 V174 H185 Z"
      : "M143 160 H165 V153 L185 167 L165 181 V174 H143 Z"
  );
  const signedPower = Number.isFinite(netPower) ? `${formatted(netPower, 0)} W` : "—";
  const powerText = addText(gridGroup, "net-power", 198, 174, signedPower);
  powerText.setAttribute("fill", powerColor);

  addText(gridGroup, "head-v", 215, 204, "V", "grid-v005-head").setAttribute("text-anchor", "middle");
  addText(gridGroup, "head-a", 263, 204, "A", "grid-v005-head").setAttribute("text-anchor", "middle");
  addText(gridGroup, "head-w", 310, 204, "W", "grid-v005-head").setAttribute("text-anchor", "middle");

  const legacyVoltages = entityList(this._config.grid_voltage);
  const phases = [
    ["L1", this._config.grid_voltage_l1 || legacyVoltages[0], this._config.grid_current_l1, this._config.grid_power_l1],
    ["L2", this._config.grid_voltage_l2 || legacyVoltages[1], this._config.grid_current_l2, this._config.grid_power_l2],
    ["L3", this._config.grid_voltage_l3 || legacyVoltages[2], this._config.grid_current_l3, this._config.grid_power_l3],
  ];
  phases.forEach(([label, voltageEntity, currentEntity, powerEntity], index) => {
    const y = 227 + index * 22;
    addText(gridGroup, `phase-${label}`, 170, y, label, "grid-v005-head");
    addText(gridGroup, `voltage-${label}`, 215, y, formatted(numericState(this, voltageEntity), 1), "grid-v005-phase")
      .setAttribute("text-anchor", "middle");
    addText(gridGroup, `current-${label}`, 263, y, formatted(numericState(this, currentEntity), 1), "grid-v005-phase")
      .setAttribute("text-anchor", "middle");
    addText(gridGroup, `power-${label}`, 310, y, formatted(numericState(this, powerEntity), 0), "grid-v005-phase")
      .setAttribute("text-anchor", "middle");
  });

  const frequency = numericState(this, this._config.grid_frequency);
  addText(gridGroup, "frequency", 170, 306, `f  ${formatted(frequency, 1)} Hz`, "grid-v005-phase");
}

Card.prototype._render = function () {
  previousRender.call(this);
  applyV005.call(this);
};

function configuredEntities(config) {
  const result = [];
  const visit = (value) => {
    if (Array.isArray(value)) value.forEach(visit);
    else if (typeof value === "string") {
      value.split(/[\s,]+/).forEach((candidate) => {
        if (/^[a-z_]+\.[a-z0-9_]+$/i.test(candidate)) result.push(candidate);
      });
    }
  };
  Object.values(config || {}).forEach(visit);
  return [...new Set(result)];
}

Object.defineProperty(Card.prototype, "hass", {
  configurable: true,
  set(hass) {
    const previousHass = this._hass;
    this._hass = hass;
    const changed = !previousHass
      || !this.shadowRoot?.innerHTML
      || configuredEntities(this._config).some((id) => previousHass.states?.[id] !== hass.states?.[id]);
    if (changed) this._render();
  },
});

const PHASE_FIELDS = [
  ["grid_current_l1", "Courant L1"],
  ["grid_power_l1", "Puissance L1"],
  ["grid_current_l2", "Courant L2"],
  ["grid_power_l2", "Puissance L2"],
  ["grid_current_l3", "Courant L3"],
  ["grid_power_l3", "Puissance L3"],
];

const PreviousEditor = customElements.get("lovelace-electro-card-editor");
class LovelaceElectroCardEditorV005 extends PreviousEditor {
  _render() {
    super._render();
    const fields = this.shadowRoot?.querySelector("section .fields");
    if (!fields) return;
    PHASE_FIELDS.forEach(([key, label]) => {
      const picker = document.createElement("ha-entity-picker");
      picker.dataset.key = key;
      picker.hass = this._hass;
      picker.value = this._editorValue(key);
      picker.label = label;
      picker.allowCustomEntity = true;
      picker.includeDomains = ["sensor"];
      picker.addEventListener("value-changed", (event) => this._valueChanged(key, event.detail?.value));
      fields.appendChild(picker);
    });
  }
}

if (!customElements.get("lovelace-electro-card-editor-v005")) {
  customElements.define("lovelace-electro-card-editor-v005", LovelaceElectroCardEditorV005);
}
Card.getConfigElement = () => document.createElement("lovelace-electro-card-editor-v005");

if (Array.isArray(window.customCards)) {
  const entry = window.customCards.find((card) => card.type === "lovelace-electro-card");
  if (entry) entry.description = `2D electrical-system card v${VERSION} — direct grid and per-phase V/A/W`;
}

console.info(
  `%c LOVELACE-ELECTRO-CARD %c v${VERSION} `,
  "color:#fff;background:#0b8df0;font-weight:700;padding:2px 4px",
  "color:#0b8df0;background:#111;padding:2px 4px"
);
