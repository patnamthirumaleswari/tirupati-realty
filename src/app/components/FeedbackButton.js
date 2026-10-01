'use client';

import { useState } from 'react';
import FeedbackModal from '@/app/components/FeedbackModal';

// A small, unobtrusive floating button present on every page (mounted in
// the root layout), the same idea as the "Feedback" link you'd see in the
// corner of many dashboards. Deliberately not tied to login — anyone,
// logged in or not, can send a thought.
export default function FeedbackButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-5 right-5 z-40 rounded-full bg-[var(--color-ink)] px-4 py-2.5 text-xs font-bold text-[var(--color-bg)] shadow-lg transition-transform hover:-translate-y-0.5"
      >
        Feedback
      </button>
      {open && <FeedbackModal onClose={() => setOpen(false)} />}
    </>
  );
}
