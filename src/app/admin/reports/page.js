'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/AuthProvider';
import { getMyProfile, getOpenReports, setReportStatus, setListingStatus } from '@/lib/queries';
import AdminNav from '@/app/components/AdminNav';

export default function AdminReportsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [profile, setProfile] = useState(null);
  const [checkingRole, setCheckingRole] = useState(true);
  const [reports, setReports] = useState([]);
  const [listLoading, setListLoading] = useState(true);
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
    if (profile?.role === 'admin') refresh();
  }, [profile]);

  function refresh() {
    setListLoading(true);
    getOpenReports()
      .then(setReports)
      .catch((err) => setPageError(err.message || String(err)))
      .finally(() => setListLoading(false));
  }

  async function handleDismiss(report) {
    setActioningId(report.id);
    try {
      await setReportStatus(report.id, 'dismissed');
      setReports((prev) => prev.filter((r) => r.id !== report.id));
    } catch (err) {
      alert(err.message || String(err));
    } finally {
      setActioningId(null);
    }
  }

  async function handleRemoveListing(report) {
    setActioningId(report.id);
    try {
      // Reject the listing itself, then mark the report as actioned.
      await setListingStatus(report.listing.id, 'rejected');
      await setReportStatus(report.id, 'actioned');
      setReports((prev) => prev.filter((r) => r.id !== report.id));
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
      <h1 className="font-display text-3xl">Reports</h1>
      <p className="mt-2 text-[var(--color-ink-soft)]">
        Listings flagged by users, awaiting review.
      </p>

      <div className="mt-8">
        {listLoading ? (
          <p className="text-sm text-[var(--color-ink-soft)]">Loading…</p>
        ) : reports.length === 0 ? (
          <p className="text-sm text-[var(--color-ink-soft)]">No open reports right now.</p>
        ) : (
          <ul className="flex flex-col gap-4">
            {reports.map((report) => (
              <li
                key={report.id}
                className="border border-[var(--color-sand)] bg-[var(--color-surface)] p-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <Link
                      href={`/listings/${report.listing?.id}`}
                      target="_blank"
                      className="font-display text-lg text-[var(--color-teal-deep)] underline"
                    >
                      {report.listing?.title || 'Listing removed'}
                    </Link>
                    <p className="mt-1 text-sm text-[var(--color-ink-soft)]">
                      Reported by {report.reporter?.full_name || 'a user'}
                    </p>
                    <p className="mt-2">{report.reason}</p>
                    {report.listing?.status === 'rejected' && (
                      <p className="mt-2 text-xs text-[var(--color-brick)]">
                        This listing has already been rejected.
                      </p>
                    )}
                  </div>

                  <div className="flex shrink-0 flex-col gap-2">
                    <button
                      disabled={actioningId === report.id}
                      onClick={() => handleRemoveListing(report)}
                      className="bg-[var(--color-brick)] px-4 py-1.5 text-sm text-[var(--color-surface)] transition-colors hover:opacity-90 disabled:opacity-60"
                    >
                      Reject listing
                    </button>
                    <button
                      disabled={actioningId === report.id}
                      onClick={() => handleDismiss(report)}
                      className="border border-[var(--color-sand)] px-4 py-1.5 text-sm text-[var(--color-ink)] transition-colors hover:border-[var(--color-teal)] hover:text-[var(--color-teal-deep)] disabled:opacity-60"
                    >
                      Dismiss report
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
