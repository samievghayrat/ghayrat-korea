'use client';

import { useEffect, useMemo, useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import {
  calculateDamagedAuctionBid,
  type DamageCategory,
  type DamagedAuctionType,
} from '@/lib/damaged-cars';

const locales = { ru: 'ru-RU', en: 'en-US', tj: 'tg-TJ', uz: 'uz-UZ' } as const;

function defaultAuctionType(category: DamageCategory): DamagedAuctionType | null {
  if (category === 'transfer') return 'transfer';
  if (category === 'scrap') return 'scrap';
  return null;
}

export default function DamagedBidCalculator({ category }: { category: DamageCategory }) {
  const { t, lang, convertUsdToKrw, convertKrwToUsd } = useApp();
  const [bidInput, setBidInput] = useState('');
  const [auctionType, setAuctionType] = useState<DamagedAuctionType | null>(() => defaultAuctionType(category));
  useEffect(() => { setAuctionType(defaultAuctionType(category)); }, [category]);

  const bidUsd = Number(bidInput.replace(/\D/g, '')) || 0;
  const bidKrw = bidUsd > 0 ? convertUsdToKrw(bidUsd) : 0;
  const calculation = useMemo(
    () => auctionType && bidKrw > 0 ? calculateDamagedAuctionBid(bidKrw, auctionType) : null,
    [auctionType, bidKrw],
  );
  const formatUsd = (valueKrw: number) => `$${convertKrwToUsd(valueKrw).toLocaleString(locales[lang])}`;

  return <section className="mb-4 rounded-xl border border-gray-200 bg-gray-50 p-4">
    <h2 className="text-base font-bold text-gray-900">{t('damaged.bidCalculator')}</h2>
    <p className="mt-1 text-xs leading-relaxed text-gray-500">{t('damaged.bidCurrency')}</p>

    {(category === 'transfer-scrap' || category === 'unknown') && <fieldset className="mt-3">
      <legend className="mb-2 text-xs font-semibold text-gray-600">{t('damaged.chooseAuctionType')}</legend>
      <div className="grid grid-cols-2 gap-2">
        {(['transfer', 'scrap'] as const).map(type => <label key={type} className={`flex min-h-11 cursor-pointer items-center justify-center rounded-lg border px-2 text-sm font-semibold ${auctionType === type ? 'border-primary bg-primary-50 text-primary' : 'border-gray-200 bg-white text-gray-600'}`}>
          <input type="radio" name="damaged-auction-type" value={type} checked={auctionType === type} onChange={() => setAuctionType(type)} className="sr-only" />
          {t(type === 'transfer' ? 'damaged.transfer' : 'damaged.scrap')}
        </label>)}
      </div>
    </fieldset>}

    <label className="mt-3 block text-xs font-semibold text-gray-600" htmlFor="damaged-bid-amount">{t('damaged.yourBid')}</label>
    <div className="relative mt-1">
      <input
        id="damaged-bid-amount"
        type="text"
        inputMode="numeric"
        autoComplete="off"
        maxLength={15}
        value={bidInput}
        onChange={event => {
          const digits = event.target.value.replace(/\D/g, '').slice(0, 11);
          setBidInput(digits ? Number(digits).toLocaleString('en-US') : '');
        }}
        placeholder="10,000"
        className="min-h-12 w-full rounded-lg border border-gray-300 bg-white px-3 pr-10 text-base font-semibold text-gray-900 outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
      />
      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 font-semibold text-gray-400">$</span>
    </div>
    {!auctionType && bidUsd > 0 && <p role="alert" className="mt-1 text-xs text-amber-700">{t('damaged.chooseAuctionType')}</p>}

    {calculation && <dl className="mt-4 divide-y divide-gray-200 border-t border-gray-200">
      <div className="flex items-center justify-between gap-3 py-2.5"><dt className="text-sm text-gray-600">{t('damaged.yourBid')}</dt><dd className="font-semibold text-gray-900">{formatUsd(calculation.bidKrw)}</dd></div>
      <div className="flex items-center justify-between gap-3 py-2.5"><dt className="text-sm text-gray-600">{t('damaged.auctionFee')}</dt><dd className="font-semibold text-gray-900">{formatUsd(calculation.auctionFeeKrw)}</dd></div>
      {calculation.vatKrw > 0 && <div className="flex items-center justify-between gap-3 py-2.5"><dt className="text-sm text-gray-600">{t('damaged.bidVat')}</dt><dd className="font-semibold text-gray-900">{formatUsd(calculation.vatKrw)}</dd></div>}
      <div className="flex items-center justify-between gap-3 py-2.5"><dt className="text-sm text-gray-600">{t(auctionType === 'scrap' ? 'damaged.scrapFee' : 'damaged.documentFee')}</dt><dd className="font-semibold text-gray-900">{formatUsd(calculation.processingFeeKrw)}</dd></div>
      <div className="flex items-center justify-between gap-3 py-3"><dt className="font-bold text-gray-900">{t('damaged.auctionTotal')}</dt><dd className="text-lg font-extrabold text-primary">{formatUsd(calculation.totalKrw)}</dd></div>
    </dl>}
    <p className="mt-3 text-xs leading-relaxed text-gray-500">{t('damaged.bidEstimate')}</p>
  </section>;
}
