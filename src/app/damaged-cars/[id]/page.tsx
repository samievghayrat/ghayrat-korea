import { notFound } from 'next/navigation';
import { getDamagedCar } from '@/lib/damaged-cars-server';
import { getCarPreviewMetadata, getCarShareUrl } from '@/lib/car-sharing';
import DamagedDetailClient from '@/components/damaged/DamagedDetailClient';

export const maxDuration = 60;
type Props = { params: Promise<{ id: string }> };
export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const car = await getDamagedCar(id);
  if (!car) return { title: 'Автомобиль не найден' };
  return getCarPreviewMetadata(`${car.title} ${car.year || ''} — Аварийные авто`,
    `${car.title}: фотографии, характеристики и повреждения. Уточните цену и возможность экспорта перед покупкой.`,
    getCarShareUrl('damaged-cars', id), car.image || undefined);
}
export default async function DamagedCarPage({ params }: Props) {
  const { id } = await params;
  const car = await getDamagedCar(id);
  if (!car) notFound();
  return <DamagedDetailClient initial={car} />;
}
