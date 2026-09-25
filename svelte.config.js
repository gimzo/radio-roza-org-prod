import adapter from '@sveltejs/adapter-cloudflare';
import { relative, sep } from 'node:path';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  compilerOptions: {
    // defaults to rune mode for the project, execept for `node_modules`. Can be removed in svelte 6.
    runes: ({ filename }) => {
      const relativePath = relative(import.meta.dirname, filename);
      const pathSegments = relativePath.toLowerCase().split(sep);
      const isExternalLibrary = pathSegments.includes('node_modules');

      return isExternalLibrary ? undefined : true;
    },
  },
  kit: {
    adapter: adapter({
      // Pages dopušta najviše 100 pravila u _routes.json. Zadani `<all>` ispisuje
      // svaku statičnu datoteku posebno (fontovi, slike crewa...) i prelije limit,
      // pa adapter tiho odbaci višak — te datoteke onda bez potrebe bude funkciju.
      // Mape pokrivamo jednim wildcardom umjesto stavku po stavku.
      routes: {
        include: ['/*'],
        exclude: [
          '<build>',
          '<prerendered>',
          '/fonts/*',
          '/images/*',
          '/icons/*',
          '/screenshots/*',
          '/apple-touch-icon.png',
          '/logo.svg',
          '/manifest.webmanifest',
          '/robots.txt',
        ],
      },
    }),
    prerender: {
      // Prerendered pages bake og:url/canonical from this origin
      origin: 'https://radio-roza.org',
    },
  },
};

export default config;
