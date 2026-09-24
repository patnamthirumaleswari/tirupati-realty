'use client';

import { useState } from 'react';

export default function ShareButton({ title, className = '' }) {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    const url = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({ title, url });
      } catch (err) {
        // User cancelled the share sheet — not an error, do nothing.
      }
      return;
    }

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Copy failed:', err);
    }
  }

  return (
    <button
      onClick={handleShare}
      className={`flex h-10 w-10 items-center justify-center rounded-full ${className}`}
      aria-label="Share this listing"
    >
      {copied ? (
        <span className="text-xs font-semibold text-[var(--color-teal-deep)]">Copied!</span>
      ) : (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="18" cy="5" r="3" />
          <circle cx="6" cy="12" r="3" />
          <circle cx="18" cy="19" r="3" />
          <path d="M8.6 13.5l6.8 3.9M15.4 6.6L8.6 10.5" />
        </svg>
      )}
    </button>
  );
}
