import type { APIRoute } from 'astro';
import { fotos, lojasDaOferta, todasAsOfertas } from '../lib/ofertas';

// Índice compacto de todas as ofertas (ativas e encerradas) para a busca da
// home e para o 404 inteligente. Chaves curtas porque a lista cresce todo dia.
export const GET: APIRoute = async () => {
  const todas = await todasAsOfertas();
  const itens = todas.map((o) => {
    const f = fotos(o);
    return {
      n: o.numero,
      s: o.slug,
      t: o.titulo,
      c: o.categoria,
      i: f.p,
      i2: f.m,
      ...(o.precoDe ? { de: o.precoDe } : {}),
      ...(o.precoPor ? { por: o.precoPor } : {}),
      l: lojasDaOferta(o),
      p: o.publicadoEm,
      a: o.ativo ? 1 : 0,
    };
  });
  return new Response(JSON.stringify(itens), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
};
