"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
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

function translateValue(value: string | null | undefined): string {
  if (!value) return "-";
  const map: Record<string, string> = {
    Gasoline: "Бензин",
    Diesel: "Дизель",
    Hybrid: "Гибрид",
    Electric: "Электро",
    LPG: "Газ (LPG)",
    Automatic: "Автомат",
    Manual: "Механика",
    기타: "Другое",
    흰색: "Белый",
    검정색: "Черный",
    은색: "Серебристый",
    회색: "Серый",
    세종경매장: "Седжон, аукционная площадка",
    "2WD": "2WD",
    "4WD": "4WD",
    AWD: "AWD",
  };
  return map[value] || value;
}

export default function AuctionDetailClient({ car, images }: AuctionDetailClientProps) {
  const { formatKrwPrice } = useApp();
  const searchParams = useSearchParams();
  const [selectedImage, setSelectedImage] = useState(0);
  const [imageLoaded, setImageLoaded] = useState(false);
  const title = formatKCarName(car);
  const price = formatKrwPrice(kcarPriceToKrw(car.price));
  const contactMessage = `KCar auction: ${title}, lot ${car.lotNumber}, ${price}`;
  const whatsappUrl = `https://wa.me/821099221601?text=${encodeURIComponent(contactMessage)}`;
  const telegramUrl = `https://t.me/+821099221601`;
  const backHref = searchParams.toString() ? `/auction?${searchParams.toString()}` : "/auction";
  const currentImage = images[selectedImage] || images[0] || "/images/no-image.svg";
  const regYear = car.firstRegDate && car.firstRegDate.length >= 6
    ? `${car.firstRegDate.slice(0, 4)}/${car.firstRegDate.slice(4, 6)}`
    : String(car.year);

  const specs = useMemo(() => ([
    ["Год", regYear],
    ["Пробег", `${car.mileage.toLocaleString("ru-RU")} км`],
    ["Топливо", translateValue(car.fuelType)],
    ["КПП", translateValue(car.transmission)],
    ["Двигатель", car.engineVolume ? `${car.engineVolume}cc` : car.engineTier || "-"],
    ["Локация", translateValue(car.location)],
    ["Цвет", translateValue(car.color)],
    ["Привод", translateValue(car.driveType)],
    ["VIN", car.vin || "-"],
  ]), [car, regYear]);

  const showPreviousImage = () => {
    setImageLoaded(false);
    setSelectedImage((current) => (current === 0 ? images.length - 1 : current - 1));
  };

  const showNextImage = () => {
    setImageLoaded(false);
    setSelectedImage((current) => (current + 1) % images.length);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      <div className="bg-gray-950">
        <div className="mx-auto max-w-5xl">
          <div className="relative aspect-[16/10] bg-gray-900 sm:aspect-[16/8]">
            {!imageLoaded && (
              <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center bg-gray-900/40">
                <div className="h-9 w-9 animate-spin rounded-full border-4 border-white/25 border-t-white" />
              </div>
            )}
            <img
              key={currentImage}
              src={currentImage}
              alt={title}
              className="h-full w-full object-contain"
              loading="eager"
              decoding="async"
              fetchPriority="high"
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageLoaded(true)}
            />
            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={showPreviousImage}
                  className="absolute left-3 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-gray-950 shadow-md transition hover:bg-white"
                  aria-label="Предыдущее фото"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={showNextImage}
                  className="absolute right-3 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-gray-950 shadow-md transition hover:bg-white"
                  aria-label="Следующее фото"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </>
            )}
            <div className="absolute left-3 top-3 z-20 rounded bg-white px-3 py-1 text-sm font-bold text-gray-950">
              Аукцион {formatKcarAuctionDate(car.auctionDate)}
            </div>
            {car.lotNumber && (
              <div className="absolute right-3 top-3 z-20 rounded bg-white/90 px-3 py-1 text-sm font-bold text-gray-950">
                Лот #{car.lotNumber}
              </div>
            )}
          </div>
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto bg-gray-950 px-3 py-3">
              {images.map((image, index) => (
                <button
                  key={`${image}-${index}`}
                  type="button"
                  onClick={() => {
                    setImageLoaded(false);
                    setSelectedImage(index);
                  }}
                  className={`relative h-16 w-24 flex-shrink-0 overflow-hidden rounded-md border ${
                    selectedImage === index ? "border-red-400" : "border-white/20"
                  }`}
                  aria-label={`Показать фото ${index + 1}`}
                >
                  <img src={image} alt="" className="h-full w-full object-cover" loading="lazy" decoding="async" />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-5 sm:px-6 lg:px-8">
        <Link href={backHref} className="mb-4 inline-flex text-sm font-semibold text-primary hover:underline">
          Назад к аукциону
        </Link>

        <section className="mb-4 rounded-xl border border-red-100 bg-white p-4 shadow-sm sm:p-5">
          <div className="text-xs font-bold uppercase tracking-wide text-gray-500">Стартовая цена</div>
          <div className="mt-1 text-3xl font-extrabold text-red-700">{price}</div>
          <div className="mt-2 rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold leading-snug text-red-800">
            Эта цена указана без аукционной комиссии и доставки.
          </div>
          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block rounded-lg bg-emerald-600 px-4 py-3 text-center text-sm font-bold text-white transition hover:bg-emerald-700 sm:px-6"
            >
              WhatsApp
            </a>
            <a
              href={telegramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block rounded-lg bg-sky-600 px-4 py-3 text-center text-sm font-bold text-white transition hover:bg-sky-700 sm:px-6"
            >
              Telegram
            </a>
          </div>
        </section>

        <div className="grid gap-4">
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
        </div>
      </div>
    </div>
  );
}
