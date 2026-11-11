// Grupos de WhatsApp lidos de src/data/grupos.json. O build para se a lista
// estiver errada (convite inválido, convite repetido).
import dados from '../data/grupos.json';
import { errosDosGrupos, grupoAberto, gruposSchema } from './grupo-schema.mjs';

const lido = gruposSchema.safeParse(dados);
if (!lido.success) throw new Error(`src/data/grupos.json:\n${errosDosGrupos(lido)}`);

export const grupos = lido.data.grupos;

/** Grupo que recebe quem toca em "Entrar no grupo" (o primeiro que não encheu). */
export const grupoAtual = grupoAberto(grupos);

/** Quantos grupos já lotaram (aparece na página como prova de que enche). */
export const gruposCheios = grupos.filter((g) => g.cheio).length;
