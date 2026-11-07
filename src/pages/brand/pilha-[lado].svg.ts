import type { APIRoute, GetStaticPaths } from 'astro';
import { pilha } from '../../../scripts/desenhos/desenhos.mjs';
import { caminho } from '../../lib/marca.mjs';

// As pilhas de encomenda dos lados do topo (só aparecem no computador).
// Como arquivo à parte, o celular nem baixa: a <img> fica escondida e lazy.
export const getStaticPaths = (() => [{ params: { lado: 'e' } }, { params: { lado: 'd' } }]) satisfies GetStaticPaths;

export const GET: APIRoute = ({ params }) =>
  new Response(pilha(params.lado === 'd' ? 'd' : 'e', caminho), {
    headers: { 'Content-Type': 'image/svg+xml; charset=utf-8' },
  });
