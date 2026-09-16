import type { Metadata } from "next";
import { Suspense } from "react";
import AuctionCatalogClient from "@/components/auction/AuctionCatalogClient";
import { getKCarAuctionCars } from "@/lib/kcar-auction";

export const metadata: Metadata = {
  title: "\u0410\u0443\u043a\u0446\u0438\u043e\u043d",
  description: "\u0410\u0443\u043a\u0446\u0438\u043e\u043d\u043d\u044b\u0435 \u0430\u0432\u0442\u043e \u0438\u0437 \u041a\u043e\u0440\u0435\u0438.",
};

export default async function AuctionPage() {
  const cars = await getKCarAuctionCars();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8 lg:py-7">
        <Suspense fallback={null}>
          <AuctionCatalogClient cars={cars} />
        </Suspense>
      </div>
    </div>
  );
}
