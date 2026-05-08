export interface KCarAuctionCar {
  id: string;
  brand: string;
  model: string;
  year: number;
  price: number;
  mileage: number;
  transmission: "Automatic" | "Manual";
  fuelType: "Gasoline" | "Diesel" | "Hybrid" | "Electric" | "LPG";
  engineTier?: string | null;
  engineVolume?: string | null;
  image: string;
  images?: string[] | null;
  auctionDate: string;
  lotNumber: string;
  location: string;
  condition: "Excellent" | "Good" | "Fair";
  startingBid: number;
  grade?: string | null;
  firstRegDate?: string | null;
  color?: string | null;
  vin?: string | null;
  driveType?: string | null;
  inspectionData?: string | null;
}

interface KCarListResponse {
  data: KCarAuctionCar[];
  count: number;
}

interface KCarItemResponse {
  data: KCarAuctionCar;
}

interface KCarImagesResponse {
  data: string[];
}

export const KCAR_API_URL =
  process.env.KCAR_API_URL ||
  process.env.NEXT_PUBLIC_KCAR_API_URL ||
  "https://kcar-bidding-api.ghayrat-sami.workers.dev";

export function resolveKCarImageUrl(image?: string | null): string {
  if (!image) return "/images/no-image.svg";
  if (image.startsWith("http")) return image;
  return `${KCAR_API_URL}${image}`;
}

export function kcarPriceToKrw(priceManwon: number): number {
  return Math.round(priceManwon * 10000);
}

const BRAND_MAP: Record<string, string> = {
  "현대": "Hyundai",
  "기아": "Kia",
  "제네시스": "Genesis",
  "쉐보레": "Chevrolet",
  "한국GM": "GM Korea",
  "르노코리아": "Renault Korea",
  "르노삼성": "Renault Samsung",
  "쌍용": "SsangYong",
  "KG모빌리티(쌍용)": "KG Mobility",
  "벤츠": "Mercedes-Benz",
  "메르세데스벤츠": "Mercedes-Benz",
  "아우디": "Audi",
  "폭스바겐": "Volkswagen",
  "포르쉐": "Porsche",
  "미니": "MINI",
  "토요타": "Toyota",
  "도요타": "Toyota",
  "렉서스": "Lexus",
  "혼다": "Honda",
  "닛산": "Nissan",
  "테슬라": "Tesla",
  "포드": "Ford",
  "링컨": "Lincoln",
  "지프": "Jeep",
  "볼보": "Volvo",
  "랜드로버": "Land Rover",
  "재규어": "Jaguar",
  "푸조": "Peugeot",
  "시트로엥": "Citroen",
};

const MODEL_REPLACEMENTS: [RegExp, string][] = [
  [/쏘나타/g, "Sonata"],
  [/아반떼/g, "Avante"],
  [/그랜저/g, "Grandeur"],
  [/투싼/g, "Tucson"],
  [/싼타페/g, "Santa Fe"],
  [/팰리세이드/g, "Palisade"],
  [/코나/g, "Kona"],
  [/베뉴/g, "Venue"],
  [/스타리아/g, "Staria"],
  [/아이오닉/g, "Ioniq"],
  [/캐스퍼/g, "Casper"],
  [/포터/g, "Porter"],
  [/카니발/g, "Carnival"],
  [/쏘렌토/g, "Sorento"],
  [/스포티지/g, "Sportage"],
  [/모하비/g, "Mohave"],
  [/셀토스/g, "Seltos"],
  [/니로/g, "Niro"],
  [/레이/g, "Ray"],
  [/모닝/g, "Morning"],
  [/스팅어/g, "Stinger"],
  [/스토닉/g, "Stonic"],
  [/쏘울/g, "Soul"],
  [/봉고/g, "Bongo"],
  [/티볼리/g, "Tivoli"],
  [/코란도/g, "Korando"],
  [/렉스턴/g, "Rexton"],
  [/토레스/g, "Torres"],
  [/트랙스/g, "Trax"],
  [/트레일블레이저/g, "Trailblazer"],
  [/말리부/g, "Malibu"],
  [/스파크/g, "Spark"],
  [/크루즈/g, "Cruze"],
  [/올란도/g, "Orlando"],
  [/이쿼녹스/g, "Equinox"],
  [/임팔라/g, "Impala"],
  [/캡티바/g, "Captiva"],
  [/아베오/g, "Aveo"],
  [/마티즈/g, "Matiz"],
  [/클래스/g, "Class"],
  [/시리즈/g, "Series"],
  [/더 뉴/g, "The New"],
  [/올 뉴/g, "All New"],
  [/디 올 뉴/g, "The All New"],
  [/하이브리드/g, "Hybrid"],
  [/전기/g, "Electric"],
  [/세대/g, "Gen"],
];

const KOREAN_RE = /[\u3131-\uD79D]/;

export function formatKCarName(car: Pick<KCarAuctionCar, "brand" | "model">): string {
  const brand = BRAND_MAP[car.brand] || car.brand;
  let model = car.model || "";

  for (const [pattern, replacement] of MODEL_REPLACEMENTS) {
    model = model.replace(pattern, replacement);
  }

  model = model
    .replace(/\s+/g, " ")
    .replace(/\s*\(\s*/g, " (")
    .replace(/\s*\)\s*/g, ") ")
    .trim();

  if (KOREAN_RE.test(model)) {
    const latinParts = model.match(/[A-Za-z0-9][A-Za-z0-9\s()./-]*/g);
    if (latinParts?.length) {
      model = latinParts.join(" ").replace(/\s+/g, " ").trim();
    }
  }

  return [brand, model].filter(Boolean).join(" ").trim();
}

export function getKCarBrand(car: Pick<KCarAuctionCar, "brand" | "model">): string {
  return formatKCarName(car).split(" ")[0] || car.brand;
}

export function getKCarBaseModel(car: Pick<KCarAuctionCar, "brand" | "model">): string {
  const name = formatKCarName(car);
  const [, ...modelParts] = name.split(" ");
  let model = modelParts.join(" ").trim() || car.model;

  model = model
    .replace(/\b(The All New|All New|The New|New)\b/gi, "")
    .replace(/\bHybrid|Electric|Diesel|Gasoline|LPG\b/gi, "")
    .replace(/\b\d+(st|nd|rd|th)?\s*Gen\b/gi, "")
    .replace(/\b[A-Z]{1,3}\d{0,3}\b(?=\s|$)/g, (match) => {
      const keep = ["K3", "K5", "K7", "K8", "K9", "G70", "G80", "G90", "GV60", "GV70", "GV80", "EV6", "EV9", "SM3", "SM5", "SM6", "SM7", "QM3", "QM5", "QM6", "XM3"];
      return keep.includes(match) ? match : "";
    })
    .replace(/\([^)]*\)/g, "")
    .replace(/[0-9.]+\s*(T|Turbo|GDI|CRDi|cc)?\b/gi, "")
    .replace(/\s+/g, " ")
    .trim();

  const firstWords = model.split(" ").filter(Boolean);
  if (firstWords.length >= 2 && ["Class", "Series"].includes(firstWords[1])) {
    return firstWords.slice(0, 2).join(" ");
  }

  return firstWords[0] || model || car.model;
}

export function formatKcarAuctionDate(date: string): string {
  if (!date) return "";
  return new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "short",
  }).format(new Date(`${date}T00:00:00+09:00`));
}

export async function getKCarAuctionCars(): Promise<KCarAuctionCar[]> {
  const res = await fetch(`${KCAR_API_URL}/api/cars?limit=1000`, {
    next: { revalidate: 300 },
  });

  if (!res.ok) {
    throw new Error(`Failed to load KCar auction cars: ${res.status}`);
  }

  const payload = (await res.json()) as KCarListResponse;
  return payload.data || [];
}

export async function getKCarAuctionCar(id: string): Promise<KCarAuctionCar | null> {
  const res = await fetch(`${KCAR_API_URL}/api/cars/${encodeURIComponent(id)}`, {
    next: { revalidate: 300 },
  });

  if (res.status === 404) return null;
  if (!res.ok) {
    throw new Error(`Failed to load KCar auction car: ${res.status}`);
  }

  const payload = (await res.json()) as KCarItemResponse;
  return payload.data;
}

export async function getKCarAuctionImages(id: string): Promise<string[]> {
  const res = await fetch(`${KCAR_API_URL}/api/cars/${encodeURIComponent(id)}/images`, {
    next: { revalidate: 3600 },
  });

  if (!res.ok) return [];

  const payload = (await res.json()) as KCarImagesResponse;
  return payload.data || [];
}
