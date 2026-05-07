import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  formatKcarAuctionDate,
  getKCarAuctionCar,
  getKCarAuctionImages,
  kcarPriceToKrw,
  resolveKCarImageUrl,
} from "@/lib/kcar-auction";

interface AuctionDetailPageProps {
  params: { id: string };
}

function formatKrw(amount: number): string {
  return new Intl.NumberFormat("ko-KR", {
    style: "currency",
    currency: "KRW",
    maximumFractionDigits: 0,
  }).format(amount);
}

export async function generateMetadata({ params }: AuctionDetailPageProps): Promise<Metadata> {
  const car = await getKCarAuctionCar(params.id);
  if (!car) return { title: "Auction car not found" };

  return {
    title: `${car.brand} ${car.model} ${car.year} - KCar Auction`,
    description: `${car.brand} ${car.model}, ${car.year}, ${car.mileage.toLocaleString("ru-RU")} km.`,
  };
}

export default async function AuctionDetailPage({ params }: AuctionDetailPageProps) {
  const car = await getKCarAuctionCar(params.id);
  if (!car) notFound();

  const imagePaths = await getKCarAuctionImages(car.id);
  const images = (imagePaths.length > 0 ? imagePaths : [car.image]).map(resolveKCarImageUrl);
  const regYear = car.firstRegDate && car.firstRegDate.length >= 6
    ? `${car.firstRegDate.slice(0, 4)}/${car.firstRegDate.slice(4, 6)}`
    : String(car.year);

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      <div className="bg-gray-950">
        <div className="mx-auto max-w-5xl">
          <div className="relative aspect-[16/10] bg-gray-900 sm:aspect-[16/8]">
            <img
              src={images[0]}
              alt={`${car.brand} ${car.model}`}
              className="h-full w-full object-contain"
              loading="eager"
              decoding="async"
              fetchPriority="high"
            />
            <div className="absolute left-3 top-3 rounded bg-white px-3 py-1 text-sm font-bold text-gray-950">
              Auction {formatKcarAuctionDate(car.auctionDate)}
            </div>
            {car.lotNumber && (
              <div className="absolute right-3 top-3 rounded bg-white/90 px-3 py-1 text-sm font-bold text-gray-950">
                Lot #{car.lotNumber}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-5 sm:px-6 lg:px-8">
        <Link href="/auction" className="mb-4 inline-flex text-sm font-semibold text-primary hover:underline">
          Back to auction
        </Link>

        <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
          <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
            <h1 className="text-2xl font-extrabold text-gray-950">
              {car.brand} {car.model}
            </h1>
            {car.grade && <p className="mt-1 text-sm font-medium text-gray-500">{car.grade}</p>}

            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {[
                ["Year", regYear],
                ["Mileage", `${car.mileage.toLocaleString("ru-RU")} km`],
                ["Fuel", car.fuelType],
                ["Transmission", car.transmission],
                ["Engine", car.engineVolume ? `${car.engineVolume}cc` : car.engineTier || "-"],
                ["Location", car.location || "-"],
                ["Color", car.color || "-"],
                ["Drive", car.driveType || "-"],
                ["VIN", car.vin || "-"],
              ].map(([label, value]) => (
                <div key={label} className="rounded-lg bg-gray-50 px-3 py-2">
                  <div className="text-[11px] font-bold uppercase tracking-wide text-gray-400">{label}</div>
                  <div className="mt-1 text-sm font-bold text-gray-900">{value}</div>
                </div>
              ))}
            </div>
          </section>

          <aside className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
            <div className="text-xs font-bold uppercase tracking-wide text-gray-500">Start price</div>
            <div className="mt-1 text-3xl font-extrabold text-blue-700">
              {formatKrw(kcarPriceToKrw(car.price))}
            </div>
            <div className="mt-1 text-sm text-gray-500">{car.price.toLocaleString("ru-RU")} manwon</div>
            <a
              href={`https://wa.me/?text=${encodeURIComponent(`KCar auction: ${car.brand} ${car.model} ${car.year}, lot ${car.lotNumber}, ${formatKrw(kcarPriceToKrw(car.price))}`)}`}
              className="mt-5 block rounded-lg bg-emerald-600 px-4 py-3 text-center text-sm font-bold text-white transition hover:bg-emerald-700"
            >
              Ask about this car
            </a>
          </aside>
        </div>

        {images.length > 1 && (
          <section className="mt-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
            <h2 className="mb-3 text-lg font-bold text-gray-950">Photos</h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {images.slice(1).map((image, index) => (
                <img
                  key={`${image}-${index}`}
                  src={image}
                  alt={`${car.brand} ${car.model} photo ${index + 2}`}
                  className="aspect-[4/3] w-full rounded-lg bg-gray-100 object-cover"
                  loading="lazy"
                  decoding="async"
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
