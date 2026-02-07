import { useState, useEffect } from 'react';

export function useFavorites() {
  const [favorites, setFavorites] = useState<Set<string>>(() => {
    if (typeof window === 'undefined') return new Set();
    const saved = localStorage.getItem('favorites');
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });

  useEffect(() => {
    localStorage.setItem('favorites', JSON.stringify([...favorites]));
  }, [favorites]);

  const isFavorite = (candidateId: string) => favorites.has(candidateId);

  const toggleFavorite = (candidateId: string) => {
    setFavorites((prev) => {
      const newFavs = new Set(prev);
      if (newFavs.has(candidateId)) {
        newFavs.delete(candidateId);
      } else {
        newFavs.add(candidateId);
      }
      return newFavs;
    });
  };

  return { favorites, isFavorite, toggleFavorite };
}
