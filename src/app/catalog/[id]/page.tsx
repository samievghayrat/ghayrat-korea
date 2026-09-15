'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import type { CarListing } from '@/types';
import ImageGallery from '@/components/detail/ImageGallery';
import CarSpecs from '@/components/detail/CarSpecs';
import RussiaCustomsSummary, { getRussiaCustomsTotal } from '@/components/detail/RussiaCustomsSummary';
import Equipment from '@/components/detail/Equipment';
import CarCondition from '@/components/detail/CarCondition';
import SimilarCars from '@/components/detail/SimilarCars';
import FavoriteButton from '@/components/shared/FavoriteButton';
import CarShareButton from '@/components/shared/CarShareButton';
import { getCarShareUrl, getManagerContactLinks } from '@/lib/car-sharing';
import { calculateImportCost, getTjContainerShippingUsd } from '@/lib/calculator';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import CountryFlag from '@/components/shared/CountryFlag';
import { useApp } from '@/contexts/AppContext';
import { getCompactModelName, translateColor } from '@/lib/translations';
import { getEncarFeeKrw, getPriceIncludingEncarFee } from '@/lib/encar-fee';
import { getCarDeliveryDestination, type CarDestination } from '@/lib/car-destination';
import { parseManualEngineInput } from '@/lib/manual-engine-input';

function getSessionCar(id: string): CarListing | null {
  try {
    const raw = sessionStorage.getItem(`car_${id}`);
    if (raw) return JSON.parse(raw);
  } catch {}
  return null;
}

function buildCarTitle(car: CarListing): string {
  return [car.brand, getCompactModelName(car.model)].filter(Boolean).join(' ');
}

interface RemoteCarDetails {
  yearMonth?: string;
  mileage?: number;
  displacement?: number;
  hp?: number;
  fuel?: string;
  color?: string;
  bodyType?: string;
  transmission?: string;
  drivetrain?: string;
  seatCount?: number;
  vin?: string;
}

export default function CarDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const id = params.id as string;

  const { t } = useApp();
  const sessionCar = typeof window !== 'undefined' ? getSessionCar(id) : null;
  const [car, setCar] = useState<CarListing | null>(sessionCar);
  const [apiLoaded, setApiLoaded] = useState(false);
  const [galleryLoaded, setGalleryLoaded] = useState(false);
  const [remoteGalleryImages, setRemoteGalleryImages] = useState<string[]>([]);
  const [remoteCarDetails, setRemoteCarDetails] = useState<RemoteCarDetails | null>(null);
  const [loading, setLoading] = useState(!sessionCar);
  const [error, setError] = useState(false);
  const [manualHp, setManualHp] = useState('');
  const [manualDisplacement, setManualDisplacement] = useState('');
  const [destinationChoice, setDestinationChoice] = useState<{
    carId: string;
    destination: CarDestination;
  } | null>(null);
  const destination = getCarDeliveryDestination(
    car?.id === id ? car.year : undefined,
    destinationChoice?.carId === id
      ? destinationChoice.destination
      : searchParams.get('destination'),
  );
  const chooseDestination = (nextDestination: CarDestination) => {
    setDestinationChoice({ carId: id, destination: nextDestination });
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
                // Keep Encar's gallery/specification body classification when
                // a later pricing enhancement only contains catalogue data.
                bodyType: current?.bodyType || enhanced.bodyType,
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
    setRemoteCarDetails(null);
    const controller = new AbortController();

    fetch(`/api/encar-gallery/${id}?details=1`, { signal: controller.signal })
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data?.images?.length) setRemoteGalleryImages(data.images);
        if (data?.details) setRemoteCarDetails(data.details);
      })
      .catch(error => {
        if (!(error instanceof DOMException && error.name === 'AbortError')) {
          console.error('Gallery fetch failed:', error);
        }
      })
      .finally(() => setGalleryLoaded(true));

    return () => controller.abort();
  }, [id]);

  useEffect(() => {
    if (!remoteCarDetails) return;
    const details = remoteCarDetails;
    const yearMonth = String(details.yearMonth || '');
    setCar(current => current ? {
      ...current,
      year: Number(yearMonth.slice(0, 4)) || current.year,
      month: Number(yearMonth.slice(4, 6)) || current.month,
      mileage: details.mileage || current.mileage,
      displacement: details.displacement || current.displacement,
      hp: details.hp || current.hp,
      color: details.color ? translateColor(details.color) : current.color,
      bodyType: details.bodyType || current.bodyType,
      transmission: details.transmission || current.transmission,
      drivetrain: details.drivetrain || current.drivetrain,
      seatCount: details.seatCount || current.seatCount,
      vin: details.vin || current.vin,
    } : current);
  }, [remoteCarDetails, apiLoaded]);

  useEffect(() => {
    setManualHp('');
    setManualDisplacement('');
  }, [id]);

  const effectiveHp = car?.hp || parseManualEngineInput(manualHp, 'hp');
  const effectiveDisplacement = car?.displacement || parseManualEngineInput(manualDisplacement, 'displacement') || 0;
  const fullTitle = car ? buildCarTitle(car) : '';
  const titleSuffix = t('brand.subtitle');

  useEffect(() => {
    if (fullTitle) document.title = `${fullTitle} — ${titleSuffix} | GHAYRAT KOREA`;
  }, [fullTitle, titleSuffix]);

  // Keep the visible itemized quote and total on the same API data and rates.
  const breakdown = useMemo(() => {
    if (!car || !apiLoaded) return null;
    return calculateImportCost({
      priceKrw: car.price_krw,
      priceRub: car.price_rub,
      priceUsd: car.price_usd,
      encarFeeKrw: getEncarFeeKrw(car.source),
      displacement: effectiveDisplacement,
      year: car.year,
      month: car.month,
      fuel: car.fuel,
      hp: effectiveHp,
      brand: car.brand,
      model: car.model,
      badge: car.badge,
      bodyType: car.bodyType,
      destination,
      eurRate: car.eur_to_rub,
      usdRate: car.usd_to_rub,
      russiaCustomsOverride: destination === 'russia' ? car.panAutoCustoms : undefined,
    });
  }, [car, destination, apiLoaded, effectiveDisplacement, effectiveHp]);

  if (loading) return <LoadingSpinner className="py-32" />;

  if (error || !car) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">{t('detail.notFound')}</h1>
        <p className="text-gray-500 mb-8">{t('detail.notFoundDesc')}</p>
        <Link href="/" className="btn-primary inline-block">{t('detail.backToCatalog')}</Link>
      </div>
    );
  }

  const turnkeyPriceRub = destination === 'russia' ? breakdown?.total : undefined;
  const turnkeyPriceUsd = destination === 'tajikistan' ? breakdown?.total : undefined;
  const calculationReady = destination === 'tajikistan'
    ? Boolean(breakdown?.calculationComplete)
    : (breakdown?.calculationComplete ?? car.russia_calculation_complete ?? Boolean(turnkeyPriceRub));
  const fuelLower = car.fuel.toLowerCase();
  const isElectricPower = fuelLower.includes('электро') || fuelLower.includes('electric');
  const isHybridPower = fuelLower.includes('гибрид') || fuelLower.includes('hybrid');
  const calculationHp = breakdown?.calculationHp ?? effectiveHp ?? 0;
  const powerLimitHp = breakdown?.preferentialPowerLimitHp ?? (isElectricPower ? 80 : 160);
  const hasHighPower = calculationHp > powerLimitHp;
  const isPowerBoundary = calculationHp === powerLimitHp;
  const hasPreferentialPower = calculationHp > 0
    && calculationHp < powerLimitHp
    && !isHybridPower
    && (isElectricPower || effectiveDisplacement <= 3000);
  const formatRub = (value: number) => `${value.toLocaleString('ru-RU')} ₽`;
  const formatUsd = (value: number) => `$${value.toLocaleString('en-US')}`;
  const formattedDeliveryTotal = destination === 'russia'
    ? (turnkeyPriceRub ? formatRub(turnkeyPriceRub) : null)
    : (turnkeyPriceUsd ? formatUsd(turnkeyPriceUsd) : null);

  const galleryImages = remoteGalleryImages.length > 0
    ? remoteGalleryImages
    : car.images && car.images.length > 0
    ? car.images
    : [car.imageUrl || '/images/no-image.svg'];

  const displayCar = effectiveHp !== car.hp || effectiveDisplacement !== (car.displacement || 0)
    ? { ...car, hp: effectiveHp, displacement: effectiveDisplacement }
    : car;
  const displayPrice = getPriceIncludingEncarFee(car);
  const tajikCarPriceUsd = breakdown
    ? breakdown.carPrice + (breakdown.encarFee || 0)
    : (displayPrice.priceUsd || 0);
  const tajikPriceRows = [
    {
      label: t('card.priceInKorea'),
      value: tajikCarPriceUsd > 0 ? formatUsd(tajikCarPriceUsd) : '—',
    },
    {
      label: t('price.shippingShort'),
      value: formatUsd(breakdown?.serviceFee ?? getTjContainerShippingUsd(car)),
    },
    {
      label: t('price.customsShort'),
      value: calculationReady && breakdown?.customsTotal
        ? formatUsd(breakdown.customsTotal)
        : apiLoaded ? t('price.noInformationShort') : '—',
    },
  ];
  const russianPriceRows = [
    { label: t('card.priceInKorea'), value: formatRub(breakdown ? breakdown.carPrice + (breakdown.encarFee || 0) : displayPrice.priceRub) },
    { label: t('price.delivery'), value: breakdown ? formatRub(breakdown.serviceFee) : '—' },
  ];
  const russianCustomsTotal = getRussiaCustomsTotal(breakdown);
  const russianTotalTerms = [...russianPriceRows.map(row => row.value),
    russianCustomsTotal !== null ? formatRub(russianCustomsTotal) : t('price.confirmingShort')];
  const contactLinks = getManagerContactLinks(
    `${t('contact.carInterest')} ${fullTitle} ${car.year}\n${getCarShareUrl('catalog', car.id, destination)}`,
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 lg:py-7">
      {/* Breadcrumb */}
      <nav className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-gray-400 mb-4">
        <Link href="/" className="shrink-0 hover:text-primary transition-colors">{t('nav.catalog')}</Link>
        <span className="shrink-0">/</span>
        <span className="shrink-0 text-gray-700 font-medium">{car.id}</span>
        <span className="shrink-0" aria-hidden="true">/</span>
        <span className="min-w-0 break-words text-gray-700 font-medium" aria-current="page">{fullTitle}</span>
      </nav>

      <div className="mb-5 lg:mb-6">
        <div className="flex items-start justify-between gap-3 lg:items-end">
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
          <CarShareButton title={`${fullTitle} ${car.year}`} url={getCarShareUrl('catalog', car.id, destination)} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 lg:gap-x-6 lg:gap-y-4 items-start">
        {/* Gallery */}
        <div className="lg:col-span-8 order-1">
          <div className="bg-white rounded-2xl border border-gray-200 p-2 sm:p-3 shadow-sm">
            <div className="relative">
              <ImageGallery
                images={galleryImages}
                alt={fullTitle}
              />
              <div className="absolute left-3 top-3 z-20">
                <FavoriteButton
                  carId={car.id}
                  className="border border-white/70 shadow-lg backdrop-blur-sm"
                />
              </div>
            </div>
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
            <div>
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
                <span className="inline-flex items-center justify-center gap-2">
                  <CountryFlag country="tajikistan" />
                  {t('country.tajikistan')}
                </span>
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
                <span className="inline-flex items-center justify-center gap-2">
                  <CountryFlag country="russia" />
                  {t('country.russia')}
                </span>
              </button>
            </div>

            {destination === 'tajikistan' ? (
              <div className="mt-4 rounded-2xl border border-gray-200 bg-white px-4">
                <dl className="divide-y divide-gray-100">
                  {tajikPriceRows.map((row) => (
                    <div key={row.label} className="flex items-center justify-between gap-4 py-3.5">
                      <dt className="text-sm font-medium text-gray-600">{row.label}</dt>
                      <dd className="min-w-0 text-right text-lg font-bold tracking-tight text-gray-950">{row.value}</dd>
                    </div>
                  ))}
                </dl>
                <div className="border-t border-gray-200 py-4">
                  {calculationReady && formattedDeliveryTotal && (
                    <p className="mb-3 text-xs leading-5 tabular-nums text-gray-500">
                      {tajikPriceRows.map((row) => row.value).join(' + ')} = {formattedDeliveryTotal}
                    </p>
                  )}
                  <div className="flex items-center justify-between gap-4" aria-live="polite">
                    <span className="text-base font-semibold text-gray-950">{t('price.totalShort')}</span>
                    {calculationReady && formattedDeliveryTotal ? (
                      <span className="text-2xl font-bold tracking-tight text-gray-950">{formattedDeliveryTotal}</span>
                    ) : apiLoaded ? (
                      <span className="text-base font-semibold text-gray-500">{t('price.totalUnavailableShort')}</span>
                    ) : (
                      <span className="h-8 w-28 animate-pulse rounded bg-gray-100" />
                    )}
                  </div>
                  <p className="mt-3 text-xs leading-5 text-gray-500" role="note">
                    {apiLoaded && !calculationReady
                      ? t('price.customsNeedsConfirmationDesc')
                      : t('price.customsEstimateShort')}
                  </p>
                </div>
              </div>
            ) : (
              <div className="mt-4 rounded-2xl border border-gray-200 bg-white px-4">
                <dl className="divide-y divide-gray-100">
                  {russianPriceRows.map(row => (
                    <div key={row.label} className="flex items-center justify-between gap-3 py-3">
                      <dt className="min-w-0 text-sm font-medium text-gray-600">{row.label}</dt>
                      <dd className="shrink-0 text-right text-base font-semibold tabular-nums text-gray-950">{row.value}</dd>
                    </div>
                  ))}
                </dl>
                <RussiaCustomsSummary breakdown={breakdown} />
                <div className="border-t border-gray-200 py-4">
                  {calculationReady && formattedDeliveryTotal && (
                    <p className="mb-3 text-xs leading-5 tabular-nums text-gray-500">
                      {russianTotalTerms.join(' + ')} = {formattedDeliveryTotal}
                    </p>
                  )}
                  <div className="flex items-center justify-between gap-3" aria-live="polite">
                    <span className="text-base font-semibold text-gray-950">{t('price.totalShort')}</span>
                    {calculationReady && formattedDeliveryTotal ? (
                      <span className="text-2xl font-bold tracking-tight tabular-nums text-gray-950">{formattedDeliveryTotal}</span>
                    ) : apiLoaded ? (
                      <span className="text-base font-semibold text-gray-500">{t('price.confirmingShort')}</span>
                    ) : (
                      <span className="h-8 w-28 animate-pulse rounded bg-gray-100" />
                    )}
                  </div>
                  <p className="mt-1 text-xs text-gray-500">{t('price.inVladivostok')}</p>
                  <p className="mt-3 text-xs leading-5 text-gray-500" role="note">{t('price.estimateShort')}</p>
                </div>
                {apiLoaded && (!car.hp || !car.displacement) && (
                  <div className="border-t border-gray-100 py-4">
                    <h3 className="text-sm font-semibold text-gray-900">{t('price.needsEngineData')}</h3>
                    <p className="mt-1 text-xs leading-5 text-gray-500">{t('price.needsEngineDataDesc')}</p>
                    <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                    {!car.displacement && (
                      <label className="text-xs font-semibold text-gray-600">
                        {t('price.enterDisplacement')}
                        <input
                          type="number"
                          min="500"
                          max="10000"
                          step="1"
                          inputMode="numeric"
                          value={manualDisplacement}
                          onChange={(event) => setManualDisplacement(event.target.value)}
                          className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-base text-gray-900 outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                          placeholder="1998"
                        />
                      </label>
                    )}
                    {!car.hp && (
                      <label className="text-xs font-semibold text-gray-600">
                        {t('price.enterHp')}
                        <input
                          type="number"
                          min="30"
                          max="1500"
                          step="1"
                          inputMode="numeric"
                          value={manualHp}
                          onChange={(event) => setManualHp(event.target.value)}
                          className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-base text-gray-900 outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                          placeholder="150"
                        />
                      </label>
                    )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {destination === 'russia' && hasHighPower && (
                <div className="mt-3 border-l-2 border-amber-400 pl-3" role="note">
                  <div className="text-sm font-semibold text-amber-800">
                    <span aria-hidden="true">⚠</span>
                    {t('price.highPowerTitle')}
                  </div>
                  <p className="mt-1 text-xs leading-5 text-gray-500">
                    {t('price.highPowerDesc')
                      .replace('{hp}', calculationHp.toLocaleString('ru-RU'))
                      .replace('{limit}', powerLimitHp.toLocaleString('ru-RU'))}
                  </p>
                </div>
              )}

              {destination === 'russia' && isPowerBoundary && (
                <div className="mt-3 border-l-2 border-gray-300 pl-3" role="note">
                  <div className="text-sm font-semibold text-gray-700">{t('price.powerBoundaryTitle')}</div>
                  <p className="mt-1 text-xs leading-5 text-gray-500">
                    {t('price.powerBoundaryDesc').replace('{limit}', powerLimitHp.toLocaleString('ru-RU'))}
                  </p>
                </div>
              )}

              {destination === 'russia' && isHybridPower && (
                <div className="mt-3 border-l-2 border-gray-300 pl-3" role="note">
                  <div className="text-sm font-semibold text-gray-700">{t('price.hybridPowerTitle')}</div>
                  <p className="mt-1 text-xs leading-5 text-gray-500">{t('price.hybridPowerDesc')}</p>
                </div>
              )}

              {destination === 'russia' && hasPreferentialPower && (
                <div className="mt-3 text-xs leading-5 text-gray-500" role="note">
                  <p>
                    {t('price.preferentialUtilDesc')
                      .replace('{hp}', calculationHp.toLocaleString('ru-RU'))
                      .replace('{limit}', powerLimitHp.toLocaleString('ru-RU'))}
                  </p>
                </div>
              )}


            <a
              href={contactLinks.telegram}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-cta-green mt-5"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0h-.056zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.479.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
              </svg>
              {t('nav.writeManager')}
            </a>

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
          <CarSpecs car={displayCar} />
          <CarCondition records={car.accidentHistory || []} carId={car.id} source={car.source} inspectionData={car.inspectionData} />
          <Equipment items={car.equipment || []} />
          <SimilarCars brand={car.brand} model={car.model} excludeId={car.id} priceRub={car.price_rub} />
        </div>

      </div>
      </div>
    </div>
  );
}
