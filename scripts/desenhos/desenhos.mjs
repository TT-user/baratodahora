// Desenhos 2D do Barato da Hora, em SVG escrito à mão.
// - pilha(), caixa(), pacote(), etiquetaPct(): as encomendas com etiqueta
//   de % do banner do canal (decoração do topo, OG).
// - caixaVazia(): a ilustração do 404.
// - PRODUTOS: as seis imagens das ofertas de exemplo.
// - favicon(): etiqueta de % sobre o amarelo do banner.
// O texto em Anton ("%") chega pronto em caminho, por src/lib/marca.mjs.
// Tudo no mesmo traço do site: contorno preto grosso, cor chapada e sombra dura.
// `npm run desenhos` transforma estes SVGs nos arquivos de public/.

const TINTA = '#141210';
const OURO = '#FFD60A';
const VERMELHO = '#D62828';
const AZUL = '#2D6BE4';

const r = (n) => Math.round(n * 10) / 10;

/** Estrela de quatro pontas (brilho), centrada em x,y. */
function brilho(x, y, t = 26, cor = OURO) {
  const p = t * 0.28;
  return `<path d="M${x} ${y - t} Q${x + p} ${y - p} ${x + t} ${y} Q${x + p} ${y + p} ${x} ${y + t} Q${x - p} ${y + p} ${x - t} ${y} Q${x - p} ${y - p} ${x} ${y - t}Z" fill="${cor}" stroke="${TINTA}" stroke-width="6" stroke-linejoin="round"/>`;
}

/** Nuvem de vapor: círculos com contorno por fora, sem linha por dentro. */
function nuvem(circulos, contorno = 9) {
  const borda = circulos
    .map(([x, y, raio]) => `<circle cx="${x}" cy="${y}" r="${raio}" fill="${TINTA}" stroke="${TINTA}" stroke-width="${contorno * 2}"/>`)
    .join('');
  const miolo = circulos.map(([x, y, raio]) => `<circle cx="${x}" cy="${y}" r="${raio}" fill="#FFFFFF"/>`).join('');
  return `<g stroke="none">${borda}${miolo}</g>`;
}

/* ------------------------------------------------------------------ */
/* Caixas, pacotes e etiquetas (o desenho do banner do canal)          */
/* ------------------------------------------------------------------ */

const PAPELAO = '#C9965B';
const PAPELAO_ESCURO = '#A87A45';
const FITA = '#E7CFA0';
const CINZA = '#BFC5CB';
const CINZA_ESCURO = '#9AA2AA';

/** Caixa de papelão vista de frente, com fita e etiqueta de envio. */
export function caixa(x, y, w, h, giro = 0, { fita = 0.42, rotulo = true } = {}) {
  const cx = r(x + w / 2);
  const cy = r(y + h / 2);
  return `<g transform="rotate(${giro} ${cx} ${cy})">
    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="6" fill="${PAPELAO}" stroke="${TINTA}" stroke-width="6"/>
    <rect x="${r(x + w * fita)}" y="${y}" width="${r(w * 0.13)}" height="${h}" fill="${FITA}" stroke="${TINTA}" stroke-width="4"/>
    ${rotulo ? `<rect x="${r(x + w * 0.08)}" y="${r(y + h * 0.6)}" width="${r(w * 0.24)}" height="${r(h * 0.19)}" rx="3" fill="#FFFFFF" stroke="${TINTA}" stroke-width="4"/>` : ''}
  </g>`;
}

/** Envelope plástico de encomenda (o pacote cinza do banner). */
export function pacote(x, y, w, h, giro = 0, cor = CINZA, faixa = CINZA_ESCURO) {
  const cx = r(x + w / 2);
  const cy = r(y + h / 2);
  const b = r(h * 0.15);
  const rr = 18;
  const meio = r(y + h * 0.43);
  const baixo = `M${x} ${y + b} L${x + w} ${y + b} L${x + w} ${y + h - rr} Q${x + w} ${y + h} ${x + w - rr} ${y + h} L${x + rr} ${y + h} Q${x} ${y + h} ${x} ${y + h - rr}Z`;
  return `<g transform="rotate(${giro} ${cx} ${cy})">
    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rr}" fill="${faixa}"/>
    <path d="${baixo}" fill="${cor}"/>
    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rr}" fill="none" stroke="${TINTA}" stroke-width="6"/>
    <path d="M${x} ${y + b} L${x + w} ${y + b}" stroke="${TINTA}" stroke-width="5"/>
    <g transform="rotate(4 ${cx} ${meio})">
      <rect x="${r(x + w * 0.16)}" y="${r(y + h * 0.3)}" width="${r(w * 0.68)}" height="${r(h * 0.27)}" rx="5" fill="#FFFFFF" stroke="${TINTA}" stroke-width="5"/>
      <rect x="${r(x + w * 0.24)}" y="${r(y + h * 0.37)}" width="${r(w * 0.46)}" height="10" rx="5" fill="${TINTA}"/>
      <rect x="${r(x + w * 0.24)}" y="${r(y + h * 0.46)}" width="${r(w * 0.3)}" height="9" rx="4.5" fill="${faixa}"/>
    </g>
  </g>`;
}

/**
 * Etiqueta vermelha com "%" na Anton, como no banner.
 * @param {(t: string, tam: number) => { d: string, x: number, y: number, largura: number, altura: number }} caminho
 */
export function etiquetaPct(x, y, w, h, giro, caminho) {
  const cx = r(x + w / 2);
  const cy = r(y + h / 2);
  const pct = caminho('%', h * 0.78);
  const tx = r(cx - (pct.x + pct.largura / 2));
  const ty = r(cy - (pct.y + pct.altura / 2));
  return `<g transform="rotate(${giro} ${cx} ${cy})">
    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="12" fill="${VERMELHO}" stroke="${TINTA}" stroke-width="6"/>
    <path d="${pct.d}" fill="#FFFFFF" transform="translate(${tx} ${ty})"/>
  </g>`;
}

/**
 * Pilha de encomendas com a etiqueta de %, dos dois lados do topo, como no
 * banner. O lado "d" tem o envelope branco.
 * @param {'e' | 'd'} lado
 * @param {(t: string, tam: number) => { d: string, x: number, y: number, largura: number, altura: number }} caminho
 */
export function pilha(lado, caminho) {
  const corpo =
    lado === 'e'
      ? caixa(20, 104, 240, 186, -6) +
        caixa(84, 286, 250, 108, 3, { fita: 0.4, rotulo: false }) +
        pacote(214, 18, 210, 262, 8) +
        etiquetaPct(298, 292, 128, 70, -12, caminho)
      : caixa(206, 112, 238, 184, 5, { fita: 0.6 }) +
        caixa(140, 288, 250, 108, -3, { fita: 0.5, rotulo: false }) +
        pacote(42, 20, 208, 262, -8, '#F4F5F7', '#D6DADF') +
        etiquetaPct(30, 292, 128, 70, 10, caminho);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 460 410" stroke-linejoin="round" stroke-linecap="round">${corpo}</svg>`;
}

/**
 * Caixa aberta e vazia: a ilustração do 404. As classes .cv-* animam no CSS.
 * @param {(t: string, tam: number) => { d: string, x: number, y: number, largura: number, altura: number }} caminho
 */
export function caixaVazia(caminho) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 520 470" stroke="${TINTA}" stroke-linejoin="round" stroke-linecap="round">
  <ellipse cx="262" cy="446" rx="200" ry="16" fill="${TINTA}" opacity=".12" stroke="none"/>
  <g class="cv-caixa">
    <g class="cv-aba-tras"><path d="M165 176 L438 176 L452 104 L182 104Z" fill="${PAPELAO}" stroke-width="7"/></g>
    <g class="cv-aba-esq"><path d="M112 226 L165 176 L120 106 L64 150Z" fill="${PAPELAO}" stroke-width="7"/></g>
    <path d="M112 226 L165 176 L438 176 L386 226Z" fill="#5E4022" stroke-width="7"/>
    <path d="M150 214 L180 188 L420 188" fill="none" stroke="#3E2A16" stroke-width="10" opacity=".6"/>
    <path d="M386 226 L438 176 L438 372 L386 424Z" fill="${PAPELAO_ESCURO}" stroke-width="7"/>
    <rect x="112" y="226" width="274" height="198" fill="${PAPELAO}" stroke-width="7"/>
    <rect x="226" y="226" width="40" height="198" fill="${FITA}" stroke-width="5"/>
    <rect x="132" y="336" width="78" height="48" rx="4" fill="#FFFFFF" stroke-width="5"/>
    <path d="M144 352 L196 352 M144 368 L180 368" stroke-width="5"/>
    <g class="cv-aba-frente"><path d="M112 226 L386 226 L404 284 L94 284Z" fill="#D9A86C" stroke-width="7"/></g>
    <g class="cv-aba-dir"><path d="M386 226 L438 176 L498 214 L446 264Z" fill="${PAPELAO}" stroke-width="7"/></g>
  </g>
  <g class="cv-etiqueta">
    <path d="M438 250 L452 290" stroke-width="4" fill="none"/>
    ${etiquetaPct(408, 282, 100, 56, 14, caminho)}
  </g>
</svg>`;
}

/** Raios de sol: fatias alternadas em volta de (cx, cy). Usado no OG. */
export function raiosDeSol(cx, cy, raio, fatias, cor) {
  const passo = 360 / fatias;
  let d = '';
  for (let i = 0; i < fatias; i += 2) {
    const a1 = (i * passo * Math.PI) / 180;
    const a2 = ((i + 1) * passo * Math.PI) / 180;
    d += `M${cx} ${cy} L${r(cx + raio * Math.cos(a1))} ${r(cy + raio * Math.sin(a1))} L${r(cx + raio * Math.cos(a2))} ${r(cy + raio * Math.sin(a2))}Z`;
  }
  return `<path d="${d}" fill="${cor}"/>`;
}

/* ------------------------------------------------------------------ */
/* Produtos das ofertas de exemplo                                     */
/* ------------------------------------------------------------------ */

/**
 * Moldura comum: fundo branco (como foto de loja), círculo pastel atrás,
 * brilhos e uma sombra dura do produto inteiro, deslocada para baixo.
 */
function produto(fundoPastel, desenho, brilhos = [[150, 170], [660, 600], [640, 150]]) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800" width="800" height="800">
  <defs>
    <filter id="sombra" x="-10%" y="-10%" width="130%" height="130%">
      <feFlood flood-color="${TINTA}" result="tinta"/>
      <feComposite in="tinta" in2="SourceAlpha" operator="in"/>
    </filter>
    <g id="p" stroke="${TINTA}" stroke-linejoin="round" stroke-linecap="round">${desenho}</g>
  </defs>
  <rect width="800" height="800" fill="#FFFFFF"/>
  <circle cx="400" cy="410" r="300" fill="${fundoPastel}"/>
  <circle cx="400" cy="410" r="300" fill="none" stroke="${TINTA}" stroke-width="5" stroke-dasharray="4 18" stroke-linecap="round" opacity=".35"/>
  ${brilhos.map(([x, y], i) => brilho(x, y, i === 0 ? 30 : 22)).join('')}
  <ellipse cx="400" cy="712" rx="220" ry="24" fill="${TINTA}" opacity=".12"/>
  <use href="#p" transform="translate(10 14)" filter="url(#sombra)"/>
  <use href="#p"/>
</svg>`;
}

const passador = produto(
  '#DCE8FF',
  `
  <path d="M402 652 C404 722 520 712 560 650 S650 566 694 612" fill="none" stroke-width="13"/>
  <rect x="680" y="598" width="44" height="34" rx="8" fill="${TINTA}" transform="rotate(30 702 615)"/>
  <g transform="rotate(-6 400 430)">
    <path d="M340 330 L460 330 Q478 330 478 350 L490 610 Q492 662 440 662 L360 662 Q308 662 310 610 L322 350 Q322 330 340 330Z" fill="${AZUL}" stroke-width="13"/>
    <path d="M345 366 L338 604" fill="none" stroke="#FFFFFF" stroke-width="11" opacity=".45"/>
    <rect x="355" y="478" width="90" height="152" rx="34" fill="#CDEBFF" stroke-width="10"/>
    <path d="M360 560 Q380 544 400 560 T440 560 L440 600 Q440 625 415 625 L385 625 Q360 625 360 600Z" fill="#6EC1FF" stroke="none"/>
    <circle cx="384" cy="592" r="7" fill="#FFFFFF" stroke="none"/><circle cx="414" cy="604" r="5" fill="#FFFFFF" stroke="none"/>
    <circle cx="400" cy="402" r="28" fill="${OURO}" stroke-width="11"/>
    <path d="M400 386 L400 400" fill="none" stroke-width="7"/>
    <path d="M390 394 A13 13 0 1 0 410 394" fill="none" stroke-width="6"/>
    <rect x="368" y="282" width="64" height="56" rx="12" fill="#FFFFFF" stroke-width="11"/>
    <g transform="rotate(-9 400 236)">
      <rect x="242" y="184" width="316" height="112" rx="56" fill="#EFEFEF" stroke-width="13"/>
      <rect x="268" y="204" width="264" height="36" rx="18" fill="#FFFFFF" stroke-width="9"/>
      ${[300, 334, 368, 402, 436, 470, 500].map((x) => `<circle cx="${x}" cy="222" r="6" fill="${TINTA}" stroke="none"/>`).join('')}
    </g>
    <path d="M206 262 A190 120 0 0 1 238 158" fill="none" stroke-width="11"/>
    <path d="M222 168 L240 154 L248 178" fill="none" stroke-width="11"/>
    <path d="M594 140 A190 120 0 0 1 612 246" fill="none" stroke-width="11"/>
    <path d="M626 236 L612 252 L598 232" fill="none" stroke-width="11"/>
  </g>
  ${nuvem([[300, 118, 30], [336, 96, 38], [374, 116, 28]])}
  ${nuvem([[432, 74, 28], [468, 58, 34], [500, 80, 24]])}
  ${nuvem([[530, 136, 22], [556, 122, 26]])}
`,
);

const airfryer = produto(
  '#FFE6D2',
  `
  <path d="M330 168 q18 -22 0 -44 q-18 -22 0 -44" fill="none" stroke="${VERMELHO}" stroke-width="11"/>
  <path d="M400 160 q18 -22 0 -44 q-18 -22 0 -44" fill="none" stroke="${VERMELHO}" stroke-width="11"/>
  <path d="M470 168 q18 -22 0 -44 q-18 -22 0 -44" fill="none" stroke="${VERMELHO}" stroke-width="11"/>
  <rect x="582" y="164" width="28" height="96" rx="9" fill="${OURO}" stroke-width="9" transform="rotate(26 596 212)"/>
  <rect x="624" y="196" width="28" height="84" rx="9" fill="${OURO}" stroke-width="9" transform="rotate(44 638 238)"/>
  <rect x="160" y="190" width="28" height="86" rx="9" fill="${OURO}" stroke-width="9" transform="rotate(-30 174 233)"/>
  <rect x="276" y="648" width="54" height="30" rx="9" fill="${TINTA}"/>
  <rect x="470" y="648" width="54" height="30" rx="9" fill="${TINTA}"/>
  <rect x="228" y="188" width="344" height="474" rx="82" fill="#F6F1E7" stroke-width="13"/>
  <path d="M262 236 Q262 214 290 214" fill="none" stroke="#FFFFFF" stroke-width="12"/>
  <rect x="278" y="230" width="244" height="98" rx="28" fill="${TINTA}"/>
  <path d="M318 300 Q296 280 312 256 Q318 272 330 270 Q326 254 340 244 Q342 266 352 280 Q356 300 336 306 Q326 308 318 300Z" fill="${VERMELHO}" stroke="none"/>
  <rect x="384" y="256" width="11" height="48" rx="5" fill="${OURO}" stroke="none"/>
  <rect x="408" y="256" width="30" height="48" rx="10" fill="none" stroke="${OURO}" stroke-width="8"/>
  <path d="M410 280 L436 280" stroke="${OURO}" stroke-width="7"/>
  <rect x="450" y="256" width="30" height="48" rx="10" fill="none" stroke="${OURO}" stroke-width="8"/>
  <circle cx="496" cy="260" r="7" fill="none" stroke="${OURO}" stroke-width="5"/>
  <circle cx="400" cy="394" r="44" fill="${OURO}" stroke-width="11"/>
  <path d="M400 394 L400 362" fill="none" stroke-width="10"/>
  <path d="M232 456 L568 456" fill="none" stroke-width="10"/>
  <rect x="250" y="472" width="300" height="160" rx="42" fill="${VERMELHO}" stroke-width="13"/>
  <path d="M276 502 Q276 490 292 490 L360 490" fill="none" stroke="#FFFFFF" stroke-width="10" opacity=".55"/>
  <rect x="318" y="520" width="164" height="52" rx="26" fill="${TINTA}"/>
`,
);

const parafusadeira = produto(
  '#FFF0C2',
  `
  <g transform="translate(-56 26)">
    <path d="M700 238 A70 70 0 0 1 760 270" fill="none" stroke-width="10"/>
    <path d="M700 362 A70 70 0 0 0 760 330" fill="none" stroke-width="10"/>
    <path d="M778 300 L812 300" fill="none" stroke-width="10"/>
    <rect x="284" y="560" width="232" height="98" rx="22" fill="${TINTA}"/>
    <rect x="302" y="582" width="196" height="18" rx="9" fill="${OURO}" stroke="none"/>
    <path d="M412 612 L392 640 L404 640 L396 660 L420 628 L408 628 L416 612Z" fill="${OURO}" stroke="none"/>
    <path d="M330 350 L470 350 L482 572 L340 572Z" fill="#FF6A13" stroke-width="13"/>
    <path d="M352 384 L456 384 L463 546 L360 546Z" fill="${TINTA}" stroke="none"/>
    <path d="M366 414 L452 414 M368 448 L455 448 M370 482 L458 482 M372 516 L460 516" fill="none" stroke="#5A534C" stroke-width="9"/>
    <path d="M474 376 Q506 382 502 426 L478 430Z" fill="${TINTA}" stroke-width="8"/>
    <path d="M290 228 L560 228 Q592 228 592 260 L592 340 Q592 372 560 372 L290 372 Q218 372 218 300 Q218 228 290 228Z" fill="#FF6A13" stroke-width="13"/>
    <path d="M262 268 L262 332 M292 262 L292 338 M322 268 L322 332" fill="none" stroke-width="10"/>
    <path d="M360 252 L500 252" fill="none" stroke="#FFFFFF" stroke-width="11" opacity=".55"/>
    <rect x="520" y="228" width="36" height="144" fill="${TINTA}" stroke-width="13"/>
    <circle cx="568" cy="352" r="8" fill="${OURO}" stroke-width="5"/>
    <path d="M592 254 L662 268 L662 332 L592 346Z" fill="#CFC9BF" stroke-width="13"/>
    <path d="M614 266 L614 334 M638 270 L638 330" fill="none" stroke-width="8"/>
    <rect x="662" y="288" width="72" height="24" fill="#8E8A84" stroke-width="9"/>
    <path d="M734 288 L766 300 L734 312Z" fill="#8E8A84" stroke-width="9"/>
  </g>
`,
  [[140, 180], [650, 640], [610, 140]],
);

const fone = produto(
  '#DDF5E6',
  `
  <path d="M238 426 Q238 300 345 300 L455 300 Q562 300 562 426Z" fill="#ECECEC" stroke-width="13" transform="rotate(-7 400 426)"/>
  <path d="M230 428 L570 428 L570 520 Q570 626 465 626 L335 626 Q230 626 230 520Z" fill="#FFFFFF" stroke-width="13"/>
  <ellipse cx="336" cy="436" rx="48" ry="15" fill="${TINTA}"/>
  <ellipse cx="464" cy="436" rx="48" ry="15" fill="${TINTA}"/>
  <path d="M258 474 Q258 560 300 590" fill="none" stroke="#E4E4E4" stroke-width="14"/>
  <circle cx="380" cy="578" r="9" fill="#25D366" stroke-width="5"/>
  <circle cx="400" cy="578" r="9" fill="#25D366" stroke-width="5"/>
  <circle cx="420" cy="578" r="9" fill="${OURO}" stroke-width="5"/>
  <g transform="translate(318 196) rotate(-18)">
    <rect x="-17" y="0" width="34" height="124" rx="17" fill="#FFFFFF" stroke-width="11"/>
    <rect x="-17" y="102" width="34" height="22" rx="11" fill="${AZUL}" stroke-width="11"/>
    <circle cx="0" cy="-10" r="46" fill="#FFFFFF" stroke-width="11"/>
    <circle cx="-8" cy="-16" r="19" fill="#5B554C" stroke="none"/>
  </g>
  <g transform="translate(484 176) rotate(17)">
    <rect x="-17" y="0" width="34" height="124" rx="17" fill="#FFFFFF" stroke-width="11"/>
    <rect x="-17" y="102" width="34" height="22" rx="11" fill="${AZUL}" stroke-width="11"/>
    <circle cx="0" cy="-10" r="46" fill="#FFFFFF" stroke-width="11"/>
    <circle cx="8" cy="-16" r="19" fill="#5B554C" stroke="none"/>
  </g>
  <path d="M604 236 L604 150 L656 136 L656 220" fill="none" stroke-width="11"/>
  <path d="M604 166 L656 152" fill="none" stroke-width="11"/>
  <ellipse cx="590" cy="238" rx="20" ry="14" fill="${TINTA}" transform="rotate(-18 590 238)"/>
  <ellipse cx="642" cy="222" rx="20" ry="14" fill="${TINTA}" transform="rotate(-18 642 222)"/>
  <path d="M176 312 L176 236 Q206 246 210 272" fill="none" stroke-width="11"/>
  <ellipse cx="162" cy="314" rx="20" ry="14" fill="${TINTA}" transform="rotate(-18 162 314)"/>
  <path d="M600 330 A60 60 0 0 1 612 390" fill="none" stroke-width="10"/>
  <path d="M632 310 A96 96 0 0 1 650 410" fill="none" stroke-width="10"/>
`,
  [[150, 470], [660, 600], [250, 120]],
);

const cerdas = [];
for (let y = 136; y <= 392; y += 36) {
  for (let x = 304; x <= 496; x += 36) {
    const dx = (x - 400) / 104;
    const dy = (y - 262) / 142;
    if (dx * dx + dy * dy <= 1) cerdas.push(`<circle cx="${x + ((y / 36) % 2 ? 18 : 0)}" cy="${y}" r="8.5" fill="${OURO}" stroke-width="6"/>`);
  }
}
const escova = produto(
  '#FFE3EF',
  `
  <path d="M382 694 C350 744 250 716 230 664" fill="none" stroke-width="12" transform="rotate(16 400 430)"/>
  <g transform="rotate(16 400 430)">
    <rect x="348" y="430" width="104" height="272" rx="50" fill="#FF8FC0" stroke-width="13"/>
    <path d="M370 470 L370 660" fill="none" stroke="#FFFFFF" stroke-width="11" opacity=".5"/>
    <rect x="380" y="490" width="40" height="76" rx="20" fill="#FFFFFF" stroke-width="10"/>
    <circle cx="400" cy="512" r="6" fill="${TINTA}" stroke="none"/>
    <circle cx="400" cy="544" r="6" fill="${VERMELHO}" stroke="none"/>
    <rect x="338" y="408" width="124" height="42" rx="14" fill="${TINTA}"/>
    <ellipse cx="400" cy="262" rx="126" ry="166" fill="#3A3330" stroke-width="13"/>
    <ellipse cx="400" cy="262" rx="104" ry="142" fill="#4A423E" stroke="none"/>
    ${cerdas.join('')}
  </g>
  <path d="M190 260 q-22 -18 0 -36 q22 -18 0 -36" fill="none" stroke="#FF6A13" stroke-width="11"/>
  <path d="M150 330 q-22 -18 0 -36 q22 -18 0 -36" fill="none" stroke="#FF6A13" stroke-width="11"/>
  <path d="M640 230 q22 -18 0 -36 q-22 -18 0 -36" fill="none" stroke="#FF6A13" stroke-width="11"/>
`,
  [[620, 360], [170, 560], [650, 600]],
);

const petalas = [0, 60, 120, 180, 240, 300]
  .map((g) => `<ellipse cx="400" cy="282" rx="22" ry="34" fill="#FFFFFF" stroke-width="9" transform="rotate(${g} 400 316)"/>`)
  .join('');
const jato = (d) => `<path d="${d}" fill="none" stroke="${TINTA}" stroke-width="22"/><path d="${d}" fill="none" stroke="#56B8FF" stroke-width="10"/>`;
const fonte = produto(
  '#DDF1FF',
  `
  <g>
    <path d="M598 452 L612 380 L646 418Z" fill="#FF9F43" stroke-width="11"/>
    <path d="M702 452 L688 380 L654 418Z" fill="#FF9F43" stroke-width="11"/>
    <circle cx="650" cy="470" r="74" fill="#FF9F43" stroke-width="13"/>
    <path d="M610 440 L622 404 L636 430Z" fill="#FFC9A0" stroke="none"/>
    <ellipse cx="626" cy="462" rx="11" ry="15" fill="${TINTA}"/>
    <ellipse cx="674" cy="462" rx="11" ry="15" fill="${TINTA}"/>
    <circle cx="622" cy="456" r="4" fill="#FFFFFF" stroke="none"/><circle cx="670" cy="456" r="4" fill="#FFFFFF" stroke="none"/>
    <path d="M642 488 L658 488 L650 498Z" fill="#FF6B7A" stroke-width="6"/>
    <path d="M598 494 L560 488 M600 508 L562 512 M702 494 L740 488 M700 508 L738 512" fill="none" stroke-width="6"/>
  </g>
  ${jato('M400 286 Q300 180 248 452')}
  ${jato('M400 286 Q500 180 552 452')}
  ${jato('M400 286 L400 196')}
  <circle cx="400" cy="172" r="12" fill="#56B8FF" stroke-width="7"/>
  <circle cx="372" cy="150" r="8" fill="#56B8FF" stroke-width="6"/>
  <circle cx="430" cy="146" r="8" fill="#56B8FF" stroke-width="6"/>
  <path d="M206 476 L594 476 L566 640 Q560 672 530 672 L270 672 Q240 672 234 640Z" fill="#7FD9A8" stroke-width="13"/>
  <path d="M250 520 L268 636" fill="none" stroke="#FFFFFF" stroke-width="11" opacity=".55"/>
  <rect x="186" y="446" width="428" height="52" rx="26" fill="#FFFFFF" stroke-width="13"/>
  <ellipse cx="400" cy="466" rx="184" ry="12" fill="#8ED0FF" stroke="none"/>
  <path d="M300 458 Q300 330 400 330 Q500 330 500 458Z" fill="#CDEBFF" stroke-width="13"/>
  <path d="M330 420 Q334 368 372 352" fill="none" stroke="#FFFFFF" stroke-width="11"/>
  ${petalas}
  <circle cx="400" cy="316" r="22" fill="${OURO}" stroke-width="9"/>
  <g fill="${TINTA}" stroke="none" transform="translate(148 600) rotate(-18)">
    <ellipse cx="0" cy="18" rx="26" ry="22"/>
    <ellipse cx="-28" cy="-14" rx="10" ry="13"/><ellipse cx="-9" cy="-28" rx="10" ry="13"/>
    <ellipse cx="12" cy="-28" rx="10" ry="13"/><ellipse cx="30" cy="-14" rx="10" ry="13"/>
  </g>
`,
  [[170, 200], [640, 170], [690, 640]],
);

/** As seis imagens das ofertas de exemplo, por número. */
export const PRODUTOS = {
  231: passador,
  230: airfryer,
  229: parafusadeira,
  228: fone,
  227: escova,
  226: fonte,
};

/* ------------------------------------------------------------------ */
/* Favicon                                                             */
/* ------------------------------------------------------------------ */

/**
 * Etiqueta vermelha de % sobre o amarelo do banner. `cheio`: quadrado sem
 * cantos nem transparência (ícone da tela inicial do iPhone).
 * @param {(t: string, tam: number) => { d: string, x: number, y: number, largura: number, altura: number }} caminho
 */
export function favicon(caminho, { cheio = false } = {}) {
  const fundo = cheio
    ? `<rect width="64" height="64" fill="${OURO}"/>`
    : `<rect x="2.5" y="2.5" width="59" height="59" rx="15" fill="${OURO}" stroke="${TINTA}" stroke-width="4"/>`;
  const pct = caminho('%', 30);
  const tx = r(32 - (pct.x + pct.largura / 2));
  const ty = r(33 - (pct.y + pct.altura / 2));
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">${fundo}<g transform="rotate(-12 32 33)"><rect x="10" y="20" width="44" height="32" rx="6" fill="${TINTA}"/><rect x="10" y="17" width="44" height="32" rx="6" fill="${VERMELHO}" stroke="${TINTA}" stroke-width="3.5"/><path d="${pct.d}" fill="#FFFFFF" transform="translate(${tx} ${ty})"/></g></svg>`;
}
