'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { BRANDS, FUEL_TYPES, BODY_TYPES, TRANSMISSION_TYPES, DRIVETRAIN_TYPES } from '@/lib/constants';
import { MAX_CAR_PHOTOS, isCarImageUrl } from '@/lib/own-car-input';
import { prepareCarPhoto } from '@/lib/prepare-car-photo';

interface CarFormData {
  brand: string;
  model: string;
  year: number;
  mileage: number;
  fuel: string;
  engine: string;
  hp: number;
  displacement: number;
  color: string;
  bodyType: string;
  transmission: string;
  drivetrain: string;
  price_krw: number;
  price_rub: number;
  price_usd: number;
  images: string[];
  description: string;
  equipment: string[];
  vin: string;
  location: string;
  isActive: boolean;
}

interface CarFormProps {
  initialData?: Partial<CarFormData>;
  carId?: string;
}

export default function CarForm({ initialData, carId }: CarFormProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
  const [error, setError] = useState('');
  const [form, setForm] = useState<CarFormData>({
    brand: '',
    model: '',
    year: new Date().getFullYear(),
    mileage: 0,
    fuel: 'gasoline',
    engine: '',
    hp: 0,
    displacement: 0,
    color: '',
    bodyType: '',
    transmission: '',
    drivetrain: '',
    price_krw: 0,
    price_rub: 0,
    price_usd: 0,
    images: [],
    description: '',
    equipment: [],
    vin: '',
    location: '',
    isActive: false,
    ...initialData,
  });

  const [imageUrl, setImageUrl] = useState('');
  const [equipItem, setEquipItem] = useState('');

  const update = (field: keyof CarFormData, value: unknown) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const addImage = () => {
    if (imageUrl.trim()) {
      if (!isCarImageUrl(imageUrl.trim()) || form.images.length >= MAX_CAR_PHOTOS) {
        setError('Используйте ссылку HTTPS. Можно добавить до 20 фото.'); return;
      }
      update('images', [...form.images, imageUrl.trim()]);
      setImageUrl('');
      setError('');
    }
  };

  const removeImage = (index: number) => {
    update('images', form.images.filter((_, i) => i !== index));
  };

  const uploadPhotos = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const field = event.currentTarget;
    const files = Array.from(field.files || []);
    if (!files.length) return;
    if (files.length + form.images.length > MAX_CAR_PHOTOS) {
      setError('Можно добавить до 20 фотографий.'); field.value = ''; return;
    }
    setUploading(true); setError('');
    try {
      for (let i = 0; i < files.length; i++) {
        setUploadProgress(`Загрузка фото ${i + 1} из ${files.length}…`);
        const photo = await prepareCarPhoto(files[i]);
        const data = new FormData(); data.append('photo', photo);
        const response = await fetch('/api/own-car-photos', { method: 'POST', body: data });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || 'Не удалось загрузить фото.');
        setForm(current => ({ ...current, images: [...current.images, result.url] }));
      }
    } catch (error) { setError(error instanceof Error ? error.message : 'Не удалось загрузить фото.'); }
    finally { setUploading(false); setUploadProgress(''); field.value = ''; }
  };

  const addEquipment = () => {
    if (equipItem.trim()) {
      update('equipment', [...form.equipment, equipItem.trim()]);
      setEquipItem('');
    }
  };

  const removeEquipment = (index: number) => {
    update('equipment', form.equipment.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (uploading) return;
    setSaving(true);
    setError('');

    const url = carId ? `/api/own-cars/${carId}` : '/api/own-cars';
    const method = carId ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        router.push('/admin/cars');
      } else {
        const data = await res.json();
        setError(data.error || 'Ошибка сохранения');
      }
    } catch {
      setError('Не удалось сохранить автомобиль. Попробуйте ещё раз.');
    }
    setSaving(false);
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl space-y-6">
      <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Основная информация</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Марка *</label>
            <select value={form.brand} onChange={(e) => update('brand', e.target.value)} required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
              <option value="">Выберите марку</option>
              {BRANDS.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Модель *</label>
            <input type="text" value={form.model} onChange={(e) => update('model', e.target.value)} required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Год *</label>
            <input type="number" value={form.year} onChange={(e) => update('year', parseInt(e.target.value))} required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Пробег (км) *</label>
            <input type="number" value={form.mileage} onChange={(e) => update('mileage', parseInt(e.target.value))} required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Топливо</label>
            <select value={form.fuel} onChange={(e) => update('fuel', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
              {FUEL_TYPES.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Кузов</label>
            <select value={form.bodyType} onChange={(e) => update('bodyType', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
              <option value="">—</option>
              {BODY_TYPES.map(b => <option key={b.value} value={b.value}>{b.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Двигатель</label>
            <input type="text" value={form.engine} onChange={(e) => update('engine', e.target.value)}
              placeholder="2.0L" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Объём (cc)</label>
            <input type="number" value={form.displacement || ''} onChange={(e) => update('displacement', parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Мощность (л.с.)</label>
            <input type="number" value={form.hp || ''} onChange={(e) => update('hp', parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Цвет</label>
            <input type="text" value={form.color} onChange={(e) => update('color', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">VIN</label>
            <input type="text" value={form.vin} onChange={(e) => update('vin', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="own-location">Местонахождение</label>
            <input id="own-location" type="text" value={form.location} maxLength={150} onChange={e => update('location', e.target.value)} placeholder="Например, Душанбе или Сеул" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="own-transmission">КПП</label>
            <select id="own-transmission" value={form.transmission} onChange={e => update('transmission', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
              <option value="">—</option>{TRANSMISSION_TYPES.map(v => <option key={v.value} value={v.label}>{v.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="own-drivetrain">Привод</label>
            <select id="own-drivetrain" value={form.drivetrain} onChange={e => update('drivetrain', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
              <option value="">—</option>{DRIVETRAIN_TYPES.map(v => <option key={v.value} value={v.label}>{v.label}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Цены</h2>
        <div>
          <label htmlFor="own-price-usd" className="block text-sm font-medium text-gray-700 mb-1">Цена продажи (USD) *</label>
          <input id="own-price-usd" type="number" min="1" max="10000000" step="1" value={form.price_usd || ''} onChange={e => update('price_usd', Number(e.target.value) || 0)} required className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
          <p className="mt-2 text-xs leading-5 text-gray-500">Укажите цену для покупателя. Другие валюты рассчитываются автоматически.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Фотографии</h2>
        <label className="block rounded-xl border-2 border-dashed border-gray-200 p-4">
          <span className="block text-sm font-semibold text-gray-800">Загрузить фотографии</span>
          <span className="mt-1 block text-xs text-gray-500">Выберите до 20 фото с телефона или компьютера. Первое фото — обложка.</span>
          <input type="file" accept="image/jpeg,image/png,image/webp" multiple disabled={uploading || saving} onChange={uploadPhotos} className="mt-3 block w-full text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-gray-100 file:px-3 file:py-2 file:text-sm file:font-semibold" />
        </label>
        {uploadProgress && <p className="text-sm text-gray-600" role="status">{uploadProgress}</p>}
        <div className="flex min-w-0 gap-2">
          <input type="text" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)}
            placeholder="Или ссылка HTTPS на фото" className="min-w-0 flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm" />
          <button type="button" onClick={addImage} disabled={uploading || saving} className="btn-primary text-sm py-2 disabled:opacity-50">Добавить</button>
        </div>
        {form.images.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {form.images.map((img, i) => (
              <div key={i} className="relative group">
                <Image src={img} alt={`Фото ${i + 1}`} width={96} height={64} unoptimized className="h-16 w-24 object-cover rounded border" />
                {i === 0 && <span className="mt-1 block text-xs font-medium text-gray-500">Обложка</span>}
                {i > 0 && <button type="button" onClick={() => update('images', [img, ...form.images.filter((_, index) => index !== i)])} className="mt-1 block text-xs font-medium text-primary">На обложку</button>}
                <button type="button" onClick={() => removeImage(i)}
                  aria-label={`Удалить фото ${i + 1}`} className="absolute -top-2 -right-2 bg-red-500 text-white w-6 h-6 rounded-full text-xs">
                  &times;
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Описание и комплектация</h2>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Описание</label>
          <textarea value={form.description} onChange={(e) => update('description', e.target.value)}
            rows={4} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Комплектация</label>
          <div className="flex min-w-0 gap-2 mb-2">
            <input type="text" value={equipItem} onChange={(e) => setEquipItem(e.target.value)}
              placeholder="Опция" className="min-w-0 flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addEquipment(); } }} />
            <button type="button" onClick={addEquipment} className="btn-outline text-sm py-2">+</button>
          </div>
          <div className="flex flex-wrap gap-2">
            {form.equipment.map((item, i) => (
              <span key={i} className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 rounded-full text-sm">
                {item}
                <button type="button" onClick={() => removeEquipment(i)} className="text-gray-400 hover:text-red-500">&times;</button>
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={form.isActive} onChange={(e) => update('isActive', e.target.checked)}
            className="w-4 h-4 text-primary rounded" />
          <span className="text-sm text-gray-700">Показывать на сайте</span>
        </label>
      </div>

      {error && <p role="alert" className="rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">{error}</p>}
      <div className="flex gap-4">
        <button type="submit" disabled={saving || uploading} className="btn-primary disabled:opacity-50">
          {saving ? 'Сохранение...' : carId ? 'Сохранить' : 'Создать'}
        </button>
        <button type="button" onClick={() => router.back()} className="btn-outline">Отмена</button>
      </div>
    </form>
  );
}
