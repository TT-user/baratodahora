// Catálogo compartilhado entre o site (Astro) e os scripts de terminal.
// JavaScript puro de propósito: o `npm run nova-oferta` importa este arquivo
// direto no Node, sem etapa de build.

/** Lojas aceitas no campo `links[].loja`. A ordem aqui é a ordem dos ícones. */
export const LOJAS = /** @type {const} */ (['shopee', 'mercadolivre', 'amazon', 'magalu', 'aliexpress', 'outra']);

/** @type {Record<(typeof LOJAS)[number], { nome: string, prep: 'na' | 'no', marca: string }>} */
export const LOJA = {
  shopee: { nome: 'Shopee', prep: 'na', marca: 'S' },
  mercadolivre: { nome: 'Mercado Livre', prep: 'no', marca: 'ML' },
  amazon: { nome: 'Amazon', prep: 'na', marca: 'a' },
  magalu: { nome: 'Magalu', prep: 'na', marca: 'M' },
  aliexpress: { nome: 'AliExpress', prep: 'no', marca: 'AE' },
  outra: { nome: 'loja', prep: 'na', marca: '↗' },
};

/** Categorias aceitas no campo `categoria`. A ordem aqui é a ordem dos chips. */
export const CATEGORIAS = /** @type {const} */ ([
  'casa',
  'cozinha',
  'ferramentas',
  'beleza',
  'tech',
  'pet',
  'infantil',
  'outros',
]);

/** @type {Record<(typeof CATEGORIAS)[number], { nome: string, emoji: string }>} */
export const CATEGORIA = {
  casa: { nome: 'Casa', emoji: '🏠' },
  cozinha: { nome: 'Cozinha', emoji: '🍳' },
  ferramentas: { nome: 'Ferramentas', emoji: '🔧' },
  beleza: { nome: 'Beleza', emoji: '💄' },
  tech: { nome: 'Tech', emoji: '🎧' },
  pet: { nome: 'Pet', emoji: '🐾' },
  infantil: { nome: 'Infantil', emoji: '🧸' },
  outros: { nome: 'Outros', emoji: '📦' },
};

/** Apelidos que o script e o comando /nova-oferta entendem para cada loja. */
export const APELIDOS_LOJA = {
  shopee: 'shopee',
  shp: 'shopee',
  ml: 'mercadolivre',
  meli: 'mercadolivre',
  mercadolivre: 'mercadolivre',
  'mercado-livre': 'mercadolivre',
  'mercado livre': 'mercadolivre',
  amazon: 'amazon',
  amz: 'amazon',
  magalu: 'magalu',
  'magazine luiza': 'magalu',
  magazineluiza: 'magalu',
  ali: 'aliexpress',
  aliexpress: 'aliexpress',
  outra: 'outra',
  loja: 'outra',
};

/**
 * Descobre a loja pelo endereço do link.
 * @param {string} url
 * @returns {(typeof LOJAS)[number]}
 */
export function lojaPorUrl(url) {
  let host = '';
  try {
    host = new URL(url).hostname.toLowerCase();
  } catch {
    return 'outra';
  }
  if (host.includes('shopee') || host === 'shp.ee') return 'shopee';
  if (host.includes('mercadolivre') || host.includes('mercadolibre') || host.includes('meli.la')) return 'mercadolivre';
  if (host.includes('amazon') || host === 'amzn.to' || host.endsWith('.a.co') || host === 'a.co') return 'amazon';
  if (host.includes('magazineluiza') || host.includes('magalu')) return 'magalu';
  if (host.includes('aliexpress') || host.includes('alicdn')) return 'aliexpress';
  return 'outra';
}

/**
 * Título → slug de URL ("Passador a Vapor" → "passador-a-vapor").
 * Corta em ~70 caracteres sem partir palavra.
 * @param {string} texto
 */
export function slugify(texto) {
  const base = String(texto)
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  if (base.length <= 70) return base;
  const corte = base.slice(0, 70);
  const ultimo = corte.lastIndexOf('-');
  return ultimo > 30 ? corte.slice(0, ultimo) : corte;
}

/** Larguras das miniaturas geradas no build (ver integrations/miniaturas.mjs). */
export const LARGURAS_MINI = /** @type {const} */ ([200, 400, 600]);

/**
 * Caminho público da miniatura de uma imagem de oferta.
 * "/ofertas/231.webp" + 200 → "/_mini/ofertas_231-200.webp"
 * @param {string} imagem
 * @param {number} largura
 */
export function miniatura(imagem, largura) {
  const nome = imagem.replace(/^\/+/, '').replace(/\.[a-z0-9]+$/i, '').replace(/[\\/]+/g, '_');
  return `/_mini/${nome}-${largura}.webp`;
}
