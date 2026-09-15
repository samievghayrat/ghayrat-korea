import type { Metadata } from 'next';
import OurCarsClient from '@/components/own/OurCarsClient';

export const metadata: Metadata = {
  title: 'Наши автомобили', description: 'Автомобили GHAYRAT в продаже: фотографии, характеристики и цены.',
  alternates: { canonical: '/our-cars' }, openGraph: { title: 'Наши автомобили | GHAYRAT', url: '/our-cars' },
};

export default function OurCarsPage() { return <OurCarsClient />; }
