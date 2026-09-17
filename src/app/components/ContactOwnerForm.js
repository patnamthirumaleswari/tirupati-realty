'use client';

import { useState } from 'react';
import { createInquiry } from '@/lib/queries';

export default function ContactOwnerForm({ listingId }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await createInquiry({ listingId, name, phone, message });
      setSent(true);
    } catch (err) {
      setError(err.message || String(err));
    } finally {
      setSubmitting(false);
    }
  }

  if (sent) {
    return (
      <div className="border border-[var(--color-teal)] bg-[var(--color-surface)] p-4 text-sm">
        Thanks — your message has been sent to the owner. They&apos;ll reach
        out to the phone number you provided.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <div>
        <label className="block text-sm text-[var(--color-ink-soft)]">Your name</label>
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 w-full border-b border-[var(--color-sand)] bg-transparent py-2 outline-none focus:border-[var(--color-teal)]"
        />
      </div>
      <div>
        <label className="block text-sm text-[var(--color-ink-soft)]">Your phone number</label>
        <input
          required
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="mt-1 w-full border-b border-[var(--color-sand)] bg-transparent py-2 outline-none focus:border-[var(--color-teal)]"
        />
      </div>
      <div>
        <label className="block text-sm text-[var(--color-ink-soft)]">Message (optional)</label>
        <textarea
          rows={3}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="I'm interested in this property…"
          className="mt-1 w-full border border-[var(--color-sand)] bg-transparent p-2 outline-none focus:border-[var(--color-teal)]"
        />
      </div>

      {error && <p className="text-sm text-[var(--color-brick)]">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="mt-1 bg-[var(--color-teal)] px-6 py-2.5 text-[var(--color-surface)] transition-colors hover:bg-[var(--color-teal-deep)] disabled:opacity-60"
      >
        {submitting ? 'Sending…' : 'Contact owner'}
      </button>
    </form>
  );
}
