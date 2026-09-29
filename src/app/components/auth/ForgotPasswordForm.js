'use client';

import { useId, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';

// Shared by the /forgot-password page and the popup's "forgot password" mode.
// Same shape as LoginForm/SignupForm: renders its own heading (headingAs),
// and takes an optional onSwitch to flip back to the login form in the popup.
export default function ForgotPasswordForm({ headingAs: Heading = 'h1', headingId, onSwitch }) {
  const uid = useId();
  const emailId = `${uid}-email`;

  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    setSubmitting(false);

    if (resetError) {
      setError(resetError.message);
      return;
    }

    // Worded to be true whether or not the email is registered: Supabase
    // does not report which emails exist (an anti-enumeration measure), so
    // this form can't tell either, on purpose.
    setSent(true);
  }

  const backToLogin = onSwitch ? (
    <button type="button" onClick={onSwitch} className="text-[var(--color-teal-deep)] underline">
      Log in
    </button>
  ) : (
    <Link href="/login" className="text-[var(--color-teal-deep)] underline">
      Log in
    </Link>
  );

  if (sent) {
    return (
      <div className="text-center">
        <Heading id={headingId} className="font-display text-3xl">
          Check your email
        </Heading>
        <p className="mt-4 text-sm text-[var(--color-ink-soft)]">
          If an account exists for <strong>{email}</strong>, we&apos;ve sent a link to reset its
          password.
        </p>
        <p className="mt-4 text-sm text-[var(--color-ink-soft)]">Back to {backToLogin}.</p>
      </div>
    );
  }

  return (
    <div>
      <Heading id={headingId} className="font-display text-3xl">
        Reset your password
      </Heading>
      <p className="mt-2 text-sm text-[var(--color-ink-soft)]">
        Enter your account&apos;s email and we&apos;ll send you a link to set a new password.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
        <div>
          <label className="block text-sm text-[var(--color-ink-soft)]" htmlFor={emailId}>
            Email
          </label>
          <input
            id={emailId}
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full border-b border-[var(--color-sand)] bg-transparent py-2 outline-none focus:border-[var(--color-teal)]"
          />
        </div>

        {error && <p className="text-sm text-[var(--color-brick)]">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="mt-2 rounded-full bg-[var(--color-teal)] px-6 py-2.5 font-semibold text-[var(--color-surface)] transition-colors hover:bg-[var(--color-teal-deep)] disabled:opacity-60"
        >
          {submitting ? 'Sending…' : 'Send reset link'}
        </button>
      </form>

      <p className="mt-6 text-sm text-[var(--color-ink-soft)]">Remembered it? {backToLogin}</p>
    </div>
  );
}
