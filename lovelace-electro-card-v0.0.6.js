/* Lovelace Electro Card v0.0.6
 * Visual alignment and labelling polish.
 */
import "./lovelace-electro-card-v0.0.5.js";

const VERSION = "0.0.6";
const Card = customElements.get("lovelace-electro-card");
if (!Card) throw new Error("lovelace-electro-card: v0.0.5 did not register the card");

const previousRender = Card.prototype._render;

function findText(root, x, y) {
  return root.querySelector(`text[x="${x}"][y="${y}"]`);
}

function findPath(root, d) {
  return [...root.querySelectorAll("path")].find((path) => path.getAttribute("d") === d);
}

function moveText(root, x, oldY, newY) {
  const text = findText(root, x, oldY);
  if (text) text.setAttribute("y", newY);
}

function applyV006() {
  const root = this.shadowRoot;
  if (!root) return;

  // Every DC conductor and DC badge is red; equipment body colours remain unchanged.
  const style = document.createElementNS("http://www.w3.org/2000/svg", "style");
  style.textContent = `
    .dc{stroke:#ff3b45!important}
    .grid-v005{font-size:19px!important}
    .grid-v005-head{font-size:14px!important}
    .grid-v005-phase{font-size:18px!important}
  `;
  root.querySelector("svg")?.appendChild(style);
  root.querySelectorAll('rect[stroke="#11a7ff"]').forEach((rect) => rect.setAttribute("stroke", "#ff3b45"));
  [...root.querySelectorAll("text")].filter((text) => text.textContent.trim() === "DC")
    .forEach((text) => text.setAttribute("style", "fill:#ff3b45"));

  // Compact grid icon beside the title and power, freeing the panel for full-size values.
  const pylon = root.querySelector('g[transform="translate(58 110)"]');
  if (pylon) pylon.setAttribute("transform", "translate(52 112) scale(.56)");
  const gridTitle = findText(root, 145, 130);
  if (gridTitle) {
    gridTitle.setAttribute("x", "118");
    gridTitle.setAttribute("y", "126");
  }
  const powerArrow = root.querySelector('[data-v005="power-arrow"]');
  if (powerArrow) powerArrow.setAttribute("transform", "translate(-28 -8)");
  const netPower = root.querySelector('[data-v005="net-power"]');
  if (netPower) {
    netPower.setAttribute("x", "175");
    netPower.setAttribute("y", "163");
    netPower.setAttribute("style", `fill:${powerArrow?.getAttribute("fill") || "#f5f6f7"};font-size:19px`);
  }

  const columns = {
    "head-v": 200, "head-a": 255, "head-w": 310,
    "voltage-L1": 200, "voltage-L2": 200, "voltage-L3": 200,
    "current-L1": 255, "current-L2": 255, "current-L3": 255,
    "power-L1": 310, "power-L2": 310, "power-L3": 310,
    "phase-L1": 155, "phase-L2": 155, "phase-L3": 155,
    frequency: 155,
  };
  Object.entries(columns).forEach(([key, x]) => {
    root.querySelector(`[data-v005="${key}"]`)?.setAttribute("x", x);
  });

  // Battery product and position labels.
  const leftBrand = findText(root, 482, 725);
  const leftName = findText(root, 482, 764);
  const rightBrand = findText(root, 1127, 725);
  const rightName = findText(root, 1127, 764);
  if (leftBrand) leftBrand.textContent = "Batterie gauche";
  if (rightBrand) rightBrand.textContent = "Batterie droite";
  [leftName, rightName].forEach((text) => {
    if (!text) return;
    text.textContent = "Dyness PowerHaus 5,12 kWh";
    text.setAttribute("class", "s");
  });

  // Clean main-board value area and centre the remaining value.
  findPath(root, "M385 545 l28-24 28 24v34h-18v-22h-20v22h-18z")?.remove();
  findText(root, 462, 588)?.remove();
  const boardValue = findText(root, 475, 566);
  if (boardValue) {
    boardValue.setAttribute("x", "462");
    boardValue.setAttribute("text-anchor", "middle");
  }

  // Raise both load icons by 5 px; critical-load artwork is also reduced to 90%.
  const backupIcon = findPath(root, "M1058 571 l25-22 25 22v29h-16v-18h-18v18h-16z");
  if (backupIcon) backupIcon.setAttribute("transform", "translate(0 -5)");
  [
    "M1306 548 l24-8 24 8v21c0 18-12 29-24 35-12-6-24-17-24-35z",
    "M1333 552 l-11 18h10l-6 18 19-24h-9l7-12z",
  ].forEach((d) => {
    const iconPart = findPath(root, d);
    if (iconPart) iconPart.setAttribute("transform", "matrix(.9 0 0 .9 133 52.4)");
  });

  // Use an identical 29-unit baseline interval in every PV and MPPT value block.
  moveText(root, 1220, 130, 124);
  moveText(root, 1450, 249, 247);
  moveText(root, 1450, 282, 276);
  moveText(root, 655, 339, 336);
  moveText(root, 925, 339, 336);
}

Card.prototype._render = function () {
  previousRender.call(this);
  applyV006.call(this);
};

if (Array.isArray(window.customCards)) {
  const entry = window.customCards.find((card) => card.type === "lovelace-electro-card");
  if (entry) entry.description = `2D electrical-system card v${VERSION} — polished labels and red DC wiring`;
}

console.info(
  `%c LOVELACE-ELECTRO-CARD %c v${VERSION} `,
  "color:#fff;background:#0b8df0;font-weight:700;padding:2px 4px",
  "color:#0b8df0;background:#111;padding:2px 4px"
);
