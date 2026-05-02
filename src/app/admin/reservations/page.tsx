'use client';

import { useEffect, useState } from 'react';

interface Reservation {
  carId: string;
  status: 'reserved' | 'sold';
  note?: string;
  createdAt: string;
  updatedAt: string;
}

export default function AdminReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [carId, setCarId] = useState('');
  const [status, setStatus] = useState<'reserved' | 'sold'>('reserved');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchReservations = () => {
    fetch('/api/admin/reservations')
      .then(res => res.json())
      .then(data => setReservations(data.reservations || []))
      .catch(() => setReservations([]))
      .finally(() => setLoading(false));
  };

  useEffect(fetchReservations, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!carId.trim()) return;
    setSaving(true);
    try {
      await fetch('/api/admin/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ carId: carId.trim(), status, note }),
      });
      setCarId('');
      setNote('');
      fetchReservations();
    } catch {}
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Удалить бронь?')) return;
    await fetch(`/api/admin/reservations/${id}`, { method: 'DELETE' });
    fetchReservations();
  };

  const handleStatusToggle = async (r: Reservation) => {
    const newStatus = r.status === 'reserved' ? 'sold' : 'reserved';
    await fetch('/api/admin/reservations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ carId: r.carId, status: newStatus, note: r.note }),
    });
    fetchReservations();
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Бронирование</h1>

      {/* Add form */}
      <form onSubmit={handleAdd} className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">Добавить бронь</h2>
        <div className="flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs text-gray-500 mb-1">ID автомобиля (Encar)</label>
            <input
              type="text"
              value={carId}
              onChange={(e) => setCarId(e.target.value)}
              placeholder="например 41571753"
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          <div className="w-40">
            <label className="block text-xs text-gray-500 mb-1">Статус</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as 'reserved' | 'sold')}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="reserved">Забронировано</option>
              <option value="sold">Продано</option>
            </select>
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs text-gray-500 mb-1">Заметка (необязательно)</label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Имя клиента и т.д."
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          <button
            type="submit"
            disabled={saving || !carId.trim()}
            className="btn-primary text-sm px-6 disabled:opacity-50"
          >
            {saving ? 'Сохранение...' : 'Добавить'}
          </button>
        </div>
      </form>

      {/* List */}
      {loading ? (
        <div className="text-center py-12 text-gray-500">Загрузка...</div>
      ) : reservations.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl">
          <p className="text-gray-500">Нет бронирований</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-sm font-medium text-gray-500">ID авто</th>
                <th className="px-4 py-3 text-sm font-medium text-gray-500">Статус</th>
                <th className="px-4 py-3 text-sm font-medium text-gray-500">Заметка</th>
                <th className="px-4 py-3 text-sm font-medium text-gray-500">Дата</th>
                <th className="px-4 py-3 text-sm font-medium text-gray-500">Действия</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {reservations.map((r) => (
                <tr key={r.carId} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <a
                      href={`/catalog/${r.carId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline font-medium"
                    >
                      {r.carId}
                    </a>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleStatusToggle(r)}
                      className={`text-xs px-2.5 py-1 rounded-full font-medium cursor-pointer transition-colors ${
                        r.status === 'sold'
                          ? 'bg-red-100 text-red-700 hover:bg-red-200'
                          : 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                      }`}
                    >
                      {r.status === 'sold' ? 'Продано' : 'Забронировано'}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">{r.note || '—'}</td>
                  <td className="px-4 py-3 text-sm text-gray-400">
                    {new Date(r.updatedAt).toLocaleDateString('ru-RU')}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleDelete(r.carId)}
                      className="text-sm text-red-500 hover:underline"
                    >
                      Удалить
                    </button>
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
