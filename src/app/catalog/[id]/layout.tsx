import type { Metadata } from 'next';
import { getSnapshotCarById } from '@/lib/encar-snapshot';
import { getCompactModelName, translateBrand, translateModel } from '@/lib/translations';

interface DetailLayoutProps {
  children: React.ReactNode;
  params: { id: string };
}

export function generateMetadata({ params }: DetailLayoutProps): Metadata {
  const raw = getSnapshotCarById(params.id);
  if (!raw) return { title: 'Автомобиль из Кореи' };

  const brand = translateBrand(String(raw.Manufacturer || ''));
  const model = getCompactModelName(translateModel(String(raw.Model || '')));
  const year = String(raw.Year || '').slice(0, 4);
  const carName = [brand, model, year].filter(Boolean).join(' ');

  return {
    title: carName,
    description: `${carName}: фотографии, характеристики и расчёт доставки из Кореи в Россию или Таджикистан.`,
    openGraph: {
      title: `${carName} | GHAYRAT KOREA`,
      description: `Характеристики и расчёт доставки ${carName} из Кореи.`,
      type: 'website',
    },
  };
}

export default function DetailLayout({ children }: DetailLayoutProps) {
  return children;
}
