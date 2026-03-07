import { NextResponse } from 'next/server';

const ENCAR_API_BASE = 'https://api.encar.com/search/car/list/general';

const ALL_BRANDS = [
  // Domestic
  { name: 'Hyundai', nameKo: '현대' },
  { name: 'Genesis', nameKo: '제네시스' },
  { name: 'Kia', nameKo: '기아' },
  { name: 'Chevrolet', nameKo: '쉐보레(GM대우)' },
  { name: 'Renault Korea', nameKo: '르노코리아(삼성)' },
  { name: 'KG Mobility', nameKo: 'KG모빌리티(쌍용)' },
  // Foreign
  { name: 'BMW', nameKo: 'BMW' },
  { name: 'Mercedes-Benz', nameKo: '벤츠' },
  { name: 'Audi', nameKo: '아우디' },
  { name: 'Volkswagen', nameKo: '폭스바겐' },
  { name: 'Porsche', nameKo: '포르쉐' },
  { name: 'Volvo', nameKo: '볼보' },
  { name: 'Tesla', nameKo: '테슬라' },
  { name: 'Lexus', nameKo: '렉서스' },
  { name: 'Land Rover', nameKo: '랜드로버' },
  { name: 'Jeep', nameKo: '지프' },
  { name: 'Ford', nameKo: '포드' },
  { name: 'Mini', nameKo: '미니' },
  { name: 'Cadillac', nameKo: '캐딜락' },
  { name: 'Peugeot', nameKo: '푸조' },
  { name: 'Jaguar', nameKo: '재규어' },
  { name: 'Maserati', nameKo: '마세라티' },
  { name: 'Bentley', nameKo: '벤틀리' },
  { name: 'Ferrari', nameKo: '페라리' },
  { name: 'Lamborghini', nameKo: '람보르기니' },
  { name: 'Rolls-Royce', nameKo: '롤스로이스' },
] as const;

let cache: { data: { brands: { name: string; nameKo: string; count: number }[]; total: number }; timestamp: number } | null = null;
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

async function fetchBrandCount(nameKo: string): Promise<number> {
  try {
    const q = `(And.Hidden.N._.Manufacturer.${nameKo}.)`;
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

  const counts = await Promise.all(
    ALL_BRANDS.map(async (brand) => {
      const count = await fetchBrandCount(brand.nameKo);
      return { name: brand.name, nameKo: brand.nameKo, count };
    })
  );

  // Filter out brands with 0 count and sort by count descending
  const activeBrands = counts.filter(b => b.count > 0).sort((a, b) => b.count - a.count);
  const total = activeBrands.reduce((sum, b) => sum + b.count, 0);
  const result = { brands: activeBrands, total };

  cache = { data: result, timestamp: Date.now() };

  return NextResponse.json(result);
}
