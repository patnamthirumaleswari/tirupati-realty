'use client';

import { useId, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';

// The login form, shared by the /login page and the login popup so the
// two can never drift apart. It renders its own heading so the page can
// use an <h1> and the popup an <h2> (via headingAs) without duplicating
// any markup.
//
//   onSuccess          called after a successful login
//   onSwitch           popup only: switches to the signup form. On the page
//                      this is left out and the form links to /signup instead.
//   onForgotPassword   popup only: switches to the "forgot password" form.
//                      On the page this is left out and the link below goes
//                      to /forgot-password instead.
//   message    optional line under the heading explaining why the visitor
//              is being asked to log in (e.g. "Log in to save this listing")
export default function LoginForm({
  headingAs: Heading = 'h1',
  headingId,
  message,
  onSuccess,
  onSwitch,
  onForgotPassword,
}) {
  // useId keeps the input ids unique even if a login form is ever on
  // screen twice (say, the popup opened over the /login page).
  const uid = useId();
  const emailId = `${uid}-email`;
  const passwordId = `${uid}-password`;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setSubmitting(false);

    if (signInError) {
      setError(signInError.message);
      return;
    }

    if (onSuccess) onSuccess();
  }

  return (
    <div>
      <Heading id={headingId} className="font-display text-3xl">
        Log in
      </Heading>
      {message && <p className="mt-2 text-sm text-[var(--color-ink-soft)]">{message}</p>}

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
        <div>
          <div className="flex items-baseline justify-between">
            <label className="block text-sm text-[var(--color-ink-soft)]" htmlFor={passwordId}>
              Password
            </label>
            {onForgotPassword ? (
              <button
                type="button"
                onClick={onForgotPassword}
                className="text-xs text-[var(--color-teal-deep)] underline"
              >
                Forgot password?
              </button>
            ) : (
              <Link href="/forgot-password" className="text-xs text-[var(--color-teal-deep)] underline">
                Forgot password?
              </Link>
            )}
          </div>
          <div className="relative">
            <input
              id={passwordId}
              type={showPassword ? 'text' : 'password'}
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full border-b border-[var(--color-sand)] bg-transparent py-2 pr-9 outline-none focus:border-[var(--color-teal)]"
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              className="absolute right-0 top-1/2 -translate-y-1/2 p-1 text-[var(--color-ink-softer)] hover:text-[var(--color-ink)]"
            >
              {showPassword ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17.94 17.94A10.94 10.94 0 0 1 12 19c-5 0-9.27-3.11-11-7.5a13.6 13.6 0 0 1 4.22-5.44M9.9 4.24A10.9 10.9 0 0 1 12 4c5 0 9.27 3.11 11 7.5a13.5 13.5 0 0 1-1.67 2.68M14.12 14.12a3 3 0 1 1-4.24-4.24" />
                  <path d="M1 1l22 22" />
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M1 12s4-7.5 11-7.5 11 7.5 11 7.5-4 7.5-11 7.5S1 12 1 12z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {error && <p className="text-sm text-[var(--color-brick)]">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="mt-2 rounded-full bg-[var(--color-teal)] px-6 py-2.5 font-semibold text-[var(--color-surface)] transition-colors hover:bg-[var(--color-teal-deep)] disabled:opacity-60"
        >
          {submitting ? 'Logging in…' : 'Log in'}
        </button>
      </form>

      <p className="mt-6 text-sm text-[var(--color-ink-soft)]">
        Don&apos;t have an account?{' '}
        {onSwitch ? (
          <button type="button" onClick={onSwitch} className="text-[var(--color-teal-deep)] underline">
            Sign up
          </button>
        ) : (
          <Link href="/signup" className="text-[var(--color-teal-deep)] underline">
            Sign up
          </Link>
        )}
      </p>
    </div>
  );
}
