import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://www.tn-abbruch.de',
  trailingSlash: 'always',
  build: { format: 'directory', inlineStylesheets: 'auto' },
  image: { responsiveStyles: true },
    // Dankeseiten und das Demo-Backend gehören nicht in die Sitemap.
  integrations: [sitemap({ filter: (page) => !page.includes('/danke/') && !page.includes('/demo/') })],
  compressHTML: true,
  devToolbar: { enabled: false },
});
