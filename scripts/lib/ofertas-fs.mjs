// Leitura e escrita dos JSON das ofertas para os scripts de terminal.
import fs from 'node:fs';
import path from 'node:path';
import { ofertaSchema } from '../../src/lib/oferta-schema.mjs';

export const RAIZ = path.resolve(import.meta.dirname, '../..');
export const PASTA = path.join(RAIZ, 'src/content/ofertas');

/** Ordem das chaves no JSON, igual à do modelo do README. */
const ORDEM = [
  'numero',
  'slug',
  'titulo',
  'imagem',
  'categoria',
  'precoDe',
  'precoPor',
  'precoVistoEm',
  'cupom',
  'links',
  'videos',
  'publicadoEm',
  'ativo',
  'destaque',
  'nota',
];

/** @returns {{ arquivo: string, dados: Record<string, any> }[]} */
export function lerTodas() {
  if (!fs.existsSync(PASTA)) return [];
  return fs
    .readdirSync(PASTA)
    .filter((f) => f.endsWith('.json'))
    .map((f) => ({ arquivo: path.join(PASTA, f), dados: JSON.parse(fs.readFileSync(path.join(PASTA, f), 'utf8')) }));
}

export function proximoNumero() {
  const numeros = lerTodas().map((o) => Number(o.dados.numero) || 0);
  return numeros.length ? Math.max(...numeros) + 1 : 1;
}

export function acharPorNumero(numero) {
  return lerTodas().find((o) => Number(o.dados.numero) === Number(numero));
}

/** Grava com as chaves na ordem do modelo e os links numa linha cada. */
export function gravar(arquivo, dados) {
  const ordenado = {};
  for (const k of ORDEM) if (dados[k] !== undefined) ordenado[k] = dados[k];
  for (const k of Object.keys(dados)) if (!(k in ordenado)) ordenado[k] = dados[k];
  let json = JSON.stringify(ordenado, null, 2);
  // cada link e o bloco de vídeos numa linha só, como no modelo
  json = json.replace(/\{\n\s+"loja": [\s\S]*?\n\s+\}/g, (bloco) => bloco.replace(/\n\s+/g, ' ').replace('{ ', '{ ').replace(' }', ' }'));
  json = json.replace(/"videos": \{\n[\s\S]*?\n\s+\}/, (bloco) => bloco.replace(/\n\s+/g, ' '));
  fs.writeFileSync(arquivo, `${json}\n`);
}

/** Valida com o mesmo schema do site. Devolve a lista de problemas legíveis. */
export function validar(dados) {
  const r = ofertaSchema.safeParse(dados);
  if (r.success) return [];
  return r.error.issues.map((i) => `${i.path.join('.') || 'oferta'}: ${i.message}`);
}

/** Data de hoje e hora agora, no fuso de Brasília. */
export function agoraBrasilia() {
  const partes = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  })
    .formatToParts(new Date())
    .reduce((o, p) => ({ ...o, [p.type]: p.value }), /** @type {Record<string, string>} */ ({}));
  const dia = `${partes.year}-${partes.month}-${partes.day}`;
  const hora = `${partes.hour === '24' ? '00' : partes.hour}:${partes.minute}:${partes.second}`;
  return { dia, dataHora: `${dia}T${hora}-03:00` };
}

/** O domínio do site, lido do src/site.config.ts (sem compilar TypeScript). */
export function dominio() {
  const texto = fs.readFileSync(path.join(RAIZ, 'src/site.config.ts'), 'utf8');
  return texto.match(/dominio:\s*["']([^"']+)["']/)?.[1] ?? 'https://baratodahora.com.br';
}
