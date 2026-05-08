"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useApp } from "@/contexts/AppContext";
import {
  formatKcarAuctionDate,
  formatKCarName,
  kcarPriceToKrw,
  type KCarAuctionCar,
} from "@/lib/kcar-auction";

interface AuctionDetailClientProps {
  car: KCarAuctionCar;
  images: string[];
}

export default function AuctionDetailClient({ car, images }: AuctionDetailClientProps) {
  const { formatKrwPrice } = useApp();
  const [selectedImage, setSelectedImage] = useState(0);
  const title = formatKCarName(car);
  const price = formatKrwPrice(kcarPriceToKrw(car.price));
  const regYear = car.firstRegDate && car.firstRegDate.length >= 6
    ? `${car.firstRegDate.slice(0, 4)}/${car.firstRegDate.slice(4, 6)}`
    : String(car.year);

  const specs = useMemo(() => ([
    ["Year", regYear],
    ["Mileage", `${car.mileage.toLocaleString("ru-RU")} km`],
    ["Fuel", car.fuelType],
    ["Transmission", car.transmission],
    ["Engine", car.engineVolume ? `${car.engineVolume}cc` : car.engineTier || "-"],
    ["Location", car.location || "-"],
    ["Color", car.color || "-"],
    ["Drive", car.driveType || "-"],
    ["VIN", car.vin || "-"],
  ]), [car, regYear]);

  const showPreviousImage = () => {
    setSelectedImage((current) => (current === 0 ? images.length - 1 : current - 1));
  };

  const showNextImage = () => {
    setSelectedImage((current) => (current + 1) % images.length);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      <div className="bg-gray-950">
        <div className="mx-auto max-w-5xl">
          <div className="relative aspect-[16/10] bg-gray-900 sm:aspect-[16/8]">
            <img
              src={images[selectedImage] || images[0]}
              alt={title}
              className="h-full w-full object-contain"
              loading="eager"
              decoding="async"
              fetchPriority="high"
            />
            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={showPreviousImage}
                  className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-gray-950 shadow-md transition hover:bg-white"
                  aria-label="Previous photo"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={showNextImage}
                  className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-gray-950 shadow-md transition hover:bg-white"
                  aria-label="Next photo"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </>
            )}
            <div className="absolute left-3 top-3 rounded bg-white px-3 py-1 text-sm font-bold text-gray-950">
              Auction {formatKcarAuctionDate(car.auctionDate)}
            </div>
            {car.lotNumber && (
              <div className="absolute right-3 top-3 rounded bg-white/90 px-3 py-1 text-sm font-bold text-gray-950">
                Lot #{car.lotNumber}
              </div>
            )}
          </div>
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto bg-gray-950 px-3 py-3">
              {images.map((image, index) => (
                <button
                  key={`${image}-${index}`}
                  type="button"
                  onClick={() => setSelectedImage(index)}
                  className={`relative h-16 w-24 flex-shrink-0 overflow-hidden rounded-md border ${
                    selectedImage === index ? "border-red-400" : "border-white/20"
                  }`}
                  aria-label={`Show photo ${index + 1}`}
                >
                  <img src={image} alt="" className="h-full w-full object-cover" loading="lazy" decoding="async" />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-5 sm:px-6 lg:px-8">
        <Link href="/auction" className="mb-4 inline-flex text-sm font-semibold text-primary hover:underline">
          Back to auction
        </Link>

        <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
          <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
            <h1 className="text-2xl font-extrabold text-gray-950">{title}</h1>

            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {specs.map(([label, value]) => (
                <div key={label} className="rounded-lg bg-gray-50 px-3 py-2">
                  <div className="text-[11px] font-bold uppercase tracking-wide text-gray-400">{label}</div>
                  <div className="mt-1 text-sm font-bold text-gray-900">{value}</div>
                </div>
              ))}
            </div>
          </section>

          <aside className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
            <div className="text-xs font-bold uppercase tracking-wide text-gray-500">Start price</div>
            <div className="mt-1 text-3xl font-extrabold text-red-700">{price}</div>
            <div className="mt-2 rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold leading-snug text-red-800">
              This price is without auction commission and delivery.
            </div>
            <a
              href={`https://wa.me/?text=${encodeURIComponent(`KCar auction: ${title}, lot ${car.lotNumber}, ${price}`)}`}
              className="mt-5 block rounded-lg bg-emerald-600 px-4 py-3 text-center text-sm font-bold text-white transition hover:bg-emerald-700"
            >
              Ask about this car
            </a>
          </aside>
        </div>
      </div>
    </div>
  );
}
