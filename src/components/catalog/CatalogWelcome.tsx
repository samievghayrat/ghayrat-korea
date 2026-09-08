'use client';

import { useEffect, useState } from 'react';

const STORAGE_KEY = 'ghayrat-catalog-welcome-seen-v1';

export default function CatalogWelcome() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (window.localStorage.getItem(STORAGE_KEY)) return;

      const timer = window.setTimeout(() => {
        setVisible(true);
        window.localStorage.setItem(STORAGE_KEY, 'true');
      }, 650);

      return () => window.clearTimeout(timer);
    } catch {
      // The catalog remains fully usable when storage is unavailable.
    }
  }, []);

  if (!visible) return null;

  return (
    <aside
      aria-label="Добро пожаловать"
      className="animate-in fixed inset-x-3 bottom-20 z-[70] mx-auto max-w-md rounded-2xl border border-white/10 bg-gray-950 p-4 text-white shadow-2xl shadow-gray-950/30 sm:bottom-6"
    >
      <button
        type="button"
        onClick={() => setVisible(false)}
        className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-gray-300 transition hover:bg-white/20 hover:text-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
        aria-label="Закрыть"
      >
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 6l12 12M18 6 6 18" />
        </svg>
      </button>

      <div className="flex gap-3 pr-8">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-400/15 text-xl" aria-hidden="true">
          🚘
        </span>
        <div>
          <p className="font-bold leading-5">Автомобиль из Кореи — проще, чем кажется</p>
          <p className="mt-1 text-sm leading-5 text-gray-300">
            Поможем выбрать, проверить и доставить автомобиль до вашего города.
          </p>
        </div>
      </div>
    </aside>
  );
}
