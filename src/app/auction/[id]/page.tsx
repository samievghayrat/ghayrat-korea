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
  if (!car) return { title: "\u0410\u0432\u0442\u043e \u043d\u0435 \u043d\u0430\u0439\u0434\u0435\u043d\u043e" };
  const title = formatKCarName(car);

  return {
    title: `${title} ${car.year} - \u0410\u0443\u043a\u0446\u0438\u043e\u043d`,
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
