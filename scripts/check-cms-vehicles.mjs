// Validate staged CMS records against live source data, without touching the site.
import {readdir,readFile} from 'node:fs/promises';
import {cars} from '../src/data/cars.js';
import {vehicleSpecs} from '../src/data/vehicleSpecs.js';
const folder=new URL('../content/vehicles/',import.meta.url);
const names=(await readdir(folder)).filter(name=>name.endsWith('.json')).sort();
const errors=[];
const staged=new Map();
for(const name of names){
  const v=JSON.parse(await readFile(new URL(name,folder),'utf8'));
  if(staged.has(v.slug))errors.push('Duplicate slug: '+v.slug);
  staged.set(v.slug,v);
  if(name!==v.slug+'.json')errors.push('Filename/slug mismatch: '+name);
  if(!['draft','in_stock','sold'].includes(v.status))errors.push('Invalid status: '+name);
  if(typeof v.published!=='boolean')errors.push('Invalid published flag: '+name);
  if(!Array.isArray(v.images)||!v.images.every(x=>typeof x==='string'))errors.push('Invalid gallery: '+name);
  if(v.price!=null&&(!Number.isInteger(v.price)||v.price<0))errors.push('Invalid price: '+name);
}
for(const car of cars){
  const v=staged.get(car.slug);
  if(!v){errors.push('Missing record: '+car.slug);continue;}
  for(const key of ['brand','model','type','tag','image'])if((v[key]||'')!==(car[key]||''))errors.push(car.slug+' changed '+key);
  if(JSON.stringify(v.images)!==JSON.stringify(car.images))errors.push(car.slug+' changed gallery/order');
  const spec=vehicleSpecs[car.slug]||{};
  if((v.price??null)!==(spec.price??null))errors.push(car.slug+' changed price');
  if((v.reference||'')!==(spec.reference||''))errors.push(car.slug+' changed reference');
  for(const key of ['facts','details']){
    const expected=(spec[key]||[]).map(([label,value])=>({label,value}));
    if(JSON.stringify(v[key])!==JSON.stringify(expected))errors.push(car.slug+' changed '+key);
  }
  if(JSON.stringify(v.highlights)!==JSON.stringify(spec.highlights||[]))errors.push(car.slug+' changed highlights');
}
if(staged.size!==cars.length)errors.push('Record count differs: '+staged.size+' vs '+cars.length);
if(errors.length){console.error(errors.join('\n'));process.exitCode=1;}
else console.log('CMS staging OK: '+staged.size+' vehicle records; original images, order, details and prices preserved.');
