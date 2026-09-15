import { NextResponse } from 'next/server';
import { getSnapshotBrandCounts } from '@/lib/encar-snapshot';
import { ENCAR_API_BASE } from '@/lib/encar-endpoints';
import { ENCAR_BRANDS as ALL_BRANDS } from '@/lib/encar-brands';

export const maxDuration = 60;

const NORMAL_SELL_TYPE = '\uC77C\uBC18'; // 일반: normal sale, excludes lease/rent listings


let cache: { data: { brands: { name: string; nameKo: string; count: number }[]; total: number }; timestamp: number } | null = null;
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

async function fetchBrandCount(nameKo: string): Promise<number> {
  try {
    const q = `(And.Hidden.N._.SellType.${NORMAL_SELL_TYPE}._.Manufacturer.${nameKo}.)`;
    const params = new URLSearchParams({
      count: 'true',
      q,
      sr: '|ModifiedDate|0|0',
    });

    const res = await fetch(`${ENCAR_API_BASE}?${params.toString()}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
      cache: 'no-store',
      signal: AbortSignal.timeout(5000),
    });

    if (!res.ok) return 0;
    const data = await res.json();
    return data.Count || 0;
  } catch {
    return 0;
  }
}

export async function GET() {
  if (cache && Date.now() - cache.timestamp < CACHE_TTL) {
    return NextResponse.json(cache.data);
  }

  // The production host is blocked by Encar, so the downloaded full catalog is
  // the authoritative fast source for navigation counts.
  const savedCounts = getSnapshotBrandCounts(ALL_BRANDS);
  cache = { data: savedCounts, timestamp: Date.now() };
  return NextResponse.json(savedCounts);

  // A known-popular brand doubles as a quick upstream health check. If it
  // fails, avoid dozens of slow requests and use the downloaded catalog.
  const firstBrand = ALL_BRANDS[0];
  const firstCount = await fetchBrandCount(firstBrand.nameKo);
  if (firstCount === 0) {
    return NextResponse.json(getSnapshotBrandCounts(ALL_BRANDS));
  }

  // Batch in groups of 4 with delays to avoid Encar rate limiting
  const counts: { name: string; nameKo: string; count: number }[] = [
    { ...firstBrand, count: firstCount },
  ];
  const batchSize = 4;
  for (let i = 1; i < ALL_BRANDS.length; i += batchSize) {
    if (i > 1) await new Promise(r => setTimeout(r, 800)); // delay between batches
    const batch = ALL_BRANDS.slice(i, i + batchSize);
    const batchResults = await Promise.all(
      batch.map(async (brand) => {
        const count = await fetchBrandCount(brand.nameKo);
        return { name: brand.name, nameKo: brand.nameKo, count };
      })
    );
    counts.push(...batchResults);
  }

  // Filter out brands with 0 count and sort by count descending
  const activeBrands = counts.filter(b => b.count > 0).sort((a, b) => b.count - a.count);
  const total = activeBrands.reduce((sum, b) => sum + b.count, 0);
  const result = { brands: activeBrands, total };

  cache = { data: result, timestamp: Date.now() };

  return NextResponse.json(result);
}
