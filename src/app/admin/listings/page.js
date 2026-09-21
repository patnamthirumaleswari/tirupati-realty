'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthProvider';
import { getMyProfile, getPendingListings, setListingStatus, revealOwnerPhone } from '@/lib/queries';
import { formatPrice } from '@/lib/format';
import AdminNav from '@/app/components/AdminNav';

export default function AdminListingsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [profile, setProfile] = useState(null);
  const [checkingRole, setCheckingRole] = useState(true);
  const [pending, setPending] = useState([]);
  const [listingsLoading, setListingsLoading] = useState(true);
  const [revealedPhones, setRevealedPhones] = useState({});
  const [actioningId, setActioningId] = useState(null);
  const [pageError, setPageError] = useState('');

  // Redirect anyone who isn't logged in, or isn't an admin, straight away.
  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.push('/login');
      return;
    }
    getMyProfile()
      .then((p) => {
        setProfile(p);
        if (p?.role !== 'admin') router.push('/');
      })
      .catch((err) => setPageError(err.message || String(err)))
      .finally(() => setCheckingRole(false));
  }, [loading, user, router]);

  useEffect(() => {
    if (profile?.role === 'admin') {
      refreshPending();
    }
  }, [profile]);

  function refreshPending() {
    setListingsLoading(true);
    getPendingListings()
      .then(setPending)
      .catch((err) => setPageError(err.message || String(err)))
      .finally(() => setListingsLoading(false));
  }

  async function handleReveal(listingId) {
    try {
      const phone = await revealOwnerPhone(listingId);
      setRevealedPhones((prev) => ({ ...prev, [listingId]: phone }));
    } catch (err) {
      alert(err.message || String(err));
    }
  }

  async function handleAction(id, status) {
    setActioningId(id);
    try {
      await setListingStatus(id, status);
      setPending((prev) => prev.filter((l) => l.id !== id));
    } catch (err) {
      alert(err.message || String(err));
    } finally {
      setActioningId(null);
    }
  }

  if (loading || checkingRole) return null;

  if (pageError) {
    return (
      <main className="mx-auto max-w-2xl px-6 py-12">
        <p className="text-[var(--color-brick)]">Error: {pageError}</p>
      </main>
    );
  }

  if (profile?.role !== 'admin') return null;

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <AdminNav />
      <h1 className="font-display text-3xl">Pending listings</h1>
      <p className="mt-2 text-[var(--color-ink-soft)]">
        Approve a listing to make it publicly searchable, or reject it.
      </p>

      <div className="mt-8">
        {listingsLoading ? (
          <p className="text-sm text-[var(--color-ink-soft)]">Loading…</p>
        ) : pending.length === 0 ? (
          <p className="text-sm text-[var(--color-ink-soft)]">
            Nothing waiting for review right now.
          </p>
        ) : (
          <ul className="flex flex-col gap-4">
            {pending.map((listing) => (
              <li
                key={listing.id}
                className="border border-[var(--color-sand)] bg-[var(--color-surface)] p-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-display text-lg">{listing.title}</p>
                    <p className="text-sm text-[var(--color-ink-soft)]">
                      {listing.type} · {listing.purpose} · {listing.locality?.name}
                    </p>
                    <p className="mt-1 text-[var(--color-brick)]">{formatPrice(listing)}</p>
                    <p className="mt-2 text-xs text-[var(--color-ink-soft)]">
                      Posted by {listing.owner?.full_name || 'Unknown'}
                      {revealedPhones[listing.id] ? (
                        ` · ${revealedPhones[listing.id]}`
                      ) : (
                        <button
                          onClick={() => handleReveal(listing.id)}
                          className="ml-1 underline hover:text-[var(--color-teal-deep)]"
                        >
                          reveal phone
                        </button>
                      )}
                    </p>
                  </div>

                  <div className="flex shrink-0 flex-col gap-2">
                    <button
                      disabled={actioningId === listing.id}
                      onClick={() => handleAction(listing.id, 'live')}
                      className="bg-[var(--color-teal)] px-4 py-1.5 text-sm text-[var(--color-surface)] transition-colors hover:bg-[var(--color-teal-deep)] disabled:opacity-60"
                    >
                      Approve
                    </button>
                    <button
                      disabled={actioningId === listing.id}
                      onClick={() => handleAction(listing.id, 'rejected')}
                      className="border border-[var(--color-sand)] px-4 py-1.5 text-sm text-[var(--color-ink)] transition-colors hover:border-[var(--color-brick)] hover:text-[var(--color-brick)] disabled:opacity-60"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
