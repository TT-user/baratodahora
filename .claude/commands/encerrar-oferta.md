---
description: Encerra uma oferta (a página continua no ar, sem link de loja) e publica
argument-hint: número da oferta (ex.: 231)
allowed-tools: Bash
---

Encerre a oferta número: $ARGUMENTS

1. `npm run encerrar-oferta -- <numero>`
   (para reabrir uma encerrada, eu escrevo "reabrir 231": aí use `-- <numero> --reabrir`)
2. `npm run build`
3. `git add` só do JSON dessa oferta em `src/content/ofertas/`, confira com
   `git diff --cached --name-only`, `git commit -m "oferta #<numero>: encerrada"` (ou
   "reaberta") e `git push`.
4. Responda numa linha: "✓ #<numero> encerrada. A página continua no ar com as ofertas que tão valendo."
