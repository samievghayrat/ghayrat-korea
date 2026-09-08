"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useApp } from "@/contexts/AppContext";
import { localizeVehicleValue, type Lang } from "@/lib/i18n";
import { AUCTION_COPY, type AuctionCopy } from "@/lib/page-copy";
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

const HIGH_VALUE_THRESHOLD_KRW = 10000000;
const LOW_VALUE_EXTRA_COST_USD = 300;
const HIGH_VALUE_BASE_EXTRA_COST_USD = 200;
const HIGH_VALUE_EXTRA_COST_RATE = 0.022;
const AUCTION_USD_TO_KRW = 1450;

function getAuctionTargetTime(date: string): number {
  return new Date(`${date}T09:00:00+09:00`).getTime();
}

function formatRemainingTime(date: string, copy: AuctionCopy): string {
  const diff = getAuctionTargetTime(date) - Date.now();
  if (!date || diff <= 0) return copy.started;
  const totalMinutes = Math.ceil(diff / 60000);
  const days = Math.floor(totalMinutes / 1440);
  const hours = Math.floor((totalMinutes % 1440) / 60);
  const minutes = totalMinutes % 60;
  if (days > 0) return `${days}${copy.dayShort} ${hours}${copy.hourShort} ${minutes}${copy.minuteShort}`;
  return `${hours}${copy.hourShort} ${minutes}${copy.minuteShort}`;
}

function translateValue(value: string | null | undefined, lang: Lang, copy: AuctionCopy): string {
  if (!value) return "-";
  if (value === "\uc138\uc885\uacbd\ub9e4\uc7a5") return copy.sejong;
  return localizeVehicleValue(value, lang) || value;
}

export default function AuctionDetailClient({ car, images }: AuctionDetailClientProps) {
  const { t, lang, currency, convertKrwPrice, convertCurrentToKrw, formatKrwPrice, formatMileage } = useApp();
  const copy = AUCTION_COPY[lang];
  const searchParams = useSearchParams();
  const [selectedImage, setSelectedImage] = useState(0);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [remainingTime, setRemainingTime] = useState(() => formatRemainingTime(car.auctionDate, copy));
  const title = formatKCarName(car);
  const startPriceKrw = kcarPriceToKrw(car.price);
  const hasStartPrice = startPriceKrw > 0;
  const [bidKrw, setBidKrw] = useState(startPriceKrw);
  const [bidInput, setBidInput] = useState(() => String(convertKrwPrice(startPriceKrw)));
  const price = hasStartPrice ? formatKrwPrice(startPriceKrw) : copy.pricePending;
  const minBidInputValue = convertKrwPrice(startPriceKrw);
  const currencySymbol = { RUB: "\u20bd", USD: "$", EUR: "\u20ac", KRW: "\u20a9", TJS: "с." }[currency];
  const bidStep = currency === "KRW" ? 100000 : currency === "USD" || currency === "EUR" ? 100 : currency === "TJS" ? 1000 : 10000;
  const extraCostsKrw =
    bidKrw > HIGH_VALUE_THRESHOLD_KRW
      ? Math.round(HIGH_VALUE_BASE_EXTRA_COST_USD * AUCTION_USD_TO_KRW + bidKrw * HIGH_VALUE_EXTRA_COST_RATE)
      : LOW_VALUE_EXTRA_COST_USD * AUCTION_USD_TO_KRW;
  const totalKrw = bidKrw + extraCostsKrw;
  const formatAuctionAmount = (amountKrw: number, options?: { baseKrw?: number }) => {
    if (currency === "USD") {
      const amountUsd = Math.round(amountKrw / AUCTION_USD_TO_KRW);
      return `${amountUsd.toLocaleString("en-US")} $`;
    }
    if (currency === "KRW") return `${amountKrw.toLocaleString("ko-KR")} \u20a9`;
    if (currency === "TJS") return formatKrwPrice(amountKrw);
    if (options?.baseKrw) {
      const baseDisplay = convertKrwPrice(options.baseKrw);
      const extraDisplay = Math.round((amountKrw - options.baseKrw) / AUCTION_USD_TO_KRW);
      return `${(baseDisplay + extraDisplay).toLocaleString("ru-RU")} ${currencySymbol}`;
    }
    return formatKrwPrice(amountKrw);
  };
  const contactMessage = [
    `KCar ${copy.auction}: ${title}`,
    car.lotNumber ? `${copy.lot}: ${car.lotNumber}` : null,
    `${copy.startPrice}: ${price}`,
    hasStartPrice ? `${copy.yourBid}: ${formatAuctionAmount(bidKrw)}` : copy.pricePendingNote,
    hasStartPrice ? `${copy.extraCosts}: ${formatAuctionAmount(extraCostsKrw)}` : null,
    hasStartPrice ? `${copy.total}: ${formatAuctionAmount(totalKrw, { baseKrw: bidKrw })}` : null,
  ].filter(Boolean).join("\n");
  const whatsappUrl = `https://wa.me/821099221601?text=${encodeURIComponent(contactMessage)}`;
  const backHref = searchParams.toString() ? `/auction?${searchParams.toString()}` : "/auction";
  const currentImage = images[selectedImage] || images[0] || "/images/no-image.svg";
  const regYear = car.firstRegDate && car.firstRegDate.length >= 6
    ? `${car.firstRegDate.slice(0, 4)}/${car.firstRegDate.slice(4, 6)}`
    : String(car.year);

  const specs = useMemo(() => ([
    [t('filter.year'), regYear],
    [t('spec.mileage'), formatMileage(car.mileage)],
    [t('spec.fuel'), translateValue(car.fuelType, lang, copy)],
    [t('spec.trans'), translateValue(car.transmission, lang, copy)],
    [t('spec.engine'), car.engineVolume ? `${car.engineVolume} ${t('spec.cc')}` : "-"],
    [copy.location, translateValue(car.location, lang, copy)],
    [t('spec.color'), translateValue(car.color, lang, copy)],
    [copy.drive, translateValue(car.driveType, lang, copy)],
    ["VIN", car.vin || "-"],
  ]), [car, regYear, t, formatMileage, lang, copy]);

  useEffect(() => {
    setRemainingTime(formatRemainingTime(car.auctionDate, copy));
    const timer = window.setInterval(() => {
      setRemainingTime(formatRemainingTime(car.auctionDate, copy));
    }, 60000);
    return () => window.clearInterval(timer);
  }, [car.auctionDate, copy]);

  useEffect(() => {
    setBidInput(String(convertKrwPrice(bidKrw)));
  }, [bidKrw, convertKrwPrice, currency]);

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
      <div className="bg-gray-50 px-4 pt-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="relative aspect-[16/10] bg-gray-100 sm:aspect-[16/9]">
            {!imageLoaded && (
              <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center bg-gray-100/70">
                <div className="h-9 w-9 animate-spin rounded-full border-4 border-gray-300 border-t-red-600" />
              </div>
            )}
            <img
              key={currentImage}
              src={currentImage}
              alt={title}
              className="h-full w-full object-cover"
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
                  aria-label={t('gallery.previous')}
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={showNextImage}
                  className="absolute right-3 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-gray-950 shadow-md transition hover:bg-white"
                  aria-label={t('gallery.next')}
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </>
            )}
            <div className="absolute left-3 top-3 z-20 rounded bg-white px-3 py-1 text-sm font-bold text-gray-950">
              {copy.auction} {formatKcarAuctionDate(car.auctionDate)}
            </div>
            {car.lotNumber && (
              <div className="absolute right-3 top-3 z-20 rounded bg-white/90 px-3 py-1 text-sm font-bold text-gray-950">
                {car.lotNumber}
              </div>
            )}
          </div>
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto bg-white px-3 py-3">
              {images.map((image, index) => (
                <button
                  key={`${image}-${index}`}
                  type="button"
                  onClick={() => {
                    setImageLoaded(false);
                    setSelectedImage(index);
                  }}
                  className={`relative h-16 w-24 flex-shrink-0 overflow-hidden rounded-md border ${
                    selectedImage === index ? "border-red-500" : "border-gray-200"
                  }`}
                  aria-label={`${copy.showPhoto} ${index + 1}`}
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
          {copy.back}
        </Link>

        <div className="grid gap-4">
          <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
            <h1 className="text-2xl font-extrabold text-gray-950">{title}</h1>
            <div className="mt-3 inline-flex rounded-lg bg-red-50 px-3 py-2 text-sm font-extrabold text-red-700">
              {copy.remaining}: {remainingTime}
            </div>

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
            <div className="flex items-center justify-between gap-3 border-b border-gray-200 pb-4">
              <div className="text-sm font-extrabold uppercase tracking-wide text-gray-500">{copy.startPrice}</div>
              <div className="text-2xl font-extrabold text-red-700 sm:text-right">{price}</div>
            </div>

            {hasStartPrice ? (
              <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4">
                <div className="space-y-3">
                  <label className="block">
                    <span className="mb-1 block text-xs font-bold uppercase tracking-wide text-gray-500">
                      {copy.yourBid}, {currencySymbol}
                    </span>
                    <input
                      type="number"
                      min={minBidInputValue}
                      step={bidStep}
                      value={bidInput}
                      onChange={(event) => {
                        const value = event.target.value;
                        setBidInput(value);
                        if (value === "") return;
                        setBidKrw(convertCurrentToKrw(Number(value) || 0));
                      }}
                      onBlur={() => {
                        const nextBidKrw = convertCurrentToKrw(Number(bidInput) || 0);
                        const clampedBidKrw = Math.max(startPriceKrw, nextBidKrw);
                        setBidKrw(clampedBidKrw);
                        setBidInput(String(convertKrwPrice(clampedBidKrw)));
                      }}
                      className="h-12 w-full rounded-lg border border-gray-200 bg-white px-3 text-base font-bold text-gray-950 outline-none transition focus:border-red-300 focus:ring-2 focus:ring-red-100"
                    />
                  </label>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-gray-500">
                        <strong className="font-bold text-gray-700">{copy.extraCosts}</strong>: {copy.extraCostsNote}
                      </span>
                      <span className="font-bold text-gray-950">{formatAuctionAmount(extraCostsKrw)}</span>
                    </div>
                    <div className="border-t border-gray-200 pt-3">
                      <div className="flex items-center justify-between gap-3 text-base">
                        <span className="font-extrabold text-gray-950">{copy.total}</span>
                        <span className="font-extrabold text-red-700">{formatAuctionAmount(totalKrw, { baseKrw: bidKrw })}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-900">
                {copy.pricePendingNote}
              </div>
            )}

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex w-full justify-center rounded-lg bg-emerald-600 px-6 py-4 text-center text-base font-extrabold text-white transition hover:bg-emerald-700"
            >
              {hasStartPrice ? copy.makeBid : copy.askPrice}
            </a>
          </section>
        </div>
      </div>
    </div>
  );
}
