'use client';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useApp } from '@/contexts/AppContext';
import { filterDamagedCars, isDamagedAuctionClosed, type DamagedCatalogue } from '@/lib/damaged-cars';
import type { TranslationKey } from '@/lib/i18n';

const PAGE_SIZE = 12;
const categoryKeys: Record<string, TranslationKey> = { transfer: 'damaged.transfer', scrap: 'damaged.scrap', 'transfer-scrap': 'damaged.transferScrap', unknown: 'damaged.unknown' };
const lossKeys: Record<string, TranslationKey> = { total: 'damaged.totalLoss', partial: 'damaged.partialLoss', unknown: 'damaged.unknown' };
const locales = { ru: 'ru-RU', en: 'en-US', tj: 'tg-TJ', uz: 'uz-UZ' };

export default function DamagedCatalogClient({ initial }: { initial: DamagedCatalogue }) {
  const { t, lang, formatMileage } = useApp();
  const [catalogue, setCatalogue] = useState(initial);
  const [refreshing, setRefreshing] = useState(false);
  const [refreshFailed, setRefreshFailed] = useState(false);
  const search = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const brand = search.get('brand') || '', model = search.get('model') || '';
  const category = search.get('category') || '', lossType = search.get('loss') || '';
  const [advancedOpen, setAdvancedOpen] = useState(Boolean(category || lossType));
  useEffect(() => { if (category || lossType) setAdvancedOpen(true); }, [category, lossType]);
  const yearFrom = Number(search.get('yearFrom') || 0), query = search.get('q') || '';
  const [searchText, setSearchText] = useState(query);
  useEffect(() => { setSearchText(query); }, [query]);

  const refresh = useCallback(async (signal?: AbortSignal) => {
    setRefreshing(true); setRefreshFailed(false);
    try {
      const response = await fetch('/api/damaged-cars', { signal });
      if (!response.ok) throw new Error();
      const data = await response.json() as DamagedCatalogue;
      if (!Array.isArray(data.cars) || !data.fetchedAt) throw new Error();
      setCatalogue(previous => Date.parse(data.fetchedAt) >= Date.parse(previous.fetchedAt) ? data : previous);
      setRefreshFailed(data.fallback);
    } catch { if (!signal?.aborted) setRefreshFailed(true); }
    finally { if (!signal?.aborted) setRefreshing(false); }
  }, []);
  useEffect(() => {
    const controller = new AbortController();
    void refresh(controller.signal);
    return () => controller.abort();
  }, [refresh]);

  const update = (values: Record<string, string | null>) => {
    const params = new URLSearchParams(search.toString());
    Object.entries(values).forEach(([key, value]) => value ? params.set(key, value) : params.delete(key));
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };
  const brands = useMemo(() => [...new Set(catalogue.cars.map(car => car.brand).filter(Boolean))].sort(), [catalogue]);
  const models = useMemo(() => brand ? [...new Set(catalogue.cars.filter(car => car.brand === brand).map(car => car.model).filter(name => name && name !== '—'))].sort() : [], [catalogue, brand]);
  const cars = useMemo(() => filterDamagedCars(catalogue.cars, { brand, model, category, lossType, yearFrom, query }),
    [catalogue, brand, model, category, lossType, yearFrom, query]);
  const totalPages = Math.max(1, Math.ceil(cars.length / PAGE_SIZE));
  const rawPage = Number(search.get('page') || 1);
  const page = Math.min(totalPages, Number.isInteger(rawPage) && rawPage > 0 ? rawPage : 1);
  const currentCars = cars.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const inputClass = 'h-11 min-w-0 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-800 focus:outline-primary';
  const locale = locales[lang];

  return <>
    <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">{t('damaged.title')}</h1>
    <p className="mb-4 mt-1 max-w-2xl text-sm leading-relaxed text-gray-500">{t('damaged.intro')}</p>
    <div className="mb-4 rounded-xl border border-gray-200 bg-white p-3">
      <form onSubmit={event => { event.preventDefault(); update({ q: searchText.trim(), page: null }); }} className="mb-3 flex gap-2">
        <input value={searchText} onChange={event => setSearchText(event.target.value)} placeholder={t('damaged.search')} aria-label={t('damaged.search')} className={inputClass} />
        <button type="submit" className="rounded-lg bg-primary px-4 text-sm font-semibold text-white">{t('search.showResults')}</button>
      </form>
      <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
        <select value={brand} onChange={event => update({ brand: event.target.value, model: null, page: null })} aria-label={t('search.brandLabel')} className={`${inputClass} col-span-2 sm:col-span-1`}>
          <option value="">{t('search.brandLabel')} · {t('search.all')}</option>{brands.map(name => <option key={name}>{name}</option>)}
        </select>
        <select value={model} disabled={!brand} onChange={event => update({ model: event.target.value, page: null })} aria-label={t('search.modelLabel')} className={`${inputClass} col-span-2 sm:col-span-1 disabled:bg-gray-50 disabled:text-gray-400`}>
          <option value="">{t(brand ? 'search.allModels' : 'search.modelAfterBrand')}</option>{models.map(name => <option key={name}>{name}</option>)}
        </select>
        <select value={yearFrom || ''} onChange={event => update({ yearFrom: event.target.value, page: null })} aria-label={t('filter.year')} className={inputClass}>
          <option value="">{t('filter.year')}</option>{[2014, 2017, 2021, 2022, 2023, 2024, 2025, 2026].map(year => <option key={year} value={year}>{year}+</option>)}
        </select>
        <button type="button" aria-expanded={advancedOpen} aria-controls="damaged-advanced-filters" onClick={() => setAdvancedOpen(value => !value)} className={`${inputClass} font-semibold text-gray-600`}>{t('search.moreFilters')}</button>
      </div>
      {advancedOpen && <div id="damaged-advanced-filters" className="mt-2 grid gap-2 sm:grid-cols-2">
        <select value={category} onChange={event => update({ category: event.target.value, page: null })} aria-label={t('damaged.allCategories')} className={inputClass}>
          <option value="">{t('damaged.allCategories')}</option>{Object.entries(categoryKeys).filter(([key]) => key !== 'unknown').map(([key, label]) => <option key={key} value={key}>{t(label)}</option>)}
        </select>
        <select value={lossType} onChange={event => update({ loss: event.target.value, page: null })} aria-label={t('damaged.allLossTypes')} className={inputClass}>
          <option value="">{t('damaged.allLossTypes')}</option>{Object.entries(lossKeys).filter(([key]) => key !== 'unknown').map(([key, label]) => <option key={key} value={key}>{t(label)}</option>)}
        </select>
      </div>}
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-gray-500">
        <span>{t('search.found')} <strong className="text-gray-900">{cars.length}</strong></span>
        <div className="flex items-center gap-3">
          <time dateTime={catalogue.fetchedAt}>{t('damaged.updated')}: {new Date(catalogue.fetchedAt).toLocaleString(locale, { timeZone: 'Asia/Seoul', dateStyle: 'short', timeStyle: 'short' })}</time>
          <button type="button" disabled={refreshing} onClick={() => { void refresh(); }} className="min-h-9 rounded-lg border border-gray-200 px-3 font-semibold text-gray-600 disabled:opacity-50">{t(refreshing ? 'damaged.refreshing' : 'damaged.refresh')}</button>
        </div>
      </div>
      {refreshFailed && <p role="status" className="mt-2 text-xs text-gray-500">{t('damaged.refreshFailed')}</p>}
    </div>
    {!cars.length ? <p className="rounded-xl border border-gray-200 bg-white px-4 py-12 text-center text-gray-500">{t('search.noCars')}</p>
      : <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {currentCars.map((car, index) => <Link key={car.id} href={`/damaged-cars/${car.id}`} prefetch={false} target="_blank" rel="noopener noreferrer"
          className="overflow-hidden rounded-xl border border-gray-200 bg-white transition hover:border-gray-300 hover:shadow-sm">
          <div className="relative aspect-[16/10] bg-gray-100">
            <Image src={car.image || '/images/no-image.svg'} alt={car.title} fill sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 33vw" priority={page === 1 && index < 3} className="object-cover" onError={event => { event.currentTarget.srcset = ''; event.currentTarget.src = '/images/no-image.svg'; }} />
            <span className="absolute left-2 top-2 rounded-md bg-white/95 px-2 py-1 text-xs font-semibold text-gray-800">{car.year || '—'}</span>
            {isDamagedAuctionClosed(car) && <span className="absolute bottom-2 left-2 rounded-md bg-gray-900/80 px-2 py-1 text-xs text-white">{t('damaged.closed')}</span>}
          </div>
          <div className="p-3">
            <div className="mb-1 flex items-start justify-between gap-2"><h2 className="font-semibold text-gray-900">{car.title}</h2><span className="shrink-0 text-xs text-gray-400">#{car.id}</span></div>
            <p className="text-xs text-gray-500">{car.registrationDate || car.year || '—'}{car.mileage !== null ? ` · ${formatMileage(car.mileage)}` : ''}</p>
            <div className="my-3 flex flex-wrap gap-1.5 text-xs">
              <span className={`rounded-md px-2 py-1 ${car.category === 'scrap' ? 'bg-amber-50 text-amber-800' : 'bg-gray-100 text-gray-600'}`}>{t(categoryKeys[car.category])}</span>
              <span className="rounded-md bg-gray-100 px-2 py-1 text-gray-600">{t(lossKeys[car.lossType])}</span>
            </div>
            <div className="flex items-center justify-between border-t border-gray-100 pt-2 text-sm"><span className="font-semibold text-primary">{t('damaged.askPrice')}</span><span className="text-gray-400" aria-hidden="true">→</span></div>
          </div>
        </Link>)}
      </div>}
    {totalPages > 1 && <nav aria-label={t('damaged.title')} className="mt-6 flex items-center justify-between rounded-xl border border-gray-200 bg-white p-3">
      <button type="button" disabled={page <= 1} onClick={() => update({ page: String(page - 1) })} aria-label={t('damaged.previous')} className="min-h-11 rounded-lg px-3 text-sm font-semibold text-gray-700 disabled:opacity-30">← {t('damaged.previous')}</button>
      <span className="text-sm text-gray-500">{page} / {totalPages}</span>
      <button type="button" disabled={page >= totalPages} onClick={() => update({ page: String(page + 1) })} aria-label={t('damaged.next')} className="min-h-11 rounded-lg px-3 text-sm font-semibold text-gray-700 disabled:opacity-30">{t('damaged.next')} →</button>
    </nav>}
  </>;
}
