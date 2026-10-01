'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthProvider';
import { getMyProfile, getSiteFeedback, markFeedbackRead } from '@/lib/queries';
import AdminNav from '@/app/components/AdminNav';

export default function AdminFeedbackPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [profile, setProfile] = useState(null);
  const [checkingRole, setCheckingRole] = useState(true);
  const [items, setItems] = useState([]);
  const [itemsLoading, setItemsLoading] = useState(true);
  const [pageError, setPageError] = useState('');
  const [actioningId, setActioningId] = useState(null);

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
      getSiteFeedback()
        .then(setItems)
        .catch((err) => setPageError(err.message || String(err)))
        .finally(() => setItemsLoading(false));
    }
  }, [profile]);

  async function handleToggleRead(item) {
    setActioningId(item.id);
    try {
      await markFeedbackRead(item.id, !item.is_read);
      setItems((prev) =>
        prev.map((x) => (x.id === item.id ? { ...x, is_read: !x.is_read } : x))
      );
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

  const unreadCount = items.filter((i) => !i.is_read).length;

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <AdminNav />
      <h1 className="font-display text-3xl">Feedback</h1>
      <p className="mt-2 text-[var(--color-ink-soft)]">
        {items.length} total, {unreadCount} unread. Sent from the "Feedback" button available on
        every page, by logged-in and anonymous visitors alike.
      </p>

      <div className="mt-6">
        {itemsLoading ? (
          <p className="text-sm text-[var(--color-ink-soft)]">Loading…</p>
        ) : items.length === 0 ? (
          <p className="text-sm text-[var(--color-ink-soft)]">No feedback yet.</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {items.map((item) => (
              <li
                key={item.id}
                className={`rounded-xl border p-4 ${
                  item.is_read
                    ? 'border-[var(--color-sand)] bg-[var(--color-surface)]'
                    : 'border-[var(--color-teal)] bg-[var(--color-surface)]'
                }`}
              >
                <p className="whitespace-pre-line text-[var(--color-ink)]">{item.message}</p>
                <p className="mt-2 text-xs text-[var(--color-ink-softer)]">
                  {item.user?.full_name ? `From ${item.user.full_name}` : 'From a visitor'}
                  {item.email ? ` · ${item.email}` : ''}
                  {item.page_url ? ` · sent from ${item.page_url}` : ''}
                  {' · '}
                  {new Date(item.created_at).toLocaleString()}
                </p>
                <button
                  disabled={actioningId === item.id}
                  onClick={() => handleToggleRead(item)}
                  className={`mt-3 rounded-full border px-3 py-1.5 text-xs font-semibold disabled:opacity-50 ${
                    item.is_read
                      ? 'border-[var(--color-sand)] text-[var(--color-ink-soft)] hover:border-[var(--color-teal)]'
                      : 'border-[var(--color-teal)] text-[var(--color-teal-deep)]'
                  }`}
                >
                  {item.is_read ? 'Mark as unread' : 'Mark as read'}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
