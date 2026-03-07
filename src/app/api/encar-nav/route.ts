import { NextRequest, NextResponse } from 'next/server';

const ENCAR_API_BASE = 'https://api.encar.com/search/car/list/general';
const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
};

// Cache for nav data (30 min TTL)
const navCache = new Map<string, { data: unknown; timestamp: number }>();
const CACHE_TTL = 30 * 60 * 1000;

function getCached(key: string) {
  const cached = navCache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) return cached.data;
  return null;
}

function setCache(key: string, data: unknown) {
  navCache.set(key, { data, timestamp: Date.now() });
}

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

// Escape special characters in Encar query values
function escapeEncarValue(value: string): string {
  return value.replace(/[.)]/g, '_$&');
}

interface SearchResult {
  Model: string;
  Year: number;
  Manufacturer: string;
}

/**
 * GET /api/encar-nav
 *
 * ?level=models&manufacturer=기아
 *   → returns model groups with counts and generation variants
 *
 * ?level=generations&manufacturer=기아&modelGroup=K3
 *   → returns generation variants for a specific model group with counts
 */
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const level = params.get('level');
  const manufacturer = params.get('manufacturer');

  if (level === 'models' && manufacturer) {
    return getModelGroups(manufacturer);
  }

  if (level === 'generations' && manufacturer) {
    const modelGroup = params.get('modelGroup');
    if (!modelGroup) {
      return NextResponse.json({ error: 'modelGroup parameter required' }, { status: 400 });
    }
    return getGenerations(manufacturer, modelGroup);
  }

  return NextResponse.json({ error: 'Invalid parameters. Use level=models or level=generations' }, { status: 400 });
}

async function getModelGroups(manufacturer: string) {
  const cacheKey = `models:${manufacturer}`;
  const cached = getCached(cacheKey);
  if (cached) return NextResponse.json(cached);

  try {
    // Fetch 500 recent cars for this manufacturer
    const q = `(And.Hidden.N._.Manufacturer.${escapeEncarValue(manufacturer)}.)`;
    const sr = '|ModifiedDate|0|500';
    const url = `${ENCAR_API_BASE}?count=true&q=${encodeURIComponent(q)}&sr=${encodeURIComponent(sr)}`;

    const response = await fetch(url, { headers: HEADERS });
    if (!response.ok) throw new Error(`API error: ${response.status}`);

    const data = await response.json();
    const results: SearchResult[] = data.SearchResults || [];

    // Group by base model name
    const groups = new Map<string, { count: number; variants: Map<string, { count: number; minYear: number; maxYear: number }> }>();

    for (const item of results) {
      const model = item.Model;
      if (!model) continue;
      const base = getBaseModelName(model);
      const year = parseInt(String(item.Year).substring(0, 4));

      if (!groups.has(base)) {
        groups.set(base, { count: 0, variants: new Map() });
      }
      const group = groups.get(base)!;
      group.count++;

      if (!group.variants.has(model)) {
        group.variants.set(model, { count: 0, minYear: year || 9999, maxYear: year || 0 });
      }
      const variant = group.variants.get(model)!;
      variant.count++;
      if (year && year < variant.minYear) variant.minYear = year;
      if (year && year > variant.maxYear) variant.maxYear = year;
    }

    const modelGroups = Array.from(groups.entries())
      .map(([name, data]) => ({
        name,
        count: data.count,
        variants: Array.from(data.variants.entries())
          .map(([vName, vData]) => ({
            name: vName,
            count: vData.count,
            yearFrom: vData.minYear,
            yearTo: vData.maxYear,
          }))
          .sort((a, b) => b.count - a.count),
      }))
      .sort((a, b) => b.count - a.count);

    const result = { modelGroups, total: data.Count || 0 };
    setCache(cacheKey, result);
    return NextResponse.json(result);
  } catch (error) {
    console.error('encar-nav models error:', error);
    return NextResponse.json({ modelGroups: [], total: 0 });
  }
}

async function getGenerations(manufacturer: string, modelGroup: string) {
  const cacheKey = `generations:${manufacturer}:${modelGroup}`;
  const cached = getCached(cacheKey);
  if (cached) return NextResponse.json(cached);

  try {
    // Fetch cars for this specific model group
    const q = `(And.Hidden.N._.Manufacturer.${escapeEncarValue(manufacturer)}._.ModelGroup.${escapeEncarValue(modelGroup)}.)`;
    const sr = '|ModifiedDate|0|500';
    const url = `${ENCAR_API_BASE}?count=true&q=${encodeURIComponent(q)}&sr=${encodeURIComponent(sr)}`;

    const response = await fetch(url, { headers: HEADERS });
    if (!response.ok) throw new Error(`API error: ${response.status}`);

    const data = await response.json();
    const results: SearchResult[] = data.SearchResults || [];

    // Count by Model (generation) and track year ranges
    const variants = new Map<string, { count: number; minYear: number; maxYear: number }>();
    for (const item of results) {
      const model = item.Model;
      if (!model) continue;
      const year = parseInt(String(item.Year).substring(0, 4));

      if (!variants.has(model)) {
        variants.set(model, { count: 0, minYear: year || 9999, maxYear: year || 0 });
      }
      const v = variants.get(model)!;
      v.count++;
      if (year && year < v.minYear) v.minYear = year;
      if (year && year > v.maxYear) v.maxYear = year;
    }

    const generations = Array.from(variants.entries())
      .map(([name, vData]) => ({
        name,
        count: vData.count,
        yearFrom: vData.minYear,
        yearTo: vData.maxYear,
      }))
      .sort((a, b) => b.count - a.count);

    const result = { generations, total: data.Count || 0 };
    setCache(cacheKey, result);
    return NextResponse.json(result);
  } catch (error) {
    console.error('encar-nav generations error:', error);
    return NextResponse.json({ generations: [], total: 0 });
  }
}
