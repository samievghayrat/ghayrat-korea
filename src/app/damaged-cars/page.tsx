import { Suspense } from 'react';
import type { Metadata } from 'next';
import { getDamagedCatalogue } from '@/lib/damaged-cars-server';
import DamagedCatalogClient from '@/components/damaged/DamagedCatalogClient';

export const metadata: Metadata = { title: 'Аварийные авто из Кореи', description: 'Аварийные автомобили из Кореи: фотографии, характеристики и сведения о повреждениях.' };
export default async function DamagedCarsPage() {
  const initial = await getDamagedCatalogue();
  return <div className="min-h-screen bg-gray-50"><div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
    <Suspense fallback={null}><DamagedCatalogClient initial={initial} /></Suspense>
  </div></div>;
}
