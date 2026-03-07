'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { CarListing } from '@/types';
import { formatPrice } from '@/lib/currency';

export default function AdminCarsPage() {
  const [cars, setCars] = useState<CarListing[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCars = () => {
    fetch('/api/own-cars')
      .then(res => res.json())
      .then(data => {
        setCars(data.cars || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(fetchCars, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Удалить этот автомобиль?')) return;
    await fetch(`/api/own-cars/${id}`, { method: 'DELETE' });
    fetchCars();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Свои автомобили</h1>
        <Link href="/admin/cars/new" className="btn-primary text-sm">
          + Добавить
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">Загрузка...</div>
      ) : cars.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl">
          <p className="text-gray-500 mb-4">Нет добавленных автомобилей</p>
          <Link href="/admin/cars/new" className="btn-primary text-sm inline-block">
            Добавить первый
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-sm font-medium text-gray-500">Фото</th>
                <th className="px-4 py-3 text-sm font-medium text-gray-500">Автомобиль</th>
                <th className="px-4 py-3 text-sm font-medium text-gray-500">Год</th>
                <th className="px-4 py-3 text-sm font-medium text-gray-500">Цена</th>
                <th className="px-4 py-3 text-sm font-medium text-gray-500">Статус</th>
                <th className="px-4 py-3 text-sm font-medium text-gray-500">Действия</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {cars.map((car) => (
                <tr key={car.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="relative w-16 h-12 rounded overflow-hidden bg-gray-100">
                      {car.imageUrl && car.imageUrl !== '/images/no-image.svg' ? (
                        <Image src={car.imageUrl} alt="" fill className="object-cover" sizes="64px" unoptimized />
                      ) : (
                        <div className="flex items-center justify-center h-full text-gray-300 text-xs">Нет</div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 font-medium">{car.brand} {car.model}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{car.year}</td>
                  <td className="px-4 py-3 text-sm font-medium">{formatPrice(car.price_rub)}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full ${car.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {car.isActive ? 'Активно' : 'Скрыто'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <Link href={`/admin/cars/${car.id}`} className="text-sm text-primary hover:underline">Ред.</Link>
                      <button onClick={() => handleDelete(car.id)} className="text-sm text-red-500 hover:underline">Удал.</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
