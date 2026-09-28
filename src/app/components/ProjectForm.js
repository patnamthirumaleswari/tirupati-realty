'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createProject, updateProject, uploadProjectBrochure, removeBrochureFile } from '@/lib/queries';

// These mirror the limits on the storage bucket (0013_builder_projects.sql).
// Checking here first means a builder finds out about a wrong file right
// away, instead of after waiting for an upload to fail.
const MAX_BROCHURE_BYTES = 10 * 1024 * 1024;
const ALLOWED_BROCHURE_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];

const INPUT_CLASS =
  'mt-1 w-full border-b border-[var(--color-sand)] bg-transparent py-2 outline-none focus:border-[var(--color-teal)]';

// One form for both creating and editing a project. Pass `project` to edit
// an existing one; leave it out to create a new one.
//   onSaved(projectId)  called after a successful save
//   cancelHref          where the Cancel link goes
export default function ProjectForm({ project, onSaved, cancelHref }) {
  const editing = Boolean(project);

  const [name, setName] = useState(project?.project_name || '');
  const [rera, setRera] = useState(project?.rera_id || '');
  const [units, setUnits] = useState(project?.total_units != null ? String(project.total_units) : '');
  const [possession, setPossession] = useState(project?.possession_date || '');
  const [description, setDescription] = useState(project?.description || '');
  const [file, setFile] = useState(null);
  const [removeBrochure, setRemoveBrochure] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function handleFileChange(e) {
    const chosen = e.target.files && e.target.files[0] ? e.target.files[0] : null;
    setError('');

    if (chosen && !ALLOWED_BROCHURE_TYPES.includes(chosen.type)) {
      setError('The brochure must be a PDF, JPG, PNG or WebP file.');
      e.target.value = '';
      setFile(null);
      return;
    }
    if (chosen && chosen.size > MAX_BROCHURE_BYTES) {
      setError('That file is larger than 10 MB. Please choose a smaller one.');
      e.target.value = '';
      setFile(null);
      return;
    }
    setFile(chosen);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      // Keep the current brochure unless the builder removes it or uploads
      // a new one. The old file is deleted from storage once the save has
      // gone through, so it stops being reachable at its old web address.
      let brochureUrl = project?.brochure_url || null;
      if (removeBrochure) brochureUrl = null;
      if (file) brochureUrl = await uploadProjectBrochure(file);

      const fields = {
        project_name: name.trim(),
        rera_id: rera.trim() || null,
        total_units: units ? Number(units) : null,
        possession_date: possession || null,
        description: description.trim() || null,
        brochure_url: brochureUrl,
      };

      let projectId = project ? project.id : null;
      if (editing) {
        await updateProject(project.id, fields);
        // Only after the save succeeded: delete the file that was removed or replaced.
        if (project.brochure_url && project.brochure_url !== brochureUrl) {
          await removeBrochureFile(project.brochure_url);
        }
      } else {
        const created = await createProject(fields);
        projectId = created.id;
      }

      onSaved(projectId);
    } catch (err) {
      const message = err.message || String(err);
      // The database refuses non-builders with a technical message; say
      // what it means.
      if (message.includes('row-level security') || message.includes('violates row-level')) {
        setError('Only builder accounts can create or change projects. Please contact us to have your account set up as a builder.');
      } else {
        setError(message);
      }
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-6">
      <div>
        <label htmlFor="project-name" className="block text-sm text-[var(--color-ink-soft)]">
          Project name
        </label>
        <input
          id="project-name"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Sai Residency"
          className={INPUT_CLASS}
        />
      </div>

      <div>
        <label htmlFor="project-rera" className="block text-sm text-[var(--color-ink-soft)]">
          RERA ID (optional)
        </label>
        <input
          id="project-rera"
          value={rera}
          onChange={(e) => setRera(e.target.value)}
          className={INPUT_CLASS}
        />
        <p className="mt-1 text-xs text-[var(--color-ink-softer)]">
          Enter it exactly as it appears on your RERA certificate. Buyers will see it labelled as
          declared by you. Tirupati Realty does not verify it.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="project-units" className="block text-sm text-[var(--color-ink-soft)]">
            Total units (optional)
          </label>
          <input
            id="project-units"
            type="number"
            min="1"
            step="1"
            value={units}
            onChange={(e) => setUnits(e.target.value)}
            className={INPUT_CLASS}
          />
        </div>
        <div>
          <label htmlFor="project-possession" className="block text-sm text-[var(--color-ink-soft)]">
            Possession date (optional)
          </label>
          <input
            id="project-possession"
            type="date"
            value={possession}
            onChange={(e) => setPossession(e.target.value)}
            className={INPUT_CLASS}
          />
        </div>
      </div>

      <div>
        <label htmlFor="project-description" className="block text-sm text-[var(--color-ink-soft)]">
          About the project (optional)
        </label>
        <textarea
          id="project-description"
          rows={5}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="mt-1 w-full border border-[var(--color-sand)] bg-transparent p-2 outline-none focus:border-[var(--color-teal)]"
        />
      </div>

      <div>
        <label htmlFor="project-brochure" className="block text-sm text-[var(--color-ink-soft)]">
          Brochure or floor plan (optional): PDF, JPG, PNG or WebP, up to 10 MB
        </label>

        {editing && project.brochure_url && !removeBrochure && !file && (
          <p className="mt-1 text-sm">
            <a
              href={project.brochure_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--color-teal)] underline"
            >
              View current brochure
            </a>
            <span className="text-[var(--color-ink-softer)]"> (choose a file below to replace it)</span>
          </p>
        )}

        <input
          id="project-brochure"
          type="file"
          accept="application/pdf,image/jpeg,image/png,image/webp"
          onChange={handleFileChange}
          className="mt-1 w-full text-sm text-[var(--color-ink-soft)] file:mr-3 file:border file:border-[var(--color-sand)] file:bg-[var(--color-surface)] file:px-3 file:py-1.5 file:text-sm"
        />

        {editing && project.brochure_url && !file && (
          <label className="mt-2 flex items-center gap-2 text-sm text-[var(--color-ink-soft)]">
            <input
              type="checkbox"
              checked={removeBrochure}
              onChange={(e) => setRemoveBrochure(e.target.checked)}
            />
            Remove the current brochure
          </label>
        )}
      </div>

      {error && <p className="text-sm text-[var(--color-brick)]">{error}</p>}

      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={submitting}
          className="rounded-full bg-[var(--color-teal)] px-6 py-2.5 font-semibold text-[var(--color-surface)] transition-colors hover:bg-[var(--color-teal-deep)] disabled:opacity-60"
        >
          {submitting ? 'Saving…' : editing ? 'Save changes' : 'Create project'}
        </button>
        {cancelHref && (
          <Link href={cancelHref} className="text-sm text-[var(--color-ink-soft)] underline">
            Cancel
          </Link>
        )}
      </div>
    </form>
  );
}
