/* Lovelace Electro Card v0.0.1 */
const VERSION = "0.0.1";

class LovelaceElectroCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  static getStubConfig() {
    return { type: "custom:lovelace-electro-card" };
  }

  setConfig(config) {
    if (!config) throw new Error("Configuration required");
    this._config = config;
    this._render();
  }

  set hass(hass) {
    this._hass = hass;
    if (!this.shadowRoot.innerHTML) this._render();
  }

  getCardSize() { return 9; }
  getGridOptions() { return { columns: 12, rows: 9, min_columns: 6, min_rows: 5 }; }

  _render() {
    this.shadowRoot.innerHTML = `
      <style>
        :host{display:block}
        ha-card{overflow:hidden;background:var(--ha-card-background,var(--card-background-color,#111415));border-radius:var(--ha-card-border-radius,16px)}
        .wrap{aspect-ratio:16/9;min-height:320px;background:radial-gradient(circle at 50% 35%,rgba(255,255,255,.025),transparent 45%),#111415;color:#f4f6f7}
        svg{width:100%;height:100%;display:block;font-family:Roboto,Arial,sans-serif}
        .house{fill:none;stroke:#f4f5f6;stroke-width:5;stroke-linecap:round;stroke-linejoin:round}
        .panel{fill:#151819;stroke:#666d72;stroke-width:2}
        .bluebox{fill:#0b8df0;stroke:#33b2ff;stroke-width:2}
        .darkbox{fill:#1b1f21;stroke:#747b80;stroke-width:2}
        .edge{fill:#30363a}.orange{fill:#ff9e00}
        .t{fill:#f5f6f7;font-size:19px;font-weight:650}.s{fill:#d5dadd;font-size:15px}.v{fill:#f5f6f7;font-size:21px;font-weight:700}.vs{fill:#f5f6f7;font-size:18px;font-weight:650}
        .green{fill:#20e65d}.red{fill:#ff3b45}.yellow{fill:#ffd400}.blue{fill:#11a7ff}
        .grid,.ac,.dc{fill:none;stroke-linecap:round;stroke-linejoin:round}.grid{stroke:#edf1f3;stroke-width:7}.ac{stroke:#ffd400;stroke-width:7}.dc{stroke:#11a7ff;stroke-width:7}
        .divider{stroke:#697177;stroke-width:1.5}.tiny{fill:#d8dde0;font-size:11px}
      </style>
      <ha-card>
        <div class="wrap">
          <svg viewBox="0 0 1600 900" role="img" aria-label="Electrical energy system">
            <defs>
              <marker id="aBlue" markerWidth="10" markerHeight="10" refX="7" refY="3" orient="auto"><path d="M0 0 L0 6 L8 3 z" class="blue"/></marker>
              <marker id="aYellow" markerWidth="10" markerHeight="10" refX="7" refY="3" orient="auto"><path d="M0 0 L0 6 L8 3 z" class="yellow"/></marker>
              <marker id="aWhite" markerWidth="10" markerHeight="10" refX="7" refY="3" orient="auto"><path d="M0 0 L0 6 L8 3 z" fill="#edf1f3"/></marker>
            </defs>

            <!-- house -->
            <path class="house" d="M375 220 L800 24 L1232 230 L1232 355 L1512 355 L1560 410 L1560 850"/>
            <path class="house" d="M1232 355 H1512"/>
            ${Array.from({length:8},(_,i)=>`<line class="house" x1="${1262+i*28}" y1="292" x2="${1262+i*28}" y2="352"/>`).join("")}

            <!-- grid -->
            <g>
              <rect class="panel" x="28" y="90" width="310" height="195" rx="14"/>
              <g transform="translate(58 110)" stroke="#f0f2f3" fill="none" stroke-width="5">
                <path d="M42 0 L4 145 M42 0 L82 145 M18 38 H66 M10 68 H74 M4 100 H80 M22 145 H63"/>
                <path d="M42 0 V145 M18 38 L66 68 M66 38 L18 68 M10 68 L74 100 M74 68 L10 100 M4 100 L80 130 M80 100 L4 130"/>
              </g>
              <text class="t" x="145" y="130">Réseau public</text>
              <path class="red" d="M153 160 h-18 v-7 l-18 14 18 14 v-7 h18z"/><text class="vs" x="176" y="174">0 W</text>
              <path class="green" d="M118 198 h18 v-7 l18 14-18 14v-7h-18z"/><text class="vs" x="176" y="212">81 W</text>
              <path fill="#e8edf0" d="M149 226 l-12 23h13l-7 25 28-35h-15l8-13z"/><text class="vs" x="184" y="247">230 V</text><text class="vs" x="184" y="275">50,0 Hz</text>
            </g>

            <!-- meter + board -->
            <path class="grid" d="M338 190 H365 V355 H180 V427" marker-end="url(#aWhite)"/>
            <g><rect class="panel" x="105" y="430" width="155" height="150" rx="14"/><rect x="133" y="452" width="98" height="88" rx="12" fill="#dfe7ec" stroke="#7b858c" stroke-width="4"/><rect x="146" y="465" width="72" height="62" rx="8" fill="#f4f7f8"/><text x="182" y="508" text-anchor="middle" font-size="38" fill="#121416">↔</text><text class="t" x="182" y="563" text-anchor="middle">Compteur</text></g>
            <g><rect class="panel" x="335" y="392" width="255" height="200" rx="14"/><text class="t" x="462" y="427" text-anchor="middle">Tableau général</text><text class="t" x="462" y="452" text-anchor="middle">maison</text><rect x="405" y="470" width="115" height="58" rx="6" fill="#e9eef1" stroke="#8d969c" stroke-width="3"/><g fill="#2f3438">${[418,438,458,478,498].map(x=>`<rect x="${x}" y="483" width="15" height="27"/>`).join("")}</g><path fill="#f2f5f6" d="M385 545 l28-24 28 24v34h-18v-22h-20v22h-18z"/><text class="v" x="475" y="566">81 W</text><text class="s" x="462" y="588" text-anchor="middle">Autres charges maison</text></g>
            <path class="ac" d="M260 500 H335" marker-start="url(#aYellow)" marker-end="url(#aYellow)"/>
            <path class="ac" d="M590 500 H705" marker-start="url(#aYellow)" marker-end="url(#aYellow)"/>

            <!-- roof PV -> left MPPT only -->
            <g transform="translate(938 55)"><polygon points="0,0 140,0 178,70 38,70" fill="#096fff" stroke="#9eb8ff" stroke-width="3"/><g stroke="#b8ccff" stroke-width="1.5"><line x1="35" y1="0" x2="72" y2="70"/><line x1="70" y1="0" x2="108" y2="70"/><line x1="105" y1="0" x2="143" y2="70"/><line x1="10" y1="18" x2="150" y2="18"/><line x1="20" y1="36" x2="160" y2="36"/><line x1="30" y1="54" x2="170" y2="54"/></g></g>
            <g><rect class="panel" x="1145" y="15" width="245" height="145" rx="14"/><text class="t" x="1267" y="48" text-anchor="middle">PV Sud Toiture (30°)</text><line class="divider" x1="1166" y1="62" x2="1369" y2="62"/><circle class="yellow" cx="1185" cy="88" r="9"/><text class="vs" x="1220" y="95">0 W</text><text class="vs" x="1220" y="130">0,0 kWh</text><text class="vs" x="1220" y="153">0 V</text></g>
            <path class="dc" d="M955 98 H650 V162" marker-end="url(#aBlue)"/>

            <!-- balcony PV -> right MPPT only -->
            <g transform="translate(1270 216)"><polygon points="0,0 76,10 95,80 19,70" fill="#096fff" stroke="#9eb8ff" stroke-width="3"/><g stroke="#b8ccff" stroke-width="1.2"><line x1="19" y1="3" x2="38" y2="73"/><line x1="38" y1="5" x2="57" y2="75"/><line x1="57" y1="7" x2="76" y2="78"/><line x1="8" y1="22" x2="83" y2="31"/><line x1="13" y1="43" x2="89" y2="52"/></g></g>
            <g><rect class="panel" x="1382" y="170" width="205" height="142" rx="14"/><text class="t" x="1484" y="203" text-anchor="middle">PV Sud Balcon (60°)</text><line class="divider" x1="1402" y1="217" x2="1567" y2="217"/><circle class="yellow" cx="1418" cy="242" r="9"/><text class="vs" x="1450" y="249">35 W</text><text class="vs" x="1450" y="282">0,2 kWh</text><text class="vs" x="1450" y="305">0 V</text></g>
            <path class="dc" d="M1276 262 H1082 V208 H1012" marker-end="url(#aBlue)"/>

            <!-- MPPTs -->
            ${this._mppt(588,160,"0 W","0,0 A","0,0 V")}
            ${this._mppt(858,160,"35 W","0,0 A","0,0 V")}
            <path class="dc" d="M752 250 H780 V397" marker-end="url(#aBlue)"/><path class="dc" d="M858 250 H832 V397" marker-end="url(#aBlue)"/>
            <rect x="786" y="347" width="40" height="34" rx="8" fill="#111416" stroke="#11a7ff" stroke-width="2"/><text class="blue vs" x="806" y="371" text-anchor="middle">DC</text>

            <!-- MultiPlus -->
            <g><rect class="bluebox" x="710" y="405" width="190" height="205" rx="8"/><rect class="edge" x="710" y="405" width="190" height="16" rx="7"/><rect class="edge" x="710" y="594" width="190" height="16" rx="7"/><rect class="orange" x="724" y="472" width="162" height="8"/><text class="t" x="805" y="517" text-anchor="middle">MultiPlus</text><text class="vs" x="805" y="544" text-anchor="middle">48/2000/25-32</text><rect x="780" y="563" width="48" height="25" rx="4" fill="#1c2428"/><circle cx="841" cy="566" r="4" fill="#30df66"/><circle cx="841" cy="578" r="4" fill="#f4d400"/></g>

            <!-- loads -->
            <path class="ac" d="M900 500 H1005 V445 H1370"/><path class="ac" d="M1115 445 V475" marker-end="url(#aYellow)"/><path class="ac" d="M1370 445 V475" marker-end="url(#aYellow)"/>
            <g><rect class="panel" x="1018" y="482" width="230" height="118" rx="14"/><text class="t" x="1133" y="516" text-anchor="middle">Charges secourues</text><line class="divider" x1="1040" y1="529" x2="1226" y2="529"/><path class="green" d="M1058 571 l25-22 25 22v29h-16v-18h-18v18h-16z"/><text class="v" x="1144" y="580">80 W</text></g>
            <g><rect class="panel" x="1270" y="482" width="230" height="118" rx="14"/><text class="t" x="1385" y="516" text-anchor="middle">Charges critiques</text><line class="divider" x1="1292" y1="529" x2="1478" y2="529"/><path fill="#eef3f6" d="M1306 548 l24-8 24 8v21c0 18-12 29-24 35-12-6-24-17-24-35z"/><path fill="#171a1c" d="M1333 552 l-11 18h10l-6 18 19-24h-9l7-12z"/><text class="v" x="1395" y="580">50 W</text></g>

            <!-- shunt + batteries -->
            <path class="dc" d="M805 610 V690" marker-start="url(#aBlue)" marker-end="url(#aBlue)"/><rect x="785" y="640" width="40" height="34" rx="8" fill="#111416" stroke="#11a7ff" stroke-width="2"/><text class="blue vs" x="805" y="664" text-anchor="middle">DC</text>
            ${this._battery(360,700,"Batterie Gauche","59 %","52,46 V")}
            <g><rect class="panel" x="645" y="700" width="320" height="142" rx="14"/><rect x="684" y="721" width="34" height="25" rx="4" class="blue"/><rect x="694" y="714" width="14" height="7" rx="2" class="blue"/><text class="t" x="805" y="734" text-anchor="middle">SmartShunt</text><text class="s" x="805" y="758" text-anchor="middle">Batteries total</text><text class="vs green" x="670" y="795">SoC : 56 %</text><text class="vs" x="845" y="795">52,45 V</text><text class="vs blue" x="670" y="827">-2,50 A</text><text class="vs blue" x="845" y="827">-131 W</text></g>
            ${this._battery(1005,700,"Batterie Droite","54 %","52,45 V")}
            <path class="dc" d="M605 772 H645" marker-start="url(#aBlue)" marker-end="url(#aBlue)"/><path class="dc" d="M965 772 H1005" marker-start="url(#aBlue)" marker-end="url(#aBlue)"/>
          </svg>
        </div>
      </ha-card>`;
  }

  _mppt(x,y,power,current,voltage){
    return `<g><rect class="bluebox" x="${x}" y="${y}" width="168" height="100" rx="10"/><rect class="edge" x="${x}" y="${y}" width="168" height="10" rx="7"/><rect class="orange" x="${x+15}" y="${y+62}" width="138" height="6"/><rect x="${x+50}" y="${y+82}" width="70" height="18" rx="4" fill="#16191b"/><text class="t" x="${x+84}" y="${y+38}" text-anchor="middle">MPPT 150/35</text><text class="tiny" x="${x+84}" y="${y+56}" text-anchor="middle">SmartSolar charge controller</text><rect class="panel" x="${x-13}" y="${y+108}" width="194" height="108" rx="12"/><circle class="yellow" cx="${x+22}" cy="${y+140}" r="9"/><text class="vs" x="${x+67}" y="${y+147}">${power}</text><text class="vs" x="${x+67}" y="${y+179}">${current}</text><text class="vs" x="${x+67}" y="${y+205}">${voltage}</text></g>`;
  }

  _battery(x,y,name,soc,voltage){
    return `<g><rect class="darkbox" x="${x}" y="${y}" width="245" height="142" rx="12"/><rect x="${x}" y="${y}" width="245" height="36" rx="10" fill="#2b3034" stroke="#7e858a" stroke-width="2"/><text class="t" x="${x+122}" y="${y+25}" text-anchor="middle">DYNESS</text><text class="t" x="${x+122}" y="${y+64}" text-anchor="middle">${name}</text><rect x="${x+32}" y="${y+80}" width="40" height="28" rx="4" class="green"/><rect x="${x+43}" y="${y+72}" width="18" height="8" rx="2" class="green"/><text class="vs" x="${x+108}" y="${y+98}">${soc}</text><text class="vs" x="${x+108}" y="${y+127}">${voltage}</text></g>`;
  }
}

if (!customElements.get("lovelace-electro-card")) customElements.define("lovelace-electro-card", LovelaceElectroCard);
window.customCards = window.customCards || [];
if (!window.customCards.some(c => c.type === "lovelace-electro-card")) window.customCards.push({type:"lovelace-electro-card",name:"Lovelace Electro Card",description:`2D electrical-system visual baseline v${VERSION}`,preview:true,documentationURL:"https://github.com/adrien3287/lovelace-electro-card"});
console.info(`%c LOVELACE-ELECTRO-CARD %c v${VERSION} `,"color:#fff;background:#0b8df0;font-weight:700;padding:2px 4px","color:#0b8df0;background:#111;padding:2px 4px");
