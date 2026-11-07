// Miniaturas das fotos das ofertas (200 e 400 px, quadradas, WebP).
// A lista da home mostra a foto em 88 px: servir a de 800 px seria baixar
// dez vezes mais do que aparece. Elas vão para public/_mini/ (fora do git),
// são geradas antes de cada build e refeitas no dev quando uma foto muda.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { LARGURAS_MINI, miniatura } from '../src/lib/catalogo.mjs';
import { lerOfertas } from './ofertas-no-disco.mjs';

/** @param {string} raiz @param {string} pub @param {(m: string) => void} aviso */
async function gerarTodas(raiz, pub, aviso) {
  let feitas = 0;
  for (const o of lerOfertas(raiz)) {
    const origem = path.join(pub, o.imagem);
    if (!fs.existsSync(origem)) {
      aviso(`a oferta #${o.numero} aponta para ${o.imagem}, que não existe em public/`);
      continue;
    }
    const mtime = fs.statSync(origem).mtimeMs;
    for (const largura of LARGURAS_MINI) {
      const destino = path.join(pub, miniatura(o.imagem, largura));
      if (fs.existsSync(destino) && fs.statSync(destino).mtimeMs >= mtime) continue;
      fs.mkdirSync(path.dirname(destino), { recursive: true });
      await sharp(origem)
        .resize(largura, largura, { fit: 'cover' })
        .flatten({ background: '#FFFFFF' })
        .webp({ quality: 76 })
        .toFile(destino);
      feitas++;
    }
  }
  return feitas;
}

export default function miniaturas() {
  /** @type {string} */ let raiz;
  /** @type {string} */ let pub;
  return {
    name: 'bdh-miniaturas',
    hooks: {
      'astro:config:setup': async ({ config, logger }) => {
        raiz = fileURLToPath(config.root);
        pub = fileURLToPath(config.publicDir);
        const feitas = await gerarTodas(raiz, pub, (m) => logger.warn(m));
        if (feitas) logger.info(`${feitas} miniatura(s) gerada(s) em public/_mini/`);
      },
      'astro:server:setup': ({ server, logger }) => {
        const refaz = async (arquivo) => {
          const f = arquivo.replace(/\\/g, '/');
          if (!f.includes('/src/content/ofertas/') && !f.includes('/public/ofertas/')) return;
          const feitas = await gerarTodas(raiz, pub, (m) => logger.warn(m));
          if (feitas) logger.info(`${feitas} miniatura(s) refeita(s)`);
        };
        server.watcher.add(path.join(pub, 'ofertas'));
        server.watcher.on('add', refaz);
        server.watcher.on('change', refaz);
      },
    },
  };
}
