#!/usr/bin/env node
// Marca uma oferta como destaque do dia e tira o destaque anterior.
//   npm run destaque -- 231
//   npm run destaque -- --nenhum   (tira o destaque de todas)
import { acharPorNumero, gravar, lerTodas } from './lib/ofertas-fs.mjs';

const numero = process.argv.slice(2).find((a) => /^\d+$/.test(a));
const nenhum = process.argv.includes('--nenhum');
if (!numero && !nenhum) {
  console.error('Uso: npm run destaque -- <número>   ou   npm run destaque -- --nenhum');
  process.exit(1);
}
if (numero) {
  const alvo = acharPorNumero(numero);
  if (!alvo) {
    console.error(`Não existe oferta #${numero}.`);
    process.exit(1);
  }
  if (alvo.dados.ativo === false) {
    console.error(`A oferta #${numero} está encerrada; reabra antes com npm run encerrar-oferta -- ${numero} --reabrir`);
    process.exit(1);
  }
}
for (const o of lerTodas()) {
  const deveSer = !nenhum && Number(o.dados.numero) === Number(numero);
  if (!!o.dados.destaque !== deveSer) {
    o.dados.destaque = deveSer;
    gravar(o.arquivo, o.dados);
    console.log(deveSer ? `✓ #${o.dados.numero} é o destaque do dia` : `· #${o.dados.numero} deixou de ser destaque`);
  }
}
