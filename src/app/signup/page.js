'use client';

import { useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import { checkPhoneExists } from '@/lib/queries';

export default function SignupPage() {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [signedUp, setSignedUp] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    // Check phone availability BEFORE attempting signup, so a duplicate
    // shows a clear message immediately instead of the account creation
    // silently half-failing.
    try {
      const alreadyTaken = await checkPhoneExists(phone.trim());
      if (alreadyTaken) {
        setError('This phone number is already registered to another account. Please use a different number, or log in if this is your account.');
        setSubmitting(false);
        return;
      }
    } catch (checkErr) {
      // If the availability check itself fails for some reason, don't
      // block signup entirely on it — fall through and let the actual
      // signup attempt proceed (the database constraint is still the
      // real source of truth either way).
      console.error('Phone availability check failed:', checkErr);
    }

    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, phone },
      },
    });

    setSubmitting(false);

    if (signUpError) {
      setError(signUpError.message);
      return;
    }

    // The `handle_new_user` trigger in the database creates a matching
    // row in `profiles` automatically — nothing else to do here.
    //
    // Note: if this email is already registered, Supabase's signUp()
    // still returns success here rather than an error — that's
    // deliberate on Supabase's part, to avoid leaking which emails are
    // registered (a security measure, not a bug). This message is
    // written to be correct and helpful either way, without confirming
    // or denying whether the email existed already.
    setSignedUp(true);
  }

  if (signedUp) {
    return (
      <main className="mx-auto max-w-sm px-6 py-16 text-center">
        <h1 className="font-display text-3xl">Check your email</h1>
        <p className="mt-4 text-sm text-[var(--color-ink-soft)]">
          We've sent a confirmation link to <strong>{email}</strong>. Click
          it to activate your account.
        </p>
        <p className="mt-4 text-sm text-[var(--color-ink-soft)]">
          Already have an account with this email?{' '}
          <Link href="/login" className="text-[var(--color-teal-deep)] underline">
            Log in instead
          </Link>
          .
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-sm px-6 py-16">
      <h1 className="font-display text-3xl">Create your account</h1>
      <p className="mt-2 text-sm text-[var(--color-ink-soft)]">
        List a property or save your favorites once you're signed up.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
        <div>
          <label className="block text-sm text-[var(--color-ink-soft)]" htmlFor="fullName">
            Full name
          </label>
          <input
            id="fullName"
            type="text"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="mt-1 w-full border-b border-[var(--color-sand)] bg-transparent py-2 outline-none focus:border-[var(--color-teal)]"
          />
        </div>
        <div>
          <label className="block text-sm text-[var(--color-ink-soft)]" htmlFor="phone">
            Phone number
          </label>
          <p className="text-xs text-[var(--color-ink-softer)]">
            Shown only when someone reveals it on one of your listings.
          </p>
          <input
            id="phone"
            type="tel"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="e.g. 9876543210"
            className="mt-1 w-full border-b border-[var(--color-sand)] bg-transparent py-2 outline-none focus:border-[var(--color-teal)]"
          />
        </div>
        <div>
          <label className="block text-sm text-[var(--color-ink-soft)]" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full border-b border-[var(--color-sand)] bg-transparent py-2 outline-none focus:border-[var(--color-teal)]"
          />
        </div>
        <div>
          <label className="block text-sm text-[var(--color-ink-soft)]" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full border-b border-[var(--color-sand)] bg-transparent py-2 outline-none focus:border-[var(--color-teal)]"
          />
        </div>

        {error && <p className="text-sm text-[var(--color-brick)]">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="mt-2 bg-[var(--color-teal)] px-6 py-2.5 text-[var(--color-surface)] transition-colors hover:bg-[var(--color-teal-deep)] disabled:opacity-60"
        >
          {submitting ? 'Creating account…' : 'Sign up'}
        </button>

        <p className="text-xs text-[var(--color-ink-soft)]">
          By signing up, you agree to our{' '}
          <Link href="/terms" className="underline">Terms of Service</Link> and{' '}
          <Link href="/privacy-policy" className="underline">Privacy Policy</Link>.
        </p>
      </form>

      <p className="mt-6 text-sm text-[var(--color-ink-soft)]">
        Already have an account?{' '}
        <Link href="/login" className="text-[var(--color-teal-deep)] underline">
          Log in
        </Link>
      </p>
    </main>
  );
}
