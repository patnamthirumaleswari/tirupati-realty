'use client';

import dynamic from 'next/dynamic';

const ListingsMapInner = dynamic(() => import('@/app/components/ListingsMapInner'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center text-sm text-[var(--color-ink-soft)]">
      Loading map…
    </div>
  ),
});

// heightClass lets a page pick how tall the map is. It has to be a complete,
// literal Tailwind class (e.g. "h-[420px]") written out in the calling file,
// or Tailwind will not generate the CSS for it.
export default function ListingsMap({ pins, heightClass = 'h-[560px]' }) {
  return (
    <div className={`${heightClass} w-full overflow-hidden rounded-xl border border-[var(--color-sand)]`}>
      <ListingsMapInner pins={pins} />
    </div>
  );
}
