'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/AuthProvider';
import { getMyProfile } from '@/lib/queries';

// The buttons on a project page. The page itself is rendered on the server
// for everyone; this small piece works out on the client who is looking:
//   - the builder who owns the project: "+ Add a unit" and "Edit project"
//   - an admin: "Edit project" (which is also where a project is deleted)
//   - everyone else: nothing
// (Hiding buttons is convenience only. The database enforces who can
// actually change or delete a project.)
export default function ProjectOwnerActions({ builderId, projectId }) {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (!user) {
      setIsAdmin(false);
      return;
    }
    getMyProfile()
      .then((p) => setIsAdmin(p?.role === 'admin'))
      .catch(() => setIsAdmin(false));
  }, [user]);

  const isOwner = Boolean(user) && user.id === builderId;
  if (!isOwner && !isAdmin) return null;

  return (
    <div className="mt-4 flex flex-wrap gap-3">
      {isOwner && (
        <Link
          href={`/listings/new?project=${projectId}`}
          className="rounded-full bg-[var(--color-teal)] px-5 py-2 text-sm font-bold text-white transition-colors hover:bg-[var(--color-teal-deep)]"
        >
          + Add a unit
        </Link>
      )}
      <Link
        href={`/projects/${projectId}/edit`}
        className="rounded-full border border-[var(--color-sand)] px-5 py-2 text-sm font-semibold text-[var(--color-ink)] transition-colors hover:border-[var(--color-teal)]"
      >
        {isOwner ? 'Edit project' : 'Edit or delete project (admin)'}
      </Link>
    </div>
  );
}
