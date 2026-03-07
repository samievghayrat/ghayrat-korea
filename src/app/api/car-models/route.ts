import { NextRequest, NextResponse } from 'next/server';
import { reverseTranslateBrand, reverseTranslateModel } from '@/lib/translations';

const ENCAR_API_BASE = 'http://api.encar.com/search/car/list/general';

// In-memory cache
const variantsCache: Map<string, { data: unknown; timestamp: number }> = new Map();
const CACHE_TTL = 30 * 60 * 1000;

export async function GET(request: NextRequest) {
  const brand = request.nextUrl.searchParams.get('brand');
  if (!brand) {
    return NextResponse.json({ error: 'brand parameter required' }, { status: 400 });
  }

  const koreanBrand = reverseTranslateBrand(brand);
  if (!koreanBrand) {
    return NextResponse.json({ models: [] });
  }

  const model = request.nextUrl.searchParams.get('model');
  const koreanModel = model ? reverseTranslateModel(model) : undefined;

  const cacheKey = koreanModel ? `${koreanBrand}:${koreanModel}` : koreanBrand;
  const cached = variantsCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return NextResponse.json(cached.data);
  }

  try {
    const searchQuery = koreanModel
      ? `(And.Hidden.N._.Manufacturer.${koreanBrand}._.ModelGroup.${koreanModel}.)`
      : `(And.Hidden.N._.Manufacturer.${koreanBrand}.)`;

    const params = new URLSearchParams({
      count: 'true',
      q: searchQuery,
      sr: '|ModifiedDate|0|1000',
    });

    const fullUrl = `${ENCAR_API_BASE}?${params.toString()}`;

    const res = await fetch(fullUrl, {
      cache: 'no-store',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
    });

    if (!res.ok) {
      return NextResponse.json({ models: [] });
    }

    const data = await res.json();
    const searchResults = data.SearchResults || [];
    const totalCount = data.Count || searchResults.length;

    const modelData = new Map<string, { count: number; minYear: number; maxYear: number }>();
    for (const item of searchResults) {
      const m = item.Model as string;
      if (m) {
        const year = parseInt(String(item.Year).substring(0, 4));
        const existing = modelData.get(m);
        if (existing) {
          existing.count++;
          if (year && year < existing.minYear) existing.minYear = year;
          if (year && year > existing.maxYear) existing.maxYear = year;
        } else {
          modelData.set(m, { count: 1, minYear: year || 9999, maxYear: year || 0 });
        }
      }
    }

    // Scale counts proportionally if we only sampled 1000 out of more
    const sampleSize = searchResults.length;
    const scale = sampleSize > 0 && totalCount > sampleSize ? totalCount / sampleSize : 1;

    const models = Array.from(modelData.entries())
      .map(([name, d]) => ({
        name,
        count: Math.round(d.count * scale),
        yearFrom: d.minYear,
        yearTo: d.maxYear,
      }))
      .sort((a, b) => b.count - a.count);

    const result = { models, total: totalCount };
    variantsCache.set(cacheKey, { data: result, timestamp: Date.now() });
    return NextResponse.json(result);
  } catch (error) {
    console.error('Car models fetch error:', error);
    return NextResponse.json({ models: [] });
  }
}
