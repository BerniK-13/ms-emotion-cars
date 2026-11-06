import { defineConfig } from 'astro/config';
// GitHub Pages project repositories are hosted at /repository-name/.
// For the final custom domain, set SITE_URL and leave BASE_PATH empty.
export default defineConfig({
  site: process.env.SITE_URL || 'https://example.com',
  base: process.env.BASE_PATH || '/',
});
