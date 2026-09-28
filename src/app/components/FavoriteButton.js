'use client';

import { useAuth } from '@/lib/AuthProvider';
import { useAuthModal } from '@/lib/AuthModalProvider';
import { useFavorites } from '@/lib/FavoritesProvider';

export default function FavoriteButton({ listingId, className = '' }) {
  const { user } = useAuth();
  const { openAuthModal } = useAuthModal();
  const { favoriteIds, toggleFavorite } = useFavorites();
  const isFavorited = favoriteIds.has(listingId);

  function handleClick(e) {
    e.preventDefault(); // don't follow the card's own link
    e.stopPropagation();

    if (!user) {
      openAuthModal({
        mode: 'login',
        message: 'Log in to save this listing to your favorites.',
      });
      return;
    }
    toggleFavorite(listingId).catch((err) => alert(err.message || String(err)));
  }

  return (
    // Positioning is entirely controlled by the caller (for example
    // "absolute right-3 top-3 z-10" on a card, or nothing for an inline use).
    <div className={className}>
      <button
        onClick={handleClick}
        aria-label={isFavorited ? 'Remove from favorites' : 'Save to favorites'}
        className="flex h-9 w-9 items-center justify-center rounded-full bg-white/90 shadow-sm transition-transform hover:scale-110"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill={isFavorited ? 'var(--color-brick)' : 'none'}
          stroke={isFavorited ? 'var(--color-brick)' : 'var(--color-ink)'}
          strokeWidth="2"
        >
          <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z" />
        </svg>
      </button>
    </div>
  );
}
