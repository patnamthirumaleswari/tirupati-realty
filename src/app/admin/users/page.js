'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthProvider';
import { getMyProfile, getAllUsers, setUserVerified, setUserRole } from '@/lib/queries';
import AdminNav from '@/app/components/AdminNav';

const ROLES = ['user', 'agent', 'builder', 'admin'];

export default function AdminUsersPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [profile, setProfile] = useState(null);
  const [checkingRole, setCheckingRole] = useState(true);
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [pageError, setPageError] = useState('');
  const [actioningId, setActioningId] = useState(null);
  const [search, setSearch] = useState('');

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
      getAllUsers()
        .then(setUsers)
        .catch((err) => setPageError(err.message || String(err)))
        .finally(() => setUsersLoading(false));
    }
  }, [profile]);

  async function handleToggleVerified(u) {
    setActioningId(u.id);
    try {
      await setUserVerified(u.id, !u.is_verified);
      setUsers((prev) =>
        prev.map((x) => (x.id === u.id ? { ...x, is_verified: !x.is_verified } : x))
      );
    } catch (err) {
      alert(err.message || String(err));
    } finally {
      setActioningId(null);
    }
  }

  async function handleRoleChange(u, newRole) {
    if (newRole === u.role) return;
    if (!confirm(`Change ${u.full_name || 'this user'}'s role from "${u.role}" to "${newRole}"?`)) return;

    setActioningId(u.id);
    try {
      await setUserRole(u.id, newRole);
      setUsers((prev) => prev.map((x) => (x.id === u.id ? { ...x, role: newRole } : x)));
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

  const filteredUsers = users.filter((u) =>
    (u.full_name || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <AdminNav />
      <h1 className="font-display text-3xl">Users</h1>
      <p className="mt-2 text-[var(--color-ink-soft)]">
        {users.length} registered {users.length === 1 ? 'user' : 'users'}. Grant the
        Verified badge to trusted agents/builders, or change a user's role.
      </p>

      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search by name…"
        className="mt-4 w-full max-w-sm border-b border-[var(--color-sand)] bg-transparent py-2 text-sm outline-none focus:border-[var(--color-teal)]"
      />

      <div className="mt-6">
        {usersLoading ? (
          <p className="text-sm text-[var(--color-ink-soft)]">Loading…</p>
        ) : filteredUsers.length === 0 ? (
          <p className="text-sm text-[var(--color-ink-soft)]">No users match that search.</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {filteredUsers.map((u) => (
              <li
                key={u.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--color-sand)] bg-[var(--color-surface)] p-4"
              >
                <div>
                  <p className="font-semibold text-[var(--color-ink)]">
                    {u.full_name || 'Unnamed user'}
                    {u.is_verified && (
                      <span className="ml-2 text-xs text-[var(--color-teal-deep)]">✓ Verified</span>
                    )}
                  </p>
                  {u.agency_name && (
                    <p className="text-sm text-[var(--color-ink-soft)]">{u.agency_name}</p>
                  )}
                  <p className="text-xs text-[var(--color-ink-softer)]">
                    Joined {new Date(u.created_at).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <select
                    value={u.role}
                    disabled={actioningId === u.id || u.id === profile.id}
                    onChange={(e) => handleRoleChange(u, e.target.value)}
                    className="rounded-full border border-[var(--color-sand)] px-3 py-1.5 text-xs font-semibold text-[var(--color-ink)] disabled:opacity-50"
                    title={u.id === profile.id ? "You can't change your own role here" : undefined}
                  >
                    {ROLES.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>

                  <button
                    disabled={actioningId === u.id}
                    onClick={() => handleToggleVerified(u)}
                    className={`rounded-full border px-3 py-1.5 text-xs font-semibold disabled:opacity-50 ${
                      u.is_verified
                        ? 'border-[var(--color-sand)] text-[var(--color-ink-soft)] hover:border-[var(--color-brick)] hover:text-[var(--color-brick)]'
                        : 'border-[var(--color-teal)] text-[var(--color-teal-deep)]'
                    }`}
                  >
                    {u.is_verified ? 'Remove Verified' : 'Grant Verified'}
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
