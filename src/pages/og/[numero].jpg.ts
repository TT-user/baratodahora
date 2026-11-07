import type { APIRoute, GetStaticPaths } from 'astro';
import { ogOferta } from '../../lib/og';
import { todasAsOfertas, type Oferta } from '../../lib/ofertas';

// /og/231.jpg: a prévia que aparece ao colar o link da oferta no WhatsApp.
export const getStaticPaths = (async () => {
  const todas = await todasAsOfertas();
  return todas.map((oferta) => ({ params: { numero: String(oferta.numero) }, props: { oferta } }));
}) satisfies GetStaticPaths;

export const GET: APIRoute = async ({ props }) => {
  const jpg = await ogOferta((props as { oferta: Oferta }).oferta);
  return new Response(new Uint8Array(jpg), { headers: { 'Content-Type': 'image/jpeg' } });
};
