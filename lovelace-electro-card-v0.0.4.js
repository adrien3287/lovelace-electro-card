/* Lovelace Electro Card v0.0.4
 * Restores live updates for every v0.0.2/v0.0.3 value.
 */
import "./lovelace-electro-card-v0.0.3.js";

const VERSION = "0.0.4";
const Card = customElements.get("lovelace-electro-card");
if (!Card) throw new Error("lovelace-electro-card: v0.0.3 did not register the card");

const renderAllLayers = Card.prototype._render;

function configuredEntities(config) {
  const values = [];
  const visit = (value) => {
    if (Array.isArray(value)) value.forEach(visit);
    else if (typeof value === "string") {
      value.split(/[\s,]+/).forEach((candidate) => {
        if (/^[a-z_]+\.[a-z0-9_]+$/i.test(candidate)) values.push(candidate);
      });
    }
  };
  Object.values(config || {}).forEach(visit);
  return [...new Set(values)];
}

Object.defineProperty(Card.prototype, "hass", {
  configurable: true,
  set(hass) {
    const previousHass = this._hass;
    this._hass = hass;

    const mustRefresh = !previousHass
      || !this.shadowRoot?.innerHTML
      || configuredEntities(this._config).some(
        (id) => previousHass.states?.[id] !== hass.states?.[id]
      );

    // v0.0.3 only refreshed its L1/L2/L3 overlay here. Calling the complete
    // render chain restores grid, PV, MPPT, loads, Dyness and SmartShunt data.
    if (mustRefresh) renderAllLayers.call(this);
  },
});

if (Array.isArray(window.customCards)) {
  const entry = window.customCards.find((card) => card.type === "lovelace-electro-card");
  if (entry) entry.description = `2D electrical-system card v${VERSION} — restored live values`;
}

console.info(
  `%c LOVELACE-ELECTRO-CARD %c v${VERSION} `,
  "color:#fff;background:#0b8df0;font-weight:700;padding:2px 4px",
  "color:#0b8df0;background:#111;padding:2px 4px"
);
