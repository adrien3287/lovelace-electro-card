/* Lovelace Electro Card v0.0.8
 * Responsive sizing for narrow Home Assistant cards and mobile screens.
 */
import "./lovelace-electro-card-v0.0.7.js";

const VERSION = "0.0.8";
const Card = customElements.get("lovelace-electro-card");
if (!Card) throw new Error("lovelace-electro-card: v0.0.7 did not register the card");

const previousRender = Card.prototype._render;

function applyResponsiveLayout() {
  const root = this.shadowRoot;
  if (!root) return;

  root.querySelector('style[data-v008="responsive"]')?.remove();

  const style = document.createElement("style");
  style.dataset.v008 = "responsive";
  style.textContent = `
    :host {
      display: block;
      width: 100%;
      max-width: 100%;
      min-width: 0;
    }

    ha-card {
      width: 100%;
      max-width: 100%;
      min-width: 0;
    }

    .wrap {
      width: 100%;
      max-width: 100%;
      min-width: 0;
      min-height: 0;
      height: auto;
      aspect-ratio: 16 / 9;
    }

    .wrap > svg {
      display: block;
      width: 100%;
      height: 100%;
      max-width: 100%;
    }
  `;
  root.appendChild(style);

  const svg = root.querySelector(".wrap > svg");
  if (svg) svg.setAttribute("preserveAspectRatio", "xMidYMid meet");
}

Card.prototype._render = function () {
  previousRender.call(this);
  applyResponsiveLayout.call(this);
};

if (Array.isArray(window.customCards)) {
  const entry = window.customCards.find((card) => card.type === "lovelace-electro-card");
  if (entry) entry.description = `2D electrical-system card v${VERSION} — responsive mobile sizing`;
}

console.info(
  `%c LOVELACE-ELECTRO-CARD %c v${VERSION} `,
  "color:#fff;background:#0b8df0;font-weight:700;padding:2px 4px",
  "color:#0b8df0;background:#111;padding:2px 4px"
);
