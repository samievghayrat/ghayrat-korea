"use client";

import Link from "next/link";
import { useApp } from "@/contexts/AppContext";
import {
  formatKcarAuctionDate,
  formatKCarName,
  kcarPriceToKrw,
  resolveKCarImageUrl,
  type KCarAuctionCar,
} from "@/lib/kcar-auction";

interface AuctionCarCardProps {
  car: KCarAuctionCar;
  priority?: boolean;
  href?: string;
}

const RU = {
  auction: "\u0410\u0443\u043a\u0446\u0438\u043e\u043d",
  auctionStarted: "\u0410\u0443\u043a\u0446\u0438\u043e\u043d \u043d\u0430\u0447\u0430\u043b\u0441\u044f",
  untilAuction: "\u0414\u043e \u0430\u0443\u043a\u0446\u0438\u043e\u043d\u0430",
  startPrice: "\u0421\u0442\u0430\u0440\u0442\u043e\u0432\u0430\u044f \u0446\u0435\u043d\u0430",
  km: "\u043a\u043c",
  day: "\u0434",
  hour: "\u0447",
  min: "\u043c\u0438\u043d",
};

function translateFuel(value: string): string {
  const map: Record<string, string> = {
    Gasoline: "\u0411\u0435\u043d\u0437\u0438\u043d",
    Diesel: "\u0414\u0438\u0437\u0435\u043b\u044c",
    Hybrid: "\u0413\u0438\u0431\u0440\u0438\u0434",
    Electric: "\u042d\u043b\u0435\u043a\u0442\u0440\u043e",
    LPG: "\u0413\u0430\u0437 (LPG)",
  };
  return map[value] || value;
}

function formatRemainingTime(date: string): string {
  const target = new Date(`${date}T09:00:00+09:00`).getTime();
  const diff = target - Date.now();
  if (!date || diff <= 0) return RU.auctionStarted;
  const totalMinutes = Math.ceil(diff / 60000);
  const days = Math.floor(totalMinutes / 1440);
  const hours = Math.floor((totalMinutes % 1440) / 60);
  if (days > 0) return `${RU.untilAuction}: ${days}${RU.day} ${hours}${RU.hour}`;
  return `${RU.untilAuction}: ${hours}${RU.hour} ${totalMinutes % 60}${RU.min}`;
}

export default function AuctionCarCard({ car, priority = false, href }: AuctionCarCardProps) {
  const { formatKrwPrice } = useApp();
  const title = formatKCarName(car);
  const regYear =
    car.firstRegDate && car.firstRegDate.length >= 6
      ? `${car.firstRegDate.slice(0, 4)}/${car.firstRegDate.slice(4, 6)}`
      : String(car.year);

  return (
    <Link
      href={href || `/auction/${car.id}`}
      className="group overflow-hidden rounded-lg border border-red-100 bg-white shadow-sm transition-all duration-200 hover:border-red-200 hover:shadow-md"
    >
      <div className="relative aspect-[16/9] overflow-hidden bg-gray-100">
        <img
          src={resolveKCarImageUrl(car.image)}
          alt={title}
          className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          fetchPriority={priority ? "high" : "auto"}
        />
        <div className="absolute left-2 top-2 rounded bg-red-600 px-2 py-1 text-[11px] font-bold text-white">
          {RU.auction} {formatKcarAuctionDate(car.auctionDate)}
        </div>
        {car.lotNumber && (
          <div className="absolute right-2 top-2 rounded bg-white/90 px-2 py-1 text-[11px] font-bold text-gray-800 shadow-sm">
            #{car.lotNumber}
          </div>
        )}
      </div>

      <div className="p-3">
        <h3 className="line-clamp-2 text-[15px] font-bold leading-snug text-gray-950 group-hover:text-primary">
          {title}
        </h3>

        <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[12px] font-medium text-gray-600">
          <span>{regYear}</span>
          <span className="text-gray-300">/</span>
          <span>{car.mileage.toLocaleString("ru-RU")} {RU.km}</span>
          <span className="text-gray-300">/</span>
          <span>{translateFuel(car.fuelType)}</span>
          {car.engineVolume && (
            <>
              <span className="text-gray-300">/</span>
              <span>{car.engineVolume}cc</span>
            </>
          )}
        </div>
        <div className="mt-2 text-[12px] font-bold text-red-700">{formatRemainingTime(car.auctionDate)}</div>

        <div className="mt-2.5 rounded-md bg-red-50/80 px-3 py-2">
          <div className="flex items-baseline justify-between gap-2">
            <div className="text-[11px] font-semibold text-red-700/75">{RU.startPrice}</div>
            <div className="shrink-0 text-lg font-extrabold leading-tight text-red-700">
              {formatKrwPrice(kcarPriceToKrw(car.price))}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
