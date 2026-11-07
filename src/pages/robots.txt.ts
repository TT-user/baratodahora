import type { APIRoute } from 'astro';
import { urlDoSite } from '../site.config';

export const GET: APIRoute = () =>
  new Response(`User-agent: *\nAllow: /\n\nSitemap: ${new URL('/sitemap.xml', urlDoSite).href}\n`, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
