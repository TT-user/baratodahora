// Página da oferta: copiar cupom, compartilhar e, se a oferta tem cupom,
// copiar o cupom sozinho no clique do botão da loja (com aviso na tela).
import { confete, copiar, toast } from './comum';

const cupom = document.querySelector<HTMLElement>('[data-cupom]')?.dataset.cupom;
let cupomCopiado = false;

for (const b of document.querySelectorAll<HTMLButtonElement>('[data-copiar]')) {
  const rotulo = b.querySelector('[data-rotulo]');
  b.addEventListener('click', async () => {
    const ok = await copiar(b.dataset.copiar!);
    if (!ok) {
      toast('Não consegui copiar. Segure o dedo no código para copiar.');
      return;
    }
    cupomCopiado = true;
    b.classList.add('ok');
    if (rotulo) rotulo.textContent = 'Copiado!';
    confete(b);
    toast('Cupom copiado ✓ É só colar no carrinho');
    setTimeout(() => {
      b.classList.remove('ok');
      if (rotulo) rotulo.textContent = 'Copiar';
    }, 2400);
  });
}

if (cupom) {
  for (const a of document.querySelectorAll<HTMLAnchorElement>('a[data-loja]')) {
    a.addEventListener('click', () => {
      if (cupomCopiado) return;
      copiar(cupom).then((ok) => {
        if (!ok) return;
        cupomCopiado = true;
        toast(`Cupom ${cupom} copiado ✓ Cola no carrinho`);
      });
    });
  }
}

for (const b of document.querySelectorAll<HTMLButtonElement>('[data-compartilhar]')) {
  b.addEventListener('click', async () => {
    const dados = { title: b.dataset.titulo, text: b.dataset.texto, url: b.dataset.url ?? location.href };
    if (navigator.share) {
      try {
        await navigator.share(dados);
      } catch {
        // a pessoa fechou a janela de compartilhar: nada a fazer
      }
      return;
    }
    const ok = await copiar(dados.url);
    toast(ok ? 'Link copiado ✓ Cola no WhatsApp' : 'Não consegui copiar o link');
  });
}
