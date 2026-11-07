# Barato da Hora · site do link da bio

Astro 7 estático + TypeScript, sem React, sem Tailwind. Deploy na Vercel a cada push em `main`.
O README explica tudo para humanos; aqui ficam as regras para quem mexe no código.

## Regras

- **Oferta nova, encerrar, destaque:** use os scripts (`npm run nova-oferta`, `encerrar-oferta`,
  `destaque`) ou os comandos `/nova-oferta`, `/encerrar-oferta`, `/destaque`. Nunca escreva o JSON
  de oferta na mão sem rodar `npm run build` depois.
- **Commit de oferta:** `git add` só dos arquivos da oferta (o JSON e `public/ofertas/<n>.webp`),
  confira `git diff --cached --name-only`, mensagem `oferta #<n>: <título curto>`.
- **Nunca invente** preço, cupom, link ou número de oferta. Faltou, pergunte.
- **As regras de uma oferta** moram em `src/lib/oferta-schema.mjs`, usado pelo site e pelo script.
  Mudou uma regra, ela vale para os dois.
- **Cores e componentes base** em `src/styles/global.css`. Texto branco só sobre `--red-txt`,
  `--orange-txt`, `--shopee-txt`, `--magalu` ou `--ali` (passam no contraste AA).
- **Logo**: `<Logo />` (letras da Anton em SVG, `src/lib/marca.mjs`). Não carregue a Anton como
  fonte da página.
- **Astro 7** junta texto de elementos vizinhos por padrão; o `compressHTML: true` do config evita
  isso. Não tire.
- **JavaScript da home** abaixo de 15 KB; hoje ~6 KB. Nada de biblioteca no navegador.
- Animação nova: em `transform`/`translate`/`rotate`/`opacity`, com `data-anima` no bloco (para
  parar fora da tela); o `prefers-reduced-motion` do global.css desliga tudo.
- Link de loja sempre pelo `<BotaoLoja>` (aba nova, `rel="nofollow sponsored noopener"`,
  `data-loja`/`data-oferta`).
- As ofertas #226 a #231 são de exemplo e devem ser apagadas antes de divulgar o site.
