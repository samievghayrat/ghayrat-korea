'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/contexts/AppContext';
import ImageGallery from '@/components/detail/ImageGallery';
import CarShareButton from '@/components/shared/CarShareButton';
import ContactCTA from '@/components/shared/ContactCTA';
import { getCarShareUrl } from '@/lib/car-sharing';
import { isDamagedAuctionClosed, type DamagedCar } from '@/lib/damaged-cars';
import type { TranslationKey } from '@/lib/i18n';

const categoryKeys: Record<string, TranslationKey> = { transfer: 'damaged.transfer', scrap: 'damaged.scrap', 'transfer-scrap': 'damaged.transferScrap', unknown: 'damaged.unknown' };
const lossKeys: Record<string, TranslationKey> = { partial: 'damaged.partialLoss', total: 'damaged.totalLoss', unknown: 'damaged.unknown' };
const fuelKeys: Record<string, TranslationKey> = { gasoline: 'fuel.gasoline', diesel: 'fuel.diesel', hybrid: 'fuel.hybrid', electric: 'fuel.electric', lpg: 'fuel.lpg', unknown: 'damaged.unknown' };
const localeNames = { ru: 'ru-RU', en: 'en-US', tj: 'tg-TJ', uz: 'uz-UZ' };

export default function DamagedDetailClient({ initial }: { initial: DamagedCar }) {
  const [car, setCar] = useState(initial);
  const [removed, setRemoved] = useState(false);
  const { t, lang, formatMileage, formatKrwPrice } = useApp();
  useEffect(() => {
    const controller = new AbortController();
    fetch(`/api/damaged-cars/${initial.id}`, { signal: controller.signal }).then(async response => {
      if (response.status === 404) { setRemoved(true); return; }
      if (!response.ok) return;
      const data = await response.json() as { car?: DamagedCar };
      if (data.car?.id === initial.id && Array.isArray(data.car.images)) setCar(data.car);
    }).catch(() => {});
    return () => controller.abort();
  }, [initial.id]);
  useEffect(() => { document.title = `${car.title} — ${t('damaged.title')} | GHAYRAT`; }, [car.title, t]);
  const unknown = t('damaged.unknown');
  const closed = removed || isDamagedAuctionClosed(car);
  const specs = [
    [t('spec.date'), car.manufacturedYear || car.year || unknown],
    [t('damaged.registration'), car.registrationDate || unknown],
    [t('spec.mileage'), car.mileage !== null ? formatMileage(car.mileage) : unknown],
    [t('spec.displacement'), car.displacement ? `${car.displacement.toLocaleString(localeNames[lang])} ${t('spec.cc')}` : unknown],
    [t('spec.fuel'), t(fuelKeys[car.fuel])],
    [t('spec.trans'), car.transmission === 'automatic' ? t('trans.auto') : car.transmission === 'manual' ? t('trans.manual') : unknown],
    [t('damaged.engineCode'), car.engineCode || unknown],
    [t('damaged.lot'), car.lotNumber],
    ...(car.vin ? [['VIN', car.vin]] : []),
  ];
  return <div className="min-h-screen bg-gray-50"><div className="mx-auto max-w-7xl px-4 py-5 pb-20 sm:px-6 lg:px-8">
    <nav className="mb-4 flex flex-wrap gap-2 text-xs text-gray-500">
      <Link href="/damaged-cars" className="hover:text-primary">{t('damaged.title')}</Link><span>/</span><span>{car.id}</span><span>/</span><span>{car.title}</span>
    </nav>
    <div className="mb-4 flex items-start justify-between gap-3"><h1 className="text-xl font-bold text-gray-900 sm:text-3xl">{car.title}</h1><CarShareButton title={car.title} url={getCarShareUrl('damaged-cars', car.id)} /></div>
    <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
      <div className="min-w-0 space-y-5">
        <section className="rounded-xl border border-gray-200 bg-white p-2 sm:p-3"><ImageGallery images={car.images} alt={car.title} /></section>
        <section className="rounded-xl border border-gray-200 bg-white p-4 sm:p-5">
          <h2 className="mb-3 text-lg font-semibold text-gray-900">{t('spec.generalData')}</h2>
          <dl className="grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-3">{specs.map(([label, value]) => <div key={label} className="min-w-0 border-b border-gray-100 pb-3"><dt className="mb-1 text-xs text-gray-500">{label}</dt><dd className="break-words text-sm font-semibold text-gray-900">{value}</dd></div>)}</dl>
        </section>
        <section className="rounded-xl border border-gray-200 bg-white p-4 sm:p-5">
          <h2 className="mb-3 text-lg font-semibold text-gray-900">{t('damaged.damageTitle')}</h2>
          <ul className="space-y-2 text-sm text-gray-700">
            {car.damageAreas.map(area => <li key={area} className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-amber-500" aria-hidden="true" />{t(`damaged.${area}`)}</li>)}
            {car.airbagsDeployed && <li className="rounded-lg bg-amber-50 px-3 py-2 text-amber-800">{t('damaged.airbags')}</li>}
            {car.mileageUnverified && <li>{t('damaged.mileageUnverified')}</li>}
            {!car.damageAreas.length && !car.airbagsDeployed && <li>{t('damaged.damageUnknown')}</li>}
          </ul>
          <p className="mt-4 border-t border-gray-100 pt-3 text-xs leading-relaxed text-gray-500">{t('damaged.damageHint')}</p>
        </section>
      </div>
      <aside className="space-y-4 lg:sticky lg:top-20">
        <section className="rounded-xl border border-gray-200 bg-white p-4 sm:p-5">
          <div className="mb-3 flex flex-wrap gap-2 text-xs font-semibold"><span className="rounded-lg bg-gray-100 px-3 py-2 text-gray-700">{t(categoryKeys[car.category])}</span><span className="rounded-lg bg-gray-100 px-3 py-2 text-gray-700">{t(lossKeys[car.lossType])}</span></div>
          {(car.category === 'scrap' || car.category === 'transfer-scrap') && <p className="mb-4 rounded-lg bg-amber-50 p-3 text-xs leading-relaxed text-amber-800">{t('damaged.scrapHint')}</p>}
          {car.lossType === 'total' && <p className="mb-4 text-xs leading-relaxed text-gray-500">{t('damaged.lossHint')}</p>}
          {closed ? <div className="mb-4 rounded-lg bg-gray-100 p-3"><p className="text-sm font-semibold text-gray-800">{t(removed ? 'damaged.removed' : 'damaged.closed')}</p><p className="mt-1 text-xs text-gray-500">{t('damaged.closedHint')}</p></div>
            : car.closesAt && <div className="mb-4 border-b border-gray-100 pb-3"><p className="text-xs text-gray-500">{t('damaged.closes')}</p><time dateTime={car.closesAt} className="text-sm font-semibold text-gray-900">{new Date(car.closesAt).toLocaleString(localeNames[lang], { timeZone: 'Asia/Seoul', dateStyle: 'short', timeStyle: 'short' })}</time><p className="text-xs text-gray-400">{t('damaged.koreaTime')}</p></div>}
          <p className="mb-2 text-xl font-bold text-primary">{t('damaged.askPrice')}</p>
          <p className="mb-4 text-sm leading-relaxed text-gray-500">{t('damaged.priceHint')}</p>
          {car.storageFeeKrw !== null && car.storageFeeKrw > 0 && <dl className="mb-4 flex items-center justify-between gap-3 border-t border-gray-100 pt-3 text-xs"><dt className="text-gray-500">{t('damaged.storageFee')}</dt><dd className="shrink-0 font-semibold text-gray-700">{formatKrwPrice(car.storageFeeKrw)}</dd></dl>}
          <ContactCTA />
        </section>
      </aside>
    </div>
  </div></div>;
}
