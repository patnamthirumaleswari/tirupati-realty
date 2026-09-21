'use client';

import { useState } from 'react';
import ContactOwnerForm from '@/app/components/ContactOwnerForm';

export default function InquiryAccordion({ listingId }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="mt-4 border border-[var(--color-sand)] bg-[var(--color-surface)]">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between p-4 text-left"
      >
        <h2 className="font-display text-lg">Or send an inquiry</h2>
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--color-ink)"
          strokeWidth="2"
          className={`shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div className="px-4 pb-4">
          <ContactOwnerForm listingId={listingId} />
        </div>
      )}
    </div>
  );
}
