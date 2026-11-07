import type { APIRoute } from 'astro';
import { ogHome } from '../lib/og';

// /og-home.png: prévia do link da bio. Refeita a cada build, então quando
// a foto da persona mudar ela já aparece aqui.
export const GET: APIRoute = async () => {
  const png = await ogHome();
  return new Response(new Uint8Array(png), { headers: { 'Content-Type': 'image/png' } });
};
