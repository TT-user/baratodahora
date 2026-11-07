// Gera as imagens de public/ a partir dos desenhos (desenhos.mjs) e da
// persona recortada (marca/).
//   npm run desenhos                         → tudo
//   npm run desenhos -- --folha caminho.png  → também uma folha de contato
// A persona: rode antes `python scripts/desenhos/recorta-persona.py marca/<foto>`.
import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import { caixaVazia, favicon, pilha, PRODUTOS } from './desenhos.mjs';
import { caminho } from '../../src/lib/marca.mjs';

const RAIZ = path.resolve(import.meta.dirname, '../..');
const PUB = path.join(RAIZ, 'public');
const MARCA = path.join(RAIZ, 'marca');
const svg = (texto) => Buffer.from(texto);

async function existe(f) {
  try {
    await fs.access(f);
    return true;
  } catch {
    return false;
  }
}

async function persona() {
  const recortada = path.join(MARCA, 'persona-recortada.png');
  const rosto = path.join(MARCA, 'persona-rosto.png');
  await fs.mkdir(path.join(PUB, 'brand'), { recursive: true });
  if (await existe(recortada)) {
    // a moldura do topo mostra ~260 px de largura: 640 cobre tela 2x com folga
    await sharp(recortada).resize(640, 640, { fit: 'inside' }).webp({ quality: 84, alphaQuality: 90, effort: 6 }).toFile(path.join(PUB, 'brand/avatar.webp'));
    await sharp(recortada).resize(420, 420, { fit: 'inside' }).webp({ quality: 82, alphaQuality: 90, effort: 6 }).toFile(path.join(PUB, 'brand/avatar-420.webp'));
    console.log('✓ public/brand/avatar.webp e avatar-420.webp (persona sem fundo)');
  } else {
    console.log('· sem marca/persona-recortada.png: avatar.webp fica como está');
  }
  if (await existe(rosto)) {
    // avatar redondo de 64 px: 192 cobre tela 3x
    await sharp(rosto).resize(192, 192).webp({ quality: 82 }).toFile(path.join(PUB, 'brand/rosto.webp'));
    console.log('✓ public/brand/rosto.webp');
  }
}

async function favicons() {
  await fs.writeFile(path.join(PUB, 'favicon.svg'), favicon(caminho));
  await sharp(svg(favicon(caminho)), { density: 300 }).resize(32, 32).png().toFile(path.join(PUB, 'favicon-32.png'));
  // ícone da tela inicial do iPhone: sem transparência, senão o iOS pinta de preto
  await sharp(svg(favicon(caminho, { cheio: true })), { density: 600 }).resize(180, 180).png().toFile(path.join(PUB, 'apple-touch-icon.png'));
  console.log('✓ favicon.svg, favicon-32.png, apple-touch-icon.png');
}

async function produtos() {
  await fs.mkdir(path.join(PUB, 'ofertas'), { recursive: true });
  for (const [numero, desenho] of Object.entries(PRODUTOS)) {
    await sharp(svg(desenho), { density: 96 })
      .resize(800, 800)
      .flatten({ background: '#FFFFFF' })
      .webp({ quality: 82 })
      .toFile(path.join(PUB, 'ofertas', `${numero}.webp`));
    console.log(`✓ public/ofertas/${numero}.webp`);
  }
}

async function folhaDeContato(saida) {
  const pecas = [
    svg(pilha('e', caminho)),
    svg(pilha('d', caminho)),
    svg(caixaVazia(caminho)),
    svg(favicon(caminho)),
    ...Object.values(PRODUTOS).map(svg),
  ];
  const lado = 400;
  const colunas = 5;
  const imagens = await Promise.all(
    pecas.map((p) => sharp(p, { density: 150 }).resize(lado, lado, { fit: 'contain', background: '#FBF6EC' }).flatten({ background: '#FBF6EC' }).png().toBuffer()),
  );
  await sharp({ create: { width: colunas * lado, height: Math.ceil(pecas.length / colunas) * lado, channels: 3, background: '#FBF6EC' } })
    .composite(imagens.map((input, i) => ({ input, left: (i % colunas) * lado, top: Math.floor(i / colunas) * lado })))
    .png()
    .toFile(saida);
  console.log(`✓ folha de contato em ${saida}`);
}

await persona();
await favicons();
await produtos();
const i = process.argv.indexOf('--folha');
if (i > -1 && process.argv[i + 1]) await folhaDeContato(path.resolve(process.argv[i + 1]));
