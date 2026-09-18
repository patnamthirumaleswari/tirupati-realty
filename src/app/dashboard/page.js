'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/AuthProvider';
import { supabase } from '@/lib/supabaseClient';
import { getMyListings } from '@/lib/queries';
import { formatPrice } from '@/lib/format';

const STATUS_LABELS = {
  draft: 'Draft',
  pending_approval: 'Pending approval',
  live: 'Live',
  expired: 'Expired',
  sold: 'Sold',
  rented: 'Rented',
  rejected: 'Rejected',
};

function DashboardContent() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const justSubmittedId = searchParams.get('submitted');

  const [myListings, setMyListings] = useState([]);
  const [listingsLoading, setListingsLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [loading, user, router]);

  useEffect(() => {
    if (user) {
      getMyListings(user.id)
        .then(setMyListings)
        .finally(() => setListingsLoading(false));
    }
  }, [user]);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push('/');
  }

  if (loading || !user) {
    return (
      <main className="mx-auto max-w-2xl px-6 py-16">
        <p className="text-[var(--color-ink-soft)]">Loading…</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="font-display text-3xl">My account</h1>
      <p className="mt-2 text-[var(--color-ink-soft)]">
        Logged in as {user.email}
      </p>

      {justSubmittedId && (
        <div className="mt-6 border border-[var(--color-teal)] bg-[var(--color-surface)] p-4 text-sm">
          Your listing has been submitted and is now{' '}
          <strong>pending admin approval</strong>. It will appear in search
          once approved.
        </div>
      )}

      <div className="mt-10 flex items-center justify-between">
        <h2 className="font-display text-xl">My listings</h2>
        <Link
          href="/listings/new"
          className="bg-[var(--color-teal)] px-4 py-2 text-sm text-[var(--color-surface)] transition-colors hover:bg-[var(--color-teal-deep)]"
        >
          + List a property
        </Link>
      </div>

      <div className="mt-4">
        {listingsLoading ? (
          <p className="text-sm text-[var(--color-ink-soft)]">Loading…</p>
        ) : myListings.length === 0 ? (
          <p className="text-sm text-[var(--color-ink-soft)]">
            You haven&apos;t listed anything yet.
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {myListings.map((listing) => (
              <li
                key={listing.id}
                className="flex items-center justify-between border border-[var(--color-sand)] bg-[var(--color-surface)] p-4"
              >
                <div>
                  <p className="font-display">{listing.title}</p>
                  <p className="text-sm text-[var(--color-ink-soft)]">
                    {listing.locality?.name} · {formatPrice(listing)}
                  </p>
                </div>
                <span className="border border-[var(--color-sand)] px-3 py-1 text-xs text-[var(--color-ink-soft)]">
                  {STATUS_LABELS[listing.status] || listing.status}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <button
        onClick={handleLogout}
        className="mt-10 border border-[var(--color-sand)] px-6 py-2.5 text-[var(--color-ink)] transition-colors hover:border-[var(--color-brick)] hover:text-[var(--color-brick)]"
      >
        Log out
      </button>
    </main>
  );
}

// useSearchParams() (used above, to read ?submitted=...) requires a
// Suspense boundary during static prerendering — Next.js build fails
// without this wrapper.
export default function DashboardPage() {
  return (
    <Suspense fallback={null}>
      <DashboardContent />
    </Suspense>
  );
}
