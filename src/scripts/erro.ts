// 404 inteligente: se o endereço é um número (/231) e a oferta existe,
// manda para ela. Cobre atalho que ainda não foi publicado como redirect e
// números que colidem com páginas do site (/404).
const msg = document.getElementById('erro-msg');
const campo = document.getElementById('busca') as HTMLInputElement | null;
const caminho = decodeURIComponent(location.pathname).replace(/\/+$/, '');
const numero = caminho.match(/^\/#?(\d+)$/)?.[1];

if (numero) {
  if (campo) campo.value = numero;
  fetch('/busca.json')
    .then((r) => r.json() as Promise<{ n: number; s: string }[]>)
    .then((itens) => {
      const oferta = itens.find((o) => String(o.n) === numero);
      if (oferta) {
        location.replace(`/o/${oferta.s}`);
        return;
      }
      if (msg) msg.textContent = `Não achei a oferta #${numero}. Confere o número no vídeo e busca de novo.`;
    })
    .catch(() => {});
}

export {};
