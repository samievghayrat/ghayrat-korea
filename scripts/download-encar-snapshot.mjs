import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';

const searchQuery = '(And.Hidden.N._.SellType.일반.)';
const BATCH_SIZE = 500;
const CONCURRENCY = 4;
const MAX_RESULT_WINDOW = 9_500;
const MAX_SIZE = 250_000;
const requestedValue = (process.env.ENCAR_SNAPSHOT_SIZE || 'all').trim().toLowerCase();
const requestedSize = requestedValue === 'all' ? null : Number.parseInt(requestedValue, 10);

function buildPriceQuery(priceFrom, priceTo) {
  return `(And.Hidden.N._.SellType.일반._.Price.range(${priceFrom}..${priceTo}).)`;
}

async function fetchBatch(query, offset, batchSize) {
  const url = new URL('https://api.encar.com/search/car/list/general');
  url.searchParams.set('count', 'true');
  url.searchParams.set('q', query);
  url.searchParams.set('sr', `|ModifiedDate|${offset}|${batchSize}`);

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36',
        },
        signal: AbortSignal.timeout(45_000),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      return response.json();
    } catch (error) {
      if (attempt === 3) {
        throw new Error(`Encar snapshot batch ${offset}-${offset + batchSize} failed: ${error.message}`);
      }
      await new Promise(resolve => setTimeout(resolve, attempt * 1000));
    }
  }
}

const firstBatch = await fetchBatch(searchQuery, 0, 1);
const sourceTotal = Number(firstBatch.Count || 0);
if (!sourceTotal || !(firstBatch.SearchResults || []).length) {
  throw new Error('Encar returned an empty first snapshot batch');
}

const size = requestedSize === null
  ? Math.min(sourceTotal, MAX_SIZE)
  : Math.min(Math.max(requestedSize, 1), sourceTotal || MAX_SIZE, MAX_SIZE);

const partitions = [];
async function partitionPriceRange(priceFrom, priceTo) {
  const query = buildPriceQuery(priceFrom, priceTo);
  const data = await fetchBatch(query, 0, 0);
  const count = Number(data.Count || 0);
  if (!count) return;

  if (count <= MAX_RESULT_WINDOW) {
    partitions.push({ query, count, priceFrom, priceTo });
    return;
  }

  if (priceFrom >= priceTo) {
    throw new Error(`Price ${priceFrom} contains ${count} cars and cannot be partitioned further`);
  }

  const midpoint = Math.floor((priceFrom + priceTo) / 2);
  await partitionPriceRange(priceFrom, midpoint);
  await partitionPriceRange(midpoint + 1, priceTo);
}

await partitionPriceRange(0, 999_999);
const partitionTotal = partitions.reduce((sum, partition) => sum + partition.count, 0);
if (partitionTotal < sourceTotal * 0.98) {
  throw new Error(`Price partitions cover only ${partitionTotal} of ${sourceTotal} Encar cars`);
}

const tasks = [];
let remaining = size;
for (const partition of partitions) {
  const partitionSize = Math.min(partition.count, remaining);
  for (let offset = 0; offset < partitionSize; offset += BATCH_SIZE) {
    tasks.push({
      query: partition.query,
      offset,
      batchSize: Math.min(BATCH_SIZE, partitionSize - offset),
    });
  }
  remaining -= partitionSize;
  if (remaining <= 0) break;
}

const searchResults = [];
for (let index = 0; index < tasks.length; index += CONCURRENCY) {
  const group = tasks.slice(index, index + CONCURRENCY);
  const batches = await Promise.all(group.map(task =>
    fetchBatch(task.query, task.offset, task.batchSize)
  ));
  for (const data of batches) {
    searchResults.push(...(data.SearchResults || []));
  }
  const downloaded = Math.min(size, searchResults.length);
  console.log(`Downloaded ${downloaded.toLocaleString('en-US')} / ${size.toLocaleString('en-US')} cars`);
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

const uniqueResults = Array.from(new Map(searchResults.map(item => [String(item.Id), item])).values())
  .sort((a, b) => Number(b.Id || 0) - Number(a.Id || 0));
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
