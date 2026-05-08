import type { Metadata } from "next";
import AuctionCatalogClient from "@/components/auction/AuctionCatalogClient";
import { getKCarAuctionCars } from "@/lib/kcar-auction";

export const metadata: Metadata = {
  title: "KCar Auction",
  description: "Live Korean auction cars from KCar.",
};

export default async function AuctionPage() {
  const cars = await getKCarAuctionCars();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8 lg:py-7">
        <div className="mb-4 rounded-lg border border-red-100 bg-red-50/60 px-4 py-4 shadow-sm sm:px-5">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-red-700">KCar Auction</p>
              <h1 className="mt-1 text-2xl font-extrabold text-gray-950">Auction cars from Korea</h1>
              <p className="mt-1 text-sm text-gray-600">
                Fresh KCar listings with auction dates, lot numbers, photos, and starting prices.
              </p>
            </div>
            <div className="rounded-lg bg-gray-50 px-3 py-2 text-right">
              <div className="text-2xl font-extrabold text-gray-950">{cars.length}</div>
              <div className="text-xs font-semibold text-gray-500">active cars</div>
            </div>
          </div>
        </div>

        <AuctionCatalogClient cars={cars} />
      </div>
    </div>
  );
}
