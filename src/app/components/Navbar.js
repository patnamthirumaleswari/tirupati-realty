'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/AuthProvider';

export default function Navbar() {
  const { user, loading } = useAuth();

  return (
    <header className="border-b border-[var(--color-sand)] px-6 py-4 md:px-12">
      <div className="mx-auto flex max-w-6xl items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="font-display text-xl text-[var(--color-ink)]">
            Tirupati Realty
          </Link>
          <span className="hidden border-l border-[var(--color-sand)] pl-3 text-sm text-[var(--color-ink-soft)] sm:inline">
            Tirupati
          </span>
        </div>

        <nav className="flex items-center gap-4 text-sm">
          <Link href="/" className="text-[var(--color-ink-soft)] hover:text-[var(--color-teal-deep)]">
            Home
          </Link>

          {loading ? null : user ? (
            <>
              <Link
                href="/dashboard"
                className="hidden text-[var(--color-ink-soft)] hover:text-[var(--color-teal-deep)] sm:inline"
              >
                My account
              </Link>
              <Link
                href="/listings/new"
                className="bg-[var(--color-teal)] px-4 py-2 text-[var(--color-surface)] transition-colors hover:bg-[var(--color-teal-deep)]"
              >
                Post property <span className="opacity-80">FREE</span>
              </Link>
            </>
          ) : (
            <>
              <div className="flex items-center gap-1 border border-[var(--color-sand)] px-1 py-1 text-xs">
                <Link
                  href="/login"
                  className="px-2 py-1 text-[var(--color-ink-soft)] hover:text-[var(--color-teal-deep)]"
                >
                  Log in
                </Link>
                <span className="text-[var(--color-sand)]">|</span>
                <Link
                  href="/signup"
                  className="px-2 py-1 text-[var(--color-teal-deep)] hover:underline"
                >
                  Sign up
                </Link>
              </div>
              <Link
                href="/signup"
                className="hidden bg-[var(--color-teal)] px-4 py-2 text-[var(--color-surface)] transition-colors hover:bg-[var(--color-teal-deep)] sm:inline-block"
              >
                Post property <span className="opacity-80">FREE</span>
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
