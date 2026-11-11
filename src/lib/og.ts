// Imagens de prévia (Open Graph) desenhadas no build com satori + sharp.
// Cada oferta ganha um cartão 1200x630 em JPG com a foto do produto, o
// número e o preço: é o que aparece quando o link é colado no WhatsApp
// (que não mostra WebP com segurança, por isso JPG e PNG).
import fs from 'node:fs/promises';
import path from 'node:path';
import satori from 'satori';
import sharp from 'sharp';
import { raiosDeSol } from '../../scripts/desenhos/desenhos.mjs';
import { desconto, reais, type Oferta } from './ofertas';
import { site, urlDoSite } from '../site.config';

const L = 1200;
const A = 630;
const TINTA = '#141210';
const CREME = '#FBF6EC';
const OURO = '#FFD60A';
const VERMELHO = '#D62828';

type No = { type: string; props: Record<string, unknown> };
type Estilo = Record<string, string | number>;
const h = (type: string, style: Estilo, ...children: (No | string | false | undefined)[]): No => ({
  type,
  props: { style, children: children.filter((c) => c !== false && c !== undefined) },
});
const img = (src: string, style: Estilo): No => ({ type: 'img', props: { src, style } });

const raiz = process.cwd();
const fonte = (arquivo: string) => fs.readFile(path.join(raiz, 'node_modules/@fontsource', arquivo));

let fontes: Promise<{ name: string; data: Buffer; weight: 400 | 700; style: 'normal' }[]> | undefined;
function carregarFontes() {
  fontes ??= Promise.all([
    fonte('archivo-black/files/archivo-black-latin-400-normal.woff'),
    fonte('dm-sans/files/dm-sans-latin-700-normal.woff'),
    fonte('anton/files/anton-latin-400-normal.woff'),
  ]).then(([ab, dm, an]) => [
    { name: 'Archivo Black', data: ab, weight: 400 as const, style: 'normal' as const },
    { name: 'DM Sans', data: dm, weight: 700 as const, style: 'normal' as const },
    { name: 'Anton', data: an, weight: 400 as const, style: 'normal' as const },
  ]);
  return fontes;
}

const svgUri = (svg: string) => `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;

/** A foto (WebP em public/) vira PNG em data URI, que o satori entende. */
async function fotoPng(caminhoPublico: string, lado: number) {
  const png = await sharp(path.join(raiz, 'public', caminhoPublico))
    .resize(lado, lado, { fit: 'contain', background: '#FFFFFF' })
    .flatten({ background: '#FFFFFF' })
    .png()
    .toBuffer();
  return `data:image/png;base64,${png.toString('base64')}`;
}

const fundoRaios = (cx: number, cy: number) =>
  svgUri(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${L} ${A}" width="${L}" height="${A}"><rect width="${L}" height="${A}" fill="${OURO}"/>${raiosDeSol(cx, cy, 1400, 36, '#FFB800')}<defs><radialGradient id="g"><stop offset="0" stop-color="#fff" stop-opacity=".8"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient></defs><circle cx="${cx}" cy="${cy}" r="330" fill="url(#g)"/></svg>`,
  );

const estrela = svgUri(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 2.6 14.8 8.7l6.6.7-4.9 4.5 1.4 6.5L12 17.1l-5.9 3.3 1.4-6.5-4.9-4.5 6.6-.7Z" fill="${VERMELHO}"/></svg>`,
);
/** Logo do banner ("BARATO" + caixa vermelha "DA HORA") numa etiqueta preta. */
const etiqueta = (tamanho = 26): No =>
  h(
    'div',
    {
      display: 'flex',
      alignItems: 'center',
      gap: Math.round(tamanho * 0.3),
      padding: `${Math.round(tamanho * 0.42)}px ${Math.round(tamanho * 0.6)}px`,
      background: TINTA,
      color: '#fff',
      borderRadius: 14,
      boxShadow: `0 6px 0 0 ${OURO}`,
      fontFamily: 'Anton',
      fontSize: tamanho * 1.2,
      lineHeight: 1,
      whiteSpace: 'nowrap',
      transform: 'rotate(-2deg)',
    },
    h('div', { display: 'flex' }, 'BARATO'),
    h(
      'div',
      {
        display: 'flex',
        padding: `${Math.round(tamanho * 0.12)}px ${Math.round(tamanho * 0.28)}px`,
        background: VERMELHO,
        border: '3px solid #fff',
        borderRadius: 6,
        whiteSpace: 'nowrap',
        transform: 'rotate(-3deg)',
      },
      'DA HORA',
    ),
  );

async function render(arvore: No, formato: 'jpg' | 'png') {
  const svg = await satori(arvore as never, { width: L, height: A, fonts: await carregarFontes() });
  const imagem = sharp(Buffer.from(svg), { density: 72 });
  return formato === 'jpg'
    ? imagem.jpeg({ quality: 84, mozjpeg: true }).toBuffer()
    : imagem.png({ compressionLevel: 9, palette: false }).toBuffer();
}

/* ------------------------------------------------------------------ */

export async function ogOferta(o: Oferta): Promise<Buffer> {
  const foto = await fotoPng(o.imagem, 440);
  const pct = desconto(o);
  const encerrada = !o.ativo;
  const tamTitulo = o.titulo.length > 60 ? 42 : o.titulo.length > 38 ? 50 : 58;
  const titulo = o.titulo.length > 90 ? `${o.titulo.slice(0, 88).trimEnd()}…` : o.titulo;
  const dominio = new URL(urlDoSite).host;

  const camada = (cor: string, transform: string): No =>
    h('div', {
      position: 'absolute',
      top: 0,
      left: 0,
      width: 452,
      height: 452,
      background: cor,
      border: `6px solid ${TINTA}`,
      borderRadius: 30,
      transform,
    });

  const arvore = h(
    'div',
    { display: 'flex', width: L, height: A, background: CREME, position: 'relative', fontFamily: 'DM Sans' },
    img(fundoRaios(300, 330), { position: 'absolute', top: 0, left: 0, width: 600, height: A, objectFit: 'cover' }),
    h('div', { position: 'absolute', top: 0, left: 600, width: 6, height: A, background: TINTA }),
    // pilha de fotos
    h(
      'div',
      { position: 'absolute', top: 82, left: 74, width: 452, height: 452, display: 'flex' },
      camada('#2D6BE4', 'rotate(-5deg) translate(-14px, -6px)'),
      camada('#D62828', 'rotate(4deg) translate(14px, 10px)'),
      h(
        'div',
        {
          position: 'absolute',
          top: 0,
          left: 0,
          width: 452,
          height: 452,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#fff',
          border: `6px solid ${TINTA}`,
          borderRadius: 30,
          overflow: 'hidden',
          boxShadow: `0 12px 0 0 ${TINTA}`,
        },
        img(foto, { width: 440, height: 440, opacity: encerrada ? 0.45 : 1 }),
      ),
      h(
        'div',
        {
          position: 'absolute',
          top: -30,
          left: -26,
          display: 'flex',
          padding: '10px 16px 12px',
          background: OURO,
          border: `5px solid ${TINTA}`,
          borderRadius: 16,
          boxShadow: `0 6px 0 0 ${TINTA}`,
          fontFamily: 'Archivo Black',
          fontSize: 44,
          transform: 'rotate(-6deg)',
        },
        `#${o.numero}`,
      ),
      pct > 0 &&
        !encerrada &&
        h(
          'div',
          {
            position: 'absolute',
            top: 34,
            right: -40,
            display: 'flex',
            padding: '10px 14px 12px',
            background: VERMELHO,
            color: '#fff',
            border: `5px solid ${TINTA}`,
            borderRadius: 16,
            boxShadow: `0 6px 0 0 ${TINTA}`,
            fontFamily: 'Archivo Black',
            fontSize: 46,
            transform: 'rotate(8deg)',
          },
          `-${pct}%`,
        ),
      encerrada &&
        h(
          'div',
          {
            position: 'absolute',
            top: 190,
            left: 70,
            display: 'flex',
            padding: '14px 22px',
            background: TINTA,
            color: '#fff',
            borderRadius: 16,
            boxShadow: `0 8px 0 0 ${OURO}`,
            fontFamily: 'Archivo Black',
            fontSize: 40,
            textTransform: 'uppercase',
            transform: 'rotate(-8deg)',
          },
          'Essa acabou',
        ),
    ),
    // texto
    h(
      'div',
      {
        position: 'absolute',
        top: 64,
        left: 660,
        width: 480,
        height: 502,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      },
      h(
        'div',
        { display: 'flex', flexDirection: 'column', gap: 18 },
        h(
          'div',
          { display: 'flex', fontFamily: 'Archivo Black', fontSize: 22, letterSpacing: 4, color: VERMELHO, textTransform: 'uppercase' },
          `Oferta #${o.numero}`,
        ),
        h('div', { display: 'flex', fontFamily: 'Archivo Black', fontSize: tamTitulo, lineHeight: 1.06, color: TINTA }, titulo),
        !!o.precoPor &&
          !encerrada &&
          h(
            'div',
            { display: 'flex', alignItems: 'center', gap: 18, marginTop: 6 },
            h(
              'div',
              {
                display: 'flex',
                padding: '10px 18px 12px',
                background: OURO,
                border: `5px solid ${TINTA}`,
                borderRadius: 16,
                boxShadow: `0 7px 0 0 ${TINTA}`,
                fontFamily: 'Archivo Black',
                fontSize: 50,
                transform: 'rotate(-2deg)',
              },
              reais(o.precoPor),
            ),
            !!o.precoDe &&
              h(
                'div',
                { display: 'flex', fontSize: 30, color: '#5B554C', textDecoration: 'line-through' },
                reais(o.precoDe),
              ),
          ),
      ),
      h(
        'div',
        { display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
        etiqueta(24),
        h('div', { display: 'flex', fontSize: 24, color: '#5B554C' }, `${dominio}/${o.numero}`),
      ),
    ),
  );

  return render(arvore, 'jpg');
}

/* ------------------------------------------------------------------ */

/** Textos do cartão de capa. Sem nada, é o da home; a /grupo troca os textos. */
export interface TextosCapa {
  faixa: string;
  /** linhas do título antes da pílula */
  antes: string[];
  pilula: string;
  pilulaFundo: string;
  pilulaTexto: string;
  /** linha do título depois da pílula */
  depois: string;
  sub: string;
}

const CAPA_HOME: TextosCapa = {
  faixa: 'Oferta nova todo dia',
  antes: ['Os achadinhos', 'dos vídeos,'],
  pilula: 'BARATOS',
  pilulaFundo: '#F25F0F',
  pilulaTexto: '#fff',
  depois: 'e num lugar só.',
  sub: site.slogan,
};

export async function ogHome(textos: Partial<TextosCapa> = {}): Promise<Buffer> {
  const t = { ...CAPA_HOME, ...textos };
  const avatar = await sharp(path.join(raiz, 'public', site.avatar)).resize(400, 400, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer();
  const avatarUri = `data:image/png;base64,${avatar.toString('base64')}`;
  const lojas = ['Shopee', 'Mercado Livre', 'Amazon', 'Cupons', 'Achadinhos', 'Shopee', 'Mercado Livre'];

  const camada = (cor: string, transform: string): No =>
    h('div', {
      position: 'absolute',
      top: 0,
      left: 0,
      width: 380,
      height: 360,
      background: cor,
      border: `6px solid ${TINTA}`,
      borderRadius: 34,
      transform,
    });

  const adesivo = (texto: string, cor: string, estilo: Estilo): No =>
    h(
      'div',
      {
        position: 'absolute',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '10px 14px',
        background: cor,
        border: `5px solid ${TINTA}`,
        borderRadius: 16,
        boxShadow: `0 6px 0 0 ${TINTA}`,
        fontFamily: 'Archivo Black',
        fontSize: 24,
        lineHeight: 1.05,
        textTransform: 'uppercase',
        ...estilo,
      },
      ...texto.split('\n').map((t, i) => h('div', { display: 'flex', fontSize: i === 1 && texto.startsWith('até') ? 40 : 24 }, t)),
    );

  const arvore = h(
    'div',
    { display: 'flex', width: L, height: A, background: CREME, position: 'relative', fontFamily: 'DM Sans' },
    h(
      'div',
      {
        position: 'absolute',
        top: 0,
        left: 0,
        width: L,
        height: 52,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: VERMELHO,
        borderBottom: `5px solid ${TINTA}`,
        color: '#fff',
        fontFamily: 'Archivo Black',
        fontSize: 22,
        letterSpacing: 3,
        textTransform: 'uppercase',
      },
      t.faixa,
    ),
    // moldura com o avatar
    h(
      'div',
      { position: 'absolute', top: 110, left: 92, width: 380, height: 360, display: 'flex' },
      camada('#2D6BE4', 'rotate(-5deg) translate(-14px, -6px)'),
      camada('#D62828', 'rotate(4deg) translate(14px, 10px)'),
      h(
        'div',
        {
          position: 'absolute',
          top: 0,
          left: 0,
          width: 380,
          height: 360,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-end',
          border: `6px solid ${TINTA}`,
          borderRadius: 34,
          overflow: 'hidden',
          boxShadow: `0 12px 0 0 ${TINTA}`,
        },
        img(fundoRaios(190, 220), { position: 'absolute', top: -135, left: -410, width: L, height: A }),
        img(avatarUri, { position: 'absolute', left: -14, bottom: -14, width: 396, height: 396 }),
      ),
      adesivo('até\n-70%', '#25D366', { top: 34, right: -64, transform: 'rotate(8deg)' }),
      adesivo('todo\ndia tem', '#FFFFFF', { bottom: 82, left: -66, transform: 'rotate(-9deg)' }),
      h('div', { position: 'absolute', bottom: -36, left: 52, display: 'flex' }, etiqueta(24)),
    ),
    // título
    h(
      'div',
      {
        position: 'absolute',
        top: 100,
        left: 590,
        width: 560,
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
        fontFamily: 'Archivo Black',
        fontSize: 58,
        lineHeight: 1.08,
        color: TINTA,
      },
      ...t.antes.map((linha) => h('div', { display: 'flex' }, linha)),
      h(
        'div',
        { display: 'flex', alignItems: 'center', gap: 16, margin: '6px 0 10px' },
        h(
          'div',
          {
            display: 'flex',
            padding: '4px 18px 10px',
            background: t.pilulaFundo,
            textTransform: 'uppercase',
            color: t.pilulaTexto,
            border: `5px solid ${TINTA}`,
            borderRadius: 18,
            boxShadow: `0 7px 0 0 ${TINTA}`,
            transform: 'rotate(-2deg)',
          },
          t.pilula,
        ),
      ),
      h('div', { display: 'flex' }, t.depois),
      h(
        'div',
        { display: 'flex', marginTop: 16, fontFamily: 'DM Sans', fontSize: 26, color: '#5B554C' },
        t.sub,
      ),
    ),
    // letreiro dourado
    h(
      'div',
      {
        position: 'absolute',
        left: 0,
        bottom: 0,
        width: L,
        height: 64,
        display: 'flex',
        alignItems: 'center',
        gap: 22,
        paddingLeft: 24,
        background: OURO,
        borderTop: `5px solid ${TINTA}`,
        fontFamily: 'Archivo Black',
        fontSize: 24,
        textTransform: 'uppercase',
        letterSpacing: 1,
        overflow: 'hidden',
      },
      ...lojas.flatMap((t) => [
        h('div', { display: 'flex', flexShrink: 0, whiteSpace: 'nowrap' }, t),
        img(estrela, { width: 24, height: 24, flexShrink: 0 }),
      ]),
    ),
  );

  return render(arvore, 'png');
}
