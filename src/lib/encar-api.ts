import { translateBrand, translateModel, translateFuel, translateColor, reverseTranslateBrand, reverseTranslateModel } from './translations';
import { convertKrwToRub, convertKrwToUsd } from './currency';
import type { CarListing, CarFilters, CatalogResponse, InspectionData, PanelDamage, DamageType } from '@/types';

const ENCAR_API_BASE = 'https://api.encar.com/search/car/list/general';
const ENCAR_IMAGE_CDN = 'https://ci.encar.com';
const ENCAR_OPTIONS_API = 'https://api.encar.com/v1/readside/vehicles/car/options/standard';

const transmissionMap: Record<string, string> = {
  '오토': 'Автомат',
  '수동': 'Механика',
  'CVT': 'Вариатор (CVT)',
  'DCT': 'Робот (DCT)',
  '자동': 'Автомат',
  '세미오토': 'Полуавтомат',
};

function translateTransmission(korean: string): string {
  if (!korean) return korean;
  return transmissionMap[korean] || korean;
}

// Fetch exact HP and displacement from NHTSA VIN Decoder API
interface VinData {
  hp?: number;
  displacement?: number;
}

async function fetchDataFromVin(vin: string): Promise<VinData> {
  if (!vin || vin.length < 11) return {};
  try {
    const res = await fetch(
      `https://vpic.nhtsa.dot.gov/api/vehicles/decodevin/${encodeURIComponent(vin)}?format=json`,
      { signal: AbortSignal.timeout(5000) }
    );
    if (!res.ok) return {};
    const data = await res.json();
    const results = data.Results as { VariableId: number; Variable: string; Value: string | null }[];
    if (!results) return {};

    const result: VinData = {};

    // HP: VariableId 71 = EngineKW, VariableId 228 = EngineBrakeHP
    const hpEntry = results.find(r => r.Variable === 'Engine Brake (hp) From' || r.VariableId === 228);
    if (hpEntry?.Value) {
      const hp = parseFloat(hpEntry.Value);
      if (hp > 0) result.hp = Math.round(hp);
    }
    if (!result.hp) {
      const kwEntry = results.find(r => r.Variable === 'Engine Power (kW)' || r.VariableId === 71);
      if (kwEntry?.Value) {
        const kw = parseFloat(kwEntry.Value);
        if (kw > 0) result.hp = Math.round(kw * 1.341);
      }
    }

    // Displacement: VariableId 13 = Displacement (cc), 11 = Displacement (L)
    const ccEntry = results.find(r => r.Variable === 'Displacement (CC)' || r.VariableId === 13);
    if (ccEntry?.Value) {
      const cc = parseFloat(ccEntry.Value);
      if (cc > 0) result.displacement = Math.round(cc);
    }
    if (!result.displacement) {
      const lEntry = results.find(r => r.Variable === 'Displacement (L)' || r.VariableId === 11);
      if (lEntry?.Value) {
        const l = parseFloat(lEntry.Value);
        if (l > 0) result.displacement = Math.round(l * 1000);
      }
    }

    return result;
  } catch {
    return {};
  }
}

// Parse displacement from badge string like "가솔린 1.6 터보 2WD" → 1600
function parseDisplacementFromBadge(badge: string): number {
  if (!badge) return 0;
  const match = badge.match(/(\d+\.\d+)/);
  if (match) {
    const liters = parseFloat(match[1]);
    if (liters > 0 && liters < 10) return Math.round(liters * 1000);
  }
  return 0;
}

// Fetch HP from pan-auto.ru API (they maintain HP lookup tables for Encar cars)
async function fetchHpFromPanAuto(carId: string): Promise<number | undefined> {
  try {
    const res = await fetch(`http://zefir.pan-auto.ru/api/cars/${carId}/`, {
      signal: AbortSignal.timeout(3000),
    });
    if (!res.ok) return undefined;
    const data = await res.json();
    return data.hp || undefined;
  } catch {
    return undefined;
  }
}

const bodyTypeMap: Record<string, string> = {
  'SUV': 'Кроссовер/Внедорожник',
  '세단': 'Седан',
  '해치백': 'Хэтчбек',
  '왜건': 'Универсал',
  '쿠페': 'Купе',
  '컨버터블': 'Кабриолет',
  'RV': 'Минивэн',
  '미니밴': 'Минивэн',
  '픽업': 'Пикап',
  '밴': 'Фургон',
  '스포츠카': 'Спорткар',
};

function translateBodyType(korean: string): string {
  if (!korean) return korean;
  return bodyTypeMap[korean] || korean;
}

// Korean option name → Russian translation
const optionTranslations: Record<string, string> = {
  '선루프': 'Люк (санруф)',
  '헤드램프(HID)': 'Фары HID (ксенон)',
  '헤드램프(LED)': 'Фары LED',
  '브레이크 잠김 방지(ABS)': 'ABS (антиблокировка)',
  '앞좌석 AV 모니터': 'Монитор передний',
  '내비게이션': 'Навигация',
  '전동시트': 'Электропривод сидений',
  '전동시트(운전석)': 'Электропривод сиденья водителя',
  '전동시트(동승석)': 'Электропривод сиденья пассажира',
  '전동시트(뒷좌석)': 'Электропривод задних сидений',
  '열선시트': 'Подогрев сидений',
  '열선시트(앞좌석)': 'Подогрев передних сидений',
  '열선시트(뒷좌석)': 'Подогрев задних сидений',
  '메모리 시트': 'Память сидений',
  '메모리 시트(운전석)': 'Память сиденья водителя',
  '메모리 시트(동승석)': 'Память сиденья пассажира',
  '통풍시트': 'Вентиляция сидений',
  '통풍시트(운전석)': 'Вентиляция сиденья водителя',
  '통풍시트(동승석)': 'Вентиляция сиденья пассажира',
  '통풍시트(뒷좌석)': 'Вентиляция задних сидений',
  '가죽시트': 'Кожаный салон',
  '무선도어 잠금장치': 'Бесключевой доступ',
  '알루미늄 휠': 'Литые диски',
  '미끄럼 방지(TCS)': 'Антипробуксовка (TCS)',
  '에어백(운전석)': 'Подушка безопасности водителя',
  '에어백(동승석)': 'Подушка безопасности пассажира',
  '에어백(사이드)': 'Боковые подушки безопасности',
  '에어백(커튼)': 'Шторки безопасности',
  '자동 에어컨': 'Климат-контроль',
  '전동접이 사이드 미러': 'Складные зеркала',
  'ECM 룸미러': 'Электрохромное зеркало',
  '스티어링 휠 리모컨': 'Кнопки на руле',
  '주차감지센서(후방)': 'Парктроник задний',
  '주차감지센서(전방)': 'Парктроник передний',
  '타이어 공기압센서(TPMS)': 'Датчик давления шин (TPMS)',
  '차체자세 제어장치(ESC)': 'Стабилизация (ESC)',
  '스마트키': 'Бесключевой запуск',
  '후방 카메라': 'Камера заднего вида',
  '크루즈 컨트롤(일반)': 'Круиз-контроль',
  '크루즈 컨트롤(어댑티브)': 'Адаптивный круиз-контроль',
  'USB 단자': 'USB-разъём',
  'AUX 단자': 'AUX-разъём',
  '하이패스': 'Hi-Pass (транспондер)',
  '레인센서': 'Датчик дождя',
  '열선 스티어링 휠': 'Подогрев руля',
  '전동 조절 스티어링 휠': 'Электрорегулировка руля',
  '패들 시프트': 'Подрулевые лепестки',
  '차선이탈 경보 시스템(LDWS)': 'Контроль полосы (LDWS)',
  '커튼/블라인드(뒷좌석)': 'Шторки задних стёкол',
  '커튼/블라인드(후방)': 'Шторка заднего стекла',
  '전자식 주차브레이크(EPB)': 'Электронный стояночный тормоз',
  '블루투스': 'Bluetooth',
  '오토 라이트': 'Автоматический свет',
  '전자제어 서스펜션(ECS)': 'Электронная подвеска (ECS)',
  'CD 플레이어': 'CD-проигрыватель',
  '뒷좌석 AV 모니터': 'Монитор для задних пассажиров',
  '파워 전동 트렁크': 'Электропривод багажника',
  '루프랙': 'Рейлинги на крыше',
  '후측방 경보 시스템': 'Контроль слепых зон',
  '360도 어라운드 뷰': 'Камера 360°',
  '고스트 도어 클로징': 'Доводчики дверей',
  '헤드업 디스플레이(HUD)': 'Проекция на лобовое (HUD)',
  '마사지 시트': 'Массаж сидений',
};

// Cache for option catalog (code → Korean name)
let optionCatalogCache: { data: Record<string, string>; timestamp: number } | null = null;
const OPTION_CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

async function getOptionCatalog(): Promise<Record<string, string>> {
  if (optionCatalogCache && Date.now() - optionCatalogCache.timestamp < OPTION_CACHE_TTL) {
    return optionCatalogCache.data;
  }

  try {
    const res = await fetch(ENCAR_OPTIONS_API, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      cache: 'no-store',
    });
    if (!res.ok) return {};

    const json = await res.json();
    const codeMap: Record<string, string> = {};

    for (const opt of json.options || []) {
      codeMap[opt.optionCd] = opt.optionName;
      if (opt.subOptions) {
        for (const sub of opt.subOptions) {
          codeMap[sub.optionCd] = sub.optionName;
        }
      }
    }

    optionCatalogCache = { data: codeMap, timestamp: Date.now() };
    return codeMap;
  } catch {
    return {};
  }
}

function translateOption(koreanName: string): string {
  return optionTranslations[koreanName] || koreanName;
}

async function resolveOptionCodes(codes: string[]): Promise<string[]> {
  if (!codes.length) return [];
  const catalog = await getOptionCatalog();
  return codes
    .map(code => catalog[code])
    .filter(Boolean)
    .map(translateOption);
}

// Build Encar API search query from our filters
// Format: (And.Hidden.N._.CarType.Y._.Condition1._.Condition2.)
// Each condition is separated by `_.`
function buildSearchQuery(filters: CarFilters): string {
  const parts: string[] = [];

  // Required base: Hidden.N (active listings only)
  parts.push('Hidden.N');

  if (filters.brand) {
    const koreanBrand = reverseTranslateBrand(filters.brand);
    // Use Korean name if available, otherwise use the original (for foreign brands like Lexus, BMW, etc.)
    parts.push(`Manufacturer.${koreanBrand || filters.brand}`);
  }

  if (filters.modelVariant) {
    // modelVariant is already the Korean model name (e.g., "더 뉴 아반떼 (CN7)")
    parts.push(`Model.${filters.modelVariant}`);
  } else if (filters.model) {
    // Use ModelGroup for base model search — matches ALL generations/variants
    const koreanModel = reverseTranslateModel(filters.model);
    // Use Korean name if available, otherwise use the original (for models like ES, RX, X5, etc.)
    parts.push(`ModelGroup.${koreanModel || filters.model}`);
  }

  if (filters.fuel) {
    const fuelMap: Record<string, string> = {
      gasoline: '가솔린',
      diesel: '디젤',
      hybrid: '가솔린+전기',
      electric: '전기',
      lpg: 'LPG',
    };
    if (fuelMap[filters.fuel]) {
      parts.push(`FuelType.${fuelMap[filters.fuel]}`);
    }
  }

  if (filters.yearFrom || filters.yearTo) {
    const fromYear = filters.yearFrom || 2000;
    const toYear = filters.yearTo || new Date().getFullYear();
    const fromMonth = String(filters.monthFrom || 1).padStart(2, '0');
    const toMonth = String(filters.monthTo || 12).padStart(2, '0');
    parts.push(`Year.range(${fromYear}${fromMonth}..${toYear}${toMonth})`);
  }

  if (filters.color) {
    const colorToKorean: Record<string, string> = {
      white: '흰색', black: '검정색', gray: '회색', silver: '은색',
      blue: '파란색', red: '빨간색', brown: '갈색', green: '녹색', other: '기타',
    };
    const korColor = colorToKorean[filters.color];
    if (korColor) parts.push(`Color.${korColor}`);
  }

  if (filters.priceFrom || filters.priceTo) {
    const from = filters.priceFrom || 0;
    const to = filters.priceTo || 999999;
    parts.push(`Price.range(${from}..${to})`);
  }

  if (filters.mileageFrom || filters.mileageTo) {
    const from = filters.mileageFrom || 0;
    const to = filters.mileageTo || 999999;
    parts.push(`Mileage.range(${from}..${to})`);
  }

  // Join with _.  separator and wrap in (And. ... .)
  return '(And.' + parts.join('._.') + '.)';
}

function mapSortField(sort?: string): string {
  switch (sort) {
    case 'price_asc': return 'PriceAsc';
    case 'price_desc': return 'PriceDesc';
    case 'year_desc': return 'Year';
    case 'year_asc': return 'Year'; // Encar doesn't support YearAsc, fallback to Year (newest)
    case 'mileage_asc': return 'MileageAsc';
    case 'mileage_desc': return 'MileageAsc'; // No MileageDesc, fallback
    default: return 'ModifiedDate';
  }
}

// Check which car IDs have ALL the required option codes
// Uses the lightweight readside API: ~250ms for 50 cars in parallel
async function filterByOptions(
  carIds: string[],
  requiredOptions: string[]
): Promise<Set<string>> {
  if (!requiredOptions.length || !carIds.length) return new Set(carIds);

  const results = await Promise.all(
    carIds.map(async (id) => {
      try {
        const res = await fetch(
          `https://api.encar.com/v1/readside/vehicle/${id}?include=OPTIONS`,
          { headers: { 'User-Agent': 'Mozilla/5.0' }, cache: 'no-store' }
        );
        if (!res.ok) return null;
        const data = await res.json();
        const opts = data.options;
        if (!opts) return null;
        const allCodes = [
          ...(opts.standard || []),
          ...(opts.choice || []),
          ...(opts.etc || []),
          ...(opts.tuning || []),
        ];
        const hasAll = requiredOptions.every((code) => allCodes.includes(code));
        return hasAll ? id : null;
      } catch {
        return null;
      }
    })
  );

  return new Set(results.filter(Boolean) as string[]);
}

// Cache for catalog responses
const catalogCache = new Map<string, { data: CatalogResponse; timestamp: number }>();
const CACHE_TTL = 15 * 60 * 1000; // 15 minutes

// How many Encar results to fetch per batch when option filtering is active
const OPTION_FILTER_BATCH = 200;

async function transformSearchResults(
  searchResults: Record<string, unknown>[]
): Promise<CarListing[]> {
  return Promise.all(
    searchResults.map(async (item: Record<string, unknown>) => {
      const priceKrw = ((item.Price as number) || 0) * 10000;
      const [priceRub, priceUsd] = await Promise.all([
        convertKrwToRub(priceKrw),
        convertKrwToUsd(priceKrw),
      ]);

      const brand = translateBrand((item.Manufacturer as string) || '');
      const model = translateModel((item.Model as string) || '');
      const yearStr = String(item.Year || '');
      const year = parseInt(yearStr.substring(0, 4)) || 0;
      const month = parseInt(yearStr.substring(4, 6)) || undefined;

      const photo = item.Photo as string;
      const imageUrl = photo
        ? `/api/proxy-image?url=${encodeURIComponent(`${ENCAR_IMAGE_CDN}${photo}001.jpg`)}`
        : '/images/no-image.svg';

      const hp = (item.MaxPower as number) || (item.HorsePower as number) || 0;
      const displacement = (item.Displacement as number) || parseDisplacementFromBadge((item.Badge as string) || '');

      return {
        id: String(item.Id || ''),
        source: 'encar' as const,
        brand,
        model,
        year,
        month,
        mileage: (item.Mileage as number) || 0,
        fuel: translateFuel((item.FuelType as string) || ''),
        engine: displacement ? `${(displacement / 1000).toFixed(1)}L` : '',
        displacement,
        hp: hp || undefined,
        color: translateColor((item.Color as string) || ''),
        bodyType: translateBodyType((item.BodyType as string) || ''),
        transmission: translateTransmission((item.Transmission as string) || ''),
        price_krw: priceKrw,
        price_rub: priceRub,
        price_usd: priceUsd,
        imageUrl,
        images: [],
      } satisfies CarListing;
    })
  );
}

export async function searchCars(filters: CarFilters): Promise<CatalogResponse> {
  const page = filters.page || 1;
  const limit = filters.limit || 20;
  const hasOptionFilter = filters.options && filters.options.length > 0;
  const cacheKey = JSON.stringify(filters);

  // Check cache
  const cached = catalogCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  try {
    const searchQuery = buildSearchQuery(filters);
    const sortField = mapSortField(filters.sort);

    if (hasOptionFilter) {
      // Option filtering mode: over-fetch, check options, filter
      const batchSize = OPTION_FILTER_BATCH;
      const offset = (page - 1) * batchSize;

      const sr = `|${sortField}|${offset}|${batchSize}`;
      const queryString = new URLSearchParams({
        count: 'true',
        q: searchQuery,
        sr,
      }).toString();

      const response = await fetch(`${ENCAR_API_BASE}?${queryString}`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        },
        cache: 'no-store',
      });

      if (!response.ok) throw new Error(`Encar API error: ${response.status}`);

      const data = await response.json();
      const searchResults: Record<string, unknown>[] = data.SearchResults || [];
      const encarTotal = data.Count || 0;

      // Check options for all fetched cars
      const carIds = searchResults.map((item) => String(item.Id || ''));
      const matchingIds = await filterByOptions(carIds, filters.options!);

      // Filter search results to only matching cars
      const matchedResults = searchResults.filter((item) =>
        matchingIds.has(String(item.Id || ''))
      );

      // Estimate total matching cars based on hit rate
      const hitRate = carIds.length > 0 ? matchingIds.size / carIds.length : 0;
      const estimatedTotal = Math.round(encarTotal * hitRate);

      // Take only what fits on this page
      const pageResults = matchedResults.slice(0, limit);
      const cars = await transformSearchResults(pageResults);

      const result: CatalogResponse = {
        cars,
        total: estimatedTotal,
        page,
        totalPages: Math.ceil(estimatedTotal / limit),
      };

      catalogCache.set(cacheKey, { data: result, timestamp: Date.now() });
      return result;
    }

    // Normal mode (no option filtering)
    const offset = (page - 1) * limit;
    const sr = `|${sortField}|${offset}|${limit}`;

    const queryString = new URLSearchParams({
      count: 'true',
      q: searchQuery,
      sr,
    }).toString();

    const response = await fetch(`${ENCAR_API_BASE}?${queryString}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
      next: { revalidate: 900 },
    });

    if (!response.ok) {
      throw new Error(`Encar API error: ${response.status}`);
    }

    const data = await response.json();
    const searchResults = data.SearchResults || [];
    const total = data.Count || 0;

    const cars = await transformSearchResults(searchResults);

    const result: CatalogResponse = {
      cars,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };

    catalogCache.set(cacheKey, { data: result, timestamp: Date.now() });
    return result;
  } catch (error) {
    console.error('Encar API search error:', error);
    return { cars: [], total: 0, page: 1, totalPages: 0 };
  }
}

// Panel name → Russian translation
const panelNameRu: Record<string, string> = {
  hood: 'Капот',
  frontFenderLeft: 'Переднее крыло (лев.)',
  frontFenderRight: 'Переднее крыло (прав.)',
  frontDoorLeft: 'Передняя дверь (лев.)',
  frontDoorRight: 'Передняя дверь (прав.)',
  rearDoorLeft: 'Задняя дверь (лев.)',
  rearDoorRight: 'Задняя дверь (прав.)',
  trunkLead: 'Крышка багажника',
  frontPanel: 'Передняя панель',
  insidePanelLeft: 'Внутренняя панель (лев.)',
  insidePanelRight: 'Внутренняя панель (прав.)',
  frontWheelHouseLeft: 'Передняя колёсная арка (лев.)',
  frontWheelHouseRight: 'Передняя колёсная арка (прав.)',
  crossMember: 'Поперечина',
  dashPanel: 'Панель приборов',
  roofPanel: 'Крыша',
  floorPanel: 'Днище',
  rearDashPanel: 'Задняя панель приборов',
  rearWheelHouseLeft: 'Задняя колёсная арка (лев.)',
  rearWheelHouseRight: 'Задняя колёсная арка (прав.)',
  trunkFloor: 'Пол багажника',
  rearPanel: 'Задняя панель',
  quarterPanelLeft: 'Заднее крыло (лев.)',
  quarterPanelRight: 'Заднее крыло (прав.)',
  sideSillPanelLeft: 'Порог (лев.)',
  sideSillPanelRight: 'Порог (прав.)',
  pillarPanelFrontLeft: 'Стойка A (лев.)',
  pillarPanelFrontRight: 'Стойка A (прав.)',
  pillarPanelMiddleLeft: 'Стойка B (лев.)',
  pillarPanelMiddleRight: 'Стойка B (прав.)',
  pillarPanelRearLeft: 'Стойка C (лев.)',
  pillarPanelRearRight: 'Стойка C (прав.)',
  rearSideMemberLeft: 'Задний лонжерон (лев.)',
  rearSideMemberRight: 'Задний лонжерон (прав.)',
  frontSideMemberLeft: 'Передний лонжерон (лев.)',
  frontSideMemberRight: 'Передний лонжерон (прав.)',
  radiatorSupport: 'Суппорт радиатора',
  packageTray: 'Полка багажника',
};

// Panel rank from the performanceCheck dataGroup
const panelRankMap: Record<string, string> = {
  hood: '1', frontFenderLeft: '1', frontFenderRight: '1',
  frontDoorLeft: '1', frontDoorRight: '1', rearDoorLeft: '1', rearDoorRight: '1',
  trunkLead: '1', radiatorSupport: '1',
  roofPanel: '2', quarterPanelLeft: '2', quarterPanelRight: '2',
  sideSillPanelLeft: '2', sideSillPanelRight: '2',
  frontPanel: 'A', insidePanelLeft: 'A', insidePanelRight: 'A',
  crossMember: 'A', trunkFloor: 'A', rearPanel: 'A',
  frontWheelHouseLeft: 'B', frontWheelHouseRight: 'B',
  rearWheelHouseLeft: 'B', rearWheelHouseRight: 'B',
  pillarPanelFrontLeft: 'B', pillarPanelFrontRight: 'B',
  pillarPanelMiddleLeft: 'B', pillarPanelMiddleRight: 'B',
  pillarPanelRearLeft: 'B', pillarPanelRearRight: 'B',
  rearSideMemberLeft: 'B', rearSideMemberRight: 'B',
  frontSideMemberLeft: 'B', frontSideMemberRight: 'B',
  dashPanel: 'C', floorPanel: 'C', packageTray: 'C',
};

async function fetchInspectionData(carId: string): Promise<InspectionData | null> {
  try {
    // Resolve vehicleId (listing ID and vehicleId can differ)
    const readRes = await fetch(
      `https://api.encar.com/v1/readside/vehicle/${carId}`,
      { headers: { 'User-Agent': 'Mozilla/5.0' }, signal: AbortSignal.timeout(5000) }
    );
    if (!readRes.ok) return null;
    const readData = await readRes.json();
    const vehicleId = readData.vehicleId || carId;

    // Fetch inspection data from the legacy JSON API
    const res = await fetch(
      `https://api.encar.com/legacy/usedcar/inspect/${vehicleId}`,
      { headers: { 'User-Agent': 'Mozilla/5.0' }, signal: AbortSignal.timeout(5000) }
    );
    if (!res.ok) return null;

    const data = await res.json();
    const outer: Record<string, string[] | null> = data.outer || {};
    const accidentSummary = data.inspectAccidentSummary || {};

    const panels: PanelDamage[] = [];
    const summary = { change: 0, metal: 0, corrosion: 0, scratch: 0, dent: 0, damage: 0 };

    for (const [panelName, damages] of Object.entries(outer)) {
      if (!damages || !Array.isArray(damages) || damages.length === 0) continue;
      if (panelName === 'crossMemberType1') continue;

      const validDamages = damages.filter((d): d is DamageType =>
        ['CHANGE', 'METAL', 'CORROSION', 'SCRATCH', 'HILLS', 'DAMAGE'].includes(d)
      );

      if (validDamages.length === 0) continue;

      panels.push({
        name: panelName,
        nameRu: panelNameRu[panelName] || panelName,
        rank: panelRankMap[panelName] || '',
        damages: validDamages,
      });

      for (const d of validDamages) {
        if (d === 'CHANGE') summary.change++;
        else if (d === 'METAL') summary.metal++;
        else if (d === 'CORROSION') summary.corrosion++;
        else if (d === 'SCRATCH') summary.scratch++;
        else if (d === 'HILLS') summary.dent++;
        else if (d === 'DAMAGE') summary.damage++;
      }
    }

    const accidentHistory = accidentSummary.accident === 'EXISTS' ? true
      : accidentSummary.accident === 'NONE' ? false : undefined;
    const simpleRepair = accidentSummary.simpleRepair === 'EXISTS' ? true
      : accidentSummary.simpleRepair === 'NONE' ? false : undefined;

    return {
      panels,
      summary,
      hasDamage: panels.length > 0,
      accidentHistory,
      simpleRepair,
    };
  } catch (error) {
    console.error('Encar inspection fetch error:', error);
    return null;
  }
}

export async function getCarDetail(carId: string): Promise<CarListing | null> {
  try {
    // Fetch readside and search API in parallel for faster loading
    const searchQuery = `(And.Hidden.N._.CarId.${carId}.)`;
    const [readRes, searchRes] = await Promise.all([
      fetch(
        `https://api.encar.com/v1/readside/vehicle/${carId}`,
        {
          headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
          cache: 'no-store',
          signal: AbortSignal.timeout(10000),
        }
      ),
      fetch(
        `${ENCAR_API_BASE}?${new URLSearchParams({ count: 'true', q: searchQuery, sr: '|ModifiedDate|0|1' })}`,
        {
          headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
          cache: 'no-store',
          signal: AbortSignal.timeout(10000),
        }
      ).catch(() => null),
    ]);

    if (!readRes.ok) {
      console.error(`Readside API error: ${readRes.status} for car ${carId}`);
      return null;
    }

    const readData = await readRes.json();

    let searchItem: Record<string, unknown> | null = null;
    if (searchRes?.ok) {
      const searchData = await searchRes.json();
      const results = searchData.SearchResults || [];
      if (results.length > 0) {
        searchItem = results[0];
      }
    }

    // Readside API nests data under category, spec, advertisement
    const cat = readData.category || {};
    const spec = readData.spec || {};
    const adv = readData.advertisement || {};

    // Use readside data as primary, search data as fallback for some fields
    const manufacturer = cat.manufacturerName || (searchItem?.Manufacturer as string) || '';
    const modelName = cat.modelGroupName || cat.modelName || (searchItem?.Model as string) || '';
    const yearMonth = String(cat.yearMonth || searchItem?.Year || '');
    const mileage = spec.mileage || (searchItem?.Mileage as number) || 0;
    const fuelName = spec.fuelName || (searchItem?.FuelType as string) || '';
    const displacement = spec.displacement || (searchItem?.Displacement as number) || parseDisplacementFromBadge((searchItem?.Badge as string) || '');
    const colorName = spec.colorName || (searchItem?.Color as string) || '';
    const bodyName = spec.bodyName || (searchItem?.BodyType as string) || '';
    const transmissionName = spec.transmissionName || (searchItem?.Transmission as string) || '';
    const gradeName = cat.gradeEnglishName || cat.gradeName || '';
    const price = adv.price || (searchItem?.Price as number) || 0;

    const priceKrw = price * 10000;
    const [priceRub, priceUsd] = await Promise.all([
      convertKrwToRub(priceKrw),
      convertKrwToUsd(priceKrw),
    ]);

    // Get photos from readside API
    const photos: { type: string; path: string }[] = readData.photos || [];
    const typeOrder: Record<string, number> = { OUTER: 0, INNER: 1, OPTION: 2 };
    const imageUrls = photos
      .filter((p: { type: string }) => ['OUTER', 'INNER', 'OPTION'].includes(p.type))
      .sort((a: { type: string; path: string }, b: { type: string; path: string }) => {
        const ta = typeOrder[a.type] ?? 9;
        const tb = typeOrder[b.type] ?? 9;
        if (ta !== tb) return ta - tb;
        const na = parseInt(a.path.match(/_(\d+)\.\w+$/)?.[1] || '0');
        const nb = parseInt(b.path.match(/_(\d+)\.\w+$/)?.[1] || '0');
        return na - nb;
      })
      .map((p: { path: string }) => `/api/proxy-image?url=${encodeURIComponent(`${ENCAR_IMAGE_CDN}${p.path}`)}`);

    // If no photos from readside, try search result photo prefix
    if (imageUrls.length === 0 && searchItem?.Photo) {
      const photo = searchItem.Photo as string;
      imageUrls.push(`/api/proxy-image?url=${encodeURIComponent(`${ENCAR_IMAGE_CDN}${photo}001.jpg`)}`);
    }

    // Resolve option codes to translated names
    const rawOptions = readData.options;
    const optionCodes: string[] = [];
    if (rawOptions && typeof rawOptions === 'object' && !Array.isArray(rawOptions)) {
      for (const key of ['standard', 'choice', 'etc', 'tuning']) {
        if (Array.isArray(rawOptions[key])) {
          optionCodes.push(...rawOptions[key].filter((c: unknown) => typeof c === 'string'));
        }
      }
    }

    const [equipment, inspectionData, panAutoHp, vinData] = await Promise.all([
      resolveOptionCodes(optionCodes),
      fetchInspectionData(carId),
      fetchHpFromPanAuto(carId),
      fetchDataFromVin(readData.vin),
    ]);

    const brand = translateBrand(manufacturer);
    const model = translateModel(modelName);
    const trim = gradeName ? (cat.gradeEnglishName || translateModel(gradeName)) : undefined;

    return {
      id: carId,
      source: 'encar',
      brand,
      model,
      trim: trim || undefined,
      year: parseInt(yearMonth.substring(0, 4)) || 0,
      month: parseInt(yearMonth.substring(4, 6)) || undefined,
      mileage,
      fuel: translateFuel(fuelName),
      engine: (displacement || vinData.displacement) ? `${((displacement || vinData.displacement || 0) / 1000).toFixed(1)}L` : '',
      displacement: displacement || vinData.displacement || 0,
      hp: vinData.hp || panAutoHp || (searchItem?.MaxPower as number) || (searchItem?.HorsePower as number) || undefined,
      color: translateColor(colorName),
      bodyType: translateBodyType(bodyName),
      transmission: translateTransmission(transmissionName),
      drivetrain: '',
      seatCount: spec.seatCount || undefined,
      price_krw: priceKrw,
      price_rub: priceRub,
      price_usd: priceUsd,
      imageUrl: imageUrls[0] || '/images/no-image.svg',
      images: imageUrls,
      equipment,
      vin: readData.vin || '',
      accidentHistory: [],
      inspectionData: inspectionData || undefined,
    };
  } catch (error) {
    console.error('Encar detail fetch error:', error);
    return null;
  }
}

export function getProxiedImageUrl(originalUrl: string): string {
  return `/api/proxy-image?url=${encodeURIComponent(originalUrl)}`;
}

