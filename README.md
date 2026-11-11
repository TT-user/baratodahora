# Barato da Hora · site do link da bio

O link da bio do YouTube, do TikTok e do Instagram. Em cada vídeo aparece um número
("Oferta 231"); a pessoa entra no site, acha a oferta pelo número ou pelo nome e clica para
comprar na Shopee, no Mercado Livre ou na Amazon.

- **Home `/`**: persona, busca, letreiro, filtros, destaque do dia e a lista numerada.
- **Página da oferta `/o/<slug>`**: foto, preço, cupom, botão da loja do vídeo e "também encontrei".
- **Atalho `/231`**: leva direto para a oferta 231 (301 de verdade na Vercel).
- **Oferta encerrada**: a página continua no ar, sem link de loja, mostrando as que estão valendo.
- **Grupo `/grupo`**: página para encher os grupos de WhatsApp. Sem cadastro: o botão leva direto
  ao grupo que ainda tem vaga (veja "Grupos de WhatsApp", abaixo).

Astro 7 + TypeScript, site estático. Sem React e sem Tailwind. O JavaScript da home tem ~6 KB
(4 KB transferidos).

---

## Rodar no computador

Precisa do Node 22.12 ou mais novo.

```bash
npm install
npm run dev        # http://localhost:4321
```

- `http://localhost:4321/styleguide` mostra todos os componentes numa tela (só existe no `dev`).
- `npm run build` confere os tipos e gera o site em `dist/`. `npm run preview` serve o `dist/`.

---

## Cadastrar uma oferta (todo dia)

### Jeito 1: no Claude Code (o mais rápido)

Dentro desta pasta, escreva do seu jeito:

```
/nova-oferta Passador a vapor rotativo, casa, shopee https://s.shopee.com.br/... ml https://meli.la/... de 199 por 89, cupom BARATO10, foto ./fotos/passador.jpg
```

O Claude cria a oferta, roda o build, faz o commit (`oferta #232: passador a vapor`), dá o push e
devolve o link curto (`baratodahora.com.br/232`) para colar no vídeo. A Vercel publica em cerca de
1 minuto.

Outros comandos:

| Comando | O que faz |
|---|---|
| `/encerrar-oferta 231` | encerra (a página fica, sem link de loja) |
| `/destaque 231` | vira o destaque do dia e tira o anterior |

### Jeito 2: no terminal

```bash
npm run nova-oferta
```

Ele pergunta título, categoria, links, preço, cupom, vídeos e a foto (arquivo ou URL), pega o
próximo número sozinho, gera o slug, converte a foto para `public/ofertas/<número>.webp` (800 px,
quadrada, fundo branco, sobra branca aparada) e valida tudo antes de salvar.

Também aceita tudo de uma vez, sem perguntas:

```bash
npm run nova-oferta -- --titulo "Passador a Vapor Rotativo" --categoria casa \
  --link https://s.shopee.com.br/xxx --alt "ml=https://meli.la/yyy|Achei um parecido" \
  --de 199,90 --por 89,90 --cupom BARATO10 --imagem ./fotos/passador.jpg --sim
```

Depois: `npm run build`, `git add` da oferta e da foto, `git commit` e `git push`.

```bash
npm run encerrar-oferta -- 231            # encerra
npm run encerrar-oferta -- 231 --reabrir  # volta
npm run destaque -- 231                   # destaque do dia
npm run destaque -- --nenhum              # sem destaque
```

### Jeito 3: à mão

Cada oferta é um arquivo `src/content/ofertas/<número>-<slug>.json`:

```json
{
  "numero": 231,
  "slug": "passador-a-vapor-ferro-rotativo",
  "titulo": "Passador a Vapor Ferro Rotativo",
  "imagem": "/ofertas/231.webp",
  "categoria": "casa",
  "precoDe": 199.9,
  "precoPor": 89.9,
  "precoVistoEm": "2026-11-07",
  "cupom": "BARATO10",
  "links": [
    { "loja": "shopee", "url": "https://s.shopee.com.br/...", "tipo": "principal", "rotulo": "Link do produto do vídeo" },
    { "loja": "mercadolivre", "url": "https://meli.la/...", "tipo": "alternativa", "rotulo": "Achei um parecido" }
  ],
  "videos": { "tiktok": "", "youtube": "", "instagram": "" },
  "publicadoEm": "2026-11-07T09:00:00-03:00",
  "ativo": true,
  "destaque": false,
  "nota": "Esquenta em 30s. Bom para camisa social."
}
```

Regras (o build recusa a oferta que não seguir, dizendo o que está errado):

- `numero` único. `slug` opcional: sem ele, sai do título.
- `loja`: `shopee`, `mercadolivre`, `amazon`, `magalu`, `aliexpress` ou `outra`.
- **Exatamente 1** link `principal`; quantas `alternativa` quiser.
- `categoria`: `casa`, `cozinha`, `carro`, `ferramentas`, `beleza`, `tech`, `pet`, `infantil` ou `outros`.
- `precoDe`, `precoPor`, `cupom`, `videos` e `nota` são opcionais. O **% de desconto é calculado**,
  nunca digitado; `precoDe` precisa ser maior que `precoPor`.
- `publicadoEm`: data (`2026-11-07`) ou data e hora. O selo NOVO aparece por 48 horas.
- A imagem precisa existir em `public/`.

> As seis ofertas de exemplo do começo do projeto (#226 a #231, preços inventados) saíram do site
> quando entrou a primeira oferta de verdade. Estão no primeiro commit do git, se precisar delas
> para testar o visual com a lista cheia.

---

## Grupos de WhatsApp

A página `/grupo` existe para encher os grupos de ofertas. Não pede cadastro: o botão "Entrar no
grupo" abre direto o convite do **primeiro grupo da lista que não está cheio**. O bloco "entrar no
grupo" da home e o link "Grupo" do rodapé usam a mesma lista, em `src/data/grupos.json`.

Cada grupo de WhatsApp aceita até 1.024 pessoas. Quando um encher, marque como cheio e o botão passa
sozinho para o próximo (depois do push, ~1 min):

```bash
npm run grupo                                     # mostra a lista e qual está recebendo gente
npm run grupo -- novo https://chat.whatsapp.com/...   # grupo novo no fim da fila
npm run grupo -- cheio 2                          # grupo 2 encheu
npm run grupo -- reabrir 2                        # grupo 2 voltou a ter vaga
npm run grupo -- trocar 2 https://chat.whatsapp.com/...  # redefiniu o convite no WhatsApp
```

No Claude Code: `/grupo cheio 2`, `/grupo novo <link>` (faz o build, o commit e o push).

- Sem nenhum grupo: a página mostra "O grupo abre em breve", o bloco da home some e o rodapé não
  mostra o link.
- Todos cheios: a página mostra "Os grupos lotaram" e manda para as ofertas do site.
- Com grupo cheio na lista, a página diz quantos já lotaram (é a conta da lista, não inventada).
- Dica: deixe o próximo grupo criado e na fila (`novo`) antes de o atual encher; aí é só `cheio`.

---

## Marca

Tudo que é da marca fica em `src/site.config.ts`: nome, slogan, domínio, redes, aviso de afiliado
e e-mail de contato. Os grupos de WhatsApp ficam em `src/data/grupos.json` (seção acima).

A identidade vem do banner do canal (`marca/capa-youtube.png`): amarelo `#FFD60A`, vermelho
`#D62828`, preto, as caixas de encomenda com etiqueta de % e o logo "BARATO [DA HORA]" na Anton.
O logo é desenhado em SVG no build a partir da fonte (`src/lib/marca.mjs`): o visitante não baixa
a Anton. A linguagem visual (borda grossa, sombra dura, adesivos tortos) segue a referência pedida.

### Trocar a foto da persona

A foto precisa ter fundo liso e saturado (como o amarelo da atual).

```bash
python scripts/desenhos/recorta-persona.py marca/nova-foto.jpg   # precisa de opencv-python e numpy
npm run desenhos
```

O primeiro recorta a pessoa do fundo e separa o rosto (`marca/`); o segundo gera
`public/brand/avatar.webp` (moldura do topo), `avatar-420.webp` e `rosto.webp` (avatar redondo da
página da oferta). A prévia do WhatsApp da home é refeita sozinha no build.

`npm run desenhos` também refaz o favicon. As imagens das ofertas de exemplo (desenhos 2D em SVG,
`scripts/desenhos/desenhos.mjs`) saem com `npm run desenhos -- --exemplos`.

O dinheiro que flutua no topo da home e do `/grupo` (cédula, moeda e cofrinho) também mora em
`desenhos.mjs` e vira `/brand/dinheiro-<peça>.svg` no build, sozinho. Onde cada peça fica, e quais
aparecem no celular, está em `src/components/Dinheiro.astro`.

---

## Publicar na Vercel

1. Crie um repositório no GitHub e suba esta pasta (`git push`).
2. Na Vercel: **Add New → Project**, escolha o repositório. Ela reconhece o Astro sozinha; não
   mude nada (comando de build `npm run build`).
3. Pronto: cada `git push` publica em cerca de 1 minuto.

Na Vercel, os atalhos `/231` viram redirecionamento 301 de verdade (o adaptador `@astrojs/vercel`
só liga lá, pela variável `VERCEL`). Em qualquer outro lugar, o build gera páginas de
redirecionamento instantâneo com `canonical`. E se um número não tiver atalho, a página 404
procura a oferta e redireciona do mesmo jeito.

### Apontar o domínio

1. Na Vercel, no projeto: **Settings → Domains → Add**, digite `baratodahora.com.br` e também
   `www.baratodahora.com.br` (marque um para redirecionar para o outro).
2. A Vercel mostra os registros de DNS a criar (normalmente um registro **A** para o domínio sem
   www e um **CNAME** para o `www`). Crie exatamente esses no lugar onde o domínio foi registrado
   (no Registro.br: **Editar zona DNS**).
3. Espere a Vercel mostrar "Valid Configuration" (de minutos a algumas horas).
4. Troque `dominio` em `src/site.config.ts` para o domínio novo: é o endereço que o
   `/nova-oferta` devolve como link curto. Canonical, sitemap e prévias do WhatsApp já seguem
   sozinhos o domínio de produção que a Vercel informa no build.

---

## Rastreio de cliques (preparado, desligado)

Cada botão de loja tem `data-loja`, `data-oferta` e `data-local`. Para contar os cliques, em
`src/site.config.ts`:

- **Vercel Web Analytics**: ligue o Analytics no painel do projeto e ponha
  `rastreio: { ativo: true, provedor: "vercel" }`. Eventos personalizados (`clique_loja`) são do
  plano pago da Vercel; as visitas contam em todos.
- **Umami** (tem plano gratuito): crie o site no Umami e ponha
  `rastreio: { ativo: true, provedor: "umami", umamiId: "<id>" }`.

Desligado, nenhum script de medição carrega. Ligou? Revise a página `/privacidade`, que já muda o
texto sozinha conforme essa chave.

---

## Como está organizado

```
src/
  site.config.ts          marca, redes, avisos (edite aqui)
  content/ofertas/*.json  uma oferta por arquivo
  content.config.ts       a coleção de ofertas
  lib/
    oferta-schema.mjs     regras de uma oferta (usado pelo site e pelo script)
    catalogo.mjs          lojas, categorias, slug, miniaturas
    ofertas.ts            consultas, preço, desconto, relacionadas
    marca.mjs             texto na Anton → SVG (logo)
    og.ts                 imagens de prévia do WhatsApp (satori + sharp)
  components/             Logo, FrameStack, Busca, OfertaItem, BotaoLoja, Cupom...
  pages/
    index.astro           home
    o/[slug].astro        página da oferta
    404.astro             404 que acha a oferta pelo número
    privacidade.astro
    busca.json.ts         índice da busca (baixa quando o navegador fica ocioso)
    og/[numero].jpg.ts    prévia 1200×630 de cada oferta
    og-home.png.ts        prévia da home
    sitemap.xml.ts, robots.txt.ts
  scripts/                JavaScript do navegador (busca, cupom, CTA fixo)
  styles/global.css       design system: tokens e componentes base
  dev/styleguide.astro    a página /styleguide
integrations/             miniaturas no build, atalhos /231, styleguide só no dev
scripts/                  nova-oferta, encerrar-oferta, destaque, desenhos
marca/                    banner e foto original da persona (não vai para o site)
public/                   imagens servidas como estão
.claude/commands/         /nova-oferta, /encerrar-oferta, /destaque
```

As miniaturas das fotos (200, 400 e 600 px) são geradas no build em `public/_mini/`, fora do git.

### Bom saber

- Cada prévia de oferta leva ~0,2 s no build. Com mil ofertas, o build passa de 3 minutos; aí vale
  gerar só as das ofertas ativas.
- O `npm audit` aponta um aviso no `fflate`, usado pelo `satori`. Ele só roda no build, com as
  fontes do próprio projeto; nada chega ao visitante.
- Animações param fora da tela e desligam com "reduzir movimento" no aparelho.
