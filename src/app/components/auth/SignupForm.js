'use client';

import { useId, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import { checkPhoneExists } from '@/lib/queries';

// The signup form, shared by the /signup page and the signup popup.
// Same idea as LoginForm: it renders its own heading (headingAs) and
// takes an optional onSwitch for the popup to flip to the login form.
export default function SignupForm({
  headingAs: Heading = 'h1',
  headingId,
  message,
  onSwitch,
}) {
  const uid = useId();
  const nameId = `${uid}-name`;
  const phoneId = `${uid}-phone`;
  const emailId = `${uid}-email`;
  const passwordId = `${uid}-password`;

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
        setError(
          'This phone number is already registered to another account. Please use a different number, or log in if this is your account.'
        );
        setSubmitting(false);
        return;
      }
    } catch (checkErr) {
      // If the availability check itself fails, don't block signup on it:
      // the database constraint is still the real source of truth.
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

    // The handle_new_user trigger in the database creates the matching
    // profiles row automatically. Note that if this email is already
    // registered, Supabase still reports success here rather than an
    // error, on purpose, so that nobody can use this form to find out
    // which emails have accounts. The message below is worded to be true
    // either way, without confirming or denying that the email existed.
    setSignedUp(true);
  }

  const switchToLogin = onSwitch ? (
    <button type="button" onClick={onSwitch} className="text-[var(--color-teal-deep)] underline">
      Log in
    </button>
  ) : (
    <Link href="/login" className="text-[var(--color-teal-deep)] underline">
      Log in
    </Link>
  );

  if (signedUp) {
    return (
      <div className="text-center">
        <Heading id={headingId} className="font-display text-3xl">
          Check your email
        </Heading>
        <p className="mt-4 text-sm text-[var(--color-ink-soft)]">
          If <strong>{email}</strong> isn&apos;t registered yet, we&apos;ve sent it a
          confirmation link. Click the link to activate your account.
        </p>
        <p className="mt-4 text-sm text-[var(--color-ink-soft)]">
          Already have an account with this email? {switchToLogin} instead.
        </p>
      </div>
    );
  }

  return (
    <div>
      <Heading id={headingId} className="font-display text-3xl">
        Create your account
      </Heading>
      <p className="mt-2 text-sm text-[var(--color-ink-soft)]">
        {message || 'List a property or save your favorites once you are signed up.'}
      </p>

      <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
        <div>
          <label className="block text-sm text-[var(--color-ink-soft)]" htmlFor={nameId}>
            Full name
          </label>
          <input
            id={nameId}
            type="text"
            required
            autoComplete="name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="mt-1 w-full border-b border-[var(--color-sand)] bg-transparent py-2 outline-none focus:border-[var(--color-teal)]"
          />
        </div>
        <div>
          <label className="block text-sm text-[var(--color-ink-soft)]" htmlFor={phoneId}>
            Phone number
          </label>
          <p className="text-xs text-[var(--color-ink-softer)]">
            Shown only when someone reveals it on one of your listings.
          </p>
          <input
            id={phoneId}
            type="tel"
            required
            autoComplete="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="e.g. 9876543210"
            className="mt-1 w-full border-b border-[var(--color-sand)] bg-transparent py-2 outline-none focus:border-[var(--color-teal)]"
          />
        </div>
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
          <label className="block text-sm text-[var(--color-ink-soft)]" htmlFor={passwordId}>
            Password
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

        {error && <p className="text-sm text-[var(--color-brick)]">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="mt-2 rounded-full bg-[var(--color-teal)] px-6 py-2.5 font-semibold text-[var(--color-surface)] transition-colors hover:bg-[var(--color-teal-deep)] disabled:opacity-60"
        >
          {submitting ? 'Creating account…' : 'Sign up'}
        </button>

        <p className="text-xs text-[var(--color-ink-soft)]">
          By signing up, you agree to our{' '}
          <Link href="/terms" className="underline">
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link href="/privacy-policy" className="underline">
            Privacy Policy
          </Link>
          .
        </p>
      </form>

      <p className="mt-6 text-sm text-[var(--color-ink-soft)]">
        Already have an account? {switchToLogin}
      </p>
    </div>
  );
}
