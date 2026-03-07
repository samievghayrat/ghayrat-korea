'use client';

import { useState, useEffect } from 'react';

interface FavoriteButtonProps {
  carId: string;
  className?: string;
  size?: 'sm' | 'md';
}

export default function FavoriteButton({ carId, className = '', size = 'md' }: FavoriteButtonProps) {
  const [isFav, setIsFav] = useState(false);

  useEffect(() => {
    try {
      const favs = JSON.parse(localStorage.getItem('favorites') || '[]');
      setIsFav(favs.includes(carId));
    } catch { /* empty */ }
  }, [carId]);

  const toggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const favs: string[] = JSON.parse(localStorage.getItem('favorites') || '[]');
      const updated = isFav ? favs.filter(id => id !== carId) : [...favs, carId];
      localStorage.setItem('favorites', JSON.stringify(updated));
      setIsFav(!isFav);
      window.dispatchEvent(new Event('favoritesUpdated'));
    } catch { /* empty */ }
  };

  const sizeClass = size === 'sm' ? 'w-5 h-5' : 'w-6 h-6';

  return (
    <button
      onClick={toggle}
      className={`p-2 rounded-full transition-colors ${
        isFav ? 'text-red-500 bg-red-50 hover:bg-red-100' : 'text-gray-400 bg-white/80 hover:bg-white hover:text-red-400'
      } ${className}`}
      title={isFav ? 'Убрать из избранного' : 'Добавить в избранное'}
    >
      <svg className={sizeClass} fill={isFav ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    </button>
  );
}
