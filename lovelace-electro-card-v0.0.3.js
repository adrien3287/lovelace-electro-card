/* Lovelace Electro Card v0.0.3 */
import "./lovelace-electro-card-v0.0.2.js";

const VERSION = "0.0.3";
const Card = customElements.get("lovelace-electro-card");
if (!Card) throw new Error("lovelace-electro-card: v0.0.2 did not register the card");

const previousRender = Card.prototype._render;
const previousSetConfig = Card.prototype.setConfig;

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

function format(value, unit, digits = 1) {
  if (!Number.isFinite(value)) return "—";
  const number = new Intl.NumberFormat("fr-FR", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value);
  return `${number} ${unit}`;
}

function enlargeMarker(root, id, color) {
  const marker = root.getElementById(id);
  if (!marker) return;
  marker.setAttribute("markerUnits", "userSpaceOnUse");
  marker.setAttribute("markerWidth", "20");
  marker.setAttribute("markerHeight", "20");
  marker.setAttribute("viewBox", "0 0 18 16");
  marker.setAttribute("refX", "16");
  marker.setAttribute("refY", "8");
  marker.setAttribute("orient", "auto");
  const arrow = marker.querySelector("path");
  if (arrow) {
    arrow.setAttribute("d", "M0 0 L0 16 L18 8 z");
    arrow.setAttribute("fill", color);
  }
}

function makeSvgText(root, key, x, y) {
  let text = root.querySelector(`[data-v003="${key}"]`);
  if (!text) {
    text = document.createElementNS("http://www.w3.org/2000/svg", "text");
    text.dataset.v003 = key;
    text.setAttribute("x", x);
    text.setAttribute("y", y);
    text.setAttribute("class", "grid-detail");
    const gridPanel = root.querySelector('rect[x="28"][y="90"]')?.parentElement;
    gridPanel?.appendChild(text);
  }
  return text;
}

function applyV003() {
  const root = this.shadowRoot;
  if (!root || !this._config) return;

  enlargeMarker(root, "aBlue", "#11a7ff");
  enlargeMarker(root, "aYellow", "#ffd400");
  enlargeMarker(root, "aWhite", "#edf1f3");

  if (!root.querySelector('[data-v003="alignment-style"]')) {
    const style = document.createElementNS("http://www.w3.org/2000/svg", "style");
    style.dataset.v003 = "alignment-style";
    style.textContent = ".grid-detail{fill:#eef2f4;font-size:14px;font-weight:600}";
    root.querySelector("svg")?.prepend(style);
  }

  const cfg = this._config;
  const legacyVoltages = entityList(cfg.grid_voltage);
  const voltageEntities = [
    cfg.grid_voltage_l1 || legacyVoltages[0],
    cfg.grid_voltage_l2 || legacyVoltages[1],
    cfg.grid_voltage_l3 || legacyVoltages[2],
  ];
  const voltages = voltageEntities.map((entity) => numericState(this, entity));
  const frequency = numericState(this, cfg.grid_frequency);

  // Hide the former average and align L1/L2/L3/frequency on one vertical axis.
  const oldVoltage = root.querySelector('text[x="184"][y="247"]');
  const oldFrequency = root.querySelector('text[x="184"][y="275"]');
  if (oldVoltage) oldVoltage.setAttribute("display", "none");
  if (oldFrequency) oldFrequency.setAttribute("display", "none");
  const oldBolt = [...root.querySelectorAll("path")].find(
    (path) => path.getAttribute("d") === "M149 226 l-12 23h13l-7 25 28-35h-15l8-13z"
  );
  if (oldBolt) oldBolt.setAttribute("d", "M145 229 l-10 18 h10 l-6 17 20-24 h-11 l7-11z");

  [
    ["grid-l1", 230, `L1  ${format(voltages[0], "V")}`],
    ["grid-l2", 247, `L2  ${format(voltages[1], "V")}`],
    ["grid-l3", 264, `L3  ${format(voltages[2], "V")}`],
    ["grid-hz", 281, `f    ${format(frequency, "Hz")}`],
  ].forEach(([key, y, value]) => {
    const text = makeSvgText(root, key, 176, y);
    text.textContent = value;
  });
}

Card.prototype._render = function () {
  previousRender.call(this);
  applyV003.call(this);
};

Card.prototype.setConfig = function (config) {
  previousSetConfig.call(this, config);
  applyV003.call(this);
};

Object.defineProperty(Card.prototype, "hass", {
  configurable: true,
  set(hass) {
    this._hass = hass;
    if (!this.shadowRoot?.innerHTML) previousRender.call(this);
    applyV003.call(this);
  },
});

const EDITOR_SECTIONS = [
  ["Réseau public", [
    ["grid_import_power", "Puissance réseau signée"],
    ["grid_export_power", "Puissance export séparée (optionnel)"],
    ["grid_voltage_l1", "Tension L1"],
    ["grid_voltage_l2", "Tension L2"],
    ["grid_voltage_l3", "Tension L3"],
    ["grid_frequency", "Fréquence"],
    ["grid_connected", "État de connexion réseau"],
  ]],
  ["Tableau maison", [
    ["house_main_power", "Puissance tableau général"],
    ["other_house_loads_power", "Autres charges maison"],
  ]],
  ["PV toiture / MPPT gauche", [
    ["pv_roof_power", "Puissance PV toiture"],
    ["pv_roof_energy", "Énergie PV toiture"],
    ["pv_roof_voltage", "Tension PV toiture"],
    ["mppt_left_power", "Puissance MPPT gauche"],
    ["mppt_left_current", "Courant MPPT gauche"],
    ["mppt_left_voltage", "Tension MPPT gauche"],
    ["mppt_left_state", "État MPPT gauche"],
  ]],
  ["PV balcon / MPPT droit", [
    ["pv_balcony_power", "Puissance PV balcon"],
    ["pv_balcony_energy", "Énergie PV balcon"],
    ["pv_balcony_voltage", "Tension PV balcon"],
    ["mppt_right_power", "Puissance MPPT droit"],
    ["mppt_right_current", "Courant MPPT droit"],
    ["mppt_right_voltage", "Tension MPPT droit"],
    ["mppt_right_state", "État MPPT droit"],
  ]],
  ["MultiPlus et charges", [
    ["multiplus_ac_in_power", "Puissance AC In"],
    ["multiplus_ac_out_power", "Puissance AC Out"],
    ["multiplus_mode", "Mode MultiPlus"],
    ["multiplus_status", "État MultiPlus"],
    ["inverter_state", "État onduleur"],
    ["backup_loads_power", "Charges secourues"],
    ["critical_loads_power", "Charges critiques"],
  ]],
  ["Batterie gauche", [
    ["battery_left_soc", "État de charge"],
    ["battery_left_voltage", "Tension"],
    ["battery_left_power", "Puissance"],
    ["battery_left_temperature", "Température"],
  ]],
  ["Batterie droite", [
    ["battery_right_soc", "État de charge"],
    ["battery_right_voltage", "Tension"],
    ["battery_right_power", "Puissance"],
    ["battery_right_temperature", "Température"],
  ]],
  ["SmartShunt / total", [
    ["battery_total_soc", "État de charge total"],
    ["battery_total_voltage", "Tension totale"],
    ["battery_total_current", "Courant total"],
    ["battery_total_power", "Puissance totale"],
  ]],
];

class LovelaceElectroCardEditor extends HTMLElement {
  set hass(hass) {
    this._hass = hass;
    this._syncPickers();
  }

  setConfig(config) {
    this._config = { ...config };
    this._render();
  }

  _render() {
    if (!this.shadowRoot) this.attachShadow({ mode: "open" });
    this.shadowRoot.innerHTML = `
      <style>
        :host{display:block;padding:8px 0 16px}
        .intro{color:var(--secondary-text-color);margin:0 0 16px;line-height:1.45}
        section{margin:0 0 18px}
        h3{margin:0 0 10px;font-size:16px;color:var(--primary-text-color)}
        .fields{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:10px 14px}
        ha-entity-picker{width:100%}
      </style>
      <p class="intro">Choisis les capteurs utilisés par chaque partie de l’installation. Les champs peuvent rester vides.</p>
      ${EDITOR_SECTIONS.map(([title, fields]) => `
        <section>
          <h3>${title}</h3>
          <div class="fields">
            ${fields.map(([key]) => `<ha-entity-picker data-key="${key}"></ha-entity-picker>`).join("")}
          </div>
        </section>
      `).join("")}
    `;

    this.shadowRoot.querySelectorAll("ha-entity-picker").forEach((picker) => {
      const key = picker.dataset.key;
      const field = EDITOR_SECTIONS.flatMap(([, fields]) => fields).find(([name]) => name === key);
      picker.hass = this._hass;
      picker.value = this._editorValue(key);
      picker.label = field?.[1] || key;
      picker.allowCustomEntity = true;
      picker.includeDomains = ["sensor"];
      picker.addEventListener("value-changed", (event) => this._valueChanged(key, event.detail?.value));
    });
  }

  _editorValue(key) {
    if (this._config?.[key] && this._config[key] !== "none") return this._config[key];
    if (key.startsWith("grid_voltage_l")) {
      const index = Number(key.slice(-1)) - 1;
      return entityList(this._config?.grid_voltage)[index] || "";
    }
    return "";
  }

  _syncPickers() {
    this.shadowRoot?.querySelectorAll("ha-entity-picker").forEach((picker) => {
      picker.hass = this._hass;
      picker.value = this._editorValue(picker.dataset.key);
    });
  }

  _valueChanged(key, value) {
    const config = { ...this._config };
    if (value) config[key] = value;
    else delete config[key];
    if (key.startsWith("grid_voltage_l")) delete config.grid_voltage;
    config.battery_power_sign ||= "positive=charge negative=discharge";
    this._config = config;
    this.dispatchEvent(new CustomEvent("config-changed", {
      detail: { config },
      bubbles: true,
      composed: true,
    }));
  }
}

if (!customElements.get("lovelace-electro-card-editor")) {
  customElements.define("lovelace-electro-card-editor", LovelaceElectroCardEditor);
}

Card.getConfigElement = () => document.createElement("lovelace-electro-card-editor");
const previousStub = Card.getStubConfig?.bind(Card);
Card.getStubConfig = () => ({
  ...(previousStub ? previousStub() : {}),
  type: "custom:lovelace-electro-card",
  battery_power_sign: "positive=charge negative=discharge",
});

if (Array.isArray(window.customCards)) {
  const entry = window.customCards.find((card) => card.type === "lovelace-electro-card");
  if (entry) entry.description = `2D electrical-system card v${VERSION} — graphical editor + three-phase display`;
}

console.info(
  `%c LOVELACE-ELECTRO-CARD %c v${VERSION} `,
  "color:#fff;background:#0b8df0;font-weight:700;padding:2px 4px",
  "color:#0b8df0;background:#111;padding:2px 4px"
);
