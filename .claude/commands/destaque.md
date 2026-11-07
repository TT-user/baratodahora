---
description: Marca uma oferta como destaque do dia (tira o destaque anterior) e publica
argument-hint: número da oferta (ex.: 231)
allowed-tools: Bash
---

Coloque como destaque do dia a oferta número: $ARGUMENTS

1. `npm run destaque -- <numero>` (para não ter destaque nenhum: `npm run destaque -- --nenhum`)
2. `npm run build`
3. `git add` só dos JSON que mudaram em `src/content/ofertas/`, confira com
   `git diff --cached --name-only`, `git commit -m "destaque: oferta #<numero>"` e `git push`.
4. Responda numa linha: "✓ #<numero> é o destaque do dia."
