import {readdir, readFile, stat} from 'node:fs/promises';
import {join, resolve, relative, extname} from 'node:path';

const root = resolve('dist');
const base = '/ms-emotion-cars';
const pages = [];
async function walk(dir) {
  for (const entry of await readdir(dir, {withFileTypes: true})) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) await walk(path);
    else if (entry.name.endsWith('.html')) pages.push(path);
  }
}
await walk(root);
if (!pages.length) throw new Error('No HTML pages generated');
const failures = [];
const links = new Set();
for (const page of pages) {
  const html = await readFile(page, 'utf8');
  for (const [, , url] of html.matchAll(/\b(href|src)=["']([^"']+)["']/g)) {
    if (!url || /^(https?:|mailto:|tel:|data:|#|javascript:)/i.test(url)) continue;
    if (!url.startsWith('/')) continue;
    const path = decodeURIComponent(url.split(/[?#]/)[0]);
    if (path !== base && !path.startsWith(base + '/')) {
      failures.push(`${relative(root,page)}: missing base prefix: ${url}`);
      continue;
    }
    let local = path.slice(base.length).replace(/^\//, '');
    const target = join(root, local);
    const candidates = extname(local) ? [target] : [join(target, 'index.html'), target + '.html', target];
    let found = false;
    for (const candidate of candidates) {
      try { if ((await stat(candidate)).isFile()) { found = true; break; } }
      catch {}
    }
    if (!found) failures.push(`${relative(root,page)}: broken reference ${url}`);
    links.add(url);
  }
}
console.log(`Checked ${pages.length} generated pages and ${links.size} distinct local references.`);
if (failures.length) {
  console.error(failures.join('\n'));
  process.exitCode = 1;
} else console.log('All internal links and assets resolve.');
