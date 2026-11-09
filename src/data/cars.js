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
const specLabels = {"mileage":"Kilometerstand","registration":"Erstzulassung","power":"Leistung","transmission":"Getriebe","fuel":"Kraftstoff","drive":"Antrieb","condition":"Fahrzeugzustand","body":"Karosserie","displacement":"Hubraum","seats":"Sitzplätze","doors":"Türen","exterior":"Außenfarbe","interior":"Innenausstattung","emission":"Abgasnorm","co2":"CO₂-Ausstoß","acceleration":"0–100 km/h","top_speed":"Höchstgeschwindigkeit","service":"Servicehistorie"};
function normalize(raw) {
  const specEntries = Object.entries(raw.specs || {}).filter(([key,value]) => specLabels[key] && value != null && String(value).trim()).map(([key,value]) => ({label:specLabels[key],value:String(value)}));
  const primaryKeys = new Set(['mileage','registration','power','transmission','fuel','drive']);
  const primarySpecs = specEntries.filter(item => [...primaryKeys].some(key => specLabels[key] === item.label));
  const secondarySpecs = specEntries.filter(item => !primarySpecs.includes(item));
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
    facts: [...primarySpecs, ...(Array.isArray(raw.facts) ? raw.facts : [])],
    details: [...secondarySpecs, ...(Array.isArray(raw.details) ? raw.details : [])],
    highlights: typeof raw.highlights_text === 'string' ? raw.highlights_text.split(/\r?\n/).map(x=>x.trim()).filter(Boolean) : (Array.isArray(raw.highlights) ? raw.highlights : []),
  };
}
export const allCars = Object.values(entries).map(normalize).filter(car => car.slug && car.brand && car.model && car.published !== false && ['in_stock', 'sold'].includes(car.status));
export const cars = allCars.filter(car => car.status === 'in_stock');
export const soldCars = allCars.filter(car => car.status === 'sold');
export const euro = n => n == null || n === '' ? 'Preis auf Anfrage' : new Intl.NumberFormat('de-AT',{style:'currency',currency:'EUR',maximumFractionDigits:0}).format(n);
export const number = n => n == null ? 'Auf Anfrage' : new Intl.NumberFormat('de-AT').format(n);
