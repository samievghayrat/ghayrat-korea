"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useApp } from "@/contexts/AppContext";
import type { Lang } from "@/lib/i18n";
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

const TEXT = {
  auction: { ru: "Аукцион", en: "Auction", tj: "Аукцион", uz: "Auksion" },
  lot: { ru: "Лот", en: "Lot", tj: "Лот", uz: "Lot" },
  previousPhoto: { ru: "Предыдущее фото", en: "Previous photo", tj: "Сурати қаблӣ", uz: "Oldingi rasm" },
  nextPhoto: { ru: "Следующее фото", en: "Next photo", tj: "Сурати баъдӣ", uz: "Keyingi rasm" },
  showPhoto: { ru: "Показать фото", en: "Show photo", tj: "Нишон додани сурат", uz: "Rasmni ko'rsatish" },
  back: { ru: "Назад к аукциону", en: "Back to auction", tj: "Бозгашт ба аукцион", uz: "Auksionga qaytish" },
  startPrice: { ru: "Стартовая цена", en: "Start price", tj: "Нархи оғоз", uz: "Boshlang'ich narx" },
  priceNote: {
    ru: "Эта цена указана без аукционной комиссии и доставки.",
    en: "This price is without auction commission and delivery.",
    tj: "Ин нарх бе комиссияи аукцион ва доставка нишон дода шудааст.",
    uz: "Bu narx auksion komissiyasi va yetkazib berishsiz ko'rsatilgan.",
  },
  ask: { ru: "Спросить об этом авто", en: "Ask about this car", tj: "Дар бораи ин мошин пурсед", uz: "Bu avtomobil haqida so'rash" },
  whatsapp: { ru: "WhatsApp", en: "WhatsApp", tj: "WhatsApp", uz: "WhatsApp" },
  telegram: { ru: "Telegram", en: "Telegram", tj: "Telegram", uz: "Telegram" },
  year: { ru: "Год", en: "Year", tj: "Сол", uz: "Yil" },
  mileage: { ru: "Пробег", en: "Mileage", tj: "Масофа", uz: "Yurgan masofasi" },
  fuel: { ru: "Топливо", en: "Fuel", tj: "Сӯзишворӣ", uz: "Yoqilg'i" },
  transmission: { ru: "КПП", en: "Transmission", tj: "КПП", uz: "Uzatma" },
  engine: { ru: "Двигатель", en: "Engine", tj: "Муҳаррик", uz: "Dvigatel" },
  location: { ru: "Локация", en: "Location", tj: "Ҷой", uz: "Joylashuv" },
  color: { ru: "Цвет", en: "Color", tj: "Ранг", uz: "Rang" },
  drive: { ru: "Привод", en: "Drive", tj: "Ҳаракат", uz: "Yetakchi" },
  km: { ru: "км", en: "km", tj: "км", uz: "km" },
} satisfies Record<string, Record<Lang, string>>;

function tr(key: keyof typeof TEXT, lang: Lang): string {
  return TEXT[key][lang] || TEXT[key].en;
}

export default function AuctionDetailClient({ car, images }: AuctionDetailClientProps) {
  const { formatKrwPrice, lang } = useApp();
  const [selectedImage, setSelectedImage] = useState(0);
  const [imageLoaded, setImageLoaded] = useState(false);
  const title = formatKCarName(car);
  const price = formatKrwPrice(kcarPriceToKrw(car.price));
  const contactMessage = `KCar auction: ${title}, lot ${car.lotNumber}, ${price}`;
  const whatsappUrl = `https://wa.me/821099221601?text=${encodeURIComponent(contactMessage)}`;
  const telegramUrl = `https://t.me/+821099221601`;
  const regYear = car.firstRegDate && car.firstRegDate.length >= 6
    ? `${car.firstRegDate.slice(0, 4)}/${car.firstRegDate.slice(4, 6)}`
    : String(car.year);

  const specs = useMemo(() => ([
    [tr("year", lang), regYear],
    [tr("mileage", lang), `${car.mileage.toLocaleString("ru-RU")} ${tr("km", lang)}`],
    [tr("fuel", lang), car.fuelType],
    [tr("transmission", lang), car.transmission],
    [tr("engine", lang), car.engineVolume ? `${car.engineVolume}cc` : car.engineTier || "-"],
    [tr("location", lang), car.location || "-"],
    [tr("color", lang), car.color || "-"],
    [tr("drive", lang), car.driveType || "-"],
    ["VIN", car.vin || "-"],
  ]), [car, regYear, lang]);

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
              <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                <div className="h-9 w-9 animate-spin rounded-full border-4 border-white/25 border-t-white" />
              </div>
            )}
            <img
              src={images[selectedImage] || images[0]}
              alt={title}
              className={`h-full w-full object-contain transition-opacity duration-200 ${imageLoaded ? "opacity-100" : "opacity-0"}`}
              loading="eager"
              decoding="async"
              fetchPriority="high"
              onLoad={() => setImageLoaded(true)}
            />
            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={showPreviousImage}
                  className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-gray-950 shadow-md transition hover:bg-white"
                  aria-label={tr("previousPhoto", lang)}
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={showNextImage}
                  className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-gray-950 shadow-md transition hover:bg-white"
                  aria-label={tr("nextPhoto", lang)}
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </>
            )}
            <div className="absolute left-3 top-3 rounded bg-white px-3 py-1 text-sm font-bold text-gray-950">
              {tr("auction", lang)} {formatKcarAuctionDate(car.auctionDate)}
            </div>
            {car.lotNumber && (
              <div className="absolute right-3 top-3 rounded bg-white/90 px-3 py-1 text-sm font-bold text-gray-950">
                {tr("lot", lang)} #{car.lotNumber}
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
                  aria-label={`${tr("showPhoto", lang)} ${index + 1}`}
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
          {tr("back", lang)}
        </Link>

        <section className="mb-4 rounded-xl border border-red-100 bg-white p-4 shadow-sm sm:p-5">
          <div className="text-xs font-bold uppercase tracking-wide text-gray-500">{tr("startPrice", lang)}</div>
          <div className="mt-1 text-3xl font-extrabold text-red-700">{price}</div>
          <div className="mt-2 rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold leading-snug text-red-800">
            {tr("priceNote", lang)}
          </div>
          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block rounded-lg bg-emerald-600 px-4 py-3 text-center text-sm font-bold text-white transition hover:bg-emerald-700 sm:px-6"
            >
              {tr("whatsapp", lang)}
            </a>
            <a
              href={telegramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block rounded-lg bg-sky-600 px-4 py-3 text-center text-sm font-bold text-white transition hover:bg-sky-700 sm:px-6"
            >
              {tr("telegram", lang)}
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
