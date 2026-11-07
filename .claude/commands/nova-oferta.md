---
description: Cadastra uma oferta nova no site, valida, publica e devolve o link curto
argument-hint: título, categoria, loja e link, preço de/por, cupom, foto
allowed-tools: Bash, Read, Edit
---

Cadastre esta oferta no site do Barato da Hora:

$ARGUMENTS

## 1. Entenda o texto livre e monte os argumentos

O texto vem do jeito que eu escrevo, por exemplo:
`Passador a vapor rotativo, casa, shopee https://... ml https://... de 199 por 89, cupom BARATO10, foto ./fotos/passador.jpg`

| O que eu escrevi | Argumento do script |
|---|---|
| o nome do produto (normalmente o começo) | `--titulo "..."`, com iniciais maiúsculas nas palavras principais ("Passador a Vapor Rotativo") |
| casa, cozinha, carro, ferramentas, beleza, tech, pet, infantil, outros | `--categoria`; se eu não disser, escolha pela natureza do produto |
| a PRIMEIRA loja com link (ou a que eu chamar de "do vídeo") | `--principal "loja=URL"` |
| as outras lojas com link | `--alt "loja=URL"` (uma por loja); se eu der um texto para o botão, `--alt "loja=URL\|texto"` |
| apelidos de loja | shopee, ml / mercado livre, amazon / amz, magalu, ali / aliexpress, outra |
| "de 199 por 89", "de 199,90 por 89,90" | `--de 199,90 --por 89,90` (só "por" também vale) |
| cupom | `--cupom CODIGO` (sempre em maiúsculas, como eu escrevi) |
| foto / imagem (caminho ou URL) | `--imagem "..."` (aspas: o caminho pode ter espaço) |
| links de vídeo do TikTok, YouTube, Instagram | `--tiktok`, `--youtube`, `--instagram` |
| "destaque" | `--destaque` |
| uma observação curta sobre o produto | `--nota "..."` |

Se faltar **título, link principal ou foto**, pergunte só o que falta, numa mensagem, e pare.
Não invente preço, cupom nem link.

## 2. Cadastre

```
npm run nova-oferta -- <argumentos> --sim
```

Se o script recusar (link inválido, categoria errada), corrija o argumento se o erro for de
leitura do meu texto; se for dado meu (link quebrado), me pergunte.

## 3. Valide

```
npm run build
```

Se falhar por causa da oferta nova, corrija o JSON dela (nunca o código do site) e rode de novo.

## 4. Publique

1. `git add` só dos arquivos da oferta: o JSON novo em `src/content/ofertas/`, a imagem
   `public/ofertas/<numero>.webp` e, se usou `--destaque`, os JSON que perderam o destaque.
   Confira com `git diff --cached --name-only` antes de commitar.
2. `git commit -m "oferta #<numero>: <título curto em minúsculas>"` (ex.: `oferta #231: passador a vapor`).
3. `git push` (a Vercel publica sozinha em cerca de 1 minuto).

## 5. Responda curto

Só isto:

```
✓ Oferta #<numero> no ar em ~1 min
Link curto: <domínio sem https>/<numero>
Página: <domínio>/o/<slug>
```

O domínio está em `src/site.config.ts` (campo `dominio`). Se o push falhar, diga o erro e não tente forçar.
