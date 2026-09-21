'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from '@/lib/AuthProvider';
import { getMyFavoriteIds, addFavorite, removeFavorite } from '@/lib/queries';

const FavoritesContext = createContext({
  favoriteIds: new Set(),
  loading: true,
  toggleFavorite: async () => {},
});

export function FavoritesProvider({ children }) {
  const { user } = useAuth();
  const [favoriteIds, setFavoriteIds] = useState(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setFavoriteIds(new Set());
      setLoading(false);
      return;
    }
    setLoading(true);
    getMyFavoriteIds()
      .then((ids) => setFavoriteIds(new Set(ids)))
      .finally(() => setLoading(false));
  }, [user]);

  async function toggleFavorite(listingId) {
    const isFavorited = favoriteIds.has(listingId);

    // Optimistic update — flip it locally first, then confirm with the
    // server. If the server call fails, roll back.
    setFavoriteIds((prev) => {
      const next = new Set(prev);
      isFavorited ? next.delete(listingId) : next.add(listingId);
      return next;
    });

    try {
      if (isFavorited) {
        await removeFavorite(listingId);
      } else {
        await addFavorite(listingId);
      }
    } catch (err) {
      // Roll back on failure.
      setFavoriteIds((prev) => {
        const next = new Set(prev);
        isFavorited ? next.add(listingId) : next.delete(listingId);
        return next;
      });
      throw err;
    }
  }

  return (
    <FavoritesContext.Provider value={{ favoriteIds, loading, toggleFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  return useContext(FavoritesContext);
}
