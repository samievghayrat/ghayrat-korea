"use client";

import { useMemo, useState } from "react";
import AuctionCarCard from "@/components/auction/AuctionCarCard";
import { getKCarBaseModel, getKCarBrand, type KCarAuctionCar } from "@/lib/kcar-auction";

interface AuctionCatalogClientProps {
  cars: KCarAuctionCar[];
}

type YearFilter = "all" | "2014" | "2021";
const PAGE_SIZE = 10;

function getDisplayYear(car: KCarAuctionCar): number {
  if (car.firstRegDate && car.firstRegDate.length >= 4) {
    const parsed = Number(car.firstRegDate.slice(0, 4));
    if (Number.isFinite(parsed)) return parsed;
  }
  return car.year;
}

export default function AuctionCatalogClient({ cars }: AuctionCatalogClientProps) {
  const [selectedBrand, setSelectedBrand] = useState("");
  const [selectedModel, setSelectedModel] = useState("");
  const [yearFilter, setYearFilter] = useState<YearFilter>("all");
  const [page, setPage] = useState(1);

  const carOptions = useMemo(() => {
    const rows = cars.map((car) => {
      return {
        brand: getKCarBrand(car),
        model: getKCarBaseModel(car),
      };
    });

    const brands = Array.from(new Set(rows.map((row) => row.brand).filter(Boolean))).sort();
    const models = Array.from(
      new Set(
        rows
          .filter((row) => !selectedBrand || row.brand === selectedBrand)
          .map((row) => row.model)
          .filter(Boolean),
      ),
    ).sort();

    return { brands, models };
  }, [cars, selectedBrand]);

  const filteredCars = useMemo(() => {
    return cars.filter((car) => {
      const brand = getKCarBrand(car);
      const model = getKCarBaseModel(car);
      const matchesBrand = !selectedBrand || brand === selectedBrand;
      const matchesModel = !selectedModel || model === selectedModel;

      const year = getDisplayYear(car);
      const matchesYear =
        yearFilter === "all" ||
        (yearFilter === "2014" && year >= 2014) ||
        (yearFilter === "2021" && year >= 2021);

      return matchesBrand && matchesModel && matchesYear;
    });
  }, [cars, selectedBrand, selectedModel, yearFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredCars.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pagedCars = filteredCars.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const pageItems = useMemo(() => {
    const pages = new Set<number>();
    pages.add(1);
    pages.add(2);
    pages.add(3);
    pages.add(currentPage - 1);
    pages.add(currentPage);
    pages.add(currentPage + 1);
    pages.add(totalPages - 2);
    pages.add(totalPages - 1);
    pages.add(totalPages);

    const sorted = Array.from(pages)
      .filter((item) => item >= 1 && item <= totalPages)
      .sort((a, b) => a - b);

    const result: Array<number | "..."> = [];
    sorted.forEach((item, index) => {
      if (index > 0 && item - sorted[index - 1] > 1) result.push("...");
      result.push(item);
    });
    return result;
  }, [currentPage, totalPages]);

  const updateBrand = (brand: string) => {
    setSelectedBrand(brand);
    setSelectedModel("");
    setPage(1);
  };

  const updateModel = (model: string) => {
    setSelectedModel(model);
    setPage(1);
  };

  const updateYear = (value: YearFilter) => {
    setYearFilter(value);
    setPage(1);
  };

  return (
    <>
      <div className="mb-4 rounded-lg border border-gray-200 bg-white p-3 shadow-sm">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div className="text-sm font-semibold text-gray-600">
            <span className="font-extrabold text-gray-950">{filteredCars.length}</span> auction cars
          </div>
          <div className="text-xs font-medium text-gray-500">
            Page {currentPage} of {totalPages}
          </div>
        </div>

        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="grid flex-1 grid-cols-1 gap-2 sm:grid-cols-2">
            <select
              value={selectedBrand}
              onChange={(event) => updateBrand(event.target.value)}
              className="h-12 rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm font-semibold text-gray-900 outline-none transition focus:border-red-300 focus:bg-white focus:ring-2 focus:ring-red-100"
            >
              <option value="">All brands</option>
              {carOptions.brands.map((brand) => (
                <option key={brand} value={brand}>{brand}</option>
              ))}
            </select>
            <select
              value={selectedModel}
              onChange={(event) => updateModel(event.target.value)}
              className="h-12 rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm font-semibold text-gray-900 outline-none transition focus:border-red-300 focus:bg-white focus:ring-2 focus:ring-red-100"
            >
              <option value="">All models</option>
              {carOptions.models.map((model) => (
                <option key={model} value={model}>{model}</option>
              ))}
            </select>
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
                onClick={() => updateYear(value)}
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

      {filteredCars.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white py-16 text-center text-gray-500">
          No auction cars found.
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {pagedCars.map((car, index) => (
              <AuctionCarCard key={car.id} car={car} priority={currentPage === 1 && index < 6} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="mt-6 flex flex-wrap items-center justify-center gap-1.5">
              <button
                type="button"
                onClick={() => setPage((value) => Math.max(1, value - 1))}
                disabled={currentPage === 1}
                className="h-9 rounded-lg border border-gray-200 bg-white px-3 text-sm font-bold text-gray-700 disabled:opacity-40"
              >
                Prev
              </button>
              {pageItems.map((item, index) => item === "..." ? (
                <span key={`dots-${index}`} className="px-2 text-sm font-bold text-gray-400">...</span>
              ) : (
                <button
                  key={item}
                  type="button"
                  onClick={() => setPage(item)}
                  className={`h-9 min-w-9 rounded-lg px-3 text-sm font-bold ${
                    currentPage === item
                      ? "bg-red-600 text-white"
                      : "border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {item}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
                disabled={currentPage === totalPages}
                className="h-9 rounded-lg border border-gray-200 bg-white px-3 text-sm font-bold text-gray-700 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </>
  );
}
