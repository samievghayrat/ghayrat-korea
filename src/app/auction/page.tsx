import type { Metadata } from "next";
import AuctionCarCard from "@/components/auction/AuctionCarCard";
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
        <div className="mb-4 rounded-lg border border-blue-100 bg-blue-50/60 px-4 py-4 shadow-sm sm:px-5">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-blue-700">KCar Auction</p>
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

        {cars.length === 0 ? (
          <div className="rounded-xl border border-gray-200 bg-white py-16 text-center text-gray-500">
            No auction cars available right now.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {cars.map((car, index) => (
              <AuctionCarCard key={car.id} car={car} priority={index < 6} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
