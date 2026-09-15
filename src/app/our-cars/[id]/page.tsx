import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getOwnCar } from '@/lib/own-cars';
import { getCarPreviewMetadata, getCarShareUrl } from '@/lib/car-sharing';
import { getCompactModelName } from '@/lib/translations';
import OwnCarDetail from '@/components/own/OwnCarDetail';

export const dynamic = 'force-dynamic';
type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  try {
    const car = await getOwnCar(id);
    if (car) {
      const title = `${car.brand} ${getCompactModelName(car.model)} ${car.year}`;
      return getCarPreviewMetadata(title, `${title}: фотографии, характеристики и цена автомобиля в продаже.`, getCarShareUrl('our-cars', id), car.images[0]);
    }
  } catch { /* The page displays a retry state if storage is unavailable. */ }
  return { title: 'Наши автомобили', robots: { index: false } };
}

export default async function OwnCarPage({ params }: Props) {
  const car = await getOwnCar((await params).id);
  if (!car) notFound();
  return <OwnCarDetail car={car} />;
}
