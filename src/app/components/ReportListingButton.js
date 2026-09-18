'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/AuthProvider';
import { createReport } from '@/lib/queries';

export default function ReportListingButton({ listingId }) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  if (!user) {
    return (
      <Link href="/login" className="text-xs text-[var(--color-ink-soft)] underline">
        Log in to report this listing
      </Link>
    );
  }

  if (sent) {
    return <p className="text-xs text-[var(--color-ink-soft)]">Thanks — this has been reported for review.</p>;
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="text-xs text-[var(--color-ink-soft)] underline hover:text-[var(--color-brick)]"
      >
        Report this listing
      </button>
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!reason.trim()) return;
    setSubmitting(true);
    setError('');
    try {
      await createReport({ listingId, reason: reason.trim() });
      setSent(true);
    } catch (err) {
      setError(err.message || String(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <textarea
        required
        rows={2}
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        placeholder="What's wrong with this listing?"
        className="w-full border border-[var(--color-sand)] bg-transparent p-2 text-sm outline-none focus:border-[var(--color-teal)]"
      />
      {error && <p className="text-xs text-[var(--color-brick)]">{error}</p>}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={submitting}
          className="border border-[var(--color-sand)] px-3 py-1 text-xs text-[var(--color-ink)] hover:border-[var(--color-brick)] hover:text-[var(--color-brick)] disabled:opacity-60"
        >
          {submitting ? 'Sending…' : 'Submit report'}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="text-xs text-[var(--color-ink-soft)]"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
