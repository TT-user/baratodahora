// Proteção do conteúdo (pedido de 11/11/2026), no molde do protecao.js dos
// sites da Theatrum. A parte de CSS (sem seleção, sem arrastar imagem) mora
// no global.css; aqui ficam o botão direito, copiar e os atalhos.
//
// O QUE NÃO FAZ, e não tem como fazer: impedir a inspeção de verdade. Quem
// abrir o DevTools pelo menu do navegador, desligar o JavaScript ou baixar a
// página por curl continua vendo o HTML. É atrito para o curioso, não barreira.
//
// Campos (a busca, o "avise-me" do 404) ficam de fora de tudo, e o botão
// "copiar cupom" continua funcionando: ele copia pelo navigator.clipboard ou
// por uma <textarea> escondida, que é campo.

function ehCampo(alvo: EventTarget | null): boolean {
  if (!(alvo instanceof Element)) return false;
  const t = alvo.tagName;
  return t === 'INPUT' || t === 'TEXTAREA' || t === 'SELECT' || (alvo as HTMLElement).isContentEditable;
}

function barra(e: Event) {
  if (ehCampo(e.target)) return;
  e.preventDefault();
}

for (const evento of ['contextmenu', 'dragstart', 'selectstart', 'copy', 'cut']) {
  document.addEventListener(evento, barra);
}

// e.code em vez de e.key: no macOS, Option+I devolve um caractere acentuado em e.key
function letra(e: KeyboardEvent): string {
  return e.code?.startsWith('Key') ? e.code.slice(3).toLowerCase() : (e.key || '').toLowerCase();
}

addEventListener(
  'keydown',
  (e) => {
    const l = letra(e);
    const cmd = e.ctrlKey || e.metaKey;
    const campo = ehCampo(e.target);
    const devtools =
      e.key === 'F12' ||
      (cmd && e.shiftKey && 'ijc'.includes(l) && l.length === 1) ||
      (e.metaKey && e.altKey && 'ijc'.includes(l) && l.length === 1);
    const codigoOuSalvar = cmd && !e.shiftKey && (l === 'u' || (l === 's' && !campo));
    const copiarTudo = cmd && !campo && (l === 'a' || l === 'c');
    if (devtools || codigoOuSalvar || copiarTudo) {
      e.preventDefault();
      e.stopPropagation();
    }
  },
  true,
);
