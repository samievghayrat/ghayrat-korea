'use client';

import { useEffect, useState } from 'react';
import type { ContactMessage } from '@/types';

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMessages = () => {
    fetch('/api/admin/messages')
      .then(res => res.json())
      .then(data => {
        setMessages(data.messages || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(fetchMessages, []);

  const markRead = async (id: string) => {
    await fetch(`/api/admin/messages/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isRead: true }),
    });
    fetchMessages();
  };

  const deleteMsg = async (id: string) => {
    if (!confirm('Удалить сообщение?')) return;
    await fetch(`/api/admin/messages/${id}`, { method: 'DELETE' });
    fetchMessages();
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Сообщения</h1>

      {loading ? (
        <div className="text-center py-12 text-gray-500">Загрузка...</div>
      ) : messages.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl">
          <p className="text-gray-500">Нет сообщений</p>
        </div>
      ) : (
        <div className="space-y-4">
          {messages.map((msg) => (
            <div key={msg._id} className={`bg-white rounded-xl shadow-sm p-6 ${!msg.isRead ? 'border-l-4 border-primary' : ''}`}>
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-semibold text-gray-900">{msg.name}</span>
                    <span className="text-sm text-gray-500">{msg.phone}</span>
                    {msg.messenger && (
                      <span className="text-xs bg-gray-100 px-2 py-0.5 rounded">{msg.messenger}</span>
                    )}
                    {!msg.isRead && (
                      <span className="text-xs bg-primary text-white px-2 py-0.5 rounded">Новое</span>
                    )}
                  </div>
                  <p className="text-gray-700">{msg.message}</p>
                  {msg.carId && (
                    <a href={`/catalog/${msg.carId}`} className="text-sm text-primary hover:underline mt-2 inline-block">
                      Автомобиль #{msg.carId}
                    </a>
                  )}
                  <p className="text-xs text-gray-400 mt-2">
                    {new Date(msg.createdAt).toLocaleString('ru-RU')}
                  </p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  {!msg.isRead && (
                    <button onClick={() => markRead(msg._id!)} className="text-sm text-primary hover:underline">
                      Прочитано
                    </button>
                  )}
                  <button onClick={() => deleteMsg(msg._id!)} className="text-sm text-red-500 hover:underline">
                    Удалить
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
