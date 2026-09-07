import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';

const DEFAULT_SIZE = 1000;
const MAX_SIZE = 2000;
const requestedSize = Number.parseInt(process.env.ENCAR_SNAPSHOT_SIZE || '', 10);
const size = Number.isFinite(requestedSize)
  ? Math.min(Math.max(requestedSize, 1), MAX_SIZE)
  : DEFAULT_SIZE;

const searchQuery = '(And.Hidden.N._.SellType.일반.)';
const BATCH_SIZE = 200;
const searchResults = [];
let sourceTotal = 0;

for (let offset = 0; offset < size; offset += BATCH_SIZE) {
  const batchSize = Math.min(BATCH_SIZE, size - offset);
  const url = new URL('https://api.encar.com/search/car/list/general');
  url.searchParams.set('count', 'true');
  url.searchParams.set('q', searchQuery);
  url.searchParams.set('sr', `|ModifiedDate|${offset}|${batchSize}`);

  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36',
    },
    signal: AbortSignal.timeout(45_000),
  });

  if (!response.ok) {
    throw new Error(`Encar snapshot download failed with HTTP ${response.status}`);
  }

  const data = await response.json();
  sourceTotal = Number(data.Count || sourceTotal);
  const batch = data.SearchResults || [];
  if (batch.length === 0) {
    if (offset === 0) throw new Error('Encar returned an empty first snapshot batch');
    break;
  }
  searchResults.push(...batch);
}
const fields = [
  'Id',
  'Photo',
  'Manufacturer',
  'Model',
  'Badge',
  'BadgeDetail',
  'FuelType',
  'Year',
  'Mileage',
  'Price',
  'SellType',
  'Displacement',
  'MaxPower',
  'HorsePower',
  'Color',
  'BodyType',
  'Transmission',
];

const uniqueResults = Array.from(new Map(searchResults.map(item => [String(item.Id), item])).values());
const cars = uniqueResults.map((item) => {
  const car = {};
  for (const field of fields) {
    if (item[field] !== undefined && item[field] !== null) car[field] = item[field];
  }
  return car;
});

const snapshot = {
  generatedAt: new Date().toISOString(),
  sourceTotal: sourceTotal || cars.length,
  cars,
};

const outputPath = resolve('src/data/encar-snapshot.json');
await mkdir(dirname(outputPath), { recursive: true });
await writeFile(outputPath, `${JSON.stringify(snapshot)}\n`, 'utf8');

console.log(`Saved ${cars.length} Encar cars to ${outputPath}`);
console.log(`Encar reported ${snapshot.sourceTotal} active normal-sale listings.`);
