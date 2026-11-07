#!/usr/bin/env node
// Cadastra uma oferta nova.
//
// Sem argumentos, pergunta tudo no terminal:
//   npm run nova-oferta
//
// Com argumentos, não pergunta o que já veio (é o que o /nova-oferta do
// Claude Code usa):
//   npm run nova-oferta -- --titulo "Passador a vapor rotativo" --categoria casa \
//     --link https://s.shopee.com.br/xxx --alt "ml=https://meli.la/yyy|Achei um parecido" \
//     --de 199,90 --por 89,90 --cupom BARATO10 --imagem ./fotos/passador.jpg --sim
//
// Opções:
//   --titulo, --categoria, --imagem (arquivo ou URL)
//   --link URL            link principal (a loja é descoberta pelo endereço)
//   --principal loja=URL  link principal dizendo a loja
//   --alt [loja=]URL[|rótulo]   alternativa (pode repetir)
//   --de, --por           preço "de" e "por" (199,90 ou 199.90)
//   --cupom, --nota, --tiktok, --youtube, --instagram
//   --destaque            vira o destaque do dia (tira o anterior)
//   --numero N            força o número (padrão: o próximo)
//   --sim                 não pede confirmação
import fs from 'node:fs';
import path from 'node:path';
import readline from 'node:readline/promises';
import { stdin, stdout } from 'node:process';
import sharp from 'sharp';
import { APELIDOS_LOJA, CATEGORIAS, LOJA, lojaPorUrl, slugify } from '../src/lib/catalogo.mjs';
import { agoraBrasilia, dominio, gravar, lerTodas, PASTA, proximoNumero, RAIZ, validar } from './lib/ofertas-fs.mjs';

const cor = {
  ok: (t) => `\x1b[32m${t}\x1b[0m`,
  erro: (t) => `\x1b[31m${t}\x1b[0m`,
  fraco: (t) => `\x1b[2m${t}\x1b[0m`,
  forte: (t) => `\x1b[1m${t}\x1b[0m`,
};

/* ---------- argumentos ---------- */
const args = process.argv.slice(2);
const op = { alt: [] };
for (let i = 0; i < args.length; i++) {
  const a = args[i];
  if (!a.startsWith('--')) continue;
  const chave = a.slice(2);
  if (chave === 'sim' || chave === 'destaque') {
    op[chave] = true;
    continue;
  }
  const valor = args[i + 1];
  i++;
  if (chave === 'alt') op.alt.push(valor);
  else op[chave] = valor;
}
const interativo = args.length === 0;
const pastaDoUsuario = process.env.INIT_CWD || process.cwd();

/* ---------- utilitários ---------- */
const reais = (v) => `R$ ${v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

function preco(texto) {
  if (texto == null || String(texto).trim() === '') return undefined;
  let t = String(texto).replace(/[^\d.,]/g, '');
  if (t.includes(',')) t = t.replace(/\./g, '').replace(',', '.');
  const n = Number(t);
  if (!Number.isFinite(n) || n <= 0) throw new Error(`preço inválido: "${texto}"`);
  return Math.round(n * 100) / 100;
}

/** "ml=https://..." ou só a URL. Devolve { loja, url, rotulo }. */
function lerLink(texto) {
  let [antes, rotulo] = String(texto).split('|');
  let loja;
  const m = antes.match(/^\s*([a-z\s-]+?)\s*=\s*(https?:\/\/.+)$/i);
  let url = antes.trim();
  if (m) {
    const apelido = m[1].toLowerCase().trim();
    loja = APELIDOS_LOJA[apelido];
    if (!loja) throw new Error(`não conheço a loja "${m[1]}". Use: ${Object.keys(APELIDOS_LOJA).join(', ')}`);
    url = m[2].trim();
  }
  return { loja: loja ?? lojaPorUrl(url), url, rotulo: rotulo?.trim() || undefined };
}

async function lerImagem(origem) {
  if (/^https?:\/\//i.test(origem)) {
    const r = await fetch(origem, { headers: { 'User-Agent': 'Mozilla/5.0 (barato-da-hora; cadastro de oferta)' } });
    if (!r.ok) throw new Error(`não consegui baixar a imagem (${r.status})`);
    return Buffer.from(await r.arrayBuffer());
  }
  const caminho = path.resolve(pastaDoUsuario, origem.replace(/^["']|["']$/g, ''));
  if (!fs.existsSync(caminho)) throw new Error(`não achei a imagem em ${caminho}`);
  return fs.readFileSync(caminho);
}

/** Quadrada, 800 px, fundo branco, produto ocupando o quadro. */
async function salvarImagem(buffer, destino) {
  let base = sharp(buffer).rotate().flatten({ background: '#ffffff' });
  try {
    // corta a sobra branca em volta (fotos de loja costumam ter muita)
    const aparado = await base.clone().trim({ background: '#ffffff', threshold: 12 }).toBuffer();
    base = sharp(aparado);
  } catch {
    // imagem toda de uma cor só: segue sem aparar
  }
  await base
    .resize(752, 752, { fit: 'contain', background: '#ffffff' })
    .extend({ top: 24, bottom: 24, left: 24, right: 24, background: '#ffffff' })
    .webp({ quality: 82 })
    .toFile(destino);
}

/* ---------- perguntas ---------- */
const rl = interativo || !op.sim ? readline.createInterface({ input: stdin, output: stdout }) : null;
async function pergunta(texto, { obrigatoria = false, padrao } = {}) {
  if (!rl) return padrao;
  for (;;) {
    const r = (await rl.question(`${texto}${padrao ? cor.fraco(` (${padrao})`) : ''}: `)).trim();
    if (r) return r;
    if (padrao !== undefined) return padrao;
    if (!obrigatoria) return undefined;
    console.log(cor.erro('  essa é obrigatória'));
  }
}

async function main() {
  const numero = op.numero ? Number(op.numero) : proximoNumero();
  console.log(cor.forte(`\nNova oferta #${numero}\n`));

  const titulo = op.titulo ?? (await pergunta('Título do produto', { obrigatoria: true }));
  if (!titulo) throw new Error('falta --titulo');

  let categoria = op.categoria?.toLowerCase();
  if (!categoria && interativo) {
    console.log(cor.fraco(`  categorias: ${CATEGORIAS.join(', ')}`));
    categoria = (await pergunta('Categoria', { padrao: 'outros' }))?.toLowerCase();
  }
  categoria ||= 'outros';

  const principalTexto = op.principal ?? op.link ?? (interativo ? await pergunta('Link principal (o do vídeo)', { obrigatoria: true }) : undefined);
  if (!principalTexto) throw new Error('falta --link (o link principal)');
  const principal = lerLink(principalTexto);
  if (interativo) console.log(cor.fraco(`  loja: ${LOJA[principal.loja].nome}`));

  const alternativas = op.alt.map(lerLink);
  if (interativo) {
    console.log(cor.fraco('  links alternativos: um por vez, Enter vazio para parar. Ex.: ml=https://... ou só a URL'));
    for (;;) {
      const t = await pergunta('Link alternativo');
      if (!t) break;
      const l = lerLink(t);
      l.rotulo = (await pergunta('  Texto em cima do botão', { padrao: `Opção ${LOJA[l.loja].prep} ${LOJA[l.loja].nome}` })) || undefined;
      alternativas.push(l);
    }
  }

  const precoDe = preco(op.de ?? (interativo ? await pergunta('Preço "de" (riscado, opcional)') : undefined));
  const precoPor = preco(op.por ?? (interativo ? await pergunta('Preço "por" (opcional)') : undefined));
  const cupom = op.cupom ?? (interativo ? await pergunta('Cupom (opcional)') : undefined);
  const videos = {
    tiktok: op.tiktok ?? (interativo ? await pergunta('Link do vídeo no TikTok (opcional)') : undefined) ?? '',
    youtube: op.youtube ?? (interativo ? await pergunta('Link do vídeo no YouTube (opcional)') : undefined) ?? '',
    instagram: op.instagram ?? (interativo ? await pergunta('Link do vídeo no Instagram (opcional)') : undefined) ?? '',
  };
  const origemImagem = op.imagem ?? (interativo ? await pergunta('Imagem (caminho do arquivo ou URL)', { obrigatoria: true }) : undefined);
  if (!origemImagem) throw new Error('falta --imagem');
  const nota = op.nota ?? (interativo ? await pergunta('Nota curta (opcional, ex.: "esquenta em 30s")') : undefined);
  const destaque = op.destaque ?? (interativo ? /^s/i.test((await pergunta('Destaque do dia? (s/N)')) ?? '') : false);

  // slug único
  const usados = new Set(lerTodas().map((o) => o.dados.slug || slugify(o.dados.titulo)));
  let slug = op.slug || slugify(titulo);
  if (usados.has(slug)) slug = `${slug}-${numero}`;

  const { dia, dataHora } = agoraBrasilia();
  const dados = {
    numero,
    slug,
    titulo: titulo.trim(),
    imagem: `/ofertas/${numero}.webp`,
    categoria,
    precoDe,
    precoPor,
    precoVistoEm: precoPor ? dia : undefined,
    cupom: cupom?.trim() || undefined,
    links: [
      { loja: principal.loja, url: principal.url, tipo: 'principal', rotulo: principal.rotulo ?? 'Link do produto do vídeo' },
      ...alternativas.map((l) => ({
        loja: l.loja,
        url: l.url,
        tipo: 'alternativa',
        rotulo: l.rotulo ?? `Opção ${LOJA[l.loja].prep} ${LOJA[l.loja].nome}`,
      })),
    ],
    videos,
    publicadoEm: dataHora,
    ativo: true,
    destaque: !!destaque,
    nota: nota?.trim() || undefined,
  };

  if (lerTodas().some((o) => Number(o.dados.numero) === numero)) {
    throw new Error(`já existe oferta #${numero}`);
  }
  const problemas = validar(dados);
  if (problemas.length) {
    throw new Error(`a oferta não passou na validação:\n  - ${problemas.join('\n  - ')}`);
  }

  // resumo
  const lojas = dados.links.map((l) => `${l.tipo === 'principal' ? '★' : '·'} ${LOJA[l.loja].nome}: ${l.url}`);
  console.log(`
${cor.forte(`#${numero} ${dados.titulo}`)}  ${cor.fraco(`(${categoria})`)}
${precoPor ? `${precoDe ? `de ${reais(precoDe)} ` : ''}por ${reais(precoPor)}` : cor.fraco('sem preço')}${dados.cupom ? `  cupom ${dados.cupom}` : ''}${destaque ? '  ⚡ destaque' : ''}
${lojas.join('\n')}
imagem: ${origemImagem}
`);
  if (rl && !op.sim) {
    const ok = await pergunta('Salvar? (S/n)', { padrao: 's' });
    if (!/^s/i.test(ok)) {
      console.log('Nada foi salvo.');
      return;
    }
  }

  // imagem primeiro: se falhar, não fica JSON apontando para foto que não existe
  const destinoImagem = path.join(RAIZ, 'public', dados.imagem);
  fs.mkdirSync(path.dirname(destinoImagem), { recursive: true });
  await salvarImagem(await lerImagem(origemImagem), destinoImagem);

  if (destaque) {
    for (const o of lerTodas()) {
      if (o.dados.destaque) {
        o.dados.destaque = false;
        gravar(o.arquivo, o.dados);
        console.log(cor.fraco(`  #${o.dados.numero} deixou de ser destaque`));
      }
    }
  }

  const arquivo = path.join(PASTA, `${numero}-${slug}.json`);
  gravar(arquivo, dados);

  const site = dominio();
  console.log(`${cor.ok('✓ oferta salva')}
  ${path.relative(RAIZ, arquivo)}
  ${path.relative(RAIZ, destinoImagem)}

  link curto:    ${cor.forte(`${site.replace(/^https?:\/\//, '')}/${numero}`)}
  página:        ${site}/o/${slug}
`);
}

main()
  .catch((e) => {
    console.error(cor.erro(`\n✗ ${e.message}\n`));
    process.exitCode = 1;
  })
  .finally(() => rl?.close());

