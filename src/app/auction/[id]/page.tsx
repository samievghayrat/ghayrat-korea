import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import AuctionDetailClient from "@/components/auction/AuctionDetailClient";
import {
  formatKCarName,
  getKCarAuctionCar,
  getKCarAuctionImages,
  resolveKCarImageUrl,
} from "@/lib/kcar-auction";

interface AuctionDetailPageProps {
  params: { id: string };
}

export async function generateMetadata({ params }: AuctionDetailPageProps): Promise<Metadata> {
  const car = await getKCarAuctionCar(params.id);
  if (!car) return { title: "Auction car not found" };
  const title = formatKCarName(car);

  return {
    title: `${title} ${car.year} - KCar Auction`,
    description: `${title}, ${car.year}, ${car.mileage.toLocaleString("ru-RU")} km.`,
  };
}

export default async function AuctionDetailPage({ params }: AuctionDetailPageProps) {
  const car = await getKCarAuctionCar(params.id);
  if (!car) notFound();

  const imagePaths = await getKCarAuctionImages(car.id);
  const images = (imagePaths.length > 0 ? imagePaths : [car.image]).map(resolveKCarImageUrl);

  return (
    <Suspense fallback={null}>
      <AuctionDetailClient car={car} images={images} />
    </Suspense>
  );
}
