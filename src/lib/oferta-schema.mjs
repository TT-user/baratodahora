// Schema de uma oferta (um JSON por oferta em src/content/ofertas/).
// Usado pela Content Collection do Astro e pelo `npm run nova-oferta`,
// para o script recusar na hora o que o build recusaria depois.
import { z } from 'astro/zod';
import { CATEGORIAS, LOJAS, slugify } from './catalogo.mjs';

const link = z.url({
  protocol: /^https?$/,
  error: 'precisa ser um link completo, começando com https://',
});

/** Link de vídeo: pode vir vazio ("") no JSON, que vale como "não tem". */
const linkOuVazio = z.union([z.literal(''), link]).optional();

const dia = z.iso.date({ error: 'use o formato AAAA-MM-DD' });
const diaOuHora = z.union([dia, z.iso.datetime({ offset: true, local: true })], {
  error: 'use AAAA-MM-DD ou data e hora ISO (2026-11-07T14:30:00-03:00)',
});

const linkDeLoja = z.object({
  loja: z.enum(LOJAS, { error: `loja precisa ser uma destas: ${LOJAS.join(', ')}` }),
  url: link,
  tipo: z.enum(['principal', 'alternativa']),
  rotulo: z.string().trim().max(60).optional(),
});

export const ofertaSchema = z
  .object({
    numero: z.number().int().positive(),
    slug: z
      .string()
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, { error: 'slug só com letras minúsculas, números e hífen' })
      .optional(),
    titulo: z
      .string()
      .trim()
      .min(3, { error: 'título muito curto (mínimo 3 letras)' })
      .max(120, { error: 'título muito longo (máximo 120 letras)' }),
    imagem: z.string().regex(/^\/[^\s?#]+\.(webp|jpe?g|png|avif)$/i, {
      error: 'imagem precisa ser um caminho dentro de public/, como "/ofertas/231.webp"',
    }),
    categoria: z.enum(CATEGORIAS, { error: `categoria precisa ser uma destas: ${CATEGORIAS.join(', ')}` }),
    precoDe: z.number().positive().optional(),
    precoPor: z.number().positive().optional(),
    precoVistoEm: diaOuHora.optional(),
    cupom: z.string().trim().max(40).optional(),
    links: z.array(linkDeLoja).min(1, { error: 'a oferta precisa de pelo menos um link' }),
    videos: z
      .object({ tiktok: linkOuVazio, youtube: linkOuVazio, instagram: linkOuVazio })
      .optional(),
    publicadoEm: diaOuHora,
    ativo: z.boolean().default(true),
    destaque: z.boolean().default(false),
    nota: z.string().trim().max(280, { error: 'nota muito longa (máximo 280 letras)' }).optional(),
  })
  .superRefine((o, ctx) => {
    const principais = o.links.filter((l) => l.tipo === 'principal').length;
    if (principais !== 1) {
      ctx.addIssue({
        code: 'custom',
        path: ['links'],
        message: `precisa de exatamente 1 link "principal" (tem ${principais})`,
      });
    }
    if (o.precoDe != null && o.precoPor == null) {
      ctx.addIssue({ code: 'custom', path: ['precoPor'], message: 'tem precoDe mas falta precoPor' });
    }
    if (o.precoDe != null && o.precoPor != null && o.precoDe <= o.precoPor) {
      ctx.addIssue({
        code: 'custom',
        path: ['precoDe'],
        message: `precoDe (${o.precoDe}) precisa ser maior que precoPor (${o.precoPor}); o desconto é calculado`,
      });
    }
  })
  .transform((o) => ({
    ...o,
    slug: o.slug || slugify(o.titulo),
    cupom: o.cupom || undefined,
    nota: o.nota || undefined,
    videos: {
      tiktok: o.videos?.tiktok || undefined,
      youtube: o.videos?.youtube || undefined,
      instagram: o.videos?.instagram || undefined,
    },
  }));
