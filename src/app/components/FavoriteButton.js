'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/AuthProvider';
import { useFavorites } from '@/lib/FavoritesProvider';

export default function FavoriteButton({ listingId, className = '' }) {
  const { user } = useAuth();
  const { favoriteIds, toggleFavorite } = useFavorites();
  const [showPrompt, setShowPrompt] = useState(false);
  const isFavorited = favoriteIds.has(listingId);

  function handleClick(e) {
    e.preventDefault(); // don't follow the card's own link
    e.stopPropagation();

    if (!user) {
      setShowPrompt(true);
      return;
    }
    toggleFavorite(listingId).catch((err) => alert(err.message || String(err)));
  }

  return (
    // Outer div: positioning is entirely controlled by the caller (e.g.
    // "absolute right-3 top-3 z-10" on a card, or nothing for an inline
    // use). Kept separate from the inner "relative" wrapper below so the
    // two position values never collide on one element.
    <div className={className}>
      <div className="relative">
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

        {showPrompt && (
          <>
            {/* Invisible backdrop — click anywhere else to dismiss */}
            <div
              className="fixed inset-0 z-40"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowPrompt(false);
              }}
            />
            <div
              onClick={(e) => e.preventDefault()}
              className="absolute right-0 top-11 z-50 w-52 rounded-xl border border-[var(--color-sand)] bg-[var(--color-surface)] p-3 text-left shadow-lg"
            >
              <p className="text-sm text-[var(--color-ink)]">
                Log in to save favorites.
              </p>
              <Link
                href="/login"
                className="mt-2 inline-block rounded-full bg-[var(--color-teal)] px-4 py-1.5 text-xs font-bold text-white hover:bg-[var(--color-teal-deep)]"
              >
                Log in
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
