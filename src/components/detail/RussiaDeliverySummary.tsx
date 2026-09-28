'use client';

import type { PriceBreakdownData } from '@/types';
import { useApp } from '@/contexts/AppContext';

const COMPANY_SERVICE_FEE_RUB = 50_000;

export default function RussiaDeliverySummary({ breakdown }: { breakdown: PriceBreakdownData | null }) {
  const { t } = useApp();
  const ready = breakdown?.currency === 'RUB';
  const shippingRub = ready ? Math.max(0, breakdown.serviceFee - COMPANY_SERVICE_FEE_RUB) : null;
  const koreaExpensesRub = ready ? (breakdown.encarFee || 0) : null;
  const total = ready ? breakdown.serviceFee + (breakdown.encarFee || 0) : null;
  const usdToRub = ready && breakdown.serviceFeeUsd > 0 && shippingRub !== null
    ? shippingRub / breakdown.serviceFeeUsd
    : null;
  const koreaExpensesUsd = koreaExpensesRub !== null && usdToRub
    ? Math.round(koreaExpensesRub / usdToRub)
    : null;
  const formatRub = (value: number) => `${value.toLocaleString('ru-RU')} ₽`;

  const rows = [
    {
      label: t('price.koreaExpensesParking'),
      value: breakdown?.encarFeeKrw
        ? `₩${breakdown.encarFeeKrw.toLocaleString('ko-KR')}${koreaExpensesUsd !== null ? ` ($${koreaExpensesUsd.toLocaleString('en-US')})` : ''}`
        : '—',
    },
    {
      label: t('price.shippingVladivostok'),
      value: shippingRub !== null
        ? `$${breakdown!.serviceFeeUsd.toLocaleString('en-US')} (${formatRub(shippingRub)})`
        : '—',
    },
    { label: t('price.companyService'), value: formatRub(COMPANY_SERVICE_FEE_RUB) },
  ];

  return (
    <details className="group border-t border-gray-100">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-lg py-3 outline-none focus-visible:ring-2 focus-visible:ring-primary [&::-webkit-details-marker]:hidden">
        <span className="min-w-0 text-sm font-medium text-gray-600">{t('price.delivery')}</span>
        <span className="flex shrink-0 items-center gap-2">
          <span className="text-right text-sm font-semibold tabular-nums text-gray-950 sm:text-base">
            {total !== null ? formatRub(total) : '—'}
          </span>
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
