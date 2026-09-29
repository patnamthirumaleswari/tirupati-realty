'use client';

import { useState } from 'react';
import { createBuilderRequest } from '@/lib/queries';

const INPUT_CLASS =
  'mt-1 w-full border-b border-[var(--color-sand)] bg-transparent py-2 outline-none focus:border-[var(--color-teal)]';

// The "request a builder account" form shown on /projects/new to anyone
// who isn't already a builder or admin, and has no pending request.
//   onSubmitted   called after a successful submit (parent shows the
//                 "pending" state instead of re-fetching)
export default function BuilderRequestForm({ onSubmitted }) {
  const [agencyName, setAgencyName] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await createBuilderRequest({ agencyName: agencyName.trim(), message: message.trim() || null });
      onSubmitted();
    } catch (err) {
      setError(err.message || String(err));
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
      <div>
        <label htmlFor="agency-name" className="block text-sm text-[var(--color-ink-soft)]">
          Builder / agency name
        </label>
        <input
          id="agency-name"
          required
          value={agencyName}
          onChange={(e) => setAgencyName(e.target.value)}
          placeholder="e.g. Sai Constructions"
          className={INPUT_CLASS}
        />
      </div>

      <div>
        <label htmlFor="request-message" className="block text-sm text-[var(--color-ink-soft)]">
          Tell us about your business (optional)
        </label>
        <textarea
          id="request-message"
          rows={4}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="What you build, past projects, RERA registration, anything that helps us verify you."
          className="mt-1 w-full border border-[var(--color-sand)] bg-transparent p-2 outline-none focus:border-[var(--color-teal)]"
        />
      </div>

      {error && <p className="text-sm text-[var(--color-brick)]">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="rounded-full bg-[var(--color-teal)] px-6 py-2.5 font-semibold text-[var(--color-surface)] transition-colors hover:bg-[var(--color-teal-deep)] disabled:opacity-60"
      >
        {submitting ? 'Submitting…' : 'Request builder account'}
      </button>
    </form>
  );
}
