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
        <AuctionCatalogClient cars={cars} />
      </div>
    </div>
  );
}
