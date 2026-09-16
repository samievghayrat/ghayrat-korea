import 'server-only';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { cache } from 'react';
import { unstable_cache } from 'next/cache';
import { ALKoreaClient } from '../../scripts/lib/alkorea-client.mjs';
import { parseALCatalogue, parseALDetail } from './alkorea-parser.mjs';
import { summarizeDamagedCar, type DamagedCar, type DamagedCatalogue, type DamagedSnapshot } from './damaged-cars';

export const getDamagedSnapshot = cache(async (): Promise<DamagedSnapshot> => {
  const data = JSON.parse(await readFile(join(process.cwd(), 'src/data/alkorea-snapshot.json'), 'utf8')) as DamagedSnapshot;
  if (!Array.isArray(data.cars) || !data.fetchedAt) throw new Error('Invalid accident-car snapshot');
  return data;
});

async function sourceClient() {
  const client = new ALKoreaClient(process.env.ALKOREA_USERNAME || '', process.env.ALKOREA_PASSWORD || '');
  await client.login();
  return client;
}

const readLiveCatalogue = unstable_cache(async (): Promise<DamagedCatalogue> => {
  const client = await sourceClient();
  const first = parseALCatalogue(await client.catalogue());
  const cars = [...first.cars];
  // Fetch every source page with bounded concurrency. Never stop at page one.
  for (let page = 2; page <= first.pageCount; page += 3) {
    const pages = Array.from({ length: Math.min(3, first.pageCount - page + 1) }, (_, index) => page + index);
    const batches = await Promise.all(pages.map(async item => parseALCatalogue(await client.catalogue(item))));
    for (const batch of batches) cars.push(...batch.cars);
    await new Promise(resolve => setTimeout(resolve, 250));
  }
  const unique = [...new Map(cars.map(car => [car.id, summarizeDamagedCar(car)])).values()];
  if (!unique.length && first.pageCount > 1) throw new Error('Incomplete accident-car catalogue');
  return { cars: unique, fetchedAt: new Date().toISOString(), fallback: false };
}, ['alkorea-catalogue-v1'], { revalidate: 900 });

export async function getDamagedCatalogue(live = false): Promise<DamagedCatalogue> {
  if (live && process.env.ALKOREA_USERNAME && process.env.ALKOREA_PASSWORD) {
    try { return await readLiveCatalogue(); }
    catch { /* Preserve saved listings; never pass source/private errors to visitors. */ }
  }
  const saved = await getDamagedSnapshot();
  return { cars: saved.cars.map(summarizeDamagedCar), fetchedAt: saved.fetchedAt, fallback: true };
}

const readLiveCar = unstable_cache(async (id: string): Promise<DamagedCar | null> => {
  const catalogue = await readLiveCatalogue();
  const summary = catalogue.cars.find(car => car.id === id);
  if (!summary) return null;
  const client = await sourceClient();
  return parseALDetail(await client.detail(id), summary);
}, ['alkorea-detail-v1'], { revalidate: 900 });

export const getDamagedCar = cache(async (id: string, live = false): Promise<DamagedCar | null> => {
  if (!/^\d{1,12}$/.test(id)) return null;
  const snapshot = await getDamagedSnapshot();
  const saved = snapshot.cars.find(car => car.id === id) || null;
  if ((live || !saved) && process.env.ALKOREA_USERNAME && process.env.ALKOREA_PASSWORD) {
    try { return await readLiveCar(id); }
    catch { return saved; }
  }
  return saved;
});
