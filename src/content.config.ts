import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { ofertaSchema } from './lib/oferta-schema.mjs';

// Um arquivo JSON por oferta em src/content/ofertas/{numero}-{slug}.json.
// O schema (com as regras: 1 link principal, desconto calculado...) mora em
// lib/oferta-schema.mjs porque o script `npm run nova-oferta` usa o mesmo.
export const collections = {
  ofertas: defineCollection({
    loader: glob({ pattern: '*.json', base: './src/content/ofertas' }),
    schema: ofertaSchema,
  }),
};
