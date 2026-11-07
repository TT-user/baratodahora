// Tudo que é da marca fica aqui. Mudou nome, rede ou aviso? É só neste arquivo.
export const site = {
  nome: "Barato da Hora",
  slogan: "Achadinhos que valem cada centavo.", // o mesmo do banner do canal
  dominio: "https://baratodahora.com.br", // TODO: confirmar domínio
  avatar: "/brand/avatar.webp", // persona sem fundo (scripts/desenhos/recorta-persona.py)
  avatarAlt: "Apresentador do Barato da Hora, empolgado, segurando caixas de encomenda",
  rosto: "/brand/rosto.webp",   // rosto da persona, para o avatar redondo
  redes: {
    youtube: "https://youtube.com/@baratodahora",
    tiktok: "https://tiktok.com/@obaratodahora",     // TODO: confirmar @
    instagram: "https://instagram.com/baratodahora", // TODO: confirmar @
  },
  grupoWhatsApp: "", // se vazio, esconde todos os blocos de "entrar no grupo"
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
