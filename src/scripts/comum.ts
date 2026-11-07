// Comum a todas as páginas: toast, copiar, CTA fixo, pausa das animações
// fora da tela e o gancho de rastreio de cliques (desligado por padrão).

/* ---------- toast ---------- */
let tempoToast: number | undefined;
export function toast(msg: string) {
  const el = document.getElementById('toast');
  if (!el) return;
  el.textContent = msg;
  el.classList.add('on');
  clearTimeout(tempoToast);
  tempoToast = window.setTimeout(() => el.classList.remove('on'), 2600);
}

/* ---------- copiar ---------- */
export async function copiar(texto: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(texto);
    return true;
  } catch {
    // navegador antigo ou sem permissão: o jeito velho
    const area = document.createElement('textarea');
    area.value = texto;
    area.setAttribute('readonly', '');
    area.style.cssText = 'position:fixed;opacity:0;top:0;left:0';
    document.body.append(area);
    area.select();
    let ok = false;
    try {
      ok = document.execCommand('copy');
    } catch {
      ok = false;
    }
    area.remove();
    return ok;
  }
}

/* ---------- confete ---------- */
const CORES = ['#FFD60A', '#D62828', '#2D6BE4', '#25D366', '#FF6A13', '#FFFFFF'];
export function confete(origem: Element) {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const r = origem.getBoundingClientRect();
  const x = r.left + r.width / 2;
  const y = r.top + r.height / 2;
  for (let i = 0; i < 18; i++) {
    const p = document.createElement('i');
    p.className = 'confete';
    const angulo = (Math.PI * 2 * i) / 18 + Math.random() * 0.5;
    const dist = 60 + Math.random() * 70;
    p.style.cssText = `left:${x}px;top:${y}px;background:${CORES[i % CORES.length]};--x:${Math.cos(angulo) * dist}px;--y:${Math.sin(angulo) * dist - 30}px;--r:${Math.random() * 540 - 270}deg;border-radius:${i % 3 ? '2px' : '50%'}`;
    document.body.append(p);
    setTimeout(() => p.remove(), 950);
  }
}

/* ---------- CTA fixo ---------- */
// Aparece depois do primeiro rolar e some enquanto o alvo está na tela.
for (const barra of document.querySelectorAll<HTMLElement>('[data-sticky]')) {
  const alvo = document.querySelector(barra.dataset.sticky!);
  if (!alvo) continue;
  let alvoNaTela = true;
  let rolou = false;
  const atualiza = () => {
    const mostrar = rolou && !alvoNaTela;
    barra.classList.toggle('on', mostrar);
    barra.inert = !mostrar;
  };
  new IntersectionObserver(([e]) => {
    alvoNaTela = e.isIntersecting;
    atualiza();
  }).observe(alvo);
  const aoRolar = () => {
    if (window.scrollY > 40) {
      rolou = true;
      atualiza();
      removeEventListener('scroll', aoRolar);
    }
  };
  addEventListener('scroll', aoRolar, { passive: true });
  // quem volta para a página já rolada (botão voltar) vê o CTA sem precisar rolar
  requestAnimationFrame(aoRolar);
}

/* ---------- animações paradas fora da tela ---------- */
const anima = document.querySelectorAll('[data-anima]');
if (anima.length && 'IntersectionObserver' in window) {
  const obs = new IntersectionObserver(
    (entradas) => {
      for (const e of entradas) e.target.classList.toggle('fora', !e.isIntersecting);
    },
    { rootMargin: '80px' },
  );
  anima.forEach((el) => obs.observe(el));
}

/* ---------- rastreio de cliques (preparado, desligado) ---------- */
// Liga em src/site.config.ts (rastreio.ativo). Cada botão de loja manda
// "clique_loja" com { loja, oferta, local }.
type Janela = Window & {
  va?: (tipo: string, dados: unknown) => void;
  umami?: { track: (nome: string, dados: unknown) => void };
};
const provedor = document.documentElement.dataset.rastreio;
if (provedor) {
  document.addEventListener('click', (ev) => {
    const el = (ev.target as Element).closest<HTMLElement>('[data-loja]');
    if (!el) return;
    const dados = { loja: el.dataset.loja, oferta: el.dataset.oferta, local: el.dataset.local };
    const w = window as Janela;
    if (provedor === 'vercel') w.va?.('event', { name: 'clique_loja', data: dados });
    else if (provedor === 'umami') w.umami?.track('clique_loja', dados);
  });
}
