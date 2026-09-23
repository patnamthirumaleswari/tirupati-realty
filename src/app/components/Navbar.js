'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/AuthProvider';

export default function Navbar() {
  const { user, loading } = useAuth();

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--color-sand)] bg-[var(--color-bg)]/90 px-6 py-3 backdrop-blur md:px-8">
      <div className="mx-auto flex max-w-6xl items-center gap-6">
        <Link href="/" className="flex flex-grow items-center gap-2.5">
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px]"
            style={{ background: 'linear-gradient(135deg, var(--color-teal), var(--color-teal-deep))' }}
          >
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="var(--color-bg)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 11l9-7 9 7" />
              <path d="M5 10v9a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1v-9" />
            </svg>
          </div>
          <div>
            <div className="font-display text-[17px] font-semibold leading-none text-[var(--color-ink)]">
              Tirupati <span style={{ color: 'var(--color-teal)' }}>Realty</span>
            </div>
            <div className="text-[10px] uppercase tracking-wider text-[var(--color-ink-softer)]">
              Tirupati &amp; around
            </div>
          </div>
        </Link>

        <nav className="hidden gap-6 text-sm font-semibold sm:flex">
          <Link href="/" className="text-[var(--color-ink)] hover:text-[var(--color-teal)]">Home</Link>
          <Link href="/listings" className="text-[var(--color-ink)] hover:text-[var(--color-teal)]">Buy / Rent</Link>
          {!loading && user && (
            <Link href="/dashboard" className="text-[var(--color-ink)] hover:text-[var(--color-teal)]">Dashboard</Link>
          )}
        </nav>

        <div className="flex items-center gap-3">
          {loading ? null : user ? (
            <Link
              href="/listings/new"
              className="whitespace-nowrap rounded-full px-5 py-2.5 text-sm font-bold text-[var(--color-bg)] transition-transform hover:-translate-y-0.5"
              style={{ background: 'var(--color-teal)' }}
            >
              + Post a Free Ad
            </Link>
          ) : (
            <>
              <div className="hidden items-center gap-1 border border-[var(--color-sand)] px-1 py-1 text-xs sm:flex">
                <Link href="/login" className="px-2 py-1 text-[var(--color-ink-soft)] hover:text-[var(--color-teal)]">
                  Log in
                </Link>
                <span className="text-[var(--color-sand)]">|</span>
                <Link href="/signup" className="px-2 py-1 font-semibold text-[var(--color-teal)] hover:underline">
                  Sign up
                </Link>
              </div>
              <Link
                href="/signup"
                className="whitespace-nowrap rounded-full px-5 py-2.5 text-sm font-bold text-[var(--color-bg)] transition-transform hover:-translate-y-0.5"
                style={{ background: 'var(--color-teal)' }}
              >
                + Post a Free Ad
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
