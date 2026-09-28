import Link from 'next/link';
import { getProjectById, getProjectUnits } from '@/lib/queries';
import { formatPossession } from '@/lib/format';
import ListingCard from '@/app/components/ListingCard';
import ReraNote from '@/app/components/ReraNote';
import ProjectOwnerActions from '@/app/components/ProjectOwnerActions';

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// A web address like /projects/anything-else would make the database error
// out on an invalid id; treat it as "not found" instead.
async function loadProject(id) {
  if (!UUID_PATTERN.test(id)) return null;
  return getProjectById(id);
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  const project = await loadProject(id);

  if (!project) return { title: 'Project not found' };

  const description = project.description
    ? project.description.slice(0, 160)
    : `A project by ${project.builder?.agency_name || project.builder?.full_name || 'a local builder'} in Tirupati.`;

  return {
    title: project.project_name,
    description,
    openGraph: { title: project.project_name, description },
  };
}

export default async function ProjectPage({ params }) {
  const { id } = await params;
  const project = await loadProject(id);

  if (!project) {
    return (
      <main className="mx-auto max-w-2xl px-6 py-16">
        <h1 className="font-display text-2xl">Project not found</h1>
        <p className="mt-2 text-[var(--color-ink-soft)]">
          This project may have been removed, or the link may be wrong.
        </p>
        <Link href="/projects" className="mt-4 inline-block text-[var(--color-teal)] underline">
          Browse all projects
        </Link>
      </main>
    );
  }

  // The units are an extra: if they fail to load, still show the project.
  const units = await getProjectUnits(project.id).catch(() => []);

  const possession = formatPossession(project.possession_date);
  const builderName = project.builder?.agency_name || project.builder?.full_name || 'Builder';
  const brochureIsPdf = /\.pdf($|\?)/i.test(project.brochure_url || '');

  const facts = [
    { label: 'Total units', value: project.total_units },
    { label: 'Possession', value: possession },
    { label: 'RERA ID (as declared)', value: project.rera_id },
  ].filter((f) => f.value);

  return (
    <main className="mx-auto max-w-5xl px-6 py-10 md:px-8">
      <div className="text-sm font-semibold text-[var(--color-ink-softer)]">
        Project by {builderName}
        {project.builder?.is_verified && (
          <span className="ml-2 text-[var(--color-green)]">✓ Verified</span>
        )}
      </div>
      <h1 className="font-display mt-1 text-4xl font-semibold text-[var(--color-ink)]">
        {project.project_name}
      </h1>

      <ProjectOwnerActions builderId={project.builder_id} projectId={project.id} />

      {facts.length > 0 && (
        <dl className="mt-6 grid grid-cols-2 gap-x-8 gap-y-3 border-y border-[var(--color-sand)] py-5 sm:grid-cols-3">
          {facts.map((f) => (
            <div key={f.label}>
              <dt className="text-xs text-[var(--color-ink-softer)]">{f.label}</dt>
              <dd className="text-[var(--color-ink)]">{f.value}</dd>
            </div>
          ))}
        </dl>
      )}

      <div className="mt-4">
        {project.rera_id ? (
          <ReraNote />
        ) : (
          <p className="text-xs text-[var(--color-ink-softer)]">
            The builder has not declared a RERA ID for this project.
          </p>
        )}
      </div>

      {project.brochure_url && (
        <a
          href={project.brochure_url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 inline-block rounded-full border border-[var(--color-sand)] bg-[var(--color-surface)] px-5 py-2 text-sm font-semibold text-[var(--color-ink)] transition-colors hover:border-[var(--color-teal)]"
        >
          View brochure / floor plan ({brochureIsPdf ? 'PDF' : 'image'}) ↗
        </a>
      )}

      {project.description && (
        <div className="mt-8">
          <h2 className="font-display text-xl">About this project</h2>
          <p className="mt-2 whitespace-pre-line text-[var(--color-ink-soft)]">{project.description}</p>
        </div>
      )}

      <section className="mt-12 border-t border-[var(--color-sand)] pt-8">
        <h2 className="font-display text-2xl">
          Units in this project
          <span className="ml-2 text-base font-normal text-[var(--color-ink-softer)]">
            {units.length} live
          </span>
        </h2>

        {units.length === 0 ? (
          <p className="mt-4 text-[var(--color-ink-soft)]">
            No units from this project are live yet. Units appear here once they have been reviewed
            and approved.
          </p>
        ) : (
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {units.map((unit) => (
              <ListingCard key={unit.id} listing={unit} />
            ))}
          </div>
        )}
      </section>

      <p className="mt-12 text-xs leading-relaxed text-[var(--color-ink-softer)]">
        Tirupati Realty is a listing platform, not a broker. We don&apos;t verify title, ownership,
        or approval status. Please do your own diligence before proceeding with any transaction.
      </p>
    </main>
  );
}
