// Letreiro da marca: texto na Anton (a fonte condensada do banner do canal)
// convertido em caminhos SVG na hora do build. O logo sai igual ao do banner
// e o visitante não baixa fonte nenhuma para isso.
import fs from 'node:fs';
import path from 'node:path';
import opentype from 'opentype.js';

/** @type {import('opentype.js').Font | undefined} */
let fonte;
function anton() {
  if (!fonte) {
    const arquivo = path.join(process.cwd(), 'node_modules/@fontsource/anton/files/anton-latin-400-normal.woff');
    const b = fs.readFileSync(arquivo);
    fonte = opentype.parse(b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength));
  }
  return fonte;
}

/**
 * Texto em Anton como <svg> de caminhos, recortado justo nas letras.
 * A altura do SVG é a altura das maiúsculas: com `height: 1em` no CSS, a
 * letra fica com 1em de altura.
 * @param {string} texto
 * @param {{ cor?: string, classe?: string }} [op]
 */
export function letreiro(texto, { cor = 'currentColor', classe = '' } = {}) {
  const { d, x, y, largura, altura } = caminho(texto);
  return `<svg class="${classe}" viewBox="${x} ${y} ${largura} ${altura}" aria-hidden="true" focusable="false"><path d="${d}" fill="${cor}"/></svg>`;
}

/**
 * Comandos do opentype → atributo `d`. Não uso o toPathData(): na versão 2.0
 * ele cola números ("387.2 0" sai "387.20") e o navegador recusa o caminho.
 * @param {import('opentype.js').PathCommand[]} comandos
 */
function serializar(comandos) {
  const n = (v) => String(Math.round(v * 10) / 10);
  return comandos
    .map((c) => {
      switch (c.type) {
        case 'M':
        case 'L':
          return `${c.type}${n(c.x)} ${n(c.y)}`;
        case 'Q':
          return `Q${n(c.x1)} ${n(c.y1)} ${n(c.x)} ${n(c.y)}`;
        case 'C':
          return `C${n(c.x1)} ${n(c.y1)} ${n(c.x2)} ${n(c.y2)} ${n(c.x)} ${n(c.y)}`;
        default:
          return 'Z';
      }
    })
    .join('');
}

/** Caminho cru (para compor dentro de outro SVG). Tamanho de referência: 100. */
export function caminho(texto, tamanho = 100, deslocX = 0, deslocY = 0) {
  const f = anton();
  const cap = (f.tables.os2.sCapHeight / f.unitsPerEm) * tamanho;
  const p = f.getPath(texto, deslocX, deslocY + cap, tamanho);
  const bb = p.getBoundingBox();
  const r = (n) => Math.round(n * 10) / 10;
  return {
    d: serializar(p.commands),
    x: r(bb.x1),
    y: r(bb.y1),
    largura: r(bb.x2 - bb.x1),
    altura: r(bb.y2 - bb.y1),
  };
}
