'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthProvider';
import {
  getMyProfile,
  getPendingBuilderRequests,
  approveBuilderRequest,
  rejectBuilderRequest,
  logAdminAction,
} from '@/lib/queries';
import AdminNav from '@/app/components/AdminNav';

export default function AdminBuilderRequestsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [profile, setProfile] = useState(null);
  const [checkingRole, setCheckingRole] = useState(true);
  const [requests, setRequests] = useState([]);
  const [requestsLoading, setRequestsLoading] = useState(true);
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
      getPendingBuilderRequests()
        .then(setRequests)
        .catch((err) => setPageError(err.message || String(err)))
        .finally(() => setRequestsLoading(false));
    }
  }, [profile]);

  async function handleApprove(request) {
    setActioningId(request.id);
    try {
      await approveBuilderRequest(request.id);
      setRequests((prev) => prev.filter((r) => r.id !== request.id));
      logAdminAction('approve_builder_request', 'builder_requests', request.id);
    } catch (err) {
      alert(err.message || String(err));
    } finally {
      setActioningId(null);
    }
  }

  async function handleReject(request) {
    setActioningId(request.id);
    try {
      await rejectBuilderRequest(request.id);
      setRequests((prev) => prev.filter((r) => r.id !== request.id));
      logAdminAction('reject_builder_request', 'builder_requests', request.id);
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
      <h1 className="font-display text-3xl">Builder requests</h1>
      <p className="mt-2 text-[var(--color-ink-soft)]">
        People asking to be set up as a builder, so they can create projects. Approving one
        immediately changes their account's role.
      </p>

      <div className="mt-6">
        {requestsLoading ? (
          <p className="text-sm text-[var(--color-ink-soft)]">Loading…</p>
        ) : requests.length === 0 ? (
          <p className="text-sm text-[var(--color-ink-soft)]">No pending requests right now.</p>
        ) : (
          <ul className="flex flex-col gap-4">
            {requests.map((request) => (
              <li
                key={request.id}
                className="border border-[var(--color-sand)] bg-[var(--color-surface)] p-4"
              >
                <p className="font-display text-lg">{request.agency_name}</p>
                <p className="text-sm text-[var(--color-ink-soft)]">
                  Requested by <strong>{request.user?.full_name || 'Unknown'}</strong> on{' '}
                  {new Date(request.created_at).toLocaleDateString()}
                </p>
                {request.message && (
                  <p className="mt-2 whitespace-pre-line text-sm text-[var(--color-ink-soft)]">
                    {request.message}
                  </p>
                )}
                <div className="mt-3 flex gap-2">
                  <button
                    disabled={actioningId === request.id}
                    onClick={() => handleApprove(request)}
                    className="bg-[var(--color-teal)] px-4 py-1.5 text-sm text-[var(--color-surface)] transition-colors hover:bg-[var(--color-teal-deep)] disabled:opacity-60"
                  >
                    Approve
                  </button>
                  <button
                    disabled={actioningId === request.id}
                    onClick={() => handleReject(request)}
                    className="border border-[var(--color-sand)] px-4 py-1.5 text-sm text-[var(--color-ink)] transition-colors hover:border-[var(--color-brick)] hover:text-[var(--color-brick)] disabled:opacity-60"
                  >
                    Reject
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
