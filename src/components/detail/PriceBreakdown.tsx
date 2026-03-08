'use client';

import type { PriceBreakdownData } from '@/types';
import { EXCHANGE_RATES } from '@/lib/constants';
import { useApp } from '@/contexts/AppContext';

interface PriceBreakdownProps {
  breakdown: PriceBreakdownData;
  priceKrw: number;
  destination?: 'russia' | 'tajikistan';
}

export default function PriceBreakdown({ breakdown, priceKrw, destination = 'russia' }: PriceBreakdownProps) {
  const { t, formatPrice } = useApp();
  const isRussia = destination === 'russia';

  const rows = isRussia
    ? [
        {
          label: t('price.carPriceKorea'),
          value: breakdown.carPrice,
          sublabel: `${priceKrw.toLocaleString()} KRW`,
        },
        {
          label: t('price.customsDuty'),
          value: breakdown.customsDuty,
          sublabel: breakdown.customsDutyDetails,
        },
        {
          label: t('price.utilizationFee'),
          value: breakdown.utilizationFee,
          sublabel: breakdown.utilizationWarning,
          warning: breakdown.utilizationFee > 10000,
        },
        {
          label: t('price.delivery'),
          value: breakdown.serviceFee,
          sublabel: `$${breakdown.serviceFeeUsd.toLocaleString('en-US')} — ${t('price.deliveryDesc')}`,
        },
        {
          label: t('price.broker'),
          value: breakdown.brokerFee,
          sublabel: t('price.brokerDesc'),
        },
      ]
    : [
        {
          label: t('price.carPriceKorea'),
          value: breakdown.carPrice,
          sublabel: `${priceKrw.toLocaleString()} KRW`,
        },
        {
          label: t('price.deliveryTj'),
          value: breakdown.serviceFee,
          sublabel: `$${breakdown.serviceFeeUsd.toLocaleString('en-US')} — ${t('price.deliveryTjDesc')}`,
        },
      ];

  const totalLabel = isRussia ? t('price.totalTurnkey') : t('price.totalDelivered');
  const totalSublabel = isRussia ? t('price.inVladivostok') : t('price.inTajikistan');

  return (
    <div className="space-y-3 pt-4">
      {/* Exchange rates */}
      <div className="flex gap-3 text-[11px] text-gray-400">
        <span>USD: <span className="text-gray-600 font-medium">{EXCHANGE_RATES.USD} &#8381;</span></span>
        <span>EUR: <span className="text-gray-600 font-medium">{EXCHANGE_RATES.EUR} &#8381;</span></span>
        <span>1000 KRW: <span className="text-gray-600 font-medium">{(EXCHANGE_RATES.KRW * 1000).toFixed(2)} &#8381;</span></span>
      </div>

      {/* Rows */}
      <div className="space-y-3">
        {rows.map((row) => (
          <div key={row.label} className="flex justify-between items-start">
            <div>
              <span className="text-gray-700 text-sm">{row.label}</span>
              {row.sublabel && (
                <div className={`text-[11px] ${row.warning ? 'text-amber-500' : 'text-gray-400'}`}>
                  {row.sublabel}
                </div>
              )}
            </div>
            <span className="font-semibold text-sm text-gray-900 whitespace-nowrap ml-4">{formatPrice(row.value)}</span>
          </div>
        ))}
      </div>

      {/* Total */}
      <div className="border-t-2 border-primary/20 pt-4">
        <div className="flex justify-between items-center">
          <div>
            <span className="text-base font-bold text-gray-900">{totalLabel}</span>
            <div className="text-[11px] text-gray-400">{totalSublabel}</div>
          </div>
          <div className="text-right">
            <div className="text-xl font-bold text-primary">{formatPrice(breakdown.total)}</div>
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="bg-amber-50/50 border border-amber-100/50 rounded-lg p-3">
        <p className="text-[11px] text-amber-700 flex items-start gap-1.5">
          <svg className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {t('price.disclaimer')}
        </p>
      </div>
    </div>
  );
}
