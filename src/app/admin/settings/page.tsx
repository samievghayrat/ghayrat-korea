'use client';

import { useEffect, useState } from 'react';
import { DEFAULT_SETTINGS } from '@/lib/constants';
import type { SiteSettings } from '@/types';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS as SiteSettings);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        if (data && !data.error) setSettings({ ...DEFAULT_SETTINGS as SiteSettings, ...data });
      })
      .catch(() => {});
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      alert('Ошибка сохранения');
    }
    setSaving(false);
  };

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Настройки</h1>

      <div className="space-y-6">
        {/* Contact info */}
        <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
          <h2 className="text-lg font-semibold">Контакты</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Телефон</label>
              <input type="text" value={settings.contactPhone}
                onChange={(e) => setSettings({ ...settings, contactPhone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Telegram</label>
              <input type="text" value={settings.contactTelegram}
                onChange={(e) => setSettings({ ...settings, contactTelegram: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp</label>
              <input type="text" value={settings.contactWhatsApp}
                onChange={(e) => setSettings({ ...settings, contactWhatsApp: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
            </div>
          </div>
        </div>

        {/* Fees */}
        <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
          <h2 className="text-lg font-semibold">Сборы и услуги</h2>
          <p className="text-sm text-gray-500">Таможенные пошлины рассчитываются автоматически по ставкам tks.ru</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Доставка + услуги ($)</label>
              <input type="number" value={settings.serviceFeeUsd}
                onChange={(e) => setSettings({ ...settings, serviceFeeUsd: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Брокер во Владивостоке (₽)</label>
              <input type="number" value={settings.brokerFee}
                onChange={(e) => setSettings({ ...settings, brokerFee: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Наценка курса (%)</label>
              <input type="number" step="0.01" value={settings.exchangeRateMarkup}
                onChange={(e) => setSettings({ ...settings, exchangeRateMarkup: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button onClick={handleSave} disabled={saving} className="btn-primary disabled:opacity-50">
            {saving ? 'Сохранение...' : 'Сохранить настройки'}
          </button>
          {saved && <span className="text-green-600 text-sm">Сохранено!</span>}
        </div>
      </div>
    </div>
  );
}
