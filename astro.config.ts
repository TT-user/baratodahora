import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';
import { urlDoSite } from './src/site.config';
import { atalhosPorNumero } from './integrations/ofertas-no-disco.mjs';
import miniaturas from './integrations/miniaturas.mjs';
import styleguide from './integrations/styleguide.mjs';

export default defineConfig({
  site: urlDoSite,
  // Astro 7 junta texto de elementos vizinhos por padrão ('jsx'); aqui
  // mantemos o espaço entre eles, como no HTML ("R$ 199 R$ 89").
  compressHTML: true,
  build: {
    // O CSS inteiro é pequeno: embutido no HTML, a página pinta sem esperar
    // outro arquivo. Link da bio é aberto uma vez, cache entre páginas pesa pouco.
    inlineStylesheets: 'always',
  },
  // /231 → /o/<slug>. Gerado a cada build a partir dos JSON das ofertas.
  redirects: atalhosPorNumero(),
  integrations: [miniaturas(), styleguide()],
  // Na Vercel (variável VERCEL=1, que ela mesma define no build) o adaptador
  // transforma os atalhos /231 em 301 de verdade. Fora dela, o build é o
  // estático puro em dist/, com páginas de redirecionamento.
  adapter: process.env.VERCEL ? vercel() : undefined,
  devToolbar: { enabled: false },
});
