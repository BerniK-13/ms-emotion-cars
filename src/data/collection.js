// MS Collection products are maintained through Decap CMS JSON entries.
const entries = import.meta.glob('../../content/products/*.json', {eager:true,import:'default'});
function assetPath(path){if(!path || typeof path !== 'string')return '';const clean=path.trim();return /^https?:\/\//i.test(clean)?clean:(clean.startsWith('/ms-emotion-cars/')?clean:'/ms-emotion-cars'+(clean.startsWith('/')?clean:'/'+clean));}
export const products=Object.values(entries).map(raw=>({
  ...raw,
  image:assetPath(raw.image),
  images:(Array.isArray(raw.images)?raw.images:[]).map(x=>assetPath(typeof x==='string'?x:x?.image)).filter(Boolean),
  sizes:(Array.isArray(raw.sizes)?raw.sizes:[]).map(x=>typeof x==='string'?x:x?.size).filter(Boolean),
  colors:(Array.isArray(raw.colors)?raw.colors:[]).map(x=>typeof x==='string'?x:x?.color).filter(Boolean),
  material:raw.material||null,fit:raw.fit||null,care:raw.care||null,availability:raw.availability||null,
})).filter(p=>p.slug&&p.name);
