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

const USD_TO_KRW_FOR_AUCTION_FEES = 1400;
const HIGH_VALUE_THRESHOLD_KRW = 10000000;
const LOW_VALUE_EXTRA_COST_USD = 300;
const HIGH_VALUE_BASE_EXTRA_COST_USD = 200;
const HIGH_VALUE_EXTRA_COST_RATE = 0.022;

function translateValue(value: string | null | undefined): string {
  if (!value) return "-";
  const map: Record<string, string> = {
    Gasoline: "Ð‘ÐµÐ½Ð·Ð¸Ð½",
    Diesel: "Ð”Ð¸Ð·ÐµÐ»ÑŒ",
    Hybrid: "Ð“Ð¸Ð±Ñ€Ð¸Ð´",
    Electric: "Ð­Ð»ÐµÐºÑ‚Ñ€Ð¾",
    LPG: "Ð“Ð°Ð· (LPG)",
    Automatic: "ÐÐ²Ñ‚Ð¾Ð¼Ð°Ñ‚",
    Manual: "ÐœÐµÑ…Ð°Ð½Ð¸ÐºÐ°",
    "ê¸°íƒ€": "Ð”Ñ€ÑƒÐ³Ð¾Ðµ",
    "í°ìƒ‰": "Ð‘ÐµÐ»Ñ‹Ð¹",
    "ê²€ì •ìƒ‰": "Ð§ÐµÑ€Ð½Ñ‹Ð¹",
    "ì€ìƒ‰": "Ð¡ÐµÑ€ÐµÐ±Ñ€Ð¸ÑÑ‚Ñ‹Ð¹",
    "íšŒìƒ‰": "Ð¡ÐµÑ€Ñ‹Ð¹",
    "ì„¸ì¢…ê²½ë§¤ìž¥": "Ð¡ÐµÐ´Ð¶Ð¾Ð½, Ð°ÑƒÐºÑ†Ð¸Ð¾Ð½Ð½Ð°Ñ Ð¿Ð»Ð¾Ñ‰Ð°Ð´ÐºÐ°",
    "2WD": "2WD",
    "4WD": "4WD",
    AWD: "AWD",
  };
  return map[value] || value;
}

export default function AuctionDetailClient({ car, images }: AuctionDetailClientProps) {
  const { currency, convertKrwPrice, convertCurrentToKrw, formatKrwPrice } = useApp();
  const searchParams = useSearchParams();
  const [selectedImage, setSelectedImage] = useState(0);
  const [imageLoaded, setImageLoaded] = useState(false);
  const title = formatKCarName(car);
  const startPriceKrw = kcarPriceToKrw(car.price);
  const [bidKrw, setBidKrw] = useState(startPriceKrw);
  const bidInputValue = convertKrwPrice(bidKrw);
  const currencySymbol = { RUB: "â‚½", USD: "$", EUR: "â‚¬", KRW: "â‚©" }[currency];
  const bidStep = currency === "KRW" ? 100000 : currency === "USD" || currency === "EUR" ? 100 : 10000;
  const price = formatKrwPrice(startPriceKrw);
  const extraCostsKrw =
    bidKrw > HIGH_VALUE_THRESHOLD_KRW
      ? Math.round(HIGH_VALUE_BASE_EXTRA_COST_USD * USD_TO_KRW_FOR_AUCTION_FEES + bidKrw * HIGH_VALUE_EXTRA_COST_RATE)
      : LOW_VALUE_EXTRA_COST_USD * USD_TO_KRW_FOR_AUCTION_FEES;
  const totalKrw = bidKrw + extraCostsKrw;
  const contactMessage = `KCar auction: ${title}, lot ${car.lotNumber}, ${price}`;
  const whatsappUrl = `https://wa.me/821099221601?text=${encodeURIComponent(contactMessage)}`;
  const backHref = searchParams.toString() ? `/auction?${searchParams.toString()}` : "/auction";
  const currentImage = images[selectedImage] || images[0] || "/images/no-image.svg";
  const regYear = car.firstRegDate && car.firstRegDate.length >= 6
    ? `${car.firstRegDate.slice(0, 4)}/${car.firstRegDate.slice(4, 6)}`
    : String(car.year);

  const specs = useMemo(() => ([
    ["Ð“Ð¾Ð´", regYear],
    ["ÐŸÑ€Ð¾Ð±ÐµÐ³", `${car.mileage.toLocaleString("ru-RU")} ÐºÐ¼`],
    ["Ð¢Ð¾Ð¿Ð»Ð¸Ð²Ð¾", translateValue(car.fuelType)],
    ["ÐšÐŸÐŸ", translateValue(car.transmission)],
    ["Ð”Ð²Ð¸Ð³Ð°Ñ‚ÐµÐ»ÑŒ", car.engineVolume ? `${car.engineVolume}cc` : car.engineTier || "-"],
    ["Ð›Ð¾ÐºÐ°Ñ†Ð¸Ñ", translateValue(car.location)],
    ["Ð¦Ð²ÐµÑ‚", translateValue(car.color)],
    ["ÐŸÑ€Ð¸Ð²Ð¾Ð´", translateValue(car.driveType)],
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
                  aria-label="ÐŸÑ€ÐµÐ´Ñ‹Ð´ÑƒÑ‰ÐµÐµ Ñ„Ð¾Ñ‚Ð¾"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={showNextImage}
                  className="absolute right-3 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-gray-950 shadow-md transition hover:bg-white"
                  aria-label="Ð¡Ð»ÐµÐ´ÑƒÑŽÑ‰ÐµÐµ Ñ„Ð¾Ñ‚Ð¾"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </>
            )}
            <div className="absolute left-3 top-3 z-20 rounded bg-white px-3 py-1 text-sm font-bold text-gray-950">
              ÐÑƒÐºÑ†Ð¸Ð¾Ð½ {formatKcarAuctionDate(car.auctionDate)}
            </div>
            {car.lotNumber && (
              <div className="absolute right-3 top-3 z-20 rounded bg-white/90 px-3 py-1 text-sm font-bold text-gray-950">
                Ð›Ð¾Ñ‚ #{car.lotNumber}
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
                  aria-label={`ÐŸÐ¾ÐºÐ°Ð·Ð°Ñ‚ÑŒ Ñ„Ð¾Ñ‚Ð¾ ${index + 1}`}
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
          ÐÐ°Ð·Ð°Ð´ Ðº Ð°ÑƒÐºÑ†Ð¸Ð¾Ð½Ñƒ
        </Link>

        <div className="grid gap-4">
          <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
            <h1 className="text-2xl font-extrabold text-gray-950">{title}</h1>
            <p className="mt-1 text-sm font-semibold text-gray-500">
              Ð›Ð¾Ñ‚ #{car.lotNumber || "-"} Â· ÐÑƒÐºÑ†Ð¸Ð¾Ð½ {formatKcarAuctionDate(car.auctionDate)}
            </p>

            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {specs.map(([label, value]) => (
                <div key={label} className="rounded-lg bg-gray-50 px-3 py-2">
                  <div className="text-[11px] font-bold uppercase tracking-wide text-gray-400">{label}</div>
                  <div className="mt-1 text-sm font-bold text-gray-900">{value}</div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-xl border border-red-100 bg-white p-4 shadow-sm sm:p-5">
            <div className="grid gap-4 lg:grid-cols-[0.85fr_1.15fr]">
              <div className="rounded-xl bg-red-50 p-4">
                <div className="text-xs font-bold uppercase tracking-wide text-red-700">Ð¡Ñ‚Ð°Ñ€Ñ‚Ð¾Ð²Ð°Ñ Ñ†ÐµÐ½Ð° Ð°ÑƒÐºÑ†Ð¸Ð¾Ð½Ð°</div>
                <div className="mt-2 text-3xl font-extrabold text-red-700">{price}</div>
                <p className="mt-3 text-sm font-semibold leading-snug text-red-800">
                  Ð­Ñ‚Ð° Ñ†ÐµÐ½Ð° ÑƒÐºÐ°Ð·Ð°Ð½Ð° Ð±ÐµÐ· Ð´Ð¾Ð¿Ð¾Ð»Ð½Ð¸Ñ‚ÐµÐ»ÑŒÐ½Ñ‹Ñ… Ñ€Ð°ÑÑ…Ð¾Ð´Ð¾Ð².
                </p>
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex w-full justify-center rounded-lg bg-emerald-600 px-6 py-3 text-center text-sm font-bold text-white transition hover:bg-emerald-700 sm:w-auto"
                >
                  Ð¡Ð´ÐµÐ»Ð°Ñ‚ÑŒ ÑÑ‚Ð°Ð²ÐºÑƒ
                </a>
              </div>

              <div className="rounded-xl border border-gray-200 bg-gray-50">
                <div className="border-b border-gray-200 px-4 py-3 text-xs font-extrabold uppercase tracking-wide text-gray-500">
                  Ð Ð°ÑÑ‡ÐµÑ‚ ÑÑ‚Ð°Ð²ÐºÐ¸
                </div>
                <div className="space-y-3 p-4">
                  <label className="block">
                    <span className="mb-1 block text-xs font-bold uppercase tracking-wide text-gray-500">Ваша ставка, {currencySymbol}</span>
                    <input
                      type="number"
                      min={0}
                      step={bidStep}
                      value={bidInputValue}
                      onChange={(event) => setBidKrw(convertCurrentToKrw(Math.max(0, Number(event.target.value) || 0)))}
                      className="h-12 w-full rounded-lg border border-gray-200 bg-white px-3 text-base font-bold text-gray-950 outline-none transition focus:border-red-300 focus:ring-2 focus:ring-red-100"
                    />
                  </label>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-gray-500">Ð¡ÑƒÐ¼Ð¼Ð° ÑÑ‚Ð°Ð²ÐºÐ¸</span>
                      <span className="font-bold text-gray-950">{formatKrwPrice(bidKrw)}</span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-gray-500">Ð”Ñ€ÑƒÐ³Ð¸Ðµ Ñ€Ð°ÑÑ…Ð¾Ð´Ñ‹</span>
                      <span className="font-bold text-gray-950">{formatKrwPrice(extraCostsKrw)}</span>
                    </div>
                    <div className="border-t border-gray-200 pt-3">
                      <div className="flex items-center justify-between gap-3 text-base">
                        <span className="font-extrabold text-gray-950">Ð˜Ñ‚Ð¾Ð³Ð¾</span>
                        <span className="font-extrabold text-red-700">{formatKrwPrice(totalKrw)}</span>
                      </div>
                      <p className="mt-2 text-xs font-semibold leading-snug text-gray-500">
                        Ð”Ñ€ÑƒÐ³Ð¸Ðµ Ñ€Ð°ÑÑ…Ð¾Ð´Ñ‹: ÐºÐ¾Ð¼Ð¸ÑÑÐ¸Ñ Ð°ÑƒÐºÑ†Ð¸Ð¾Ð½Ð°, Ð´Ð¾ÑÑ‚Ð°Ð²ÐºÐ° Ð¸ ÑƒÑÐ»ÑƒÐ³Ð°.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

