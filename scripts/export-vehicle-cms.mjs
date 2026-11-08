// One-way, non-destructive export of existing vehicle data to Decap-friendly JSON.
// Deliberately DOES NOT alter src/data, pages, original photos or deploy configuration.
// Usage: node scripts/export-vehicle-cms.mjs
import {mkdir, writeFile, readFile} from 'node:fs/promises';
import {join} from 'node:path';
import {cars} from '../src/data/cars.js';
import {vehicleSpecs} from '../src/data/vehicleSpecs.js';
const folder='content/vehicles';
await mkdir(folder,{recursive:true});
for(const car of cars){
  const spec=vehicleSpecs[car.slug]||{};
  const output=join(folder,car.slug+'.json');
  const record={
    slug:car.slug,brand:car.brand,model:car.model,type:car.type||'',
    status:'in_stock',published:true,tag:car.tag||'',
    image:car.image||'',images:car.images||[],
    price:spec.price??null,reference:spec.reference||'',updated:spec.updated||'',
    facts:(spec.facts||[]).map(([label,value])=>({label,value})),
    details:(spec.details||[]).map(([label,value])=>({label,value})),
    highlights:(spec.highlights||[])
  };
  // Never overwrite existing CMS-edited records.
  try{await readFile(output);console.log('SKIP existing',output);}
  catch(e){if(e.code!=='ENOENT')throw e;await writeFile(output,JSON.stringify(record,null,2)+'\n');console.log('CREATED',output);}
}
