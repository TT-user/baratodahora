import type { APIRoute, GetStaticPaths } from 'astro';
import { cedula, cofrinho, moeda } from '../../../scripts/desenhos/desenhos.mjs';
import { caminho } from '../../lib/marca.mjs';

// O dinheiro que flutua no topo do /grupo (src/components/Dinheiro.astro).
// Arquivo à parte: a cédula e a moeda aparecem mais de uma vez e o navegador
// baixa cada uma só uma vez; o cofrinho, que o celular não mostra, nem baixa.
const PECAS = { cedula, moeda, cofrinho };

export const getStaticPaths = (() => Object.keys(PECAS).map((peca) => ({ params: { peca } }))) satisfies GetStaticPaths;

export const GET: APIRoute = ({ params }) =>
  new Response(PECAS[params.peca as keyof typeof PECAS](caminho), {
    headers: { 'Content-Type': 'image/svg+xml; charset=utf-8' },
  });
