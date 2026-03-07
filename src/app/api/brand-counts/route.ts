import { NextResponse } from 'next/server';

export const maxDuration = 60;

const ENCAR_API_BASE = 'https://api.encar.com/search/car/list/general';

const ALL_BRANDS = [
  // Domestic
  { name: 'Hyundai', nameKo: '현대' },
  { name: 'Kia', nameKo: '기아' },
  { name: 'Genesis', nameKo: '제네시스' },
  { name: 'Chevrolet', nameKo: '쉐보레(GM대우)' },
  { name: 'Renault Korea', nameKo: '르노코리아(삼성)' },
  { name: 'KG Mobility', nameKo: 'KG모빌리티(쌍용)' },
  // Japanese
  { name: 'Toyota', nameKo: '도요타' },
  { name: 'Lexus', nameKo: '렉서스' },
  { name: 'Honda', nameKo: '혼다' },
  { name: 'Nissan', nameKo: '닛산' },
  { name: 'Infiniti', nameKo: '인피니티' },
  { name: 'Mazda', nameKo: '마쯔다' },
  { name: 'Subaru', nameKo: '스바루' },
  { name: 'Suzuki', nameKo: '스즈키' },
  { name: 'Daihatsu', nameKo: '다이하쯔' },
  { name: 'Mitsubishi', nameKo: '미쯔비시' },
  { name: 'Acura', nameKo: '어큐라' },
  { name: 'Scion', nameKo: '사이언' },
  { name: 'Mitsuoka', nameKo: '미쯔오까' },
  // German
  { name: 'BMW', nameKo: 'BMW' },
  { name: 'Mercedes-Benz', nameKo: '벤츠' },
  { name: 'Audi', nameKo: '아우디' },
  { name: 'Volkswagen', nameKo: '폭스바겐' },
  { name: 'Porsche', nameKo: '포르쉐' },
  { name: 'Mini', nameKo: '미니' },
  { name: 'Smart', nameKo: '스마트' },
  { name: 'Opel', nameKo: '오펠' },
  { name: 'Maybach', nameKo: '마이바흐' },
  // European
  { name: 'Volvo', nameKo: '볼보' },
  { name: 'Polestar', nameKo: '폴스타' },
  { name: 'Land Rover', nameKo: '랜드로버' },
  { name: 'Jaguar', nameKo: '재규어' },
  { name: 'Peugeot', nameKo: '푸조' },
  { name: 'Citroën/DS', nameKo: '시트로엥/DS' },
  { name: 'Renault', nameKo: '르노' },
  { name: 'Fiat', nameKo: '피아트' },
  { name: 'Alfa Romeo', nameKo: '알파 로메오' },
  { name: 'Saab', nameKo: '사브' },
  { name: 'MG Rover', nameKo: 'MG로버' },
  { name: 'INEOS', nameKo: '이네오스' },
  // American
  { name: 'Tesla', nameKo: '테슬라' },
  { name: 'Ford', nameKo: '포드' },
  { name: 'Jeep', nameKo: '지프' },
  { name: 'Lincoln', nameKo: '링컨' },
  { name: 'Cadillac', nameKo: '캐딜락' },
  { name: 'GMC', nameKo: 'GMC' },
  { name: 'Dodge', nameKo: '닷지' },
  { name: 'Chrysler', nameKo: '크라이슬러' },
  { name: 'Hummer', nameKo: '험머' },
  { name: 'Mercury', nameKo: '머큐리' },
  { name: 'Buick', nameKo: '뷰익' },
  { name: 'Saturn', nameKo: '새턴' },
  { name: 'Pontiac', nameKo: '폰티악' },
  // Chinese
  { name: 'BYD', nameKo: 'BYD' },
  { name: 'Geely', nameKo: '지리' },
  { name: 'Dongfeng Sokon', nameKo: '동풍소콘' },
  { name: 'BAIC', nameKo: '북기은상' },
  { name: 'Sinyuan', nameKo: '신위안' },
  { name: 'Foton', nameKo: '포톤' },
  // Luxury / Exotic
  { name: 'Bentley', nameKo: '벤틀리' },
  { name: 'Rolls-Royce', nameKo: '롤스로이스' },
  { name: 'Maserati', nameKo: '마세라티' },
  { name: 'Ferrari', nameKo: '페라리' },
  { name: 'Lamborghini', nameKo: '람보르기니' },
  { name: 'Aston Martin', nameKo: '애스턴마틴' },
  { name: 'McLaren', nameKo: '맥라렌' },
  { name: 'Lotus', nameKo: '로터스' },
  { name: 'Bugatti', nameKo: '부가티' },
  { name: 'Koenigsegg', nameKo: '코닉세그' },
  { name: 'Pagani', nameKo: '파가니' },
  { name: 'Isuzu', nameKo: '이스즈' },
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

  // Batch in groups of 8 to avoid Vercel timeout
  const counts: { name: string; nameKo: string; count: number }[] = [];
  const batchSize = 8;
  for (let i = 0; i < ALL_BRANDS.length; i += batchSize) {
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
