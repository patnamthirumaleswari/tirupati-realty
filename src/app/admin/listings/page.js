'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthProvider';
import { getMyProfile, getPendingListings, setListingStatus, revealOwnerPhone, logAdminAction } from '@/lib/queries';
import AdminNav from '@/app/components/AdminNav';
import PendingListingCard from '@/app/components/PendingListingCard';

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
      logAdminAction(status === 'live' ? 'approve_listing' : 'reject_listing', 'listings', id);

      fetch('/api/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: status === 'live' ? 'listing_approved' : 'listing_rejected',
          listingId: id,
        }),
      }).catch((err) => console.error('Notify request failed:', err));
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
    <main className="mx-auto max-w-4xl px-6 py-12">
      <AdminNav />
      <h1 className="font-display text-3xl">Pending listings</h1>
      <p className="mt-2 text-[var(--color-ink-soft)]">
        Review each listing, then approve it to make it publicly searchable, or reject it.
        Use “Show full details” to see all photos, the description, and every field before deciding.
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
              <PendingListingCard
                key={listing.id}
                listing={listing}
                revealedPhone={revealedPhones[listing.id]}
                onReveal={handleReveal}
                onAction={handleAction}
                actioning={actioningId === listing.id}
              />
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
