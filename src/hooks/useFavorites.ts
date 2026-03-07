'use client';

import { useState, useEffect, useCallback } from 'react';

export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('favorites') || '[]');
      setFavorites(stored);
    } catch {
      setFavorites([]);
    }

    const handleUpdate = () => {
      try {
        const stored = JSON.parse(localStorage.getItem('favorites') || '[]');
        setFavorites(stored);
      } catch { /* empty */ }
    };

    window.addEventListener('favoritesUpdated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('favoritesUpdated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  const toggleFavorite = useCallback((carId: string) => {
    setFavorites(prev => {
      const updated = prev.includes(carId)
        ? prev.filter(id => id !== carId)
        : [...prev, carId];
      localStorage.setItem('favorites', JSON.stringify(updated));
      window.dispatchEvent(new Event('favoritesUpdated'));
      return updated;
    });
  }, []);

  const isFavorite = useCallback((carId: string) => {
    return favorites.includes(carId);
  }, [favorites]);

  const clearFavorites = useCallback(() => {
    localStorage.setItem('favorites', JSON.stringify([]));
    setFavorites([]);
    window.dispatchEvent(new Event('favoritesUpdated'));
  }, []);

  return { favorites, toggleFavorite, isFavorite, clearFavorites };
}
