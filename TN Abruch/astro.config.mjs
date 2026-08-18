import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://www.tn-abbruch.de',
  trailingSlash: 'always',
  build: { format: 'directory', inlineStylesheets: 'auto' },
  image: { responsiveStyles: true },
  integrations: [sitemap({ filter: (page) => !page.includes('/danke/') })],
  compressHTML: true,
  devToolbar: { enabled: false },
});
