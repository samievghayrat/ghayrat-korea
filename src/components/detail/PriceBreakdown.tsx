'use client';

import type { PriceBreakdownData } from '@/types';
import { useApp } from '@/contexts/AppContext';

interface PriceBreakdownProps {
  breakdown: PriceBreakdownData;
  priceKrw: number;
  priceRub: number;
  priceUsd?: number;
  destination?: 'russia' | 'tajikistan';
  totalOverride?: number;
}

export default function PriceBreakdown({ breakdown, priceKrw, priceRub, priceUsd, destination = 'russia', totalOverride }: PriceBreakdownProps) {
  const { t, currency, convertUsdToKrw, formatPrice, formatKrwPrice, formatListingPrice } = useApp();
  const isRussia = destination === 'russia';

  const fmtUsd = (v: number) => `$${v.toLocaleString('en-US')}`;
  const fmtRub = (v: number) => `${v.toLocaleString('ru-RU')} ₽`;
  const fmtSelectedFromUsd = (v: number) => formatKrwPrice(convertUsdToKrw(v));
  const rubDetails = (value: number, details?: string) =>
    [fmtRub(value), details].filter(Boolean).join(' · ');

  const rows = isRussia
    ? [
        {
          label: t('price.carPriceKorea'),
          value: formatListingPrice(priceKrw, priceRub, priceUsd),
          sublabel: `${fmtRub(breakdown.carPrice)} · ₩${priceKrw.toLocaleString('ko-KR')}`,
        },
        {
          label: t('price.customsDuty'),
          value: formatPrice(breakdown.customsDuty),
          sublabel: rubDetails(breakdown.customsDuty, breakdown.customsDutyDetails),
        },
        {
          label: t('price.customsFee'),
          value: formatPrice(breakdown.customsFee),
          sublabel: rubDetails(breakdown.customsFee, t('price.customsFeeDesc')),
        },
        {
          label: t('price.utilizationFee'),
          value: formatPrice(breakdown.utilizationFee),
          sublabel: rubDetails(breakdown.utilizationFee, breakdown.utilizationWarning),
          warning: breakdown.utilizationFee > 10000,
        },
        {
          label: t('price.delivery'),
          value: formatPrice(breakdown.serviceFee),
          sublabel: rubDetails(breakdown.serviceFee, t('price.deliveryDesc')),
        },
        {
          label: t('price.broker'),
          value: formatPrice(breakdown.brokerFee),
          sublabel: rubDetails(breakdown.brokerFee, t('price.brokerDesc')),
        },
      ]
    : [
        {
          label: t('price.carPriceKorea'),
          value: formatListingPrice(priceKrw, priceRub, priceUsd),
          sublabel: `${priceKrw.toLocaleString('ko-KR')} KRW`,
        },
        {
          label: t('price.deliveryTj'),
          value: fmtSelectedFromUsd(breakdown.serviceFee),
          sublabel: t('price.deliveryTjDesc'),
        },
      ];

  const totalValue = totalOverride ?? breakdown.total;
  const formattedTotal = isRussia ? formatPrice(totalValue) : fmtSelectedFromUsd(totalValue);

  return (
    <div className="space-y-3 pt-4">
      {isRussia && breakdown.highPowerUtilization && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-3" role="note">
          <div className="text-sm font-bold text-amber-800">{t('price.highPowerTitle')}</div>
          <p className="mt-1 text-xs leading-5 text-amber-700">
            {t('price.highPowerDesc')
              .replace('{hp}', (breakdown.calculationHp || 0).toLocaleString('ru-RU'))
              .replace('{limit}', (breakdown.preferentialPowerLimitHp || 160).toLocaleString('ru-RU'))}
          </p>
        </div>
      )}

      {isRussia && breakdown.powerRequiresConfirmation && (
        <div className="rounded-xl border border-sky-200 bg-sky-50 p-3" role="note">
          <div className="text-sm font-bold text-sky-800">{t('price.hybridPowerTitle')}</div>
          <p className="mt-1 text-xs leading-5 text-sky-700">{t('price.hybridPowerDesc')}</p>
        </div>
      )}

      <div className="space-y-3 rounded-xl border border-gray-100 bg-gray-50/70 p-4">
        {rows.map((row) => (
          <div key={row.label} className="flex justify-between items-start">
            <div>
              <span className="text-gray-700 text-sm">{row.label}</span>
              {row.sublabel && (
                <div className={`mt-0.5 text-xs ${'warning' in row && row.warning ? 'text-amber-600' : 'text-gray-400'}`}>
                  {row.sublabel}
                </div>
              )}
            </div>
            <span className="font-semibold text-sm text-gray-900 whitespace-nowrap ml-4">{row.value}</span>
          </div>
        ))}
      </div>

      <div className="border-t-2 border-primary/20 pt-4">
        <div className="flex justify-between items-center">
          <div>
            <span className="text-base font-bold text-gray-900">{isRussia ? t('price.totalTurnkey') : t('price.totalDelivered')}</span>
            <div className="text-xs text-gray-400">{isRussia ? t('price.inVladivostok') : t('price.inTajikistan')}</div>
          </div>
          <div className="text-right">
            <div className="text-xl font-bold text-primary">
              {formattedTotal}
            </div>
            {isRussia && currency !== 'RUB' && (
              <div className="mt-0.5 text-xs font-medium text-gray-400">≈ {fmtRub(totalValue)}</div>
            )}
            {!isRussia && currency !== 'USD' && (
              <div className="mt-0.5 text-xs font-medium text-gray-400">≈ {fmtUsd(totalValue)}</div>
            )}
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="bg-amber-50/50 border border-amber-100/50 rounded-lg p-3">
        <p className="text-[11px] text-amber-700 flex items-start gap-1.5">
          <svg className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {isRussia ? t('price.disclaimer') : t('price.disclaimerTj')}
        </p>
      </div>
    </div>
  );
}
