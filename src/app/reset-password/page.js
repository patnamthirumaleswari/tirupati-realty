'use client';

import { useEffect, useId, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';

// Where Supabase's password-reset email link lands. Clicking that link logs
// the visitor in with a temporary "recovery" session before this page even
// loads (Supabase's client reads it from the URL automatically), so this
// page's only job is: confirm that session exists, then let them set a new
// password with supabase.auth.updateUser().
//
// Checking for a session is more robust than listening only for the
// PASSWORD_RECOVERY event: the Supabase client is created once when the app
// loads and may finish reading the link before this page's own listener has
// subscribed, which would make the event easy to miss. A short listener is
// kept too, as a backup for the reverse timing case.
const CHECK_TIMEOUT_MS = 4000;

export default function ResetPasswordPage() {
  const router = useRouter();
  const passwordId = useId();
  const confirmId = useId();

  const [checking, setChecking] = useState(true);
  const [hasSession, setHasSession] = useState(false);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    let settled = false;

    function settle(found) {
      if (settled) return;
      settled = true;
      setHasSession(found);
      setChecking(false);
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) settle(true);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) settle(true);
    });

    const timeout = setTimeout(() => settle(false), CHECK_TIMEOUT_MS);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (password !== confirm) {
      setError('Those two passwords don\u2019t match.');
      return;
    }

    setSubmitting(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setSubmitting(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    setDone(true);
  }

  if (checking) {
    return (
      <main className="mx-auto max-w-sm px-6 py-16 text-center">
        <p className="text-[var(--color-ink-soft)]">Checking your link…</p>
      </main>
    );
  }

  if (!hasSession) {
    return (
      <main className="mx-auto max-w-sm px-6 py-16 text-center">
        <h1 className="font-display text-3xl">Link expired</h1>
        <p className="mt-4 text-sm text-[var(--color-ink-soft)]">
          This password reset link is invalid or has expired. Links are only valid for a short
          time after they&apos;re sent.
        </p>
        <Link
          href="/forgot-password"
          className="mt-6 inline-block rounded-full bg-[var(--color-teal)] px-6 py-2.5 font-semibold text-[var(--color-surface)] hover:bg-[var(--color-teal-deep)]"
        >
          Request a new link
        </Link>
      </main>
    );
  }

  if (done) {
    return (
      <main className="mx-auto max-w-sm px-6 py-16 text-center">
        <h1 className="font-display text-3xl">Password updated</h1>
        <p className="mt-4 text-sm text-[var(--color-ink-soft)]">
          Your password has been changed. You&apos;re logged in with your new password.
        </p>
        <button
          type="button"
          onClick={() => router.push('/')}
          className="mt-6 rounded-full bg-[var(--color-teal)] px-6 py-2.5 font-semibold text-[var(--color-surface)] hover:bg-[var(--color-teal-deep)]"
        >
          Continue
        </button>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-sm px-6 py-16">
      <h1 className="font-display text-3xl">Set a new password</h1>

      <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
        <div>
          <label className="block text-sm text-[var(--color-ink-soft)]" htmlFor={passwordId}>
            New password
          </label>
          <input
            id={passwordId}
            type="password"
            required
            minLength={6}
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full border-b border-[var(--color-sand)] bg-transparent py-2 outline-none focus:border-[var(--color-teal)]"
          />
        </div>
        <div>
          <label className="block text-sm text-[var(--color-ink-soft)]" htmlFor={confirmId}>
            Confirm new password
          </label>
          <input
            id={confirmId}
            type="password"
            required
            minLength={6}
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="mt-1 w-full border-b border-[var(--color-sand)] bg-transparent py-2 outline-none focus:border-[var(--color-teal)]"
          />
        </div>

        {error && <p className="text-sm text-[var(--color-brick)]">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="mt-2 rounded-full bg-[var(--color-teal)] px-6 py-2.5 font-semibold text-[var(--color-surface)] transition-colors hover:bg-[var(--color-teal-deep)] disabled:opacity-60"
        >
          {submitting ? 'Saving…' : 'Set new password'}
        </button>
      </form>
    </main>
  );
}
