import type { APIRoute } from 'astro';
import { msData, ofertasAtivas, urlOferta } from '../lib/ofertas';
import { site } from '../site.config';

// Home, privacidade e as ofertas ativas. Os atalhos /231 (redirects) e as
// ofertas encerradas (noindex) ficam de fora.
export const GET: APIRoute = async () => {
  const ativas = await ofertasAtivas();
  const abs = (p: string) => new URL(p, site.dominio).href;
  const dia = (v: string) => new Date(msData(v)).toISOString().slice(0, 10);
  const maisRecente = ativas[0] ? dia(ativas[0].publicadoEm) : undefined;

  const urls = [
    { loc: abs('/'), lastmod: maisRecente },
    ...ativas.map((o) => ({ loc: abs(urlOferta(o)), lastmod: dia(o.precoVistoEm ?? o.publicadoEm) })),
    { loc: abs('/privacidade') },
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${u.loc}</loc>${u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : ''}</url>`).join('\n')}
</urlset>
`;
  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
