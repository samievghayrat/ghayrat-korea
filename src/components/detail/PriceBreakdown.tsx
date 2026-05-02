'use client';

import type { PriceBreakdownData } from '@/types';
import { useApp } from '@/contexts/AppContext';

interface PriceBreakdownProps {
  breakdown: PriceBreakdownData;
  priceKrw: number;
  priceUsd?: number;
  destination?: 'russia' | 'tajikistan';
  totalOverride?: number;
}

export default function PriceBreakdown({ breakdown, priceKrw, priceUsd, destination = 'russia', totalOverride }: PriceBreakdownProps) {
  const { t, formatPrice } = useApp();
  const isRussia = destination === 'russia';

  const fmtUsd = (v: number) => `$${v.toLocaleString('en-US')}`;

  const rows = isRussia
    ? [
        {
          label: t('price.carPriceKorea'),
          value: formatPrice(breakdown.carPrice),
          sublabel: `${priceKrw.toLocaleString()} KRW`,
        },
        {
          label: t('price.customsDuty'),
          value: formatPrice(breakdown.customsDuty),
          sublabel: breakdown.customsDutyDetails,
        },
        {
          label: t('price.customsFee'),
          value: formatPrice(breakdown.customsFee),
          sublabel: t('price.customsFeeDesc'),
        },
        {
          label: t('price.utilizationFee'),
          value: formatPrice(breakdown.utilizationFee),
          sublabel: breakdown.utilizationWarning,
          warning: breakdown.utilizationFee > 10000,
        },
        {
          label: t('price.delivery'),
          value: formatPrice(breakdown.serviceFee),
          sublabel: `$${breakdown.serviceFeeUsd.toLocaleString('en-US')} — ${t('price.deliveryDesc')}`,
        },
        {
          label: t('price.broker'),
          value: formatPrice(breakdown.brokerFee),
          sublabel: t('price.brokerDesc'),
        },
      ]
    : (() => {
        const carUsd = priceUsd || breakdown.carPrice;
        const customsTotal = (breakdown.customsDuty || 0)
          + (breakdown.exciseTax || 0)
          + (breakdown.vatTax || 0)
          + (breakdown.procedureFee || 0)
          + (breakdown.utilizationFee || 0);
        return [
          {
            label: t('price.carPriceKorea'),
            value: fmtUsd(carUsd),
            sublabel: `${priceKrw.toLocaleString()} KRW`,
          },
          {
            label: t('price.deliveryVladivostok'),
            value: fmtUsd(breakdown.deliveryVladivostok || 700),
            sublabel: t('price.deliveryVladivostokDesc'),
          },
          {
            label: t('price.deliveryKhujand'),
            value: `~${fmtUsd(breakdown.deliveryKhujand || 3000)}`,
            sublabel: t('price.deliveryKhujandDesc'),
          },
          {
            label: t('price.serviceFeeKorea'),
            value: fmtUsd(700),
            sublabel: t('price.serviceFeeKoreaDesc'),
          },
          {
            label: t('price.customsClearance'),
            value: `~${fmtUsd(customsTotal)}`,
            sublabel: t('price.customsClearanceDesc'),
          },
        ];
      })();

  const totalLabel = isRussia ? t('price.totalTurnkey') : t('price.totalDelivered');
  const totalSublabel = isRussia ? t('price.inVladivostok') : t('price.inTajikistan');
  const totalValue = totalOverride || breakdown.total;

  return (
    <div className="space-y-3 pt-4">
      {/* Rows */}
      <div className="space-y-3">
        {rows.map((row) => (
          <div key={row.label} className="flex justify-between items-start">
            <div>
              <span className="text-gray-700 text-sm">{row.label}</span>
              {row.sublabel && (
                <div className={`text-[11px] ${'warning' in row && row.warning ? 'text-amber-500' : 'text-gray-400'}`}>
                  {row.sublabel}
                </div>
              )}
            </div>
            <span className="font-semibold text-sm text-gray-900 whitespace-nowrap ml-4">{row.value}</span>
          </div>
        ))}
      </div>

      {/* Total - only for Russia */}
      {isRussia && (
        <div className="border-t-2 border-primary/20 pt-4">
          <div className="flex justify-between items-center">
            <div>
              <span className="text-base font-bold text-gray-900">{totalLabel}</span>
              <div className="text-[11px] text-gray-400">{totalSublabel}</div>
            </div>
            <div className="text-right">
              <div className="text-xl font-bold text-primary">
                {formatPrice(totalValue)}
              </div>
            </div>
          </div>
        </div>
      )}

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
