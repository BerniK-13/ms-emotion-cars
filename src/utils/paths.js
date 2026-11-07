// Prefix internal links and public assets with Astro's configured base path.
// Works on GitHub Pages subpaths and at the root of a custom domain.
export function withBase(path) {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  return `${base}/${String(path).replace(/^\/+/, '')}`;
}
