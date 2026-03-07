'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import CarForm from '@/components/admin/CarForm';
import LoadingSpinner from '@/components/shared/LoadingSpinner';

export default function EditCarPage() {
  const params = useParams();
  const id = params.id as string;
  const [carData, setCarData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/own-cars/${id}`)
      .then(res => res.json())
      .then(data => {
        setCarData(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  if (loading) return <LoadingSpinner className="py-12" />;
  if (!carData) return <div className="text-center py-12 text-gray-500">Автомобиль не найден</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Редактировать автомобиль</h1>
      <CarForm initialData={carData} carId={id} />
    </div>
  );
}
