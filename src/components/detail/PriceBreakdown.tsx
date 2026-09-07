'use client';

import type { PriceBreakdownData } from '@/types';
import { useApp } from '@/contexts/AppContext';

interface PriceBreakdownProps {
  breakdown: PriceBreakdownData;
  priceKrw: number;
  destination?: 'russia' | 'tajikistan';
  totalOverride?: number;
}

export default function PriceBreakdown({ breakdown, priceKrw, destination = 'russia', totalOverride }: PriceBreakdownProps) {
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
    : [
        {
          label: t('price.carPriceKorea'),
          value: fmtUsd(breakdown.carPrice),
          sublabel: `${priceKrw.toLocaleString('ko-KR')} KRW`,
        },
        ...(breakdown.customsValue && breakdown.customsValue !== breakdown.carPrice
          ? [{
              label: t('price.customsValue'),
              value: fmtUsd(breakdown.customsValue),
              sublabel: t('price.customsClearanceDesc'),
            }]
          : []),
        {
          label: t('price.customsDuty'),
          value: fmtUsd(breakdown.customsDuty),
          sublabel: breakdown.customsDutyDetails,
        },
        {
          label: t('price.exciseTax'),
          value: fmtUsd(breakdown.exciseTax || 0),
          sublabel: breakdown.exciseTaxDetails,
        },
        {
          label: t('price.vat'),
          value: fmtUsd(breakdown.vatTax || 0),
          sublabel: undefined,
        },
        {
          label: t('price.procedureFee'),
          value: fmtUsd(breakdown.procedureFee || 0),
          sublabel: t('price.procedureFeeDesc'),
        },
        {
          label: t('price.utilizationFee'),
          value: fmtUsd(breakdown.utilizationFee || 0),
          sublabel: undefined,
        },
        {
          label: t('price.deliveryTj'),
          value: fmtUsd(breakdown.serviceFee),
          sublabel: t('price.deliveryTjDesc'),
        },
      ];

  const totalValue = totalOverride ?? breakdown.total;
  const formattedTotal = isRussia ? formatPrice(totalValue) : fmtUsd(totalValue);

  return (
    <div className="space-y-3 pt-4">
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
            <span className="text-base font-bold text-gray-900">{t('price.totalTurnkey')}</span>
            <div className="text-xs text-gray-400">{isRussia ? t('price.inVladivostok') : t('price.inTajikistan')}</div>
          </div>
          <div className="text-right">
            <div className="text-xl font-bold text-primary">
              {formattedTotal}
            </div>
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
