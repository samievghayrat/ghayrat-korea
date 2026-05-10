"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
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

const HIGH_VALUE_THRESHOLD_KRW = 10000000;
const LOW_VALUE_EXTRA_COST_USD = 300;
const HIGH_VALUE_BASE_EXTRA_COST_USD = 200;
const HIGH_VALUE_EXTRA_COST_RATE = 0.022;
const AUCTION_USD_TO_KRW = 1450;

const RU = {
  auction: "\u0410\u0443\u043a\u0446\u0438\u043e\u043d",
  previousPhoto: "\u041f\u0440\u0435\u0434\u044b\u0434\u0443\u0449\u0435\u0435 \u0444\u043e\u0442\u043e",
  nextPhoto: "\u0421\u043b\u0435\u0434\u0443\u044e\u0449\u0435\u0435 \u0444\u043e\u0442\u043e",
  showPhoto: "\u041f\u043e\u043a\u0430\u0437\u0430\u0442\u044c \u0444\u043e\u0442\u043e",
  lot: "\u041b\u043e\u0442",
  back: "\u041d\u0430\u0437\u0430\u0434 \u043a \u0430\u0443\u043a\u0446\u0438\u043e\u043d\u0443",
  year: "\u0413\u043e\u0434",
  mileage: "\u041f\u0440\u043e\u0431\u0435\u0433",
  fuel: "\u0422\u043e\u043f\u043b\u0438\u0432\u043e",
  transmission: "\u041a\u041f\u041f",
  engine: "\u0414\u0432\u0438\u0433\u0430\u0442\u0435\u043b\u044c",
  location: "\u041b\u043e\u043a\u0430\u0446\u0438\u044f",
  color: "\u0426\u0432\u0435\u0442",
  drive: "\u041f\u0440\u0438\u0432\u043e\u0434",
  startPrice: "\u0421\u0442\u0430\u0440\u0442\u043e\u0432\u0430\u044f \u0446\u0435\u043d\u0430 \u0430\u0443\u043a\u0446\u0438\u043e\u043d\u0430",
  priceNote: "\u042d\u0442\u0430 \u0446\u0435\u043d\u0430 \u0443\u043a\u0430\u0437\u0430\u043d\u0430 \u0431\u0435\u0437 \u0434\u043e\u043f\u043e\u043b\u043d\u0438\u0442\u0435\u043b\u044c\u043d\u044b\u0445 \u0440\u0430\u0441\u0445\u043e\u0434\u043e\u0432.",
  makeBid: "\u0421\u0434\u0435\u043b\u0430\u0442\u044c \u0441\u0442\u0430\u0432\u043a\u0443 \u0432 WhatsApp",
  bidCalc: "\u0420\u0430\u0441\u0447\u0435\u0442 \u0441\u0442\u0430\u0432\u043a\u0438",
  yourBid: "\u0412\u0430\u0448\u0430 \u0441\u0442\u0430\u0432\u043a\u0430",
  bidAmount: "\u0421\u0443\u043c\u043c\u0430 \u0441\u0442\u0430\u0432\u043a\u0438",
  extraCosts: "\u0414\u0440\u0443\u0433\u0438\u0435 \u0440\u0430\u0441\u0445\u043e\u0434\u044b",
  total: "\u0418\u0442\u043e\u0433\u043e",
  extraCostsNote: "\u0414\u0440\u0443\u0433\u0438\u0435 \u0440\u0430\u0441\u0445\u043e\u0434\u044b: \u043a\u043e\u043c\u0438\u0441\u0441\u0438\u044f \u0430\u0443\u043a\u0446\u0438\u043e\u043d\u0430, \u0434\u043e\u0441\u0442\u0430\u0432\u043a\u0430 \u0438 \u0443\u0441\u043b\u0443\u0433\u0430.",
  gasoline: "\u0411\u0435\u043d\u0437\u0438\u043d",
  diesel: "\u0414\u0438\u0437\u0435\u043b\u044c",
  hybrid: "\u0413\u0438\u0431\u0440\u0438\u0434",
  electric: "\u042d\u043b\u0435\u043a\u0442\u0440\u043e",
  lpg: "\u0413\u0430\u0437 (LPG)",
  automatic: "\u0410\u0432\u0442\u043e\u043c\u0430\u0442",
  manual: "\u041c\u0435\u0445\u0430\u043d\u0438\u043a\u0430",
  other: "\u0414\u0440\u0443\u0433\u043e\u0435",
  white: "\u0411\u0435\u043b\u044b\u0439",
  black: "\u0427\u0435\u0440\u043d\u044b\u0439",
  silver: "\u0421\u0435\u0440\u0435\u0431\u0440\u0438\u0441\u0442\u044b\u0439",
  gray: "\u0421\u0435\u0440\u044b\u0439",
  sejong: "\u0421\u0435\u0434\u0436\u043e\u043d, \u0430\u0443\u043a\u0446\u0438\u043e\u043d\u043d\u0430\u044f \u043f\u043b\u043e\u0449\u0430\u0434\u043a\u0430",
  remaining: "\u0414\u043e \u0430\u0443\u043a\u0446\u0438\u043e\u043d\u0430",
  started: "\u0410\u0443\u043a\u0446\u0438\u043e\u043d \u043d\u0430\u0447\u0430\u043b\u0441\u044f",
  dayShort: "\u0434",
  hourShort: "\u0447",
  minuteShort: "\u043c\u0438\u043d",
};

function getAuctionTargetTime(date: string): number {
  return new Date(`${date}T09:00:00+09:00`).getTime();
}

function formatRemainingTime(date: string): string {
  const diff = getAuctionTargetTime(date) - Date.now();
  if (!date || diff <= 0) return RU.started;
  const totalMinutes = Math.ceil(diff / 60000);
  const days = Math.floor(totalMinutes / 1440);
  const hours = Math.floor((totalMinutes % 1440) / 60);
  const minutes = totalMinutes % 60;
  if (days > 0) return `${days}${RU.dayShort} ${hours}${RU.hourShort} ${minutes}${RU.minuteShort}`;
  return `${hours}${RU.hourShort} ${minutes}${RU.minuteShort}`;
}

function translateValue(value: string | null | undefined): string {
  if (!value) return "-";
  const map: Record<string, string> = {
    Gasoline: RU.gasoline,
    Diesel: RU.diesel,
    Hybrid: RU.hybrid,
    Electric: RU.electric,
    LPG: RU.lpg,
    Automatic: RU.automatic,
    Manual: RU.manual,
    "\uae30\ud0c0": RU.other,
    "\ud770\uc0c9": RU.white,
    "\uac80\uc815\uc0c9": RU.black,
    "\uc740\uc0c9": RU.silver,
    "\ud68c\uc0c9": RU.gray,
    "\uc138\uc885\uacbd\ub9e4\uc7a5": RU.sejong,
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
  const [remainingTime, setRemainingTime] = useState(() => formatRemainingTime(car.auctionDate));
  const title = formatKCarName(car);
  const startPriceKrw = kcarPriceToKrw(car.price);
  const [bidKrw, setBidKrw] = useState(startPriceKrw);
  const [bidInput, setBidInput] = useState(() => String(convertKrwPrice(startPriceKrw)));
  const price = formatKrwPrice(startPriceKrw);
  const minBidInputValue = convertKrwPrice(startPriceKrw);
  const currencySymbol = { RUB: "\u20bd", USD: "$", EUR: "\u20ac", KRW: "\u20a9" }[currency];
  const bidStep = currency === "KRW" ? 100000 : currency === "USD" || currency === "EUR" ? 100 : 10000;
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
    if (options?.baseKrw) {
      const baseDisplay = convertKrwPrice(options.baseKrw);
      const extraDisplay = Math.round((amountKrw - options.baseKrw) / AUCTION_USD_TO_KRW);
      return `${(baseDisplay + extraDisplay).toLocaleString("ru-RU")} ${currencySymbol}`;
    }
    return formatKrwPrice(amountKrw);
  };
  const contactMessage = [
    `KCar auction: ${title}`,
    car.lotNumber ? `Lot: ${car.lotNumber}` : null,
    `Start price: ${price}`,
    `My bid: ${formatAuctionAmount(bidKrw)}`,
    `Other costs: ${formatAuctionAmount(extraCostsKrw)}`,
    `Total: ${formatAuctionAmount(totalKrw, { baseKrw: bidKrw })}`,
  ].filter(Boolean).join("\n");
  const whatsappUrl = `https://wa.me/821099221601?text=${encodeURIComponent(contactMessage)}`;
  const backHref = searchParams.toString() ? `/auction?${searchParams.toString()}` : "/auction";
  const currentImage = images[selectedImage] || images[0] || "/images/no-image.svg";
  const regYear = car.firstRegDate && car.firstRegDate.length >= 6
    ? `${car.firstRegDate.slice(0, 4)}/${car.firstRegDate.slice(4, 6)}`
    : String(car.year);

  const specs = useMemo(() => ([
    [RU.year, regYear],
    [RU.mileage, `${car.mileage.toLocaleString("ru-RU")} \u043a\u043c`],
    [RU.fuel, translateValue(car.fuelType)],
    [RU.transmission, translateValue(car.transmission)],
    [RU.engine, car.engineVolume ? `${car.engineVolume}cc` : "-"],
    [RU.location, translateValue(car.location)],
    [RU.color, translateValue(car.color)],
    [RU.drive, translateValue(car.driveType)],
    ["VIN", car.vin || "-"],
  ]), [car, regYear]);

  useEffect(() => {
    setRemainingTime(formatRemainingTime(car.auctionDate));
    const timer = window.setInterval(() => {
      setRemainingTime(formatRemainingTime(car.auctionDate));
    }, 60000);
    return () => window.clearInterval(timer);
  }, [car.auctionDate]);

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
                  aria-label={RU.previousPhoto}
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={showNextImage}
                  className="absolute right-3 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-gray-950 shadow-md transition hover:bg-white"
                  aria-label={RU.nextPhoto}
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </>
            )}
            <div className="absolute left-3 top-3 z-20 rounded bg-white px-3 py-1 text-sm font-bold text-gray-950">
              {RU.auction} {formatKcarAuctionDate(car.auctionDate)}
            </div>
            {car.lotNumber && (
              <div className="absolute right-3 top-3 z-20 rounded bg-white/90 px-3 py-1 text-sm font-bold text-gray-950">
                {car.lotNumber}
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
                  aria-label={`${RU.showPhoto} ${index + 1}`}
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
          {RU.back}
        </Link>

        <div className="grid gap-4">
          <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
            <h1 className="text-2xl font-extrabold text-gray-950">{title}</h1>
            <div className="mt-3 inline-flex rounded-lg bg-red-50 px-3 py-2 text-sm font-extrabold text-red-700">
              {RU.remaining}: {remainingTime}
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
              <div className="text-sm font-extrabold uppercase tracking-wide text-gray-500">{RU.startPrice}</div>
              <div className="text-2xl font-extrabold text-red-700 sm:text-right">{price}</div>
            </div>

            <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4">
              <div className="space-y-3">
                <label className="block">
                  <span className="mb-1 block text-xs font-bold uppercase tracking-wide text-gray-500">
                    {RU.yourBid}, {currencySymbol}
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
                      <strong className="font-bold text-gray-700">{RU.extraCosts}</strong>: {"\u043a\u043e\u043c\u0438\u0441\u0441\u0438\u044f \u0430\u0443\u043a\u0446\u0438\u043e\u043d\u0430, \u0434\u043e\u0441\u0442\u0430\u0432\u043a\u0430 \u0438 \u0443\u0441\u043b\u0443\u0433\u0430."}
                    </span>
                    <span className="font-bold text-gray-950">{formatAuctionAmount(extraCostsKrw)}</span>
                  </div>
                  <div className="border-t border-gray-200 pt-3">
                    <div className="flex items-center justify-between gap-3 text-base">
                      <span className="font-extrabold text-gray-950">{RU.total}</span>
                      <span className="font-extrabold text-red-700">{formatAuctionAmount(totalKrw, { baseKrw: bidKrw })}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex w-full justify-center rounded-lg bg-emerald-600 px-6 py-4 text-center text-base font-extrabold text-white transition hover:bg-emerald-700"
            >
              {RU.makeBid}
            </a>
          </section>
        </div>
      </div>
    </div>
  );
}
