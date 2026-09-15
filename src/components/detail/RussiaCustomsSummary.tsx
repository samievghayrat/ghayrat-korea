'use client';

import type { PriceBreakdownData } from '@/types';
import { useApp } from '@/contexts/AppContext';

export function getRussiaCustomsTotal(breakdown: PriceBreakdownData | null): number | null {
  if (!breakdown?.calculationComplete || breakdown.currency !== 'RUB') return null;
  const values = [breakdown.brokerFee, breakdown.customsDuty, breakdown.customsFee, breakdown.utilizationFee];
  return values.every(value => Number.isFinite(value) && value >= 0)
    ? values.reduce((total, value) => total + value, 0) : null;
}

export default function RussiaCustomsSummary({ breakdown }: { breakdown: PriceBreakdownData | null }) {
  const { t } = useApp();
  const total = getRussiaCustomsTotal(breakdown);
  const formatRub = (value: number) => `${value.toLocaleString('ru-RU')} ₽`;
  const pending = t('price.confirmingShort');
  const rows = [
    { label: t('price.broker'), value: breakdown ? formatRub(breakdown.brokerFee) : '—' },
    { label: t('price.customsDuty'), value: total !== null && breakdown ? formatRub(breakdown.customsDuty) : pending },
    { label: t('price.customsFee'), value: total !== null && breakdown ? formatRub(breakdown.customsFee) : pending },
    { label: t('price.utilizationFee'), value: total !== null && breakdown ? formatRub(breakdown.utilizationFee) : pending },
  ];

  return (
    <details className="group border-t border-gray-100">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-lg py-3 outline-none focus-visible:ring-2 focus-visible:ring-primary [&::-webkit-details-marker]:hidden">
        <span className="min-w-0 text-sm font-medium text-gray-600">{t('price.russiaCustoms')}</span>
        <span className="flex shrink-0 items-center gap-2">
          <span className="text-base font-semibold tabular-nums text-gray-950" aria-live="polite">{total !== null ? formatRub(total) : pending}</span>
          <svg className="h-4 w-4 text-gray-400 transition-transform group-open:rotate-180" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m6 9 6 6 6-6" />
          </svg>
        </span>
      </summary>
      <dl className="mb-3 divide-y divide-gray-100 rounded-xl bg-gray-50 px-3">
        {rows.map(row => (
          <div key={row.label} className="flex items-start justify-between gap-3 py-3">
            <dt className="min-w-0 text-xs leading-5 text-gray-500">{row.label}</dt>
            <dd className="shrink-0 text-right text-sm font-semibold tabular-nums text-gray-800">{row.value}</dd>
          </div>
        ))}
      </dl>
    </details>
  );
}
