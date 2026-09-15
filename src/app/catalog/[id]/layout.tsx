import type { Metadata } from 'next';
import { getSnapshotCarById } from '@/lib/encar-snapshot';
import { getCompactModelName, translateBrand, translateModel } from '@/lib/translations';
import { getCarPreviewMetadata, getCarShareUrl, getEncarShareImageUrl } from '@/lib/car-sharing';

interface DetailLayoutProps {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: DetailLayoutProps): Promise<Metadata> {
  const { id } = await params;
  const raw = getSnapshotCarById(id);
  const url = getCarShareUrl('catalog', id);
  if (!raw) return getCarPreviewMetadata('Автомобиль из Кореи', 'Фотографии, характеристики и расчёт доставки автомобиля из Кореи.', url);

  const brand = translateBrand(String(raw.Manufacturer || ''));
  const model = getCompactModelName(translateModel(String(raw.Model || '')));
  const year = String(raw.Year || '').slice(0, 4);
  const carName = [brand, model, year].filter(Boolean).join(' ');

  return getCarPreviewMetadata(carName,
    `${carName}: фотографии, характеристики и расчёт доставки из Кореи в Россию или Таджикистан.`,
    url, getEncarShareImageUrl(typeof raw.Photo === 'string' ? raw.Photo : undefined));
}

export default function DetailLayout({ children }: DetailLayoutProps) {
  return children;
}
