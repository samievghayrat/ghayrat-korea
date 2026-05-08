"use client";

import { useMemo, useState } from "react";
import AuctionCarCard from "@/components/auction/AuctionCarCard";
import { formatKCarName, type KCarAuctionCar } from "@/lib/kcar-auction";

interface AuctionCatalogClientProps {
  cars: KCarAuctionCar[];
}

type YearFilter = "all" | "2014" | "2021";

function getDisplayYear(car: KCarAuctionCar): number {
  if (car.firstRegDate && car.firstRegDate.length >= 4) {
    const parsed = Number(car.firstRegDate.slice(0, 4));
    if (Number.isFinite(parsed)) return parsed;
  }
  return car.year;
}

export default function AuctionCatalogClient({ cars }: AuctionCatalogClientProps) {
  const [query, setQuery] = useState("");
  const [yearFilter, setYearFilter] = useState<YearFilter>("all");

  const filteredCars = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return cars.filter((car) => {
      const displayName = formatKCarName(car).toLowerCase();
      const rawName = `${car.brand} ${car.model}`.toLowerCase();
      const matchesQuery = !normalizedQuery ||
        displayName.includes(normalizedQuery) ||
        rawName.includes(normalizedQuery) ||
        car.lotNumber?.toLowerCase().includes(normalizedQuery);

      const year = getDisplayYear(car);
      const matchesYear =
        yearFilter === "all" ||
        (yearFilter === "2014" && year >= 2014) ||
        (yearFilter === "2021" && year >= 2021);

      return matchesQuery && matchesYear;
    });
  }, [cars, query, yearFilter]);

  return (
    <>
      <div className="mb-4 rounded-lg border border-gray-200 bg-white p-3 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative flex-1">
            <svg className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m21 21-4.35-4.35M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z" />
            </svg>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search brand, model, lot number"
              className="h-12 w-full rounded-lg border border-gray-200 bg-gray-50 pl-10 pr-3 text-sm font-semibold text-gray-900 outline-none transition focus:border-red-300 focus:bg-white focus:ring-2 focus:ring-red-100"
            />
          </div>

          <div className="flex gap-2">
            {([
              ["all", "All years"],
              ["2014", "2014+"],
              ["2021", "2021+"],
            ] as [YearFilter, string][]).map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setYearFilter(value)}
                className={`h-10 rounded-lg px-4 text-sm font-bold transition ${
                  yearFilter === value
                    ? "bg-red-600 text-white"
                    : "border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-semibold text-gray-600">
          <span className="font-extrabold text-gray-950">{filteredCars.length}</span> auction cars
        </p>
        <p className="hidden text-xs font-medium text-gray-500 sm:block">
          Prices exclude auction commission and delivery
        </p>
      </div>

      {filteredCars.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white py-16 text-center text-gray-500">
          No auction cars found.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredCars.map((car, index) => (
            <AuctionCarCard key={car.id} car={car} priority={index < 6} />
          ))}
        </div>
      )}
    </>
  );
}
