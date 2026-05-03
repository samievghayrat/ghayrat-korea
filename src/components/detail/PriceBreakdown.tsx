'use client';

import { useState } from 'react';
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
  const [tjDelivery, setTjDelivery] = useState<'none' | 'vladivostok' | 'khujand'>('none');

  const fmtUsd = (v: number) => `$${v.toLocaleString('en-US')}`;
  const carUsd = priceUsd || breakdown.carPrice;
  const vladivostokUsd = breakdown.deliveryVladivostok || 700;
  const khujandUsd = breakdown.deliveryKhujand || 3000;
  const koreaServiceUsd = 300;
  const deliveryUsd = tjDelivery === 'vladivostok'
    ? vladivostokUsd
    : tjDelivery === 'khujand'
      ? khujandUsd
      : 0;
  const tjTotal = carUsd + koreaServiceUsd + deliveryUsd;

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
    : [];

  const totalValue = totalOverride || breakdown.total;
  const formattedTotal = isRussia ? formatPrice(totalValue) : fmtUsd(totalValue);

  return (
    <div className="space-y-3 pt-4">
      {!isRussia && (
        <>
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
            <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50 px-4 py-3">
              <div className="text-xs font-bold uppercase tracking-wide text-gray-500">Дополнительные расходы</div>
              <div className="text-base font-bold text-gray-900">{fmtUsd(koreaServiceUsd + deliveryUsd)}</div>
            </div>
            <div className="space-y-3 px-4 py-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Расходы в Корее</span>
                <span className="text-sm font-bold text-gray-900">{fmtUsd(koreaServiceUsd)}</span>
              </div>
              <div>
                <div className="mb-2 text-xs font-bold uppercase tracking-wide text-gray-400">Доставка</div>
                {[
                  { key: 'none' as const, label: 'Без доставки', value: 0, note: '' },
                  { key: 'vladivostok' as const, label: 'До Владивостока', value: vladivostokUsd, note: 'Корея -> Владивосток' },
                  { key: 'khujand' as const, label: 'До Таджикистана (контейнер)', value: khujandUsd, note: 'приблизительно, зависит от размера авто' },
                ].map((option) => (
                  <button
                    key={option.key}
                    onClick={() => setTjDelivery(option.key)}
                    className="flex w-full items-start justify-between gap-3 rounded-lg py-2 text-left"
                  >
                    <span className="flex min-w-0 gap-2">
                      <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                        tjDelivery === option.key ? 'border-blue-500' : 'border-gray-400'
                      }`}>
                        {tjDelivery === option.key && <span className="h-3 w-3 rounded-full bg-blue-500" />}
                      </span>
                      <span>
                        <span className="block text-sm font-medium text-gray-700">{option.label}</span>
                        {option.note && <span className="block text-xs font-medium text-gray-400">{option.note}</span>}
                      </span>
                    </span>
                    {option.value > 0 && (
                      <span className="shrink-0 text-sm font-bold text-gray-900">{fmtUsd(option.value)}</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
            <div className="border-b border-gray-100 bg-gray-50 px-4 py-3 text-xs font-bold uppercase tracking-wide text-gray-500">
              Мой итог
            </div>
            <div className="space-y-2 px-4 py-4">
              <div className="flex justify-between text-sm text-gray-500">
                <span>Цена</span>
                <span className="font-medium text-gray-900">{fmtUsd(carUsd)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-500">
                <span>Дополнительные расходы</span>
                <span className="font-medium text-gray-900">{fmtUsd(koreaServiceUsd + deliveryUsd)}</span>
              </div>
              <div className="mt-3 flex justify-between border-t border-gray-100 pt-3">
                <span className="font-bold text-gray-900">Итого</span>
                <span className="text-xl font-extrabold text-gray-950">{fmtUsd(tjTotal)}</span>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Rows */}
      {isRussia && <div className="space-y-3">
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
      </div>}

      {isRussia && (
        <div className="border-t-2 border-primary/20 pt-4">
          <div className="flex justify-between items-center">
            <div>
              <span className="text-base font-bold text-gray-900">{t('price.totalTurnkey')}</span>
              <div className="text-[11px] text-gray-400">{t('price.inVladivostok')}</div>
            </div>
            <div className="text-right">
              <div className="text-xl font-bold text-primary">
                {formattedTotal}
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
