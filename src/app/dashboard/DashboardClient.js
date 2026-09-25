'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/AuthProvider';
import { supabase } from '@/lib/supabaseClient';
import {
  getMyListings,
  getMyFavoriteListings,
  getMyPhone,
  updateMyPhone,
  renewListing,
  markListingOutcome,
  getMyLeads,
  getMyPhoneRevealCounts,
  getMyInquiryCounts,
} from '@/lib/queries';
import { formatPrice } from '@/lib/format';
import ListingCard from '@/app/components/ListingCard';

const STATUS_LABELS = {
  draft: 'Draft',
  pending_approval: 'Pending approval',
  live: 'Live',
  expired: 'Expired',
  sold: 'Sold',
  rented: 'Rented',
  rejected: 'Rejected',
};

function timeAgo(dateStr) {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function DashboardContent() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const justSubmittedId = searchParams.get('submitted');

  const [tab, setTab] = useState('listings');
  const [myListings, setMyListings] = useState([]);
  const [listingsLoading, setListingsLoading] = useState(true);
  const [myFavorites, setMyFavorites] = useState([]);
  const [favoritesLoading, setFavoritesLoading] = useState(true);
  const [myLeads, setMyLeads] = useState([]);
  const [leadsLoading, setLeadsLoading] = useState(true);
  const [revealCounts, setRevealCounts] = useState({});
  const [inquiryCounts, setInquiryCounts] = useState({});
  const [loggingOut, setLoggingOut] = useState(false);
  const [phone, setPhone] = useState('');
  const [phoneInput, setPhoneInput] = useState('');
  const [savingPhone, setSavingPhone] = useState(false);
  const [phoneSaved, setPhoneSaved] = useState(false);
  const [actioningListingId, setActioningListingId] = useState(null);

  useEffect(() => {
    if (!loading && !user && !loggingOut) {
      router.push('/login');
    }
  }, [loading, user, loggingOut, router]);

  useEffect(() => {
    if (user) {
      getMyListings(user.id)
        .then(setMyListings)
        .finally(() => setListingsLoading(false));
      getMyFavoriteListings(user.id)
        .then(setMyFavorites)
        .finally(() => setFavoritesLoading(false));
      getMyLeads(user.id)
        .then(setMyLeads)
        .finally(() => setLeadsLoading(false));
      getMyPhoneRevealCounts(user.id).then(setRevealCounts).catch(() => {});
      getMyInquiryCounts(user.id).then(setInquiryCounts).catch(() => {});
      getMyPhone()
        .then((p) => {
          setPhone(p || '');
          setPhoneInput(p || '');
        })
        .catch((err) => console.error('Failed to load phone:', err));
    }
  }, [user]);

  async function handleSavePhone(e) {
    e.preventDefault();
    setSavingPhone(true);
    setPhoneSaved(false);
    try {
      await updateMyPhone(phoneInput.trim());
      setPhone(phoneInput.trim());
      setPhoneSaved(true);
    } catch (err) {
      alert(err.message || String(err));
    } finally {
      setSavingPhone(false);
    }
  }

  async function handleRenew(listingId) {
    setActioningListingId(listingId);
    try {
      await renewListing(listingId);
      setMyListings((prev) =>
        prev.map((l) => (l.id === listingId ? { ...l, status: 'live' } : l))
      );
    } catch (err) {
      alert(err.message || String(err));
    } finally {
      setActioningListingId(null);
    }
  }

  async function handleMarkOutcome(listingId, status) {
    setActioningListingId(listingId);
    try {
      await markListingOutcome(listingId, status);
      setMyListings((prev) =>
        prev.map((l) => (l.id === listingId ? { ...l, status } : l))
      );
    } catch (err) {
      alert(err.message || String(err));
    } finally {
      setActioningListingId(null);
    }
  }

  async function handleLogout() {
    setLoggingOut(true);
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
    <main className="mx-auto max-w-4xl px-6 py-16">
      <h1 className="font-display text-3xl">My account</h1>
      <p className="mt-2 text-[var(--color-ink-soft)]">
        Logged in as {user.email}
      </p>

      <form onSubmit={handleSavePhone} className="mt-4 flex flex-col gap-2 rounded-xl border border-[var(--color-sand)] bg-[var(--color-surface)] p-4 sm:flex-row sm:items-end">
        <div className="flex-1">
          <label className="block text-sm text-[var(--color-ink-soft)]">
            Your phone number
          </label>
          <p className="text-xs text-[var(--color-ink-softer)]">
            Shown only when a visitor clicks &quot;Reveal Phone Number&quot; on one of your listings.
          </p>
          <input
            type="tel"
            value={phoneInput}
            onChange={(e) => {
              setPhoneInput(e.target.value);
              setPhoneSaved(false);
            }}
            placeholder="e.g. 9876543210"
            className="mt-2 w-full border-b border-[var(--color-sand)] bg-transparent py-2 outline-none focus:border-[var(--color-teal)]"
          />
        </div>
        <button
          type="submit"
          disabled={savingPhone || phoneInput.trim() === phone}
          className="rounded-full bg-[var(--color-teal)] px-5 py-2 text-sm font-bold text-white transition-colors hover:bg-[var(--color-teal-deep)] disabled:opacity-50"
        >
          {savingPhone ? 'Saving…' : phoneSaved ? 'Saved ✓' : 'Save'}
        </button>
      </form>

      {justSubmittedId && (
        <div className="mt-6 border border-[var(--color-teal)] bg-[var(--color-surface)] p-4 text-sm">
          Your listing has been submitted and is now{' '}
          <strong>pending admin approval</strong>. It will appear in search
          once approved.
        </div>
      )}

      {/* Tabs */}
      <div className="mt-10 flex gap-1 border-b border-[var(--color-sand)]">
        <button
          onClick={() => setTab('listings')}
          className={`px-4 py-2 text-sm font-semibold ${
            tab === 'listings'
              ? 'border-b-2 border-[var(--color-teal)] text-[var(--color-teal-deep)]'
              : 'text-[var(--color-ink-soft)]'
          }`}
        >
          My Listings <span className="ml-1 text-xs">{myListings.length}</span>
        </button>
        <button
          onClick={() => setTab('leads')}
          className={`px-4 py-2 text-sm font-semibold ${
            tab === 'leads'
              ? 'border-b-2 border-[var(--color-teal)] text-[var(--color-teal-deep)]'
              : 'text-[var(--color-ink-soft)]'
          }`}
        >
          My Leads <span className="ml-1 text-xs">{myLeads.length}</span>
        </button>
        <button
          onClick={() => setTab('favorites')}
          className={`px-4 py-2 text-sm font-semibold ${
            tab === 'favorites'
              ? 'border-b-2 border-[var(--color-teal)] text-[var(--color-teal-deep)]'
              : 'text-[var(--color-ink-soft)]'
          }`}
        >
          My Favorites <span className="ml-1 text-xs">{myFavorites.length}</span>
        </button>
      </div>

      {tab === 'listings' && (
        <div className="mt-6">
          <div className="mb-4 flex justify-end">
            <Link
              href="/listings/new"
              className="rounded-full bg-[var(--color-teal)] px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-[var(--color-teal-deep)]"
            >
              + Post New Listing
            </Link>
          </div>
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
                  className="flex items-center justify-between rounded-xl border border-[var(--color-sand)] bg-[var(--color-surface)] p-4"
                >
                  <div>
                    <p className="font-display">{listing.title}</p>
                    <p className="text-sm text-[var(--color-ink-soft)]">
                      {listing.locality?.name} · {formatPrice(listing)}
                    </p>
                    <p className="mt-1 text-xs text-[var(--color-ink-softer)]">
                      {listing.view_count || 0} views · {inquiryCounts[listing.id] || 0} inquiries · {revealCounts[listing.id] || 0} phone reveals
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-2">
                    <span className="rounded-full border border-[var(--color-sand)] px-3 py-1 text-xs text-[var(--color-ink-soft)]">
                      {STATUS_LABELS[listing.status] || listing.status}
                    </span>
                    <div className="flex flex-wrap justify-end gap-2">
                      {(listing.status === 'live' || listing.status === 'pending_approval') && (
                        <Link
                          href={`/listings/${listing.id}/edit`}
                          className="text-xs font-semibold text-[var(--color-teal)] hover:underline"
                        >
                          Edit
                        </Link>
                      )}
                      {(listing.status === 'live' || listing.status === 'expired') && (
                        <>
                          <button
                            disabled={actioningListingId === listing.id}
                            onClick={() => handleRenew(listing.id)}
                            className="text-xs font-semibold text-[var(--color-teal)] hover:underline disabled:opacity-50"
                          >
                            Renew
                          </button>
                          <button
                            disabled={actioningListingId === listing.id}
                            onClick={() =>
                              handleMarkOutcome(
                                listing.id,
                                listing.purpose === 'rent' ? 'rented' : 'sold'
                              )
                            }
                            className="text-xs font-semibold text-[var(--color-ink-soft)] hover:underline disabled:opacity-50"
                          >
                            Mark {listing.purpose === 'rent' ? 'Rented' : 'Sold'}
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {tab === 'leads' && (
        <div className="mt-6">
          {leadsLoading ? (
            <p className="text-sm text-[var(--color-ink-soft)]">Loading…</p>
          ) : myLeads.length === 0 ? (
            <p className="text-sm text-[var(--color-ink-soft)]">
              No inquiries yet — they'll show up here as soon as someone
              contacts you about one of your listings.
            </p>
          ) : (
            <ul className="flex flex-col gap-3">
              {myLeads.map((lead) => (
                <li
                  key={lead.id}
                  className="rounded-xl border border-[var(--color-sand)] bg-[var(--color-surface)] p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-[var(--color-ink)]">{lead.sender_name}</p>
                      <p className="text-sm text-[var(--color-ink-soft)]">{lead.sender_phone}</p>
                    </div>
                    <span className="shrink-0 text-xs text-[var(--color-ink-softer)]">
                      {timeAgo(lead.created_at)}
                    </span>
                  </div>
                  {lead.message && (
                    <p className="mt-2 text-sm text-[var(--color-ink-soft)]">{lead.message}</p>
                  )}
                  <Link
                    href={`/listings/${lead.listing?.id}`}
                    className="mt-2 inline-block text-xs font-semibold text-[var(--color-teal)] hover:underline"
                  >
                    About: {lead.listing?.title}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {tab === 'favorites' && (
        <div className="mt-6">
          {favoritesLoading ? (
            <p className="text-sm text-[var(--color-ink-soft)]">Loading…</p>
          ) : myFavorites.length === 0 ? (
            <p className="text-sm text-[var(--color-ink-soft)]">
              Nothing saved yet — tap the heart icon on any listing to save it here.
            </p>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {myFavorites.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          )}
        </div>
      )}

      <button
        onClick={handleLogout}
        className="mt-12 rounded-full border border-[var(--color-sand)] px-6 py-2.5 text-[var(--color-ink)] transition-colors hover:border-[var(--color-brick)] hover:text-[var(--color-brick)]"
      >
        Log out
      </button>
    </main>
  );
}

// useSearchParams() (used above, to read ?submitted=...) requires a
// Suspense boundary during static prerendering — Next.js build fails
// without this wrapper.
export default function DashboardClient() {
  return (
    <Suspense fallback={null}>
      <DashboardContent />
    </Suspense>
  );
}
