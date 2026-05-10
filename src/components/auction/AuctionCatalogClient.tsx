"use client";

import { useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import AuctionCarCard from "@/components/auction/AuctionCarCard";
import { getKCarBaseModel, getKCarBrand, type KCarAuctionCar } from "@/lib/kcar-auction";

interface AuctionCatalogClientProps {
  cars: KCarAuctionCar[];
}

type YearFilter = "all" | "2014" | "2021";
type SortFilter = "year_desc" | "year_asc" | "price_asc" | "price_desc";
const PAGE_SIZE = 9;

function getDisplayYear(car: KCarAuctionCar): number {
  if (car.firstRegDate && car.firstRegDate.length >= 4) {
    const parsed = Number(car.firstRegDate.slice(0, 4));
    if (Number.isFinite(parsed)) return parsed;
  }
  return car.year;
}

export default function AuctionCatalogClient({ cars }: AuctionCatalogClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const selectedBrand = searchParams.get("brand") || "";
  const selectedModel = searchParams.get("model") || "";
  const yearParam = searchParams.get("year");
  const yearFilter: YearFilter = yearParam === "2014" || yearParam === "2021" ? yearParam : "all";
  const sortParam = searchParams.get("sort");
  const sortFilter: SortFilter =
    sortParam === "year_asc" || sortParam === "price_asc" || sortParam === "price_desc" ? sortParam : "year_desc";
  const pageParam = Number(searchParams.get("page") || "1");
  const page = Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1;

  const carOptions = useMemo(() => {
    const rows = cars.map((car) => ({
      brand: getKCarBrand(car),
      model: getKCarBaseModel(car),
    }));

    const brandCounts = new Map<string, number>();
    rows.forEach((row) => {
      if (!row.brand) return;
      brandCounts.set(row.brand, (brandCounts.get(row.brand) || 0) + 1);
    });
    const brands = Array.from(brandCounts.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => a.name.localeCompare(b.name));
    const modelCounts = new Map<string, number>();
    rows
      .filter((row) => !selectedBrand || row.brand === selectedBrand)
      .forEach((row) => {
        if (!row.model) return;
        modelCounts.set(row.model, (modelCounts.get(row.model) || 0) + 1);
      });

    const models = Array.from(modelCounts.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => a.name.localeCompare(b.name));

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

  const sortedCars = useMemo(() => {
    return [...filteredCars].sort((a, b) => {
      if (sortFilter === "year_asc") return getDisplayYear(a) - getDisplayYear(b);
      if (sortFilter === "price_asc") return a.price - b.price;
      if (sortFilter === "price_desc") return b.price - a.price;
      return getDisplayYear(b) - getDisplayYear(a);
    });
  }, [filteredCars, sortFilter]);

  const totalPages = Math.max(1, Math.ceil(sortedCars.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pagedCars = sortedCars.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const pageItems = useMemo(() => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, index) => index + 1);
    }

    const pages = new Set<number>([1, currentPage - 1, currentPage, currentPage + 1, totalPages]);
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

  const updateFilters = (updates: Record<string, string | number | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === "" || value === "all" || value === 1) {
        params.delete(key);
      } else {
        params.set(key, String(value));
      }
    });
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  };

  const detailHref = (id: string) => {
    const query = searchParams.toString();
    return query ? `/auction/${id}?${query}` : `/auction/${id}`;
  };

  const updateBrand = (brand: string) => {
    updateFilters({ brand, model: null, page: null });
  };

  const updateModel = (model: string) => {
    updateFilters({ model, page: null });
  };

  const updateYear = (value: YearFilter) => {
    updateFilters({ year: value, page: null });
  };

  const updateSort = (value: SortFilter) => {
    updateFilters({ sort: value === "year_desc" ? null : value, page: null });
  };

  const updatePage = (value: number) => {
    updateFilters({ page: value });
  };

  return (
    <>
      <div className="mb-4 rounded-lg border border-gray-200 bg-white p-3 shadow-sm">
        <div className="hidden">
          <div className="hidden text-sm font-semibold text-gray-600">
            <span className="font-extrabold text-gray-950">{filteredCars.length}</span> авто на аукционе
          </div>
          <div className="hidden text-xs font-medium text-gray-500">
            Страница {currentPage} из {totalPages}
          </div>
        </div>

        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="grid flex-1 grid-cols-1 gap-2 sm:grid-cols-2">
            <select
              value={selectedBrand}
              onChange={(event) => updateBrand(event.target.value)}
              className="h-12 rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm font-semibold text-gray-900 outline-none transition focus:border-red-300 focus:bg-white focus:ring-2 focus:ring-red-100"
            >
              <option value="">Все марки</option>
              {carOptions.brands.map((brand) => (
                <option key={brand.name} value={brand.name}>{brand.name} ({brand.count})</option>
              ))}
            </select>
            <select
              value={selectedModel}
              onChange={(event) => updateModel(event.target.value)}
              className="h-12 rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm font-semibold text-gray-900 outline-none transition focus:border-red-300 focus:bg-white focus:ring-2 focus:ring-red-100"
            >
              <option value="">Все модели</option>
              {carOptions.models.map((model) => (
                <option key={model.name} value={model.name}>{model.name} ({model.count})</option>
              ))}
            </select>
          </div>

          <div className="flex gap-2">
            {([
              ["all", "Все годы"],
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
        <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <select
            value={sortFilter}
            onChange={(event) => updateSort(event.target.value as SortFilter)}
            className="h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm font-semibold text-gray-800 outline-none transition focus:border-red-300 focus:ring-2 focus:ring-red-100"
          >
            <option value="year_desc">Год: сначала новые</option>
            <option value="year_asc">Год: сначала старые</option>
            <option value="price_asc">Цена: сначала дешевые</option>
            <option value="price_desc">Цена: сначала дорогие</option>
          </select>
          <div className="text-sm font-semibold text-gray-500">
          Найдено: <span className="ml-1 font-extrabold text-gray-950">{filteredCars.length}</span>
          </div>
        </div>
      </div>

      {filteredCars.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white py-16 text-center text-gray-500">
          Автомобили не найдены.
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {pagedCars.map((car, index) => (
              <AuctionCarCard key={car.id} car={car} href={detailHref(car.id)} priority={currentPage === 1 && index < 6} />
            ))}
          </div>

          {totalPages > 1 && (
            <nav className="mt-6 flex flex-col items-center gap-3 rounded-xl border border-gray-200 bg-white px-3 py-3 shadow-sm sm:flex-row sm:justify-between">
              <button
                type="button"
                onClick={() => updatePage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="inline-flex h-10 items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 text-sm font-bold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M15 19l-7-7 7-7" />
                </svg>
                Назад
              </button>

              <div className="flex items-center gap-1">
                {pageItems.map((item, index) => item === "..." ? (
                  <span key={`dots-${index}`} className="flex h-10 min-w-8 items-center justify-center text-sm font-bold text-gray-400">...</span>
                ) : (
                  <button
                    key={item}
                    type="button"
                    onClick={() => updatePage(item)}
                    aria-current={currentPage === item ? "page" : undefined}
                    className={`h-10 min-w-10 rounded-lg px-3 text-sm font-bold transition ${
                      currentPage === item
                        ? "bg-red-600 text-white shadow-sm"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>

              <div className="text-xs font-semibold text-gray-500 sm:hidden">
                Страница {currentPage} из {totalPages}
              </div>

              <button
                type="button"
                onClick={() => updatePage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="inline-flex h-10 items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 text-sm font-bold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Далее
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </nav>
          )}
        </>
      )}
    </>
  );
}
