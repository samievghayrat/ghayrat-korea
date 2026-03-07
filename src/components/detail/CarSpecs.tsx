import type { CarListing } from '@/types';
import { formatMileage } from '@/lib/currency';

interface CarSpecsProps {
  car: CarListing;
}

export default function CarSpecs({ car }: CarSpecsProps) {
  const yearMonth = car.month
    ? `${car.year}/${String(car.month).padStart(2, '0')} г.`
    : `${car.year} г.`;

  const specs = [
    { label: 'Марка', value: car.brand },
    { label: 'Модель', value: car.model },
    { label: 'Дата выпуска', value: yearMonth },
    { label: 'Пробег', value: car.mileage ? formatMileage(car.mileage) : null },
    { label: 'Двигатель', value: car.engine || null },
    { label: 'Объём', value: car.displacement ? `${car.displacement} cc` : null },
    { label: 'Мощность', value: car.hp ? `~${car.hp} л.с.` : null },
    { label: 'Топливо', value: car.fuel || null },
    { label: 'КПП', value: car.transmission || null },
    { label: 'Цвет', value: car.color || null },
    { label: 'Кузов', value: car.bodyType || null },
    { label: 'VIN', value: car.vin || null },
  ].filter(s => s.value);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-5">Общие данные</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-3.5">
        {specs.map((spec) => (
          <div key={spec.label} className="flex items-baseline gap-1">
            <span className="text-gray-400 text-sm whitespace-nowrap">{spec.label}</span>
            <span className="flex-1 border-b border-dotted border-gray-200 min-w-[2rem]" />
            <span className="font-semibold text-gray-900 text-sm whitespace-nowrap">{spec.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
