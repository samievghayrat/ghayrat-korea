import type { PriceBreakdownData } from '@/types';

interface PriceBarProps {
  breakdown: PriceBreakdownData;
}

const segments = [
  { key: 'car', label: 'Стоимость авто', color: 'bg-amber-400', dot: 'bg-amber-400' },
  { key: 'customs', label: 'Таможенная пошлина', color: 'bg-violet-500', dot: 'bg-violet-500' },
  { key: 'service', label: 'Доставка и оформление', color: 'bg-emerald-500', dot: 'bg-emerald-500' },
  { key: 'other', label: 'Утильсбор + брокер', color: 'bg-teal-500', dot: 'bg-teal-500' },
] as const;

export default function PriceBar({ breakdown }: PriceBarProps) {
  const values = [
    breakdown.carPrice,
    breakdown.customsDuty,
    breakdown.serviceFee,
    breakdown.utilizationFee + breakdown.brokerFee,
  ];
  const total = values.reduce((a, b) => a + b, 0);
  if (total === 0) return null;

  const percentages = values.map((v) => Math.round((v / total) * 100));
  // Fix rounding so they sum to 100
  const diff = 100 - percentages.reduce((a, b) => a + b, 0);
  if (diff !== 0) percentages[0] += diff;

  return (
    <div className="space-y-2">
      <div className="flex h-3 rounded-full overflow-hidden">
        {segments.map((seg, i) => (
          percentages[i] > 0 && (
            <div
              key={seg.key}
              className={seg.color}
              style={{ width: `${percentages[i]}%` }}
            />
          )
        ))}
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-1">
        {segments.map((seg, i) => (
          <div key={seg.key} className="flex items-center gap-1.5 text-xs text-gray-600">
            <span className={`w-2 h-2 rounded-full flex-shrink-0 ${seg.dot}`} />
            <span className="truncate">{seg.label}</span>
            <span className="text-gray-400 ml-auto">{percentages[i]}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
