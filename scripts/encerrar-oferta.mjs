#!/usr/bin/env node
// Encerra uma oferta (ativo: false). A página continua no ar, com o adesivo
// "Essa acabou" e as ofertas relacionadas, mas sem link de loja.
//   npm run encerrar-oferta -- 231
//   npm run encerrar-oferta -- 231 --reabrir   (volta a ativa)
import { acharPorNumero, gravar } from './lib/ofertas-fs.mjs';

const numero = process.argv.slice(2).find((a) => /^\d+$/.test(a));
const reabrir = process.argv.includes('--reabrir');
if (!numero) {
  console.error('Uso: npm run encerrar-oferta -- <número> [--reabrir]');
  process.exit(1);
}
const oferta = acharPorNumero(numero);
if (!oferta) {
  console.error(`Não existe oferta #${numero}.`);
  process.exit(1);
}
oferta.dados.ativo = reabrir;
if (!reabrir) oferta.dados.destaque = false;
gravar(oferta.arquivo, oferta.dados);
console.log(reabrir ? `✓ #${numero} voltou a ficar ativa` : `✓ #${numero} encerrada (a página continua no ar, sem link de loja)`);
