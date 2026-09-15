'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import type { CarListing } from '@/types';
import { useApp } from '@/contexts/AppContext';
import { getCompactModelName } from '@/lib/translations';
import { getCarShareUrl, getManagerContactLinks } from '@/lib/car-sharing';
import ImageGallery from '@/components/detail/ImageGallery';
import CarSpecs from '@/components/detail/CarSpecs';
import Equipment from '@/components/detail/Equipment';
import FavoriteButton from '@/components/shared/FavoriteButton';
import CarShareButton from '@/components/shared/CarShareButton';

export default function OwnCarDetail({ car }: { car: CarListing }) {
  const { t, formatListingPrice } = useApp();
  const title = `${car.brand} ${getCompactModelName(car.model)}`;
  const contactLinks = getManagerContactLinks(
    `${t('contact.carInterest')} ${title} ${car.year}\n${getCarShareUrl('our-cars', car.id)}`,
  );
  const suffix = t('brand.subtitle');
  useEffect(() => { document.title = `${title} — ${suffix} | GHAYRAT`; }, [title, suffix]);
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
        <nav className="mb-4 flex flex-wrap items-center gap-2 text-sm text-gray-500">
          <Link href="/our-cars" className="hover:text-primary">{t('nav.ourCars')}</Link><span>/</span>
          <span className="break-words" aria-current="page">{title}</span>
        </nav>
        <div className="mb-5 flex items-start justify-between gap-3">
          <h1 className="text-2xl font-bold text-gray-950 sm:text-3xl">{title}</h1>
          <CarShareButton title={`${title} ${car.year}`} url={getCarShareUrl('our-cars', car.id)} />
        </div>
        <div className="grid items-start gap-5 lg:grid-cols-12">
          <div className="order-1 lg:col-span-8">
            <div className="relative rounded-2xl border border-gray-200 bg-white p-2 shadow-sm">
              <ImageGallery images={car.images.length ? car.images : ['/images/no-image.svg']} alt={title} unoptimized />
              <div className="absolute left-5 top-5 z-20"><FavoriteButton carId={car.id} className="border border-white/70 shadow-lg backdrop-blur-sm" /></div>
            </div>
          </div>
          <aside className="order-2 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm lg:sticky lg:top-24 lg:col-span-4 lg:row-span-2">
            <p className="text-sm text-gray-500">{t('own.salePrice')}</p>
            <p className="mt-2 text-3xl font-bold text-emerald-700">{formatListingPrice(car.price_krw, car.price_rub, car.price_usd)}</p>
            {car.location && <div className="mt-5 border-t border-gray-100 pt-4"><p className="text-xs text-gray-500">{t('own.location')}</p><p className="mt-1 font-medium text-gray-900">{car.location}</p></div>}
            <Link href={contactLinks.telegram} target="_blank" rel="noopener noreferrer" className="btn-cta-green mt-6">{t('nav.writeManager')}</Link>
            <Link href="/our-cars" className="mt-4 block text-center text-sm text-gray-500 hover:text-primary">{t('own.back')}</Link>
          </aside>
          <div className="order-3 space-y-5 lg:col-span-8">
            <CarSpecs car={car} />
            {car.description && (
              <section className="rounded-2xl border border-gray-200 bg-white p-5">
                <h2 className="mb-3 font-semibold text-gray-900">{t('own.description')}</h2>
                <p className="whitespace-pre-wrap break-words text-sm leading-7 text-gray-600">{car.description}</p>
              </section>
            )}
            <Equipment items={car.equipment || []} />
          </div>
        </div>
      </div>
    </div>
  );
}
