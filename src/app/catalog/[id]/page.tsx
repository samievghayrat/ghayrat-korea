'use client';

import { useEffect, useState, useMemo } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import type { CarListing } from '@/types';
import ImageGallery from '@/components/detail/ImageGallery';
import CarSpecs from '@/components/detail/CarSpecs';
import PriceBreakdown from '@/components/detail/PriceBreakdown';
import Equipment from '@/components/detail/Equipment';
import AccidentHistory from '@/components/detail/AccidentHistory';
import SimilarCars from '@/components/detail/SimilarCars';
import FavoriteButton from '@/components/shared/FavoriteButton';
import { calculateImportCost } from '@/lib/calculator';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { useApp } from '@/contexts/AppContext';
import { translateBadgeDetail, translateGenerationName } from '@/lib/translations';
import type { Lang } from '@/lib/i18n';

function getSessionCar(id: string): CarListing | null {
  try {
    const raw = sessionStorage.getItem(`car_${id}`);
    if (raw) return JSON.parse(raw);
  } catch {}
  return null;
}

function formatModelName(value?: string): string | undefined {
  if (!value) return value;
  return value
    .replace(/\b(\d+)\s*Series\b/g, '$1 Series')
    .replace(/\b([A-Z])\s*Class\b/g, '$1-Class')
    .replace(/\s+/g, ' ')
    .trim();
}

function buildCarTitle(car: CarListing, lang: Lang): string {
  const model = formatModelName(car.model) || car.model;
  let generation = formatModelName(car.generation ? translateGenerationName(car.generation, lang) : undefined);

  if (generation && model) {
    const normalizedGeneration = generation.toLowerCase();
    const normalizedModel = model.toLowerCase();
    if (normalizedGeneration === normalizedModel) {
      generation = undefined;
    } else if (normalizedGeneration.startsWith(`${normalizedModel} `)) {
      generation = generation.slice(model.length).trim();
    }
  }

  return [car.brand, model, generation, translateBadgeDetail(car.badge || car.trim || '', lang)]
    .filter(Boolean)
    .join(' ');
}

export default function CarDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const id = params.id as string;

  const { t, lang, currency, convertUsdToKrw, formatPrice, formatKrwPrice } = useApp();
  const sessionCar = typeof window !== 'undefined' ? getSessionCar(id) : null;
  const [car, setCar] = useState<CarListing | null>(sessionCar);
  const [apiLoaded, setApiLoaded] = useState(false);
  const [galleryLoaded, setGalleryLoaded] = useState(false);
  const [remoteGalleryImages, setRemoteGalleryImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(!sessionCar);
  const [error, setError] = useState(false);
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [destination, setDestination] = useState<'russia' | 'tajikistan'>(() =>
    searchParams.get('destination') === 'tajikistan' ? 'tajikistan' : 'russia',
  );

  const chooseDestination = (nextDestination: 'russia' | 'tajikistan') => {
    setDestination(nextDestination);
    setShowBreakdown(false);
    localStorage.setItem('deliveryDestination', nextDestination);
    const nextUrl = new URL(window.location.href);
    nextUrl.searchParams.set('destination', nextDestination);
    window.history.replaceState(null, '', nextUrl);
  };

  useEffect(() => {
    fetch(`/api/cars/${id}`)
      .then(res => {
        if (!res.ok) throw new Error('Not found');
        return res.json();
      })
      .then(data => {
        setCar(data);
        setApiLoaded(true);
        setLoading(false);

        // Pan Auto uses a protected, sometimes slow public endpoint. Refine the
        // selected car in the background without delaying the first render.
        fetch(`/api/cars/${id}/pan-auto`)
          .then(res => res.status === 204 ? null : (res.ok ? res.json() : null))
          .then(enhanced => {
            if (enhanced) {
              setCar(current => ({
                ...enhanced,
                imageUrl: current?.images?.[0] || enhanced.imageUrl,
                images: current?.images?.length ? current.images : enhanced.images,
              }));
            }
          })
          .catch(() => {});
      })
      .catch(() => {
        if (!sessionCar) {
          setError(true);
        }
        setApiLoaded(true);
        setLoading(false);
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    setGalleryLoaded(false);
    setRemoteGalleryImages([]);
    const controller = new AbortController();

    fetch(`/api/encar-gallery/${id}`, { signal: controller.signal })
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (!data?.images?.length) return;
        setRemoteGalleryImages(data.images);
      })
      .catch(error => {
        if (!(error instanceof DOMException && error.name === 'AbortError')) {
          console.error('Gallery fetch failed:', error);
        }
      })
      .finally(() => setGalleryLoaded(true));

    return () => controller.abort();
  }, [id]);

  // Client-side breakdown only for the detailed breakdown view (uses API data)
  const breakdown = useMemo(() => {
    if (!car || !apiLoaded) return null;
    return calculateImportCost({
      priceKrw: car.price_krw,
      priceRub: car.price_rub,
      priceUsd: car.price_usd,
      displacement: car.displacement || 0,
      year: car.year,
      month: car.month,
      fuel: car.fuel,
      hp: car.hp,
      brand: car.brand,
      model: car.model,
      destination,
      eurRate: car.eur_to_rub,
      usdRate: car.usd_to_rub,
      russiaCustomsOverride: destination === 'russia' ? car.panAutoCustoms : undefined,
    });
  }, [car, destination, apiLoaded]);

  if (loading) return <LoadingSpinner className="py-32" />;

  if (error || !car) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">{t('detail.notFound')}</h1>
        <p className="text-gray-500 mb-8">{t('detail.notFoundDesc')}</p>
        <a href="/" className="btn-primary inline-block">{t('detail.backToCatalog')}</a>
      </div>
    );
  }

  const priceLabel = destination === 'russia'
    ? t('card.turnkeyVladivostok')
    : t('card.turnkeyTajikistan');
  const turnkeyPriceRub = car.price_turnkey_russia || (destination === 'russia' ? breakdown?.total : undefined);
  const fallbackUsdToRub = car.price_rub > 0 && car.price_usd ? car.price_rub / car.price_usd : 87.5;
  const usdToRub = car.usd_to_rub || fallbackUsdToRub;
  const turnkeyPriceUsd = destination === 'russia'
    ? car.price_turnkey_russia_usd || (turnkeyPriceRub ? Math.round(turnkeyPriceRub / usdToRub) : undefined)
    : car.price_turnkey_tajikistan || breakdown?.total;
  const calculationReady = destination === 'tajikistan'
    || (breakdown?.calculationComplete ?? car.russia_calculation_complete ?? Boolean(turnkeyPriceRub));
  const fuelLower = car.fuel.toLowerCase();
  const isElectricPower = fuelLower.includes('электро') || fuelLower.includes('electric');
  const isHybridPower = fuelLower.includes('гибрид') || fuelLower.includes('hybrid');
  const calculationHp = breakdown?.calculationHp ?? car.hp ?? 0;
  const powerLimitHp = breakdown?.preferentialPowerLimitHp ?? (isElectricPower ? 80 : 160);
  const hasHighPower = calculationHp > powerLimitHp;
  const isPowerBoundary = calculationHp === powerLimitHp;
  const hasPreferentialPower = calculationHp > 0
    && calculationHp < powerLimitHp
    && !isHybridPower
    && (isElectricPower || (car.displacement || 0) <= 3000);
  const formatRub = (value: number) => `${value.toLocaleString('ru-RU')} ₽`;
  const formatUsdInSelectedCurrency = (value: number) => formatKrwPrice(convertUsdToKrw(value));
  const formattedDeliveryTotal = destination === 'russia'
    ? (turnkeyPriceRub ? formatPrice(turnkeyPriceRub) : null)
    : (turnkeyPriceUsd ? formatUsdInSelectedCurrency(turnkeyPriceUsd) : null);

  const galleryImages = remoteGalleryImages.length > 0
    ? remoteGalleryImages
    : car.images && car.images.length > 0
    ? car.images
    : [car.imageUrl || '/images/no-image.svg'];

  const fullTitle = buildCarTitle(car, lang);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 lg:py-7">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 overflow-x-auto whitespace-nowrap text-sm text-gray-400 mb-4">
        <a href="/" className="shrink-0 hover:text-primary transition-colors">{t('nav.catalog')}</a>
        <span className="shrink-0">/</span>
        <span className="shrink-0 text-gray-700 font-medium">{car.id}</span>
      </nav>

      <div className="mb-5 lg:mb-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              {car.source === 'own' && (
                <span className="inline-flex items-center rounded-md bg-primary px-2.5 py-1 text-xs font-bold text-white">
                  {t('card.inStock')}
                </span>
              )}
              {car.reservationStatus && (
                <span className={`inline-flex items-center rounded-md px-2.5 py-1 text-xs font-bold ${
                  car.reservationStatus === 'sold'
                    ? 'bg-red-100 text-red-700'
                    : 'bg-amber-100 text-amber-700'
                }`}>
                  {car.reservationStatus === 'sold' ? t('card.sold') : t('card.reserved')}
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-950 leading-tight">
              {fullTitle}
            </h1>
          </div>
          <div className="hidden lg:block">
            <FavoriteButton carId={car.id} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 lg:gap-x-6 lg:gap-y-4 items-start">
        {/* Gallery */}
        <div className="lg:col-span-8 order-1">
          <div className="bg-white rounded-2xl border border-gray-200 p-2 sm:p-3 shadow-sm">
            <ImageGallery
              images={galleryImages}
              alt={`${car.brand} ${car.model}`}
            />
            {!galleryLoaded && galleryImages.length <= 1 && (
              <div className="flex items-center gap-2 mt-2 text-sm text-gray-400">
                <svg className="animate-spin h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {t('detail.loadingPhotos')}
              </div>
            )}
          </div>
        </div>

        {/* Price panel - right on desktop, right after gallery on mobile */}
        <div className="lg:col-span-4 order-2 lg:row-start-1 lg:col-start-9 lg:row-span-2 space-y-4 lg:sticky lg:top-24">
          <div className="bg-white rounded-2xl border border-gray-200 p-5 sm:p-6 shadow-sm">
            {/* Title + Favorite */}
            <div className="flex items-start justify-end gap-3 lg:hidden">
              <FavoriteButton carId={car.id} />
            </div>

            {/* Reservation status badge */}
            {car.reservationStatus && (
              <div className="mt-3 lg:hidden">
                <span className={`inline-block text-xs font-bold px-3 py-1.5 rounded-lg uppercase tracking-wide ${
                  car.reservationStatus === 'sold'
                    ? 'bg-red-100 text-red-700'
                    : 'bg-amber-100 text-amber-700'
                }`}>
                  {car.reservationStatus === 'sold' ? t('card.sold') : t('card.reserved')}
                </span>
              </div>
            )}

            {/* Destination toggle */}
            <div className="mt-5 lg:mt-0">
              <h2 className="text-base font-bold text-gray-950">{t('detail.destinationTitle')}</h2>
              <p className="mt-1 text-sm leading-5 text-gray-500">{t('detail.destinationHint')}</p>
            </div>
            <div className="mt-3 flex rounded-xl bg-gray-100 p-1" role="group" aria-label={t('detail.destinationTitle')}>
              <button
                type="button"
                aria-pressed={destination === 'tajikistan'}
                onClick={() => chooseDestination('tajikistan')}
                className={`flex-1 rounded-lg px-3 py-2.5 text-sm font-semibold transition-all ${
                  destination === 'tajikistan'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {'\u{1F1F9}\u{1F1EF}'} {t('country.tajikistan')}
              </button>
              <button
                type="button"
                aria-pressed={destination === 'russia'}
                onClick={() => chooseDestination('russia')}
                className={`flex-1 rounded-lg px-3 py-2.5 text-sm font-semibold transition-all ${
                  destination === 'russia'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {'\u{1F1F7}\u{1F1FA}'} {t('country.russia')}
              </button>
            </div>

            {/* Keep the catalog price visible, then show the separate delivery estimate. */}
            <div className="mt-4 rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4">
              <div className="text-sm font-semibold text-emerald-700">{t('card.priceInKorea')}</div>
              <div className="mt-1 text-3xl font-extrabold tracking-tight text-emerald-800">
                {formatKrwPrice(car.price_krw)}
              </div>
              <div className="mt-1 text-xs font-medium text-emerald-700/70">
                ₩{car.price_krw.toLocaleString('ko-KR')}
              </div>
            </div>

            <div className="mt-3 rounded-2xl bg-gray-950 p-4 text-white">
              <div className="mb-2 text-xs font-bold uppercase tracking-wider text-white/55">{t('price.estimatedTotal')}</div>
              {calculationReady && formattedDeliveryTotal ? (
                <>
                  <div className="text-3xl font-extrabold tracking-tight">
                    {formattedDeliveryTotal}
                  </div>
                  {destination === 'russia' && turnkeyPriceRub && currency !== 'RUB' && (
                    <div className="mt-1 text-sm font-semibold text-white/75">≈ {formatRub(turnkeyPriceRub)}</div>
                  )}
                  {destination === 'tajikistan' && turnkeyPriceUsd && currency !== 'USD' && (
                    <div className="mt-1 text-sm font-semibold text-white/75">≈ ${turnkeyPriceUsd.toLocaleString('en-US')}</div>
                  )}
                  <div className="text-sm text-white/65 mt-1">
                    {priceLabel}
                  </div>
                </>
              ) : apiLoaded ? (
                <div>
                  <div className="text-base font-bold text-amber-300">{t('price.needsEngineData')}</div>
                  <div className="mt-1 text-sm leading-5 text-white/65">{t('price.needsEngineDataDesc')}</div>
                </div>
              ) : (
                <div className="animate-pulse space-y-2">
                  <div className="h-9 w-48 bg-gray-200 rounded" />
                  <div className="h-4 w-36 bg-gray-200 rounded" />
                  <div className="h-3 w-44 bg-gray-200 rounded" />
                </div>
              )}

              {destination === 'russia' && hasHighPower && (
                <div className="mt-4 rounded-xl border border-amber-300/35 bg-amber-400/10 p-3" role="note">
                  <div className="flex items-center gap-2 text-sm font-bold text-amber-300">
                    <span aria-hidden="true">⚠</span>
                    {t('price.highPowerTitle')}
                  </div>
                  <p className="mt-1 text-xs leading-5 text-white/75">
                    {t('price.highPowerDesc')
                      .replace('{hp}', calculationHp.toLocaleString('ru-RU'))
                      .replace('{limit}', powerLimitHp.toLocaleString('ru-RU'))}
                  </p>
                </div>
              )}

              {destination === 'russia' && isPowerBoundary && (
                <div className="mt-4 rounded-xl border border-sky-300/25 bg-sky-400/10 p-3" role="note">
                  <div className="text-sm font-bold text-sky-200">{t('price.powerBoundaryTitle')}</div>
                  <p className="mt-1 text-xs leading-5 text-white/70">
                    {t('price.powerBoundaryDesc').replace('{limit}', powerLimitHp.toLocaleString('ru-RU'))}
                  </p>
                </div>
              )}

              {destination === 'russia' && isHybridPower && (
                <div className="mt-3 rounded-xl border border-sky-300/25 bg-sky-400/10 p-3" role="note">
                  <div className="text-sm font-bold text-sky-200">{t('price.hybridPowerTitle')}</div>
                  <p className="mt-1 text-xs leading-5 text-white/70">{t('price.hybridPowerDesc')}</p>
                </div>
              )}

              {destination === 'russia' && hasPreferentialPower && (
                <div className="mt-3 rounded-xl border border-emerald-300/25 bg-emerald-400/10 p-3" role="note">
                  <div className="text-sm font-bold text-emerald-300">{t('price.preferentialUtilTitle')}</div>
                  <p className="mt-1 text-xs leading-5 text-white/70">
                    {t('price.preferentialUtilDesc')
                      .replace('{hp}', calculationHp.toLocaleString('ru-RU'))
                      .replace('{limit}', powerLimitHp.toLocaleString('ru-RU'))}
                  </p>
                </div>
              )}

            </div>

            <a
              href="https://t.me/ghayrat_korea"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-cta-green mt-5"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0h-.056zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.479.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
              </svg>
              {t('nav.writeManager')}
            </a>

            {/* Detailed calculation */}
            {breakdown && (destination === 'tajikistan' || breakdown.calculationComplete) && (
              <>
                <button
                  onClick={() => setShowBreakdown(!showBreakdown)}
                  className="w-full mt-3 px-4 py-3 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                >
                  {showBreakdown ? t('price.hideBreakdown') : t('price.showBreakdown')}
                  <svg className={`w-4 h-4 transition-transform ${showBreakdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {showBreakdown && (
                  <PriceBreakdown
                    breakdown={breakdown}
                    priceKrw={car.price_krw}
                    priceUsd={car.price_usd}
                    usdToRub={usdToRub}
                    destination={destination}
                    totalOverride={destination === 'russia' ? turnkeyPriceRub : car.price_turnkey_tajikistan}
                  />
                )}
              </>
            )}

            {/* How to buy link */}
            <div className="mt-4 pt-4 border-t border-gray-100">
              <a
                href="/how-to-buy"
                className="text-xs text-gray-500 hover:text-primary transition-colors flex items-center gap-1"
              >
                {t('detail.howToBuy')}
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* Detail sections - below gallery on desktop (left col), below price on mobile */}
        <div className="lg:col-span-8 order-3 lg:order-2 space-y-5">
          <CarSpecs car={car} />
          <AccidentHistory records={car.accidentHistory || []} carId={car.id} inspectionData={car.inspectionData} />
          <Equipment items={car.equipment || []} />
          <SimilarCars brand={car.brand} model={car.model} excludeId={car.id} priceRub={car.price_rub} destination={destination} />
        </div>

      </div>
      </div>
    </div>
  );
}
