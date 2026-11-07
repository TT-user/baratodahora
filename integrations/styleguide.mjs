// A página /styleguide (todos os componentes numa tela) só existe no
// `npm run dev`. No build ela não é gerada nem publicada.
export default function styleguide() {
  return {
    name: 'bdh-styleguide',
    hooks: {
      'astro:config:setup': ({ command, injectRoute }) => {
        if (command !== 'dev') return;
        injectRoute({ pattern: '/styleguide', entrypoint: './src/dev/styleguide.astro' });
      },
    },
  };
}
