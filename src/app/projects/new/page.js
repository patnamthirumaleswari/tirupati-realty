'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/AuthProvider';
import { getMyProfile } from '@/lib/queries';
import ProjectForm from '@/app/components/ProjectForm';

export default function NewProjectPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [role, setRole] = useState(null);
  const [checkingRole, setCheckingRole] = useState(true);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.push('/login');
      return;
    }
    getMyProfile()
      .then((p) => setRole(p?.role || null))
      .catch(() => setRole(null))
      .finally(() => setCheckingRole(false));
  }, [loading, user, router]);

  if (loading || !user || checkingRole) return null;

  // The database enforces this too; this page just explains it kindly
  // instead of letting someone fill in a form that cannot be saved.
  if (role !== 'builder' && role !== 'admin') {
    return (
      <main className="mx-auto max-w-xl px-6 py-16">
        <h1 className="font-display text-2xl">Projects are for builder accounts</h1>
        <p className="mt-3 text-[var(--color-ink-soft)]">
          A project groups all the units of one development under a single page, with its RERA ID
          and brochure. If you are a builder or developer, contact us and we will set up your
          account after a quick check.
        </p>
        <p className="mt-3 text-[var(--color-ink-soft)]">
          If you have a single property to sell or rent, you can{' '}
          <Link href="/listings/new" className="text-[var(--color-teal)] underline">
            list it directly
          </Link>
          .
        </p>
        <Link
          href="/contact"
          className="mt-6 inline-block rounded-full bg-[var(--color-teal)] px-6 py-2.5 font-semibold text-[var(--color-surface)] hover:bg-[var(--color-teal-deep)]"
        >
          Contact us
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-2xl px-6 py-12">
      <h1 className="font-display text-3xl">New project</h1>
      <p className="mt-2 text-[var(--color-ink-soft)]">
        Create the project first, then add its units (flats, floors or plots) one by one. Each unit
        is reviewed before it goes live, like any other listing.
      </p>
      <ProjectForm onSaved={(id) => router.push(`/projects/${id}`)} cancelHref="/dashboard" />
    </main>
  );
}
