// Home: busca em tempo real, filtros por categoria, "Ver mais" e o selo NOVO.
// O HTML já chega com as 30 ofertas mais novas. O índice completo
// (/busca.json) baixa quando o navegador fica ocioso ou no primeiro toque
// na busca, e daí em diante a lista é desenhada a partir dele.

type Item = {
  n: number;
  s: string;
  t: string;
  c: string;
  i: string;
  i2: string;
  de?: number;
  por?: number;
  l: string[];
  p: string;
  a: 0 | 1;
  k?: string;
};

const POR_VEZ = 30;
const HORAS_NOVO = 48;

const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T | null;
const lista = $<HTMLOListElement>('lista');
const molde = $<HTMLTemplateElement>('tpl-item');
const campo = $<HTMLInputElement>('busca');
const form = $<HTMLFormElement>('busca-form');
const vazio = $('vazio');
const verMais = $<HTMLButtonElement>('ver-mais');
const aviso = $('busca-status');
const atalho = $<HTMLAnchorElement>('atalho');
const destaque = $('destaque');
const chips = $('chips');
const tituloLista = $('lista-titulo');
const limparFiltro = $<HTMLButtonElement>('limpar-filtro');
const vazioTitulo = vazio?.querySelector<HTMLElement>('[data-vazio-titulo]');
const vazioDica = vazio?.querySelector<HTMLElement>('[data-vazio-dica]');
const limpar = form?.querySelector<HTMLButtonElement>('[data-limpar]');

const norm = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();

const msData = (v: string) => Date.parse(v.length === 10 ? `${v}T00:00:00-03:00` : v);
const ehNova = (p: string) => Date.now() - msData(p) < HORAS_NOVO * 3600_000;
const reais = (v: number) =>
  'R$ ' +
  v.toLocaleString('pt-BR', {
    minimumFractionDigits: Math.round(v * 100) % 100 ? 2 : 0,
    maximumFractionDigits: 2,
  });

let indice: Item[] | null = null;
let baixando: Promise<Item[]> | null = null;
// 'todos', 'hoje' (últimas 24 h), 'ate50' (até R$ 50) ou 'cat:<categoria>'
let filtro = 'todos';
const TITULO_PADRAO = tituloLista?.textContent ?? '';
let termo = '';
let mostrando = POR_VEZ;

function baixarIndice(): Promise<Item[]> {
  baixando ??= fetch('/busca.json')
    .then((r) => r.json() as Promise<Item[]>)
    .then((itens) => {
      for (const o of itens) o.k = norm(`${o.t} ${o.c} #${o.n}`);
      indice = itens;
      return itens;
    })
    .catch((erro) => {
      baixando = null;
      throw erro;
    });
  return baixando;
}

/* ---------- filtro ---------- */
const HORAS_HOJE = 24;
function passaFiltro(o: Item): boolean {
  if (filtro === 'hoje') return Date.now() - msData(o.p) < HORAS_HOJE * 3600_000;
  if (filtro === 'ate50') return !!o.por && o.por <= 50;
  if (filtro.startsWith('cat:')) return o.c === filtro.slice(4);
  return true;
}

function filtrar(itens: Item[]): Item[] {
  const daCategoria = itens.filter(passaFiltro);
  const q = norm(termo).replace(/^#/, '');
  if (!q) return daCategoria.filter((o) => o.a);

  // Só número: a oferta com aquele número primeiro (mesmo encerrada, para
  // quem vem de vídeo antigo), depois as que começam com ele.
  if (/^\d+$/.test(q)) {
    const exata = daCategoria.filter((o) => String(o.n) === q);
    const comeca = daCategoria.filter((o) => o.a && String(o.n) !== q && String(o.n).startsWith(q));
    const noTitulo = daCategoria.filter((o) => o.a && !String(o.n).startsWith(q) && o.k!.includes(q));
    return [...exata, ...comeca, ...noTitulo];
  }

  // Texto: todas as palavras precisam aparecer (sem acento, sem maiúscula).
  const palavras = q.split(' ');
  const achou = daCategoria.filter((o) => palavras.every((p) => o.k!.includes(p)));
  const comecaCom = (o: Item) => (norm(o.t).startsWith(palavras[0]) ? 1 : 0);
  return achou.sort((x, y) => y.a - x.a || comecaCom(y) - comecaCom(x) || y.n - x.n);
}

/* ---------- desenho ---------- */
function card(o: Item): HTMLLIElement {
  const li = molde!.content.firstElementChild!.cloneNode(true) as HTMLLIElement;
  const a = li.querySelector('a')!;
  const f = (nome: string) => a.querySelector<HTMLElement>(`[data-f="${nome}"]`)!;
  a.href = `/o/${o.s}`;
  a.dataset.n = String(o.n);
  a.dataset.pub = o.p;
  a.classList.toggle('item--fim', !o.a);
  const img = a.querySelector('img')!;
  img.src = o.i;
  img.srcset = `${o.i} 200w, ${o.i2} 400w`;
  f('num').textContent = `#${o.n}`;
  f('titulo').textContent = o.t;
  f('preco').hidden = !o.por;
  if (o.por) {
    f('por-v').textContent = reais(o.por);
    f('de').hidden = !o.de;
    f('de-v').textContent = o.de ? reais(o.de) : '';
    const pct = o.de && o.de > o.por ? Math.floor((1 - o.por / o.de) * 100 + 1e-9) : 0;
    f('off').hidden = !pct;
    f('off').textContent = `-${pct}%`;
  }
  for (const ico of a.querySelectorAll<HTMLElement>('[data-loja-ico]')) ico.hidden = !o.l.includes(ico.dataset.lojaIco!);
  f('novo').hidden = !(o.a && ehNova(o.p));
  f('fim').hidden = !!o.a;
  return li;
}

function desenhar() {
  if (!indice || !lista) return;
  const resultado = filtrar(indice);
  lista.replaceChildren(...resultado.slice(0, mostrando).map(card));
  if (vazio) vazio.hidden = resultado.length > 0;
  if (vazioTitulo && vazioDica) {
    vazioTitulo.textContent = termo ? 'Não achei 😕 Confere o número no vídeo' : filtro === 'hoje' ? 'Ainda não saiu oferta hoje' : 'Nada por aqui ainda';
    vazioDica.hidden = !termo;
  }
  if (verMais) verMais.hidden = resultado.length <= mostrando;
  if (destaque) destaque.hidden = !!termo || filtro !== 'todos';
  if (aviso) {
    aviso.textContent = termo
      ? `${resultado.length} ${resultado.length === 1 ? 'oferta encontrada' : 'ofertas encontradas'}`
      : '';
  }
  mostrarAtalho(resultado);
}

// Número exato digitado: um cartão logo abaixo da busca leva direto à oferta.
function mostrarAtalho(resultado: Item[]) {
  if (!atalho) return;
  const q = norm(termo).replace(/^#/, '');
  const alvo = /^\d+$/.test(q) ? resultado.find((o) => String(o.n) === q) : undefined;
  atalho.hidden = !alvo;
  if (!alvo) return;
  atalho.href = `/o/${alvo.s}`;
  atalho.querySelector('img')!.src = alvo.i;
  atalho.querySelector('[data-f="num"]')!.textContent = alvo.a ? `Oferta #${alvo.n}` : `Oferta #${alvo.n} · encerrada`;
  atalho.querySelector('[data-f="titulo"]')!.textContent = alvo.t;
}

async function atualizar() {
  mostrando = POR_VEZ;
  if (limpar) limpar.hidden = !termo;
  try {
    await baixarIndice();
    desenhar();
  } catch {
    if (aviso) aviso.textContent = 'Não consegui carregar a busca. Confira a internet e tente de novo.';
  }
}

/* ---------- eventos ---------- */
campo?.addEventListener('input', () => {
  termo = campo.value;
  atualizar();
});
campo?.addEventListener('focus', () => baixarIndice().catch(() => {}), { once: true });

form?.addEventListener('submit', (ev) => {
  ev.preventDefault();
  if (atalho && !atalho.hidden) {
    location.href = atalho.href;
    return;
  }
  campo?.blur();
  lista?.scrollIntoView({ behavior: 'smooth', block: 'start' });
});

limpar?.addEventListener('click', () => {
  if (!campo) return;
  campo.value = '';
  termo = '';
  campo.focus();
  atualizar();
});

for (const b of form?.querySelectorAll<HTMLButtonElement>('[data-exemplo]') ?? []) {
  b.addEventListener('click', () => {
    if (!campo) return;
    campo.value = b.dataset.exemplo!;
    termo = campo.value;
    atualizar();
  });
}

function escolherFiltro(novo: string, botao?: HTMLElement | null) {
  filtro = novo;
  for (const b of chips?.querySelectorAll<HTMLElement>('[data-filtro]') ?? []) {
    b.setAttribute('aria-pressed', String(b.dataset.filtro === filtro));
  }
  if (tituloLista) {
    const nome = botao?.querySelector('.bolinha__rotulo')?.textContent?.trim();
    tituloLista.textContent = filtro === 'todos' ? TITULO_PADRAO : filtro === 'hoje' ? 'Ofertas de hoje' : (nome ?? TITULO_PADRAO);
  }
  if (limparFiltro) limparFiltro.hidden = filtro === 'todos';
  atualizar();
}

// toque no círculo liga o filtro; outro toque no mesmo volta para todas
chips?.addEventListener('click', (ev) => {
  const botao = (ev.target as Element).closest<HTMLButtonElement>('[data-filtro]');
  if (!botao) return;
  escolherFiltro(botao.dataset.filtro === filtro ? 'todos' : botao.dataset.filtro!, botao);
});
limparFiltro?.addEventListener('click', () => escolherFiltro('todos'));

verMais?.addEventListener('click', async () => {
  verMais.disabled = true;
  try {
    await baixarIndice();
    mostrando += POR_VEZ;
    desenhar();
  } finally {
    verMais.disabled = false;
  }
});

for (const b of document.querySelectorAll('[data-ir-busca]')) {
  b.addEventListener('click', () => {
    form?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    campo?.focus({ preventScroll: true });
  });
}

document.querySelector('[data-limpar-tudo]')?.addEventListener('click', () => {
  if (campo) campo.value = '';
  termo = '';
  escolherFiltro('todos');
});

/* ---------- início ---------- */
// O selo NOVO do HTML foi calculado na hora do build; aqui ele segue o relógio.
for (const a of lista?.querySelectorAll<HTMLElement>('a[data-pub]') ?? []) {
  const novo = a.querySelector<HTMLElement>('[data-f="novo"]');
  if (novo && !a.classList.contains('item--fim')) novo.hidden = !ehNova(a.dataset.pub!);
}

// "Hoje" ganha o aro de story novo quando saiu oferta nas últimas 24 h
const temHoje = [...(lista?.querySelectorAll<HTMLElement>('a[data-pub]') ?? [])].some(
  (a) => !a.classList.contains('item--fim') && Date.now() - msData(a.dataset.pub!) < HORAS_HOJE * 3600_000,
);
chips?.querySelector('[data-filtro="hoje"]')?.classList.toggle('bolinha--tem', temHoje);

// Veio de um link com ?q= (do 404 ou de um formulário sem JavaScript)
const q = new URLSearchParams(location.search).get('q');
if (q && campo) {
  campo.value = q;
  termo = q;
  atualizar();
}

const ocioso = window.requestIdleCallback ?? ((fn: () => void) => setTimeout(fn, 1200));
ocioso(() => baixarIndice().catch(() => {}));

export {};
