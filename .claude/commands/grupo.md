---
description: Grupos de WhatsApp da página /grupo - põe grupo novo, marca cheio, reabre ou troca o convite, e publica
argument-hint: novo <convite> | cheio <n> | reabrir <n> | trocar <n> <convite> | (vazio para ver a lista)
allowed-tools: Bash, Read
---

Mexa nos grupos de WhatsApp do site do Barato da Hora:

$ARGUMENTS

O botão "Entrar no grupo" (página `/grupo` e bloco da home) leva ao **primeiro grupo da lista que
não está cheio**. A lista mora em `src/data/grupos.json`; mude sempre pelo script.

## 1. Entenda o pedido

| O que eu escrevi | Comando |
|---|---|
| só um link `https://chat.whatsapp.com/...`, "grupo novo", "abri outro grupo" | `npm run grupo -- novo <convite>` |
| "o grupo 2 encheu", "lotou o 2" | `npm run grupo -- cheio 2` |
| "o grupo 2 voltou a ter vaga" | `npm run grupo -- reabrir 2` |
| "troquei o link do grupo 1" + link | `npm run grupo -- trocar 1 <convite>` |
| nada, "quais grupos", "qual está aberto" | `npm run grupo` (só mostra; não publica nada) |

"Lotou" sem número = o grupo que está recebendo gente (o que o `npm run grupo` marca com →).
Nunca invente convite: link que não é `chat.whatsapp.com`, pergunte.

## 2. Valide e publique (só se a lista mudou)

1. `npm run build`.
2. `git add src/data/grupos.json` e confira `git diff --cached --name-only` (só ele).
3. `git commit -m "grupo: <o que mudou>"` (ex.: `grupo: 2 cheio, 3 recebendo gente`) e `git push`.

## 3. Responda curto

A lista que o script mostrou e: "No ar em ~1 min: baratodahora1.vercel.app/grupo leva ao grupo N."
Se todos ficaram cheios, avise que a página está mostrando "Os grupos lotaram" até entrar um grupo novo.
