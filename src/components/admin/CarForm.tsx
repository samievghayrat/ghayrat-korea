'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { BRANDS, FUEL_TYPES, BODY_TYPES } from '@/lib/constants';

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
  images: string[];
  description: string;
  equipment: string[];
  vin: string;
  isActive: boolean;
}

interface CarFormProps {
  initialData?: Partial<CarFormData>;
  carId?: string;
}

export default function CarForm({ initialData, carId }: CarFormProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
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
    images: [],
    description: '',
    equipment: [],
    vin: '',
    isActive: true,
    ...initialData,
  });

  const [imageUrl, setImageUrl] = useState('');
  const [equipItem, setEquipItem] = useState('');

  const update = (field: keyof CarFormData, value: unknown) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const addImage = () => {
    if (imageUrl.trim()) {
      update('images', [...form.images, imageUrl.trim()]);
      setImageUrl('');
    }
  };

  const removeImage = (index: number) => {
    update('images', form.images.filter((_, i) => i !== index));
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
    setSaving(true);

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
        alert('Ошибка сохранения');
      }
    } catch {
      alert('Ошибка сохранения');
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
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Цены</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Цена (KRW) *</label>
            <input type="number" value={form.price_krw} onChange={(e) => update('price_krw', parseInt(e.target.value))} required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Цена (RUB) *</label>
            <input type="number" value={form.price_rub} onChange={(e) => update('price_rub', parseInt(e.target.value))} required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Фотографии</h2>
        <div className="flex gap-2">
          <input type="text" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)}
            placeholder="URL изображения" className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm" />
          <button type="button" onClick={addImage} className="btn-primary text-sm py-2">Добавить</button>
        </div>
        {form.images.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {form.images.map((img, i) => (
              <div key={i} className="relative group">
                <img src={img} alt="" className="w-24 h-16 object-cover rounded border" />
                <button type="button" onClick={() => removeImage(i)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white w-5 h-5 rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity">
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
          <div className="flex gap-2 mb-2">
            <input type="text" value={equipItem} onChange={(e) => setEquipItem(e.target.value)}
              placeholder="Опция" className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
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
          <span className="text-sm text-gray-700">Активное объявление</span>
        </label>
      </div>

      <div className="flex gap-4">
        <button type="submit" disabled={saving} className="btn-primary disabled:opacity-50">
          {saving ? 'Сохранение...' : carId ? 'Сохранить' : 'Создать'}
        </button>
        <button type="button" onClick={() => router.back()} className="btn-outline">Отмена</button>
      </div>
    </form>
  );
}
