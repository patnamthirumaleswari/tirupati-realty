'use client';

import { useState } from 'react';
import ListingsMap from '@/app/components/ListingsMap';

export default function ListingsViewToggle({ pins, children }) {
  const [view, setView] = useState('list');

  return (
    <div>
      <div className="mb-5 inline-flex rounded-full border border-[var(--color-sand)] p-1">
        <button
          onClick={() => setView('list')}
          className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
            view === 'list' ? 'bg-[var(--color-ink)] text-[var(--color-bg)]' : 'text-[var(--color-ink-soft)]'
          }`}
        >
          List
        </button>
        <button
          onClick={() => setView('map')}
          className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
            view === 'map' ? 'bg-[var(--color-ink)] text-[var(--color-bg)]' : 'text-[var(--color-ink-soft)]'
          }`}
        >
          Map {pins.length > 0 ? `(${pins.length})` : ''}
        </button>
      </div>

      {view === 'list' ? children : <ListingsMap pins={pins} />}
    </div>
  );
}
