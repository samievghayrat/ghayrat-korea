'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Sidebar from '@/components/admin/Sidebar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [checking, setChecking] = useState(true);
  const [signingIn, setSigningIn] = useState(false);

  useEffect(() => {
    fetch('/api/admin/auth', { cache: 'no-store' })
      .then(res => res.json()).then(data => setAuthenticated(Boolean(data.authenticated)))
      .catch(() => {}).finally(() => setChecking(false));
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setSigningIn(true); setError('');
    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        setAuthenticated(true);
        setPassword('');
        setError('');
      } else {
        const data = await res.json();
        setError(data.error || 'Ошибка авторизации');
      }
    } catch {
      setError('Ошибка авторизации');
    }
    setSigningIn(false);
  };

  if (checking) return <div className="px-4 py-16 text-center text-gray-500">Проверка входа…</div>;
  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
        <form onSubmit={handleLogin} className="bg-white p-8 rounded-xl shadow-md w-full max-w-sm">
          <h1 className="text-2xl font-bold text-center text-gray-900 mb-6">Панель управления</h1>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Пароль</label>
            <input
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Введите пароль"
              autoFocus
            />
          </div>
          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
          <button type="submit" disabled={signingIn} className="w-full btn-primary disabled:opacity-50">{signingIn ? 'Вход…' : 'Войти'}</button>
        </form>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <main className="min-w-0 flex-1 p-4 lg:p-8 overflow-auto">
        <div className="mb-6 flex flex-wrap items-center gap-3 border-b border-gray-200 pb-4 text-sm">
          <Link href="/admin/cars" className="font-semibold text-primary">Мои автомобили</Link>
          <Link href="/admin/cars/new" className="text-gray-600">+ Добавить авто</Link>
          <Link href="/our-cars" className="text-gray-600">На сайт ↗</Link>
          <button type="button" className="ml-auto text-gray-500" onClick={async () => {
            try {
              const res = await fetch('/api/admin/auth', { method: 'DELETE' });
              if (res.ok) { setError(''); setAuthenticated(false); }
              else setError('Не удалось выйти. Попробуйте ещё раз.');
            } catch { setError('Не удалось выйти. Попробуйте ещё раз.'); }
          }}>Выйти</button>
        </div>
        {error && <p role="alert" className="mb-4 text-sm text-red-600">{error}</p>}
        {children}
      </main>
    </div>
  );
}
