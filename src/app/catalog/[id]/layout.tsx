import type { Metadata } from 'next';
import { getSnapshotCarById } from '@/lib/encar-snapshot';
import { getFullCarName } from '@/lib/translations';
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

  const year = String(raw.Year || '').slice(0, 4);
  const title = getFullCarName({ brand: String(raw.Manufacturer || ''), model: String(raw.Model || ''),
    badge: [raw.Badge, raw.BadgeDetail].filter(Boolean).join(' ') });
  const carName = [title, year].filter(Boolean).join(' ');

  return getCarPreviewMetadata(carName,
    `${carName}: фотографии, характеристики и расчёт доставки из Кореи в Россию или Таджикистан.`,
    url, getEncarShareImageUrl(typeof raw.Photo === 'string' ? raw.Photo : undefined));
}

export default function DetailLayout({ children }: DetailLayoutProps) {
  return children;
}
