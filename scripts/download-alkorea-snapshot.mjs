import { writeFile, rename, mkdir } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { ALKoreaClient, readPrivateCredentials } from './lib/alkorea-client.mjs';
import { parseALCatalogue, parseALDetail } from '../src/lib/alkorea-parser.mjs';

const credentials = await readPrivateCredentials();
const client = new ALKoreaClient(credentials.username, credentials.password);
await client.login();
const first = parseALCatalogue(await client.catalogue());
const summaries = [...first.cars];
for (let page = 2; page <= first.pageCount; page++) {
  await new Promise(resolve => setTimeout(resolve, 300));
  const data = parseALCatalogue(await client.catalogue(page));
  if (!data.cars.length && page < first.pageCount) throw new Error(`Catalogue page ${page} is unexpectedly empty`);
  summaries.push(...data.cars);
  console.log(`Catalogue ${page}/${first.pageCount}`);
}
const unique = [...new Map(summaries.map(car => [car.id, car])).values()];
if (!unique.length) throw new Error('Source catalogue is empty; previous snapshot has been preserved');
const cars = [];
for (const summary of unique) {
  await new Promise(resolve => setTimeout(resolve, 250));
  try { cars.push(parseALDetail(await client.detail(summary.id), summary)); }
  catch { throw new Error(`Vehicle ${summary.id} could not be imported; previous snapshot has been preserved`); }
  if (cars.length % 20 === 0) console.log(`Vehicle details ${cars.length}/${unique.length}`);
}
const snapshot = { fetchedAt: new Date().toISOString(), count: cars.length, cars };
const target = resolve('src/data/alkorea-snapshot.json');
await mkdir(dirname(target), { recursive: true });
const temp = `${target}.tmp`;
await writeFile(temp, JSON.stringify(snapshot), 'utf8');
await rename(temp, target);
console.log(`Imported ${cars.length} listings and ${cars.reduce((sum, car) => sum + car.images.length, 0)} photo links. No account data exported.`);
process.exit(0);
