'use client';

import { useEffect, useState } from 'react';

interface DashboardStats {
  totalCars: number;
  totalMessages: number;
  unreadMessages: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({ totalCars: 0, totalMessages: 0, unreadMessages: 0 });

  useEffect(() => {
    fetch('/api/admin/stats')
      .then(res => res.json())
      .then(setStats)
      .catch(() => {});
  }, []);

  const cards = [
    { title: 'Свои автомобили', value: stats.totalCars, color: 'bg-blue-500', href: '/admin/cars' },
    { title: 'Все сообщения', value: stats.totalMessages, color: 'bg-green-500', href: '/admin/messages' },
    { title: 'Непрочитанные', value: stats.unreadMessages, color: 'bg-orange-500', href: '/admin/messages' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Дашборд</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {cards.map((card) => (
          <a key={card.title} href={card.href} className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{card.title}</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{card.value}</p>
              </div>
              <div className={`w-12 h-12 ${card.color} rounded-xl flex items-center justify-center text-white text-xl`}>
                {card.title === 'Свои автомобили' ? '🚗' : '📩'}
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
