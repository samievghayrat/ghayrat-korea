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
}

export default function AuctionCarCard({ car, priority = false }: AuctionCarCardProps) {
  const { formatKrwPrice } = useApp();
  const title = formatKCarName(car);
  const regYear = car.firstRegDate && car.firstRegDate.length >= 6
    ? `${car.firstRegDate.slice(0, 4)}/${car.firstRegDate.slice(4, 6)}`
    : String(car.year);

  return (
    <Link
      href={`/auction/${car.id}`}
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
          Аукцион {formatKcarAuctionDate(car.auctionDate)}
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
          <span>{car.mileage.toLocaleString("ru-RU")} км</span>
          <span className="text-gray-300">/</span>
          <span>{car.fuelType}</span>
          {car.engineVolume && (
            <>
              <span className="text-gray-300">/</span>
              <span>{car.engineVolume}cc</span>
            </>
          )}
        </div>

        <div className="mt-2.5 rounded-md bg-red-50/80 px-3 py-2">
          <div className="flex items-baseline justify-between gap-2">
            <div className="text-[11px] font-semibold text-red-700/75">Стартовая цена</div>
            <div className="shrink-0 text-lg font-extrabold leading-tight text-red-700">
              {formatKrwPrice(kcarPriceToKrw(car.price))}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
