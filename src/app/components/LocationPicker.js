'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';

const LocationPickerInner = dynamic(() => import('@/app/components/LocationPickerInner'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center text-sm text-[var(--color-ink-soft)]">
      Loading map…
    </div>
  ),
});

// Roomy bounding box covering Tirupati and the surrounding mandals this
// site serves (Chandragiri, Yerpedu, Srikalahasti, Renigunta, etc.), so
// address search results are biased to the right region without being so
// tight that a real local landmark gets excluded.
const SEARCH_VIEWBOX = '78.9,14.1,79.9,13.2'; // left,top,right,bottom

export default function LocationPicker({ lat, lng, onChange }) {
  const [query, setQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState('');

  async function handleSearch(e) {
    if (e) e.preventDefault();
    if (!query.trim()) return;
    setSearching(true);
    setSearchError('');
    try {
      const url =
        `https://nominatim.openstreetmap.org/search?format=json&limit=1` +
        `&countrycodes=in&viewbox=${SEARCH_VIEWBOX}&bounded=1` +
        `&q=${encodeURIComponent(`${query}, Tirupati`)}`;

      const res = await fetch(url, { headers: { 'Accept-Language': 'en' } });
      const results = await res.json();

      if (!results || results.length === 0) {
        setSearchError('No matching location found — try a different search, or click the map directly.');
        return;
      }

      onChange(parseFloat(results[0].lat), parseFloat(results[0].lon));
    } catch (err) {
      setSearchError('Search failed — try clicking the map directly instead.');
    } finally {
      setSearching(false);
    }
  }

  return (
    <div>
      <div className="mb-2 flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSearch(e);
          }}
          placeholder="Search an address or landmark…"
          className="flex-1 border-b border-[var(--color-sand)] bg-transparent py-2 text-sm outline-none focus:border-[var(--color-teal)]"
        />
        <button
          type="button"
          onClick={handleSearch}
          disabled={searching}
          className="rounded-full bg-[var(--color-ink)] px-4 py-2 text-xs font-bold text-[var(--color-bg)] disabled:opacity-60"
        >
          {searching ? 'Searching…' : 'Find'}
        </button>
      </div>

      {searchError && <p className="mb-2 text-xs text-[var(--color-brick)]">{searchError}</p>}

      <div className="h-72 w-full overflow-hidden rounded-lg border border-[var(--color-sand)]">
        <LocationPickerInner lat={lat} lng={lng} onChange={onChange} />
      </div>
    </div>
  );
}
