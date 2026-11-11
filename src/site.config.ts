// Tudo que é da marca fica aqui. Mudou nome, rede ou aviso? É só neste arquivo.
export const site = {
  nome: "Barato da Hora",
  slogan: "Achadinhos que valem cada centavo.", // o mesmo do banner do canal
  // Endereço público. É o que o /nova-oferta devolve como link curto.
  // TODO: quando baratodahora.com.br apontar para a Vercel, trocar aqui.
  // (Canonical, sitemap e prévias já seguem sozinhos o domínio de produção.)
  dominio: "https://baratodahora.vercel.app",
  avatar: "/brand/avatar.webp", // persona sem fundo (scripts/desenhos/recorta-persona.py)
  avatarAlt: "Apresentador do Barato da Hora, empolgado, segurando caixas de encomenda",
  rosto: "/brand/rosto.webp",   // rosto da persona, para o avatar redondo
  redes: {
    youtube: "https://youtube.com/@baratodahora",
    tiktok: "https://tiktok.com/@obaratodahora",     // TODO: confirmar @
    instagram: "https://instagram.com/baratodahora", // TODO: confirmar @
  },
  // Grupos de WhatsApp: em src/data/grupos.json (npm run grupo). Sem grupo com
  // vaga, o bloco da home some e a página /grupo mostra "abre em breve".
  avisoAfiliado:
    "Alguns links são de afiliado: posso ganhar uma comissão, sem custo extra pra você. Preços e estoque mudam rápido; confira na loja.",
  contato: "", // TODO: e-mail de contato (aparece na página de privacidade)

  // Rastreio de cliques nos botões de loja (data-loja + data-oferta).
  // Desligado: nenhum script de medição carrega. Para ligar, veja o README.
  rastreio: {
    ativo: false,
    provedor: "vercel" as "vercel" | "umami",
    umamiId: "", // id do site no Umami, se o provedor for "umami"
  },
};

/**
 * Endereço que vai no canonical, no sitemap e nas prévias do WhatsApp.
 * No build da Vercel é o domínio de produção do projeto (o domínio próprio,
 * quando ele estiver ligado lá, ou o .vercel.app). Fora dela, `site.dominio`.
 */
const producaoVercel = process.env.VERCEL_PROJECT_PRODUCTION_URL;
export const urlDoSite = producaoVercel ? `https://${producaoVercel}` : site.dominio;
