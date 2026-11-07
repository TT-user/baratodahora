// Leitura das ofertas direto do disco, para quem roda antes da Content
// Collection existir: o astro.config (atalhos /231) e a integração das
// miniaturas. Ofertas inválidas são puladas aqui; quem reclama delas, com
// a mensagem completa, é a Content Collection no build.
import fs from 'node:fs';
import path from 'node:path';
import { ofertaSchema } from '../src/lib/oferta-schema.mjs';

export const PASTA_OFERTAS = 'src/content/ofertas';

/** @param {string} raiz pasta do projeto */
export function lerOfertas(raiz = process.cwd()) {
  const pasta = path.join(raiz, PASTA_OFERTAS);
  if (!fs.existsSync(pasta)) return [];
  const ofertas = [];
  for (const arquivo of fs.readdirSync(pasta).filter((f) => f.endsWith('.json')).sort()) {
    try {
      const bruto = JSON.parse(fs.readFileSync(path.join(pasta, arquivo), 'utf8'));
      const r = ofertaSchema.safeParse(bruto);
      if (r.success) ofertas.push({ ...r.data, arquivo });
    } catch {
      // JSON quebrado: o build vai apontar o erro com detalhe.
    }
  }
  return ofertas;
}

/** Caminhos que já são páginas do site e não podem virar atalho de número. */
const RESERVADOS = new Set(['404', '500']);

/**
 * Um redirect 301 por número: /231 → /o/passador-a-vapor-ferro-rotativo.
 * Na Vercel vira 301 de verdade; em qualquer outro lugar, o Astro gera uma
 * página com meta refresh e canonical.
 */
export function atalhosPorNumero(raiz = process.cwd()) {
  /** @type {Record<string, { status: 301, destination: string }>} */
  const atalhos = {};
  for (const o of lerOfertas(raiz)) {
    const n = String(o.numero);
    if (RESERVADOS.has(n)) {
      console.warn(`[atalhos] /${n} é uma página do site; a oferta #${n} abre pelo 404 inteligente.`);
      continue;
    }
    atalhos[`/${n}`] = { status: 301, destination: `/o/${o.slug}` };
  }
  return atalhos;
}
