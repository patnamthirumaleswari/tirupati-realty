'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthProvider';
import {
  getMyProfile,
  adminGetLocalities,
  createLocality,
  setLocalityActive,
} from '@/lib/queries';
import AdminNav from '@/app/components/AdminNav';

export default function AdminLocalitiesPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [profile, setProfile] = useState(null);
  const [checkingRole, setCheckingRole] = useState(true);
  const [localities, setLocalities] = useState([]);
  const [listLoading, setListLoading] = useState(true);
  const [pageError, setPageError] = useState('');

  const [name, setName] = useState('');
  const [mandal, setMandal] = useState('');
  const [adding, setAdding] = useState(false);

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
    if (profile?.role === 'admin') refresh();
  }, [profile]);

  function refresh() {
    setListLoading(true);
    adminGetLocalities()
      .then(setLocalities)
      .catch((err) => setPageError(err.message || String(err)))
      .finally(() => setListLoading(false));
  }

  async function handleAdd(e) {
    e.preventDefault();
    if (!name.trim()) return;
    setAdding(true);
    try {
      await createLocality({ name: name.trim(), mandal: mandal.trim() });
      setName('');
      setMandal('');
      refresh();
    } catch (err) {
      alert(err.message || String(err));
    } finally {
      setAdding(false);
    }
  }

  async function toggleActive(loc) {
    try {
      await setLocalityActive(loc.id, !loc.is_active);
      setLocalities((prev) =>
        prev.map((l) => (l.id === loc.id ? { ...l, is_active: !l.is_active } : l))
      );
    } catch (err) {
      alert(err.message || String(err));
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
    <main className="mx-auto max-w-2xl px-6 py-12">
      <AdminNav />
      <h1 className="font-display text-3xl">Localities</h1>
      <p className="mt-2 text-[var(--color-ink-soft)]">
        Only active localities appear in search filters and the listing
        form. Deactivating one hides it from those without deleting history.
      </p>

      <form onSubmit={handleAdd} className="mt-6 flex gap-3 border border-[var(--color-sand)] bg-[var(--color-surface)] p-4">
        <div className="flex-1">
          <label className="block text-sm text-[var(--color-ink-soft)]">Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full border-b border-[var(--color-sand)] bg-transparent py-2 outline-none focus:border-[var(--color-teal)]"
            placeholder="e.g. Vinayaka Nagar"
          />
        </div>
        <div className="flex-1">
          <label className="block text-sm text-[var(--color-ink-soft)]">Mandal (optional)</label>
          <input
            value={mandal}
            onChange={(e) => setMandal(e.target.value)}
            className="mt-1 w-full border-b border-[var(--color-sand)] bg-transparent py-2 outline-none focus:border-[var(--color-teal)]"
            placeholder="e.g. Tirupati Town"
          />
        </div>
        <button
          type="submit"
          disabled={adding}
          className="self-end bg-[var(--color-teal)] px-4 py-2 text-sm text-[var(--color-surface)] transition-colors hover:bg-[var(--color-teal-deep)] disabled:opacity-60"
        >
          Add
        </button>
      </form>

      <div className="mt-6">
        {listLoading ? (
          <p className="text-sm text-[var(--color-ink-soft)]">Loading…</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {localities.map((loc) => (
              <li
                key={loc.id}
                className="flex items-center justify-between border border-[var(--color-sand)] bg-[var(--color-surface)] px-4 py-2"
              >
                <div>
                  <span>{loc.name}</span>
                  {loc.mandal && (
                    <span className="ml-2 text-sm text-[var(--color-ink-soft)]">{loc.mandal}</span>
                  )}
                </div>
                <button
                  onClick={() => toggleActive(loc)}
                  className={`border px-3 py-1 text-xs ${
                    loc.is_active
                      ? 'border-[var(--color-sand)] text-[var(--color-ink-soft)] hover:border-[var(--color-brick)] hover:text-[var(--color-brick)]'
                      : 'border-[var(--color-teal)] text-[var(--color-teal-deep)]'
                  }`}
                >
                  {loc.is_active ? 'Deactivate' : 'Activate'}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
