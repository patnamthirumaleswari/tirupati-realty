'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/AuthProvider';

export default function Navbar() {
  const { user, loading } = useAuth();

  return (
    <header className="border-b border-[var(--color-sand)] px-6 py-4 md:px-12">
      <div className="mx-auto flex max-w-6xl items-center justify-between">
        <Link href="/" className="font-display text-xl text-[var(--color-ink)]">
          Tirupati Realty
        </Link>

        <nav className="flex items-center gap-5 text-sm">
          <Link href="/listings" className="text-[var(--color-ink-soft)] hover:text-[var(--color-teal-deep)]">
            Browse
          </Link>

          {loading ? null : user ? (
            <>
              <Link
                href="/listings/new"
                className="text-[var(--color-ink-soft)] hover:text-[var(--color-teal-deep)]"
              >
                List a property
              </Link>
              <Link
                href="/dashboard"
                className="text-[var(--color-ink-soft)] hover:text-[var(--color-teal-deep)]"
              >
                My account
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-[var(--color-ink-soft)] hover:text-[var(--color-teal-deep)]"
              >
                Log in
              </Link>
              <Link
                href="/signup"
                className="bg-[var(--color-teal)] px-4 py-2 text-[var(--color-surface)] transition-colors hover:bg-[var(--color-teal-deep)]"
              >
                Sign up
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
