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
  exbitSeq?: string | null;
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

export type KCarAuctionSummary = Pick<
  KCarAuctionCar,
  | "id"
  | "brand"
  | "model"
  | "year"
  | "price"
  | "mileage"
  | "fuelType"
  | "engineVolume"
  | "image"
  | "auctionDate"
  | "lotNumber"
  | "exbitSeq"
  | "firstRegDate"
>;

interface KCarListResponse {
  data: KCarAuctionSummary[];
  count: number;
}

interface KCarItemResponse {
  data: KCarAuctionCar;
}

interface KCarImagesResponse {
  data: string[];
}

interface KCarThumbnailResponse {
  THUMBNAIL?: Array<{
    THUM_WEB_PATH?: string;
    THUM_ID?: string;
    THUM_EXT?: string;
  }>;
}

export const KCAR_API_URL =
  process.env.KCAR_API_URL ||
  process.env.NEXT_PUBLIC_KCAR_API_URL ||
  "https://kcar-bidding-api.ghayrat-sami.workers.dev";

export function resolveKCarImageUrl(image?: string | null): string {
  if (!image) return "/images/no-image.svg";
  if (image.startsWith("http")) return image;
  if (image.startsWith("/api/proxy-image")) return image;
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
  "쉐보레(GM대우)": "Chevrolet",
  "한국GM": "GM Korea",
  "르노코리아": "Renault Korea",
  "르노코리아(삼성)": "Renault Korea",
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
  "인피니티": "Infiniti",
  "테슬라": "Tesla",
  "포드": "Ford",
  "링컨": "Lincoln",
  "지프": "Jeep",
  "크라이슬러": "Chrysler",
  "볼보": "Volvo",
  "랜드로버": "Land Rover",
  "재규어": "Jaguar",
  "푸조": "Peugeot",
  "시트로엥": "Citroen",
  "ê¸°ì": "Kia",
  "íë": "Hyundai",
  "ì ë¤ìì¤": "Genesis",
  "ìë³´ë (GMëì°)": "Chevrolet",
  "ë¥´ë¸ì½ë¦¬ì(ì¼ì±)": "Renault Korea",
  "ë¯¸ë": "MINI",
  "ìì°ë": "Audi",
  "í¸ì¡°": "Peugeot",
  "ë²¤ì¸ ": "Mercedes-Benz",
};

const MODEL_REPLACEMENTS: [RegExp, string][] = [
  [/XC90\s*\d+\s*세대.*/gi, "XC90"],
  [/현대/g, ""],
  [/기아/g, ""],
  [/제네시스/g, "Genesis"],
  [/쉐보레\(GM대우\)/g, ""],
  [/쉐보레/g, ""],
  [/르노코리아\(삼성\)/g, ""],
  [/르노코리아/g, ""],
  [/르노삼성/g, ""],
  [/쌍용/g, ""],
  [/KG모빌리티\(쌍용\)/g, ""],
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
  [/제너레이션/g, "Generation"],
  [/레이/g, "Ray"],
  [/모닝/g, "Morning"],
  [/스팅어/g, "Stinger"],
  [/스토닉/g, "Stonic"],
  [/쏘울/g, "Soul"],
  [/봉고/g, "Bongo"],
  [/그랜드 스타렉스/g, "Grand Starex"],
  [/벨로스터/g, "Veloster"],
  [/엑센트/g, "Accent"],
  [/에쿠스/g, "Equus"],
  [/베라크루즈/g, "Veracruz"],
  [/맥스크루즈/g, "Maxcruz"],
  [/포르테/g, "Forte"],
  [/프라이드/g, "Pride"],
  [/카렌스/g, "Carens"],
  [/로체/g, "Lotze"],
  [/그랜드 보이저/g, "Grand Voyager"],
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
  [/골프/g, "Golf"],
  [/티구안/g, "Tiguan"],
  [/투아렉/g, "Touareg"],
  [/제타/g, "Jetta"],
  [/파사트/g, "Passat"],
  [/시로코/g, "Scirocco"],
  [/아테온/g, "Arteon"],
  [/토러스/g, "Taurus"],
  [/익스플로러/g, "Explorer"],
  [/알티마/g, "Altima"],
  [/쥬크/g, "Juke"],
  [/시에나/g, "Sienna"],
  [/어코드/g, "Accord"],
  [/랭글러/g, "Wrangler"],
  [/트론/g, "tron"],
  [/클리오/g, "Clio"],
  [/쿠페/g, "Coupe"],
  [/일렉트릭/g, "Electric"],
  [/올스페이스/g, "Allspace"],
  [/살룬/g, "Saloon"],
  [/럭셔리/g, "Luxury"],
  [/브릴리언트/g, "Brilliant"],
  [/트랜스폼/g, "Transform"],
  [/프리미어/g, "Premier"],
  [/마스터/g, "Master"],
  [/볼드/g, "Bold"],
  [/아머/g, "Armour"],
  [/베리/g, "Very"],
  [/뷰티풀/g, "Beautiful"],
  [/투리스모/g, "Turismo"],
  [/넥스트/g, "Next"],
  [/이노베이션/g, "Innovation"],
  [/어드밴스/g, "Advance"],
  [/노바/g, "Nova"],
  [/제너레이션/g, "Generation"],
  [/신형/g, "New"],
  [/QM6/g, "QM6"],
  [/SM6/g, "SM6"],
  [/XM3/g, "XM3"],
  [/더 뉴/g, "The New"],
  [/올 뉴/g, "All New"],
  [/디 올 뉴/g, "The All New"],
  [/하이브리드/g, "Hybrid"],
  [/전기/g, "Electric"],
  [/세대/g, "Gen"],
  [/클래스/g, "Class"],
  [/시리즈/g, "Series"],
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
  [/ìëí/g, "Sonata"],
  [/ìë°ë¼/g, "Avante"],
  [/ê·¸ëì /g, "Grandeur"],
  [/ê·¸ëë ì¤íë ì¤/g, "Grand Starex"],
  [/í¬ì¼/g, "Tucson"],
  [/ì¼íí/g, "Santa Fe"],
  [/ì ë¤ìì¤/g, "Genesis"],
  [/ë²¨ë¡ì¤í°/g, "Veloster"],
  [/ìì¼í¸/g, "Accent"],
  [/í¬í°/g, "Porter"],
  [/ì¬ ë´ ì¹´ë ì¤/g, "All New Carens"],
  [/ì¹´ë ì¤/g, "Carens"],
  [/íë¼ì´ë/g, "Pride"],
  [/ì¹´ëë°/g, "Carnival"],
  [/ìë í /g, "Sorento"],
  [/ì¤í¬í°ì§/g, "Sportage"],
  [/ëª¨íë¹/g, "Mohave"],
  [/ìí ì¤/g, "Seltos"],
  [/ëë¡/g, "Niro"],
  [/ë ì´/g, "Ray"],
  [/ëª¨ë/g, "Morning"],
  [/ë´ê³ /g, "Bongo"],
  [/í°ë³¼ë¦¬/g, "Tivoli"],
  [/ì½ëë/g, "Korando"],
  [/ë·°í°í Korando/g, "Korando"],
  [/ë ì¤í´/g, "Rexton"],
  [/í¬ë£¨ì¦/g, "Cruze"],
  [/ì¤íí¬/g, "Spark"],
  [/ì¬ëë/g, "Orlando"],
  [/ì¿ í¼/g, "Cooper"],
  [/ì»¨í¸ë¦¬ë§¨/g, "Countryman"],
  [/í´ëì¤/g, "Class"],
  [/ìë¦¬ì¦/g, "Series"],
  [/ë ë´/g, "The New"],
  [/ì¬ ë´/g, "All New"],
  [/ë´/g, "New"],
  [/íì´ë¸ë¦¬ë/g, "Hybrid"],
  [/ì¸ë/g, "Gen"],
  [/í¬ë¦¬ì¤ëª¨/g, "Turismo"],
  [/ì¤í¬ì¸ /g, "Sports"],
  [/ìì´/g, "Air"],
  [/ë¤ì¤/g, "Neo"],
  [/í¸ë­/g, "Truck"],
  [/ì¹´ê³ /g, "Cargo"],
  [/í¹ì¥/g, "Special"],
  [/ë íë ì¤í°ì§/g, "The Prestige"],
  [/ë íë¼ì/g, "The Prime"],
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
    .replace(/(\d)(Series|Gen)\b/g, "$1 $2")
    .replace(/\bBongo\s*III\b/gi, "Bongo")
    .replace(/\s*\(\s*/g, " (")
    .replace(/\s*\)\s*/g, ") ")
    .trim();

  if (KOREAN_RE.test(model)) {
    const latinParts = model.match(/[A-Za-z0-9][A-Za-z0-9\s()./-]*/g);
    if (latinParts?.length) {
      model = latinParts.join(" ").replace(/\s+/g, " ").trim();
    } else {
      model = "Model";
    }
  }

  return [brand, model].filter(Boolean).join(" ").trim();
}

export function getKCarBrand(car: Pick<KCarAuctionCar, "brand" | "model">): string {
  return BRAND_MAP[car.brand] || car.brand.replace(KOREAN_RE, "").trim() || "Other";
}

export function getKCarBaseModel(car: Pick<KCarAuctionCar, "brand" | "model">): string {
  const name = formatKCarName(car);
  const brand = getKCarBrand(car);
  let model = name.startsWith(`${brand} `) ? name.slice(brand.length + 1) : name;
  model = model.trim() || "Model";

  model = model
    .replace(/\s*\d+\s*세대.*$/g, "")
    .replace(/\b(The All New|All New|The New|New)\b/gi, "")
    .replace(/\bHybrid|Electric|Diesel|Gasoline|LPG\b/gi, "")
    .replace(/\b\d+(st|nd|rd|th)?\s*Gen\b/gi, "")
    .replace(/\b[A-Z]{1,3}\d{0,3}\b(?=\s|$)/g, (match) => {
      const keep = ["K3", "K5", "K7", "K8", "K9", "G70", "G80", "G90", "GV60", "GV70", "GV80", "EV6", "EV9", "SM3", "SM5", "SM6", "SM7", "QM3", "QM5", "QM6", "XM3", "XC90"];
      return keep.includes(match) ? match : "";
    })
    .replace(/\([^)]*\)/g, "")
    .replace(/\b\d+\.\d+\s*(T|Turbo|GDI|CRDi)?\b/gi, "")
    .replace(/\b\d{3,4}\s*cc\b/gi, "")
    .replace(/\b(F\/L|LPi|CRDi|Neo|Sports|Turismo|Air|Cargo|Special|The Prime|The Prestige)\b/gi, "")
    .replace(/\s+/g, " ")
    .trim();

  const knownModels = [
    "Grand Starex",
    "Santa Fe",
    "Range Rover",
    "Land Rover",
    "Mercedes-Benz",
    "C Class",
    "E Class",
    "S Class",
    "CLS Class",
    "GLA Class",
    "GLC Class",
    "GLE Class",
    "5 Series",
    "1 Series",
    "3 Series",
    "6 Series",
    "7 Series",
    "All New SM7",
    "SM3",
    "SM5",
    "SM6",
    "SM7",
    "QM3",
    "QM5",
    "QM6",
    "XM3",
    "Grand Voyager",
    "Trailblazer",
    "Sportage",
    "Sorento",
    "Carnival",
    "Morning",
    "Grandeur",
    "Avante",
    "Sonata",
    "Tucson",
    "Palisade",
    "Kona",
    "Ioniq",
    "Casper",
    "Porter",
    "Staria",
    "Mohave",
    "Seltos",
    "Niro",
    "Bongo",
    "Tivoli",
    "Korando",
    "Rexton",
    "Equinox",
    "Malibu",
    "Captiva",
    "Spark",
    "Cruze",
    "Trax",
    "Genesis",
    "Tiguan",
    "Touareg",
    "Passat",
    "Jetta",
  ];
  const known = knownModels.find((item) => new RegExp(`\\b${item.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i").test(model));
  if (known) return known;

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

export async function getKCarAuctionCars(): Promise<KCarAuctionSummary[]> {
  const res = await fetch(`${KCAR_API_URL}/api/cars?limit=1000&view=summary`, {
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
  const directImages = await getKCarDirectImages(id);
  if (directImages.length > 0) return directImages;

  const res = await fetch(`${KCAR_API_URL}/api/cars/${encodeURIComponent(id)}/images`, {
    next: { revalidate: 300 },
  });

  let storedImages: string[] = [];
  if (res.ok) {
    const payload = (await res.json()) as KCarImagesResponse;
    storedImages = payload.data || [];
  }

  return storedImages;
}

async function getKCarDirectImages(id: string): Promise<string[]> {
  const response = await fetch("https://www.kcarauction.com/auction/getThumbnail_ajax.do", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
      Accept: "application/json, text/javascript, */*; q=0.01",
      "Accept-Language": "ko-KR,ko;q=0.9",
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
      "X-Requested-With": "XMLHttpRequest",
      Referer: "https://www.kcarauction.com/kcar/auction/daily_auction/colAuction.do?PAGE_TYPE=dCfm",
    },
    body: new URLSearchParams({ CAR_ID: id }).toString(),
    next: { revalidate: 300 },
  });

  if (!response.ok) return [];

  const payload = (await response.json().catch(() => ({}))) as KCarThumbnailResponse;
  const thumbnails = payload.THUMBNAIL || [];

  return thumbnails
    .filter((item) => item.THUM_WEB_PATH && item.THUM_ID && item.THUM_EXT)
    .map((item) => {
      const imageUrl = `https://www.kcarauction.com/auction/IMAGE_UPLOAD/CAR/${item.THUM_WEB_PATH}${item.THUM_ID}_640${item.THUM_EXT}`;
      return `/api/proxy-image?url=${encodeURIComponent(imageUrl)}`;
    });
}
