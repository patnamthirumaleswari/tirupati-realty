'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/AuthProvider';
import { getMyProfile, getProjectById } from '@/lib/queries';
import ProjectForm from '@/app/components/ProjectForm';
import DeleteProjectSection from '@/app/components/DeleteProjectSection';

export default function EditProjectPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const projectId = params.id;

  const [project, setProject] = useState(null);
  const [role, setRole] = useState(null);
  const [loadingData, setLoadingData] = useState(true);
  const [pageError, setPageError] = useState('');

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.push('/login');
      return;
    }

    Promise.all([getProjectById(projectId), getMyProfile()])
      .then(([loadedProject, profile]) => {
        setProject(loadedProject);
        setRole(profile?.role || null);
      })
      .catch((err) => setPageError(err.message || String(err)))
      .finally(() => setLoadingData(false));
  }, [loading, user, projectId, router]);

  if (loading || !user || loadingData) return null;

  if (pageError) {
    return (
      <main className="mx-auto max-w-2xl px-6 py-12">
        <p className="text-[var(--color-brick)]">Error: {pageError}</p>
      </main>
    );
  }

  if (!project) {
    return (
      <main className="mx-auto max-w-2xl px-6 py-12">
        <h1 className="font-display text-2xl">Project not found</h1>
        <Link href="/dashboard" className="mt-4 inline-block text-[var(--color-teal)] underline">
          Back to my account
        </Link>
      </main>
    );
  }

  // The database enforces this as well; this just avoids showing an edit
  // form that could never be saved.
  const allowed = project.builder_id === user.id || role === 'admin';
  if (!allowed) {
    return (
      <main className="mx-auto max-w-2xl px-6 py-12">
        <h1 className="font-display text-2xl">You can only edit your own projects</h1>
        <Link
          href={`/projects/${project.id}`}
          className="mt-4 inline-block text-[var(--color-teal)] underline"
        >
          View this project
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-2xl px-6 py-12">
      <h1 className="font-display text-3xl">Edit project</h1>
      <p className="mt-2 text-[var(--color-ink-soft)]">{project.project_name}</p>
      <ProjectForm
        project={project}
        onSaved={(id) => router.push(`/projects/${id}`)}
        cancelHref={`/projects/${project.id}`}
      />
      <DeleteProjectSection
        project={project}
        actingAsAdmin={role === 'admin' && project.builder_id !== user.id}
        onDeleted={() => router.push(project.builder_id === user.id ? '/dashboard' : '/projects')}
      />
    </main>
  );
}
