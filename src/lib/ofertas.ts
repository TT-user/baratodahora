import fs from 'node:fs';
import path from 'node:path';
import { getCollection, type CollectionEntry } from 'astro:content';
import { CATEGORIA, CATEGORIAS, LOJA, LOJAS, miniatura } from './catalogo.mjs';

export type Oferta = CollectionEntry<'ofertas'>['data'];
export type LinkLoja = Oferta['links'][number];
export type Loja = LinkLoja['loja'];
export type Categoria = Oferta['categoria'];

const HORAS_NOVO = 48;

let cache: Promise<Oferta[]> | undefined;

/** Todas as ofertas (ativas e encerradas), da mais nova para a mais antiga. */
export function todasAsOfertas(): Promise<Oferta[]> {
  if (import.meta.env.DEV) return carregar();
  return (cache ??= carregar());
}

export async function ofertasAtivas(): Promise<Oferta[]> {
  return (await todasAsOfertas()).filter((o) => o.ativo);
}

async function carregar(): Promise<Oferta[]> {
  const entradas = await getCollection('ofertas');
  const porNumero = new Map<number, string>();
  const porSlug = new Map<string, string>();
  const erros: string[] = [];

  for (const e of entradas) {
    const o = e.data;
    const arquivo = e.filePath ?? e.id;
    const n = porNumero.get(o.numero);
    if (n) erros.push(`número #${o.numero} repetido em ${n} e ${arquivo}`);
    porNumero.set(o.numero, arquivo);
    const s = porSlug.get(o.slug);
    if (s) erros.push(`slug "${o.slug}" repetido em ${s} e ${arquivo}`);
    porSlug.set(o.slug, arquivo);
    if (!fs.existsSync(path.join(process.cwd(), 'public', o.imagem))) {
      erros.push(`${arquivo}: a imagem ${o.imagem} não existe em public/`);
    }
  }
  if (erros.length) throw new Error(`Ofertas com problema:\n  - ${erros.join('\n  - ')}`);

  return entradas.map((e) => e.data).sort((a, b) => b.numero - a.numero);
}

/* ---------- links ---------- */

export const linkPrincipal = (o: Oferta): LinkLoja => o.links.find((l) => l.tipo === 'principal')!;
export const linksAlternativos = (o: Oferta): LinkLoja[] => o.links.filter((l) => l.tipo === 'alternativa');

/** Lojas da oferta, sem repetir, na ordem fixa dos ícones. */
export const lojasDaOferta = (o: Oferta): Loja[] => LOJAS.filter((l) => o.links.some((k) => k.loja === l));

export const urlOferta = (o: Pick<Oferta, 'slug'>) => `/o/${o.slug}`;
export const urlCurta = (o: Pick<Oferta, 'numero'>) => `/${o.numero}`;

/** "na Shopee", "no Mercado Livre", "na loja" */
export function naLoja(loja: Loja): string {
  const { nome, prep } = LOJA[loja];
  return `${prep} ${nome}`;
}

export const textoBotaoLoja = (loja: Loja) => `Ver ${naLoja(loja)}`;

export const nomeLoja = (loja: Loja) => LOJA[loja].nome;

/* ---------- preço ---------- */

/** % de desconto calculado (nunca digitado). 0 quando não há preço "de". */
export function desconto(o: Pick<Oferta, 'precoDe' | 'precoPor'>): number {
  if (!o.precoDe || !o.precoPor || o.precoDe <= o.precoPor) return 0;
  return Math.round((1 - o.precoPor / o.precoDe) * 100);
}

/** 89.9 → "R$ 89,90"; 90 → "R$ 90". Espaço não separável depois do R$. */
export function reais(valor: number): string {
  const centavos = Math.round(valor * 100) % 100 !== 0;
  return `R$ ${valor.toLocaleString('pt-BR', {
    minimumFractionDigits: centavos ? 2 : 0,
    maximumFractionDigits: 2,
  })}`;
}

/* ---------- datas ---------- */

/** Data sem hora ("2026-11-07") vale como meia-noite de Brasília. */
export function msData(valor: string): number {
  return Date.parse(valor.length === 10 ? `${valor}T00:00:00-03:00` : valor);
}

/** "2026-11-07" → "07/11" */
export function diaMes(valor: string): string {
  const d = new Date(msData(valor));
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', timeZone: 'America/Sao_Paulo' });
}

export const ehNova = (o: Pick<Oferta, 'publicadoEm'>, agora = Date.now()) =>
  agora - msData(o.publicadoEm) < HORAS_NOVO * 3600_000;

/* ---------- imagens ---------- */

export function fotos(o: Pick<Oferta, 'imagem'>) {
  return {
    grande: o.imagem,
    p: miniatura(o.imagem, 200),
    m: miniatura(o.imagem, 400),
    g: miniatura(o.imagem, 600),
  };
}

/* ---------- categorias ---------- */

export const nomeCategoria = (c: Categoria) => CATEGORIA[c].nome;

/** Categorias que têm oferta ativa, na ordem do catálogo, com a contagem. */
export function categoriasComOferta(ativas: Oferta[]) {
  return CATEGORIAS.map((c) => ({
    id: c,
    ...CATEGORIA[c],
    total: ativas.filter((o) => o.categoria === c).length,
  })).filter((c) => c.total > 0);
}

/* ---------- relacionadas ---------- */

/** Mesma categoria primeiro, depois as mais recentes. Só ativas. */
export function relacionadas(o: Oferta, todas: Oferta[], quantas = 4): Oferta[] {
  const outras = todas.filter((x) => x.ativo && x.numero !== o.numero);
  const mesma = outras.filter((x) => x.categoria === o.categoria);
  const resto = outras.filter((x) => x.categoria !== o.categoria);
  return [...mesma, ...resto].slice(0, quantas);
}
