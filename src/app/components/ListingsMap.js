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

export default function ListingsMap({ pins }) {
  return (
    <div className="h-[560px] w-full overflow-hidden rounded-xl border border-[var(--color-sand)]">
      <ListingsMapInner pins={pins} />
    </div>
  );
}
