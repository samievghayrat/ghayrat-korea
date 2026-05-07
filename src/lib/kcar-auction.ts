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
