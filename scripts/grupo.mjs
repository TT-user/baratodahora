#!/usr/bin/env node
// Grupos de WhatsApp da página /grupo (src/data/grupos.json). O botão leva ao
// primeiro grupo que não está cheio; quando ele enche, marque e o botão passa
// para o próximo.
//   npm run grupo                          mostra a lista e qual recebe gente
//   npm run grupo -- novo <convite>        põe um grupo no fim da fila
//   npm run grupo -- cheio <n>             grupo n encheu
//   npm run grupo -- reabrir <n>           grupo n voltou a ter vaga
//   npm run grupo -- trocar <n> <convite>  convite novo (quando você redefine o link)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { CONVITE, errosDosGrupos, grupoAberto, gruposSchema } from '../src/lib/grupo-schema.mjs';

const ARQUIVO = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'src', 'data', 'grupos.json');
const USO = `Uso:
  npm run grupo
  npm run grupo -- novo https://chat.whatsapp.com/...
  npm run grupo -- cheio <n>
  npm run grupo -- reabrir <n>
  npm run grupo -- trocar <n> https://chat.whatsapp.com/...`;

function sair(msg) {
  console.error(msg);
  process.exit(1);
}

function ler() {
  const dados = JSON.parse(fs.readFileSync(ARQUIVO, 'utf8'));
  const r = gruposSchema.safeParse(dados);
  if (!r.success) sair(`src/data/grupos.json está com problema:\n${errosDosGrupos(r)}`);
  return r.data;
}

// um grupo por linha, para o diff do git mostrar só o que mudou
function gravar(dados) {
  const r = gruposSchema.safeParse(dados);
  if (!r.success) sair(errosDosGrupos(r));
  const linhas = dados.grupos.map((g) => `    { "link": ${JSON.stringify(g.link)}, "cheio": ${g.cheio} }`);
  const texto = `{\n  "_leia": ${JSON.stringify(dados._leia ?? '')},\n  "grupos": [${linhas.length ? `\n${linhas.join(',\n')}\n  ` : ''}]\n}\n`;
  fs.writeFileSync(ARQUIVO, texto);
}

function numero(texto, dados) {
  const n = Number(texto);
  if (!Number.isInteger(n) || n < 1 || n > dados.grupos.length) {
    sair(dados.grupos.length ? `Escolha um grupo de 1 a ${dados.grupos.length}.` : 'Ainda não há grupo na lista.');
  }
  return n;
}

function convite(texto) {
  const link = String(texto ?? '').trim();
  if (!CONVITE.test(link)) sair(`"${link}" não é um convite de grupo do WhatsApp (https://chat.whatsapp.com/...).`);
  return link;
}

function mostrar(dados) {
  if (!dados.grupos.length) {
    console.log('Nenhum grupo ainda. A página /grupo mostra "O grupo abre em breve".');
    console.log('Para pôr o primeiro: npm run grupo -- novo https://chat.whatsapp.com/...');
    return;
  }
  const aberto = grupoAberto(dados.grupos);
  dados.grupos.forEach((g, i) => {
    const marca = aberto?.numero === i + 1 ? '→ recebendo gente' : g.cheio ? '  cheio' : '  na fila';
    console.log(`${marca.padEnd(18)} grupo ${i + 1}  ${g.link}`);
  });
  if (!aberto) console.log('\nTodos cheios: a página /grupo mostra "Os grupos lotaram". Ponha um grupo novo.');
}

const [acao, a1, a2] = process.argv.slice(2);
const dados = ler();

switch (acao) {
  case undefined:
  case 'lista':
    mostrar(dados);
    break;
  case 'novo':
    dados.grupos.push({ link: convite(a1), cheio: false });
    gravar(dados);
    console.log(`✓ Grupo ${dados.grupos.length} entrou na fila.\n`);
    mostrar(dados);
    break;
  case 'cheio':
  case 'reabrir': {
    const n = numero(a1, dados);
    dados.grupos[n - 1].cheio = acao === 'cheio';
    gravar(dados);
    console.log(acao === 'cheio' ? `✓ Grupo ${n} marcado como cheio.\n` : `✓ Grupo ${n} voltou a ter vaga.\n`);
    mostrar(dados);
    break;
  }
  case 'trocar': {
    const n = numero(a1, dados);
    dados.grupos[n - 1].link = convite(a2);
    gravar(dados);
    console.log(`✓ Convite do grupo ${n} trocado.\n`);
    mostrar(dados);
    break;
  }
  default:
    sair(USO);
}
