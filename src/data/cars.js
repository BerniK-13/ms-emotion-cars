// Fahrzeugdaten kommen direkt aus den JSON-Dateien des CMS.
// Astro baut die statische Website nach jedem Commit auf main automatisch neu.
const entries = import.meta.glob('../../content/vehicles/*.json', { eager: true, import: 'default' });
function assetPath(path) {
  if (!path || typeof path !== 'string') return null;
  const clean = path.trim();
  if (!clean) return null;
  if (/^https?:\/\//i.test(clean)) return clean;
  // Decap liefert bei neuen Uploads den GitHub-Pages-Prefix, vorhandene Dateien nicht.
  return clean.replace(/^\/ms-emotion-cars(?=\/)/, '');
}
function normalize(raw) {
  const images = (Array.isArray(raw.images) ? raw.images : []).map(x => assetPath(typeof x === 'string' ? x : x?.image)).filter(Boolean);
  const image = assetPath(raw.image) || images[0] || null;
  if (image && !images.includes(image)) images.unshift(image);
  return {
    ...raw,
    slug: String(raw.slug || '').trim(),
    brand: String(raw.brand || '').trim(),
    model: String(raw.model || '').trim(),
    type: raw.type || 'Automobil',
    tag: raw.tag || (raw.status === 'sold' ? 'SOLD' : 'IM SHOWROOM'),
    image,
    images,
    facts: Array.isArray(raw.facts) ? raw.facts : [],
    details: Array.isArray(raw.details) ? raw.details : [],
    highlights: Array.isArray(raw.highlights) ? raw.highlights : [],
  };
}
export const allCars = Object.values(entries).map(normalize).filter(car => car.slug && car.brand && car.model && car.published === true && car.status !== 'draft');
export const cars = allCars.filter(car => car.status === 'in_stock');
export const euro = n => n == null || n === '' ? 'Preis auf Anfrage' : new Intl.NumberFormat('de-AT',{style:'currency',currency:'EUR',maximumFractionDigits:0}).format(n);
export const number = n => n == null ? 'Auf Anfrage' : new Intl.NumberFormat('de-AT').format(n);
