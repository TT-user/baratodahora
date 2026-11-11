import type { APIRoute } from 'astro';
import { ogHome } from '../lib/og';

// /og-grupo.png: prévia do link da página do grupo (o cartão da home com os
// textos do grupo). Refeita a cada build.
export const GET: APIRoute = async () => {
  const png = await ogHome({
    faixa: 'Grupo de ofertas no WhatsApp',
    antes: ['Os achadinhos', 'chegam no seu'],
    pilula: 'WHATSAPP',
    pilulaFundo: '#25D366',
    pilulaTexto: '#141210',
    depois: 'Entra no grupo!',
    sub: 'Gratuito. Só eu posto. Sai quando quiser.',
  });
  return new Response(new Uint8Array(png), { headers: { 'Content-Type': 'image/png' } });
};
