'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthProvider';
import { getMyProfile, getAuditLog } from '@/lib/queries';
import AdminNav from '@/app/components/AdminNav';

const ACTION_LABELS = {
  approve_listing: 'Approved listing',
  reject_listing: 'Rejected listing',
  grant_verified: 'Granted Verified badge',
  remove_verified: 'Removed Verified badge',
};

function actionLabel(action) {
  if (ACTION_LABELS[action]) return ACTION_LABELS[action];
  if (action.startsWith('role_change_to_')) {
    return `Changed role to "${action.replace('role_change_to_', '')}"`;
  }
  return action;
}

export default function AdminAuditLogPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [profile, setProfile] = useState(null);
  const [checkingRole, setCheckingRole] = useState(true);
  const [entries, setEntries] = useState([]);
  const [entriesLoading, setEntriesLoading] = useState(true);
  const [pageError, setPageError] = useState('');

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
      getAuditLog()
        .then(setEntries)
        .catch((err) => setPageError(err.message || String(err)))
        .finally(() => setEntriesLoading(false));
    }
  }, [profile]);

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
      <h1 className="font-display text-3xl">Audit log</h1>
      <p className="mt-2 text-[var(--color-ink-soft)]">
        The most recent {entries.length} admin actions, newest first.
      </p>

      <div className="mt-6">
        {entriesLoading ? (
          <p className="text-sm text-[var(--color-ink-soft)]">Loading…</p>
        ) : entries.length === 0 ? (
          <p className="text-sm text-[var(--color-ink-soft)]">No admin actions logged yet.</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--color-sand)] text-xs uppercase text-[var(--color-ink-softer)]">
                <th className="py-2 pr-4">When</th>
                <th className="py-2 pr-4">Admin</th>
                <th className="py-2 pr-4">Action</th>
                <th className="py-2">On</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((e) => (
                <tr key={e.id} className="border-b border-[var(--color-sand)]">
                  <td className="py-2 pr-4 text-[var(--color-ink-softer)]">
                    {new Date(e.created_at).toLocaleString()}
                  </td>
                  <td className="py-2 pr-4">{e.actor?.full_name || 'Unknown'}</td>
                  <td className="py-2 pr-4">{actionLabel(e.action)}</td>
                  <td className="py-2 font-mono text-xs text-[var(--color-ink-softer)]">
                    {e.target_table}/{e.target_id?.slice(0, 8)}…
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </main>
  );
}
