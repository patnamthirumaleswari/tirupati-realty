'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/AuthProvider';
import { getMyProfile, getMyBuilderRequest } from '@/lib/queries';
import ProjectForm from '@/app/components/ProjectForm';
import BuilderRequestForm from '@/app/components/BuilderRequestForm';

export default function NewProjectPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [role, setRole] = useState(null);
  const [myRequest, setMyRequest] = useState(null);
  const [checking, setChecking] = useState(true);
  const [justSubmitted, setJustSubmitted] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.push('/login');
      return;
    }
    Promise.all([getMyProfile(), getMyBuilderRequest(user.id)])
      .then(([profile, request]) => {
        setRole(profile?.role || null);
        setMyRequest(request);
      })
      .catch(() => {})
      .finally(() => setChecking(false));
  }, [loading, user, router]);

  if (loading || !user || checking) return null;

  // The database enforces this too; this page just explains it kindly
  // instead of letting someone fill in a project form that cannot be saved.
  if (role !== 'builder' && role !== 'admin') {
    const pending = !justSubmitted && myRequest?.status === 'pending';

    return (
      <main className="mx-auto max-w-xl px-6 py-16">
        <h1 className="font-display text-2xl">Projects are for builder accounts</h1>
        <p className="mt-3 text-[var(--color-ink-soft)]">
          A project groups all the units of one development under a single page, with its RERA ID
          and brochure.
        </p>
        <p className="mt-3 text-[var(--color-ink-soft)]">
          If you have a single property to sell or rent, you can{' '}
          <Link href="/listings/new" className="text-[var(--color-teal)] underline">
            list it directly
          </Link>{' '}
          instead — no builder account needed.
        </p>

        {pending || justSubmitted ? (
          <div className="mt-6 rounded-xl border border-[var(--color-sand)] bg-[var(--color-surface)] p-4">
            <p className="font-semibold text-[var(--color-ink)]">Request submitted</p>
            <p className="mt-1 text-sm text-[var(--color-ink-soft)]">
              We&apos;ll review it and get back to you. You&apos;ll be able to create projects as
              soon as it&apos;s approved.
            </p>
          </div>
        ) : (
          <>
            {myRequest?.status === 'rejected' && (
              <p className="mt-4 text-sm text-[var(--color-ink-soft)]">
                Your previous request wasn&apos;t approved. You&apos;re welcome to submit a new one
                below, for example with more detail about your business.
              </p>
            )}
            <BuilderRequestForm onSubmitted={() => setJustSubmitted(true)} />
          </>
        )}
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
