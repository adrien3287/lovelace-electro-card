/* Lovelace Electro Card v0.0.7
 * Aligned load values and battery forecast panel.
 */
import "./lovelace-electro-card-v0.0.6.js";

const VERSION = "0.0.7";
const Card = customElements.get("lovelace-electro-card");
if (!Card) throw new Error("lovelace-electro-card: v0.0.6 did not register the card");

const previousRender = Card.prototype._render;

const FORECAST_ENTITIES = {
  time_to_soc: "sensor.victron_over_mqtt_temps_de_charge",
  remaining_autonomy: "sensor.victron_over_mqtt_autonomie_charge_battery_dyness_full_empty",
  charge_discharge_rate: "sensor.autonomie_charge_battery_dyness_per_percent",
};

function svgElement(name, attributes = {}) {
  const node = document.createElementNS("http://www.w3.org/2000/svg", name);
  Object.entries(attributes).forEach(([key, value]) => node.setAttribute(key, value));
  return node;
}

function displayState(card, entityId) {
  const state = card._hass?.states?.[entityId];
  if (!state || state.state === "unknown" || state.state === "unavailable" || state.state === "") return "—";
  const numeric = Number(state.state);
  const value = Number.isFinite(numeric)
    ? new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 1 }).format(numeric)
    : state.state;
  const unit = state.attributes?.unit_of_measurement;
  return unit ? `${value} ${unit}` : value;
}

function addText(group, x, y, text, className, anchor = "start") {
  const node = svgElement("text", { x, y, class: className, "text-anchor": anchor });
  node.textContent = text;
  group.appendChild(node);
  return node;
}

function applyV007() {
  const root = this.shadowRoot;
  if (!root) return;

  // House, backup and critical-load powers share the same baseline.
  const backupPower = root.querySelector('text[x="1144"][y="580"]');
  const criticalPower = root.querySelector('text[x="1395"][y="580"]');
  if (backupPower) backupPower.setAttribute("y", "566");
  if (criticalPower) criticalPower.setAttribute("y", "566");

  root.querySelector('[data-v007="forecast-panel"]')?.remove();
  const svg = root.querySelector("svg");
  if (!svg) return;

  const group = svgElement("g", { "data-v007": "forecast-panel" });
  group.appendChild(svgElement("rect", {
    x: 35, y: 392, width: 280, height: 180, rx: 14,
    fill: "#151819", stroke: "#666d72", "stroke-width": 2,
  }));

  const rows = [
    ["Temps pour atteindre SOC", "time_to_soc", 420, 443],
    ["Autonomie restante", "remaining_autonomy", 476, 499],
    ["Rythme de charge/décharge", "charge_discharge_rate", 532, 555],
  ];
  rows.forEach(([label, key, labelY, valueY], index) => {
    addText(group, 55, labelY, label, "forecast-label");
    const entity = this._config?.[key] || FORECAST_ENTITIES[key];
    addText(group, 55, valueY, displayState(this, entity), "forecast-value");
    if (index < rows.length - 1) {
      group.appendChild(svgElement("line", {
        x1: 55, y1: valueY + 12, x2: 295, y2: valueY + 12,
        stroke: "#4f575c", "stroke-width": 1,
      }));
    }
  });

  const style = svgElement("style");
  style.textContent = `
    .forecast-label{fill:#c7ced2;font-size:14px;font-weight:500}
    .forecast-value{fill:#f5f6f7;font-size:18px;font-weight:700}
  `;
  group.appendChild(style);
  svg.appendChild(group);
}

Card.prototype._render = function () {
  previousRender.call(this);
  applyV007.call(this);
};

function watchedEntities(config) {
  const result = Object.values(FORECAST_ENTITIES);
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
      || watchedEntities(this._config).some((id) => previousHass.states?.[id] !== hass.states?.[id]);
    if (changed) this._render();
  },
});

const FORECAST_FIELDS = [
  ["time_to_soc", "Temps pour atteindre SOC"],
  ["remaining_autonomy", "Autonomie restante"],
  ["charge_discharge_rate", "Rythme de charge/décharge"],
];

const PreviousEditor = customElements.get("lovelace-electro-card-editor-v005");
class LovelaceElectroCardEditorV007 extends PreviousEditor {
  _render() {
    super._render();
    if (!this.shadowRoot) return;

    const section = document.createElement("section");
    const title = document.createElement("h3");
    title.textContent = "Prévisions batterie";
    const fields = document.createElement("div");
    fields.className = "fields";

    FORECAST_FIELDS.forEach(([key, label]) => {
      const picker = document.createElement("ha-entity-picker");
      picker.dataset.key = key;
      picker.hass = this._hass;
      picker.value = this._config?.[key] || FORECAST_ENTITIES[key];
      picker.label = label;
      picker.allowCustomEntity = true;
      picker.includeDomains = ["sensor"];
      picker.addEventListener("value-changed", (event) => this._valueChanged(key, event.detail?.value));
      fields.appendChild(picker);
    });

    section.append(title, fields);
    this.shadowRoot.appendChild(section);
  }
}

if (!customElements.get("lovelace-electro-card-editor-v007")) {
  customElements.define("lovelace-electro-card-editor-v007", LovelaceElectroCardEditorV007);
}
Card.getConfigElement = () => document.createElement("lovelace-electro-card-editor-v007");

if (Array.isArray(window.customCards)) {
  const entry = window.customCards.find((card) => card.type === "lovelace-electro-card");
  if (entry) entry.description = `2D electrical-system card v${VERSION} — battery forecasts`;
}

console.info(
  `%c LOVELACE-ELECTRO-CARD %c v${VERSION} `,
  "color:#fff;background:#0b8df0;font-weight:700;padding:2px 4px",
  "color:#0b8df0;background:#111;padding:2px 4px"
);
