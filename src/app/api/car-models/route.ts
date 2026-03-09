import { NextRequest, NextResponse } from 'next/server';
import { reverseTranslateBrand, reverseTranslateModel, translateModel } from '@/lib/translations';

const ENCAR_API_BASE = 'https://api.encar.com/search/car/list/general';

// In-memory cache
const variantsCache: Map<string, { data: unknown; timestamp: number }> = new Map();
const CACHE_TTL = 30 * 60 * 1000;

// Strip generation/variant suffixes to get the base model group name
function getBaseModelName(koreanModelName: string): string {
  let name = koreanModelName;
  for (const prefix of ['디 올 뉴 ', '더 뉴 ', '올 뉴 ', '뉴 ']) {
    if (name.startsWith(prefix)) { name = name.slice(prefix.length); break; }
  }
  name = name.replace(/\s*\d+세대$/, '');
  name = name.replace(/\s*\([A-Z0-9]+\)$/, '');
  name = name.replace(/\s*(하이브리드|쿠페|유로|플러스)$/, '');
  return name.trim();
}

export async function GET(request: NextRequest) {
  const brand = request.nextUrl.searchParams.get('brand');
  if (!brand) {
    return NextResponse.json({ error: 'brand parameter required' }, { status: 400 });
  }

  // Use Korean name if available, otherwise use the original (for foreign brands)
  const koreanBrand = reverseTranslateBrand(brand) || brand;

  const model = request.nextUrl.searchParams.get('model');
  const variant = request.nextUrl.searchParams.get('variant'); // specific generation/variant name (Korean)
  // Use Korean name if available, otherwise use original (for models like ES, RX, X5, etc.)
  const koreanModel = model ? (reverseTranslateModel(model) || model) : undefined;

  const cacheKey = variant
    ? `${koreanBrand}:${koreanModel}:${variant}:badges`
    : koreanModel ? `${koreanBrand}:${koreanModel}` : `${koreanBrand}:_models`;
  const cached = variantsCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return NextResponse.json(cached.data);
  }

  try {
    // If variant is specified, return badge/trim data for that specific generation
    if (variant && koreanModel) {
      const q = `(And.Hidden.N._.Manufacturer.${koreanBrand}._.Model.${variant}.)`;
      const params = new URLSearchParams({ count: 'true', q, sr: '|ModifiedDate|0|500' });
      const res = await fetch(`${ENCAR_API_BASE}?${params.toString()}`, {
        cache: 'no-store',
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
      });
      if (!res.ok) return NextResponse.json({ badges: [] });
      const data = await res.json();
      const results = data.SearchResults || [];
      const total = data.Count || results.length;
      const scale = results.length > 0 && total > results.length ? total / results.length : 1;

      const badgeCounts = new Map<string, number>();
      for (const item of results) {
        const badge = (item.Badge as string) || '';
        if (badge) badgeCounts.set(badge, (badgeCounts.get(badge) || 0) + 1);
      }
      const badges = Array.from(badgeCounts.entries())
        .map(([name, count]) => ({ name, count: Math.round(count * scale) }))
        .sort((a, b) => b.count - a.count);

      const result = { badges, total };
      variantsCache.set(cacheKey, { data: result, timestamp: Date.now() });
      return NextResponse.json(result);
    }

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
    const sampleSize = searchResults.length;
    const scale = sampleSize > 0 && totalCount > sampleSize ? totalCount / sampleSize : 1;

    if (koreanModel) {
      // Return generation-level variants (existing behavior)
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
    }

    // No model specified — return model-group level counts sorted by popularity
    // Group Korean model names into base model groups, then translate to English
    const groupCounts = new Map<string, { count: number; nameKo: string }>();
    for (const item of searchResults) {
      const m = item.Model as string;
      if (!m) continue;
      const base = getBaseModelName(m);
      const translated = translateModel(base);
      const existing = groupCounts.get(translated);
      if (existing) {
        existing.count++;
      } else {
        groupCounts.set(translated, { count: 1, nameKo: base });
      }
    }

    const models = Array.from(groupCounts.entries())
      .map(([name, data]) => ({
        name,
        nameKo: data.nameKo,
        count: Math.round(data.count * scale),
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
