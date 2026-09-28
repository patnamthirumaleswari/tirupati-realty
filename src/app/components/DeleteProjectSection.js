'use client';

import { useState } from 'react';
import { deleteProject, getProjectUnitCount, logAdminAction } from '@/lib/queries';

// The "Delete this project" area at the bottom of the edit page. Deleting is
// permanent, so it takes two deliberate steps and says exactly what will
// happen, including how many units are affected.
//
//   project        the project being deleted (needs id, project_name, brochure_url)
//   actingAsAdmin  true when an admin is deleting someone else's project, so
//                  the action is recorded in the audit log
//   onDeleted      called after a successful delete (the page navigates away)
export default function DeleteProjectSection({ project, actingAsAdmin, onDeleted }) {
  const [confirming, setConfirming] = useState(false);
  const [unitCount, setUnitCount] = useState(undefined); // undefined = still loading, null = could not find out
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

  async function startConfirming() {
    setError('');
    setUnitCount(undefined);
    setConfirming(true);
    try {
      setUnitCount(await getProjectUnitCount(project.id));
    } catch (err) {
      console.error('Could not count the units:', err);
      setUnitCount(null);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    setError('');
    try {
      await deleteProject(project);
      if (actingAsAdmin) logAdminAction('delete_project', 'builder_projects', project.id);
      onDeleted();
    } catch (err) {
      setError(err.message || String(err));
      setDeleting(false);
    }
  }

  let unitsSentence;
  if (unitCount === undefined) {
    unitsSentence = 'Checking how many units belong to this project…';
  } else if (unitCount === null) {
    unitsSentence =
      'Any units in this project will stay listed as ordinary listings and will no longer appear under it.';
  } else if (unitCount === 0) {
    unitsSentence = 'This project has no units.';
  } else {
    unitsSentence = `${unitCount} ${unitCount === 1 ? 'unit' : 'units'} will stay listed as ${
      unitCount === 1 ? 'an ordinary listing' : 'ordinary listings'
    } and will no longer appear under this project.`;
  }

  return (
    <section className="mt-14 border-t border-[var(--color-sand)] pt-8">
      <h2 className="font-display text-xl">Delete this project</h2>

      {!confirming ? (
        <>
          <p className="mt-2 text-sm text-[var(--color-ink-soft)]">
            Removes the project page. Its units are not deleted.
          </p>
          <button
            type="button"
            onClick={startConfirming}
            className="mt-4 rounded-full border border-[var(--color-brick)] px-5 py-2 text-sm font-semibold text-[var(--color-brick)] transition-colors hover:bg-[var(--color-brick)] hover:text-white"
          >
            Delete project…
          </button>
        </>
      ) : (
        <div className="mt-3 rounded-xl border border-[var(--color-brick)] bg-[var(--color-surface)] p-5">
          <p className="text-[var(--color-ink)]">
            Delete <strong>{project.project_name}</strong>?
          </p>
          <p className="mt-2 text-sm text-[var(--color-ink-soft)]">{unitsSentence}</p>
          <p className="mt-2 text-sm text-[var(--color-ink-soft)]">
            The project page
            {project.brochure_url ? ' and its brochure file' : ''} will be removed permanently. This
            cannot be undone.
          </p>

          {error && <p className="mt-3 text-sm text-[var(--color-brick)]">{error}</p>}

          <div className="mt-4 flex items-center gap-3">
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting || unitCount === undefined}
              className="rounded-full bg-[var(--color-brick)] px-5 py-2 text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {deleting ? 'Deleting…' : 'Yes, delete this project'}
            </button>
            <button
              type="button"
              onClick={() => setConfirming(false)}
              disabled={deleting}
              className="rounded-full border border-[var(--color-sand)] px-5 py-2 text-sm font-semibold text-[var(--color-ink)] hover:border-[var(--color-teal)] disabled:opacity-60"
            >
              Keep it
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
