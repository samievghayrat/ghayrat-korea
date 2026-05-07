import Link from "next/link";
import {
  formatKcarAuctionDate,
  kcarPriceToKrw,
  resolveKCarImageUrl,
  type KCarAuctionCar,
} from "@/lib/kcar-auction";

interface AuctionCarCardProps {
  car: KCarAuctionCar;
  priority?: boolean;
}

function formatKrw(amount: number): string {
  return new Intl.NumberFormat("ko-KR", {
    style: "currency",
    currency: "KRW",
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function AuctionCarCard({ car, priority = false }: AuctionCarCardProps) {
  const title = `${car.brand} ${car.model}`;
  const regYear = car.firstRegDate && car.firstRegDate.length >= 6
    ? `${car.firstRegDate.slice(0, 4)}/${car.firstRegDate.slice(4, 6)}`
    : String(car.year);

  return (
    <Link
      href={`/auction/${car.id}`}
      className="group overflow-hidden rounded-lg border border-blue-100 bg-white shadow-sm transition-all duration-200 hover:border-blue-200 hover:shadow-md"
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
        <div className="absolute left-2 top-2 rounded bg-blue-700 px-2 py-1 text-[11px] font-bold text-white">
          Auction {formatKcarAuctionDate(car.auctionDate)}
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
          {car.grade && <span className="font-medium text-gray-500"> {car.grade}</span>}
        </h3>

        <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[12px] font-medium text-gray-600">
          <span>{regYear}</span>
          <span className="text-gray-300">/</span>
          <span>{car.mileage.toLocaleString("ru-RU")} km</span>
          <span className="text-gray-300">/</span>
          <span>{car.fuelType}</span>
          {car.engineVolume && (
            <>
              <span className="text-gray-300">/</span>
              <span>{car.engineVolume}cc</span>
            </>
          )}
        </div>

        <div className="mt-2.5 rounded-md bg-blue-50/80 px-3 py-2">
          <div className="flex items-baseline justify-between gap-2">
            <div className="text-[11px] font-semibold text-blue-700/75">Start price</div>
            <div className="shrink-0 text-lg font-extrabold leading-tight text-blue-700">
              {formatKrw(kcarPriceToKrw(car.price))}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
