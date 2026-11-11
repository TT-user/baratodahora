// Regras da lista de grupos de WhatsApp (src/data/grupos.json). Usado pela
// página /grupo e pelo `npm run grupo`, para o script recusar na hora o que
// o build recusaria depois.
import { z } from 'astro/zod';

/** Limite de pessoas por grupo de WhatsApp. */
export const LIMITE_WHATSAPP = 1024;

/** Convite de grupo: https://chat.whatsapp.com/<código>, com ou sem ?parâmetros. */
export const CONVITE = /^https:\/\/chat\.whatsapp\.com\/[A-Za-z0-9]{16,}(\?\S*)?$/;

const grupo = z.object({
  link: z
    .string()
    .trim()
    .regex(CONVITE, { error: 'precisa ser um convite de grupo do WhatsApp: https://chat.whatsapp.com/...' }),
  cheio: z.boolean(),
});

export const gruposSchema = z
  .object({
    _leia: z.string().optional(),
    grupos: z.array(grupo),
  })
  .superRefine((dados, ctx) => {
    const vistos = new Map();
    dados.grupos.forEach((g, i) => {
      const codigo = g.link.split('?')[0];
      if (vistos.has(codigo)) {
        ctx.addIssue({
          code: 'custom',
          path: ['grupos', i, 'link'],
          message: `o grupo ${i + 1} tem o mesmo convite do grupo ${vistos.get(codigo) + 1}`,
        });
      } else vistos.set(codigo, i);
    });
  });

/**
 * O grupo que está recebendo gente: o primeiro da lista que não encheu.
 * @param {{ link: string, cheio: boolean }[]} grupos
 * @returns {{ numero: number, link: string } | undefined}
 */
export function grupoAberto(grupos) {
  const i = grupos.findIndex((g) => !g.cheio);
  return i < 0 ? undefined : { numero: i + 1, link: grupos[i].link };
}

/** Mensagem de erro legível a partir do resultado do safeParse. */
export function errosDosGrupos(resultado) {
  return resultado.error.issues.map((e) => `${e.path.join('.') || 'grupos.json'}: ${e.message}`).join('\n');
}
