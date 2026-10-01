'use client';

import { useId, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { submitSiteFeedback } from '@/lib/queries';

export default function FeedbackModal({ onClose }) {
  const messageId = useId();
  const emailId = useId();

  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  // Esc closes, same as the login popup.
  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await submitSiteFeedback({
        message: message.trim(),
        email: email.trim() || null,
        pageUrl: window.location.pathname,
      });
      setSent(true);
    } catch (err) {
      setError(err.message || String(err));
    } finally {
      setSubmitting(false);
    }
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center bg-[var(--color-ink)]/50 backdrop-blur-sm sm:items-center sm:p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-sm rounded-t-2xl border border-[var(--color-sand)] bg-[var(--color-surface)] p-6 shadow-2xl sm:rounded-2xl">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-xl leading-none text-[var(--color-ink-soft)] hover:bg-[var(--color-bg2)]"
        >
          ×
        </button>

        {sent ? (
          <div className="text-center">
            <h2 className="font-display text-2xl">Thanks!</h2>
            <p className="mt-3 text-sm text-[var(--color-ink-soft)]">
              Your feedback has been sent. We read every message.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-5 rounded-full bg-[var(--color-teal)] px-6 py-2 text-sm font-semibold text-white hover:bg-[var(--color-teal-deep)]"
            >
              Close
            </button>
          </div>
        ) : (
          <>
            <h2 className="font-display text-2xl">Send feedback</h2>
            <p className="mt-2 text-sm text-[var(--color-ink-soft)]">
              Found a bug, or have an idea to make the site better? Let us know.
            </p>

            <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
              <div>
                <label className="block text-sm text-[var(--color-ink-soft)]" htmlFor={messageId}>
                  Your feedback
                </label>
                <textarea
                  id={messageId}
                  required
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="mt-1 w-full border border-[var(--color-sand)] bg-transparent p-2 text-sm outline-none focus:border-[var(--color-teal)]"
                />
              </div>
              <div>
                <label className="block text-sm text-[var(--color-ink-soft)]" htmlFor={emailId}>
                  Your email (optional, if you&apos;d like a reply)
                </label>
                <input
                  id={emailId}
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 w-full border-b border-[var(--color-sand)] bg-transparent py-2 text-sm outline-none focus:border-[var(--color-teal)]"
                />
              </div>

              {error && <p className="text-sm text-[var(--color-brick)]">{error}</p>}

              <button
                type="submit"
                disabled={submitting}
                className="mt-1 rounded-full bg-[var(--color-teal)] px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[var(--color-teal-deep)] disabled:opacity-60"
              >
                {submitting ? 'Sending…' : 'Send feedback'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>,
    document.body
  );
}
