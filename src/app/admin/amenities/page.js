'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthProvider';
import {
  getMyProfile,
  adminGetAmenities,
  createAmenity,
  setAmenityActive,
} from '@/lib/queries';
import AdminNav from '@/app/components/AdminNav';

export default function AdminAmenitiesPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [profile, setProfile] = useState(null);
  const [checkingRole, setCheckingRole] = useState(true);
  const [amenities, setAmenities] = useState([]);
  const [listLoading, setListLoading] = useState(true);
  const [pageError, setPageError] = useState('');

  const [name, setName] = useState('');
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
    adminGetAmenities()
      .then(setAmenities)
      .catch((err) => setPageError(err.message || String(err)))
      .finally(() => setListLoading(false));
  }

  async function handleAdd(e) {
    e.preventDefault();
    if (!name.trim()) return;
    setAdding(true);
    try {
      await createAmenity(name.trim());
      setName('');
      refresh();
    } catch (err) {
      alert(err.message || String(err));
    } finally {
      setAdding(false);
    }
  }

  async function toggleActive(amenity) {
    try {
      await setAmenityActive(amenity.id, !amenity.is_active);
      setAmenities((prev) =>
        prev.map((a) =>
          a.id === amenity.id ? { ...a, is_active: !a.is_active } : a
        )
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
      <h1 className="font-display text-3xl">Amenities</h1>
      <p className="mt-2 text-[var(--color-ink-soft)]">
        Only active amenities appear as options on the listing form.
      </p>

      <form onSubmit={handleAdd} className="mt-6 flex gap-3 border border-[var(--color-sand)] bg-[var(--color-surface)] p-4">
        <div className="flex-1">
          <label className="block text-sm text-[var(--color-ink-soft)]">Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full border-b border-[var(--color-sand)] bg-transparent py-2 outline-none focus:border-[var(--color-teal)]"
            placeholder="e.g. Swimming Pool"
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
            {amenities.map((a) => (
              <li
                key={a.id}
                className="flex items-center justify-between border border-[var(--color-sand)] bg-[var(--color-surface)] px-4 py-2"
              >
                <span>{a.name}</span>
                <button
                  onClick={() => toggleActive(a)}
                  className={`border px-3 py-1 text-xs ${
                    a.is_active
                      ? 'border-[var(--color-sand)] text-[var(--color-ink-soft)] hover:border-[var(--color-brick)] hover:text-[var(--color-brick)]'
                      : 'border-[var(--color-teal)] text-[var(--color-teal-deep)]'
                  }`}
                >
                  {a.is_active ? 'Deactivate' : 'Activate'}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
